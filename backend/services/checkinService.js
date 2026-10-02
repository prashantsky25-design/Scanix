const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const Attendance = require("../models/Attendance");

const RESULTS = {
  success: "Check-in Successful",
  already: "Already Checked In",
  invalid: "Invalid QR",
};

const result = (status, name) => ({ status, message: RESULTS[status], name });

async function checkIn(eventId, qrToken) {
  if (!mongoose.isValidObjectId(eventId) || typeof qrToken !== "string" || !qrToken) {
    return result("invalid");
  }

  // Token must exist AND belong to this event
  const registration = await Registration.findOne({ qrToken, event: eventId });
  if (!registration) return result("invalid");

  try {
    await Attendance.create({ registration: registration._id, event: eventId });
    return result("success", registration.name);
  } catch (err) {
    // Unique index on Attendance.registration => already checked in
    if (err.code === 11000) return result("already", registration.name);
    throw err;
  }
}

module.exports = { checkIn };
