const mongoose = require("mongoose");

const classAttendanceSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: "ClassSession", required: true, index: true },
  rollNo: { type: String, required: true, trim: true, maxlength: 30 },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  deviceId: { type: String, required: true, maxlength: 100 },
  markedAt: { type: Date, default: Date.now },
});

// A student can mark once per class
classAttendanceSchema.index({ session: 1, rollNo: 1 }, { unique: true });
// A phone can mark for one student per class (blocks one phone marking for friends)
classAttendanceSchema.index({ session: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model("ClassAttendance", classAttendanceSchema);
