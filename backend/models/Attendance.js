const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
    required: true,
    unique: true, // DB-level guard: a registration can only check in once
  },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
  checkedInAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
