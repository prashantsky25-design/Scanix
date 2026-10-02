const mongoose = require("mongoose");
const Event = require("../models/Event");

exports.listEvents = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const events = await Event.find({ date: { $gte: startOfToday } }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    next(err);
  }
};

exports.getEvent = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Event not found" });
    }
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    next(err);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, date, venue } = req.body;
    if (!title?.trim() || !venue?.trim() || !date || isNaN(new Date(date))) {
      return res.status(400).json({ message: "Title, date and venue are required" });
    }
    const event = await Event.create({ title, description, date, venue });
    // hostKey is only ever returned here, once
    res.status(201).json({ id: event._id, hostKey: event.hostKey });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Please check the event details" });
    }
    next(err);
  }
};
