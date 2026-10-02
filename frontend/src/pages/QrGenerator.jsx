import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QrGenerator() {
  const [text, setText] = useState("");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const value = text.trim();
    if (!value) {
      setQr("");
      setError("");
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(value, { width: 512, margin: 2 })
      .then((url) => {
        if (!cancelled) {
          setQr(url);
          setError("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQr("");
          setError("This text is too long to fit in a QR code.");
        }
      });
    return () => { cancelled = true; };
  }, [text]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">QR generator</h1>
      <p className="text-sm text-slate-600">Paste a link or type any text to turn it into a QR code.</p>

      <textarea
        className="input"
        rows={3}
        placeholder="https://example.com or any text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={1000}
      />

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {qr && (
        <div className="card space-y-3 text-center">
          <img src={qr} alt="Generated QR code" className="mx-auto w-full max-w-xs" />
          <a href={qr} download="qrcode.png" className="btn block">Download PNG</a>
        </div>
      )}
    </div>
  );
}
