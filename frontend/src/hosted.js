// Remembers events created on this device so the host can reopen the scanner later.
const KEY = "quickattend:hosted";

export const getHosted = () => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const saveHosted = (entry) => {
  try {
    const list = getHosted().filter((e) => e.id !== entry.id);
    localStorage.setItem(KEY, JSON.stringify([entry, ...list]));
  } catch {
    // storage unavailable: the host link in the URL still works
  }
};

// Classes started on this device (teacher side)
const CLASSES = "quickattend:classes";

export const getClasses = () => {
  try {
    const list = JSON.parse(localStorage.getItem(CLASSES) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const saveClass = (entry) => {
  try {
    const list = getClasses().filter((c) => c.id !== entry.id).slice(0, 19);
    localStorage.setItem(CLASSES, JSON.stringify([entry, ...list]));
  } catch {
    // storage unavailable: the teacher link in the URL still works
  }
};
