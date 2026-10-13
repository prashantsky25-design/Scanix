import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Scanner({ onScan }) {
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const busy = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    const starting = scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (w, h) => {
            const s = Math.floor(Math.min(w, h) * 0.7);
            return { width: s, height: s };
          },
        },
        async (text) => {
          if (busy.current) return; // ignore repeat frames while handling a scan
          busy.current = true;
          try {
            await onScanRef.current(text);
          } finally {
            setTimeout(() => { busy.current = false; }, 2000);
          }
        },
        () => {}
      )
      .catch(() => setError("Camera blocked. Tap the 🔒 icon in your browser address bar → allow Camera, then refresh."));

    return () => {
      starting
        .then(() => scanner.stop())
        .then(() => scanner.clear())
        .catch(() => {});
    };
  }, []);

  return (
    <div>
      <div id="qr-reader" className="overflow-hidden rounded-2xl bg-black" />
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
