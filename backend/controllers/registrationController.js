const mongoose = require("mongoose");
const Event = require("../models/Event");
const Registration = require("../models/Registration");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.registerForEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id) || !(await Event.exists({ _id: id }))) {
      return res.status(404).json({ message: "Event not found" });
    }

    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone || "").trim().slice(0, 20);

    if (!name || name.length > 100) {
      return res.status(400).json({ message: "Please enter your name" });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    const registration = await Registration.create({ event: id, name, email, phone });
    res.status(201).json({ qrToken: registration.qrToken });
  } catch (err) {
    // Unique {event, email}. We don't return the existing ticket, otherwise
    // anyone could fetch someone else's QR by guessing their email.
    if (err.code === 11000) {
      return res.status(409).json({ message: "This email is already registered for this event" });
    }
    next(err);
  }
};

exports.getTicket = async (req, res, next) => {
  try {
    const registration = await Registration.findOne({ qrToken: String(req.params.qrToken) })
      .populate("event", "title date venue");
    if (!registration) return res.status(404).json({ message: "Ticket not found" });

    res.json({ name: registration.name, email: registration.email, event: registration.event });
  } catch (err) {
    next(err);
  }
};
