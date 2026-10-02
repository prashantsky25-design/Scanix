const mongoose = require("mongoose");
const crypto = require("crypto");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    date: { type: Date, required: true },
    venue: { type: String, required: true, trim: true, maxlength: 200 },

    // Secret for the host's scanner link. Never returned by normal queries.
    hostKey: {
      type: String,
      required: true,
      select: false,
      default: () => crypto.randomBytes(16).toString("hex"),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
