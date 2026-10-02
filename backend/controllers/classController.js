const mongoose = require("mongoose");
const ClassSession = require("../models/ClassSession");
const ClassAttendance = require("../models/ClassAttendance");
const { ROTATE_SECONDS, safeEqual, currentToken, verifyToken } = require("../services/classService");

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
      .sort({ markedAt: -1 })
      .select("name rollNo markedAt -_id");
    res.json({ title: session.title, active: session.active, count: records.length, records });
  } catch (err) {
    next(err);
  }
};

exports.endClass = async (req, res, next) => {
  try {
    req.classSession.active = false;
    await req.classSession.save();
    res.json({ active: false });
  } catch (err) {
    next(err);
  }
};

// Student marks attendance
exports.attend = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = mongoose.isValidObjectId(id) ? await ClassSession.findById(id).select("+secret") : null;
    if (!session) return res.json(result("invalid"));
    if (!session.active) return res.json(result("closed"));
    if (!verifyToken(session, req.body.token)) return res.json(result("expired"));

    const name = String(req.body.name || "").trim().slice(0, 100);
    const rollNo = String(req.body.rollNo || "").trim().toUpperCase().slice(0, 30);
    const deviceId = String(req.body.deviceId || "").trim();
    if (!name || !rollNo || deviceId.length < 8 || deviceId.length > 100) {
      return res.json(result("details"));
    }

    const existing = await ClassAttendance.findOne({
      session: session._id,
      $or: [{ rollNo }, { deviceId }],
    });
    if (existing) {
      return res.json(
        existing.rollNo === rollNo ? result("already", { name, rollNo }) : result("device")
      );
    }

    try {
      await ClassAttendance.create({ session: session._id, name, rollNo, deviceId });
      res.json(result("success", { name, rollNo }));
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
