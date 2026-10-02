// Student details and a per-phone id, kept in this browser.
const PROFILE = "quickattend:student";
const DEVICE = "quickattend:device";

export const getProfile = () => {
  try {
    const p = JSON.parse(localStorage.getItem(PROFILE) || "null");
    return p && p.name && p.rollNo ? p : null;
  } catch {
    return null;
  }
};

export const saveProfile = (profile) => {
  try {
    localStorage.setItem(PROFILE, JSON.stringify(profile));
  } catch {
    // storage unavailable
  }
};

const randomId = () =>
  (globalThis.crypto?.randomUUID && crypto.randomUUID()) ||
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;

export const getDeviceId = () => {
  try {
    let id = localStorage.getItem(DEVICE);
    if (!id) {
      id = randomId();
      localStorage.setItem(DEVICE, id);
    }
    return id;
  } catch {
    return randomId();
  }
};
