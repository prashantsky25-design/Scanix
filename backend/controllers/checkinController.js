const crypto = require("crypto");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const { checkIn } = require("../services/checkinService");

const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

// Guards the scan endpoint with the event's host key
exports.requireHostKey = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = mongoose.isValidObjectId(id)
      ? await Event.findById(id).select("+hostKey")
      : null;
    const key = req.get("x-host-key") || "";

    if (!event || !safeEqual(key, event.hostKey)) {
      return res.status(403).json({ message: "Invalid host link" });
    }
    next();
  } catch (err) {
    next(err);
  }
};

exports.checkIn = async (req, res, next) => {
  try {
    const outcome = await checkIn(req.params.id, req.body.qrToken);
    res.json(outcome); // always 200; UI renders status: success | already | invalid
  } catch (err) {
    next(err);
  }
};
