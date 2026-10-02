const mongoose = require("mongoose");
const crypto = require("crypto");

const classSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    active: { type: Boolean, default: true },

    // Teacher's private key for the live class page. Returned once, at creation.
    hostKey: { type: String, select: false, default: () => crypto.randomBytes(16).toString("hex") },
    // Signs the rotating QR tokens. Never leaves the server.
    secret: { type: String, select: false, default: () => crypto.randomBytes(32).toString("hex") },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClassSession", classSessionSchema);
