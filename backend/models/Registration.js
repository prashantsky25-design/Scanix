const mongoose = require("mongoose");
const crypto = require("crypto");

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: "" },

    // Opaque token encoded in the QR. No personal data inside it.
    qrToken: { type: String, required: true, unique: true, default: () => crypto.randomUUID() },
  },
  { timestamps: true }
);

// One registration per email per event
registrationSchema.index({ event: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
