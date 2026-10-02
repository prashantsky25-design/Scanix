const crypto = require("crypto");

const ROTATE_SECONDS = Number(process.env.QR_ROTATE_SECONDS) || 2;
// How many older time slots are still accepted, so a scan + network delay does not fail
const GRACE_SLOTS = Number.isInteger(Number(process.env.QR_GRACE_SLOTS)) && process.env.QR_GRACE_SLOTS !== undefined && process.env.QR_GRACE_SLOTS !== "" ? Number(process.env.QR_GRACE_SLOTS) : 2;
const ROTATE_MS = ROTATE_SECONDS * 1000;

const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

const sign = (secret, sessionId, slot) =>
  crypto.createHmac("sha256", secret).update(`${sessionId}.${slot}`).digest("hex").slice(0, 20);

// Token = "<time slot>.<signature>". Changes every ROTATE_SECONDS.
function currentToken(session) {
  const now = Date.now();
  const slot = Math.floor(now / ROTATE_MS);
  return {
    token: `${slot}.${sign(session.secret, session._id, slot)}`,
    expiresInMs: ROTATE_MS - (now % ROTATE_MS),
  };
}

// A token is accepted for its own slot plus GRACE_SLOTS more (default 2s x 3 = up to 6s).
function verifyToken(session, token) {
  if (typeof token !== "string") return false;
  const [slotStr, sig] = token.split(".");
  const slot = Number(slotStr);
  if (!Number.isInteger(slot) || !sig) return false;

  const current = Math.floor(Date.now() / ROTATE_MS);
  if (slot > current || current - slot > GRACE_SLOTS) return false;
  return safeEqual(sig, sign(session.secret, session._id, slot));
}

module.exports = { ROTATE_SECONDS, safeEqual, currentToken, verifyToken };
