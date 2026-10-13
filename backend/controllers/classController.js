const mongoose = require("mongoose");
const ClassSession = require("../models/ClassSession");
const ClassAttendance = require("../models/ClassAttendance");
const {
  ROTATE_SECONDS, safeEqual, currentToken, verifyToken, makeTicket, verifyTicket,
} = require("../services/classService");

const MESSAGES = {
  success: "Attendance marked",
  already: "Attendance already marked",
  expired: "QR expired. Scan the current QR again",
  device: "This phone already marked attendance for another student",
  closed: "This class has ended",
  details: "Enter your name and roll number",
  invalid: "Invalid QR",
};
const result = (status, extra = {}) => ({ status, message: MESSAGES[status], ...extra });

exports.createClass = async (req, res, next) => {
  try {
    const title = String(req.body.title || "").trim();
    if (!title || title.length > 120) {
      return res.status(400).json({ message: "Enter a class name" });
    }
    const session = await ClassSession.create({ title });
    res.status(201).json({ id: session._id, hostKey: session.hostKey });
  } catch (err) {
    next(err);
  }
};

// Teacher-only guard
exports.requireHost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = mongoose.isValidObjectId(id)
      ? await ClassSession.findById(id).select("+hostKey +secret")
      : null;
    if (!session || !safeEqual(req.get("x-host-key") || "", session.hostKey)) {
      return res.status(403).json({ message: "Invalid teacher link" });
    }
    req.classSession = session;
    next();
  } catch (err) {
    next(err);
  }
};

exports.getQr = (req, res) => {
  const session = req.classSession;
  if (!session.active) return res.json({ active: false });
  res.json({ active: true, rotateSeconds: ROTATE_SECONDS, ...currentToken(session) });
};

exports.getAttendance = async (req, res, next) => {
  try {
    const session = req.classSession;
    const records = await ClassAttendance.find({ session: session._id })
      .sort({ markedAt: 1 })           // chronological order in the list
      .select("name rollNo markedAt -_id");
    res.json({
      title: session.title,
      active: session.active,
      startTime: session.createdAt,    // lecture start = when the class was created
      endTime: session.endTime || null, // lecture end = when teacher clicked "End class"
      count: records.length,
      records,
    });
  } catch (err) {
    next(err);
  }
};

exports.endClass = async (req, res, next) => {
  try {
    req.classSession.active = false;
    req.classSession.endTime = new Date(); // record the end time
    await req.classSession.save();
    res.json({ active: false, endTime: req.classSession.endTime });
  } catch (err) {
    next(err);
  }
};

const validDevice = (d) => typeof d === "string" && d.length >= 8 && d.length <= 100;

// Step 1: student scans the live QR; a valid scan returns a short ticket for this phone
exports.claim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = mongoose.isValidObjectId(id) ? await ClassSession.findById(id).select("+secret") : null;
    if (!session) return res.json(result("invalid"));
    if (!session.active) return res.json(result("closed"));
    if (!validDevice(req.body.deviceId)) return res.json(result("invalid"));
    if (!verifyToken(session, req.body.token)) return res.json(result("expired"));
    res.json({ status: "ok", ticket: makeTicket(session, req.body.deviceId) });
  } catch (err) {
    next(err);
  }
};

// Step 2: student sends name + roll number with the ticket
exports.attend = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = mongoose.isValidObjectId(id) ? await ClassSession.findById(id).select("+secret") : null;
    if (!session) return res.json(result("invalid"));
    if (!session.active) return res.json(result("closed"));

    const deviceId = String(req.body.deviceId || "").trim();
    if (!validDevice(deviceId) || !verifyTicket(session, deviceId, req.body.ticket)) {
      return res.json(result("expired"));
    }

    const name = String(req.body.name || "").trim().slice(0, 100);
    const rollNo = String(req.body.rollNo || "").trim().toUpperCase().slice(0, 30);
    if (!name || !rollNo) return res.json(result("details"));

    const existing = await ClassAttendance.findOne({
      session: session._id,
      $or: [{ rollNo }, { deviceId }],
    });
    if (existing) {
      // Include markedAt so the student sees when they originally marked
      return res.json(
        existing.rollNo === rollNo
          ? result("already", { name, rollNo, markedAt: existing.markedAt })
          : result("device")
      );
    }

    try {
      const doc = await ClassAttendance.create({ session: session._id, name, rollNo, deviceId });
      res.json(result("success", { name, rollNo, markedAt: doc.markedAt }));
    } catch (err) {
      // Race: two requests at once hit the unique indexes
      if (err.code === 11000) {
        return res.json(err.keyPattern?.deviceId ? result("device") : result("already", { name, rollNo }));
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
};
