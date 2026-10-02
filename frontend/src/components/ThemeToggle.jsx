import { useState } from "react";

const KEY = "quickattend:theme";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      // storage unavailable: the choice lasts until reload
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg ring-1 ring-slate-300 active:bg-slate-100"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
