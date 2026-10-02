import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../api";
import Scanner from "../components/Scanner";

const STYLES = {
  success: "bg-green-100 text-green-800 ring-green-300",
  already: "bg-amber-100 text-amber-800 ring-amber-300",
  invalid: "bg-red-100 text-red-800 ring-red-300",
  error: "bg-slate-100 text-slate-700 ring-slate-300",
};
const ICONS = { success: "✅", already: "⚠️", invalid: "❌", error: "⚠️" };

export default function HostEvent() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const key = params.get("key");

  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const shareLink = `${window.location.origin}/events/${id}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copy this link:", shareLink);
    }
  };

  const handleScan = async (qrToken) => {
    try {
      const { data } = await api.post(
        `/events/${id}/checkin`,
        { qrToken },
        { headers: { "x-host-key": key || "" } }
      );
      setResult(data);
    } catch (err) {
      setResult({
        status: "error",
        message: err.response?.status === 403 ? "Invalid host link" : "Network error, scan again",
      });
    }
  };

  if (!key) {
    return <p className="text-center text-red-600 dark:text-red-400">This host link is missing its key. Use the link you got when you created the event.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-2">
        <h1 className="font-bold">Registration link</h1>
        <p className="break-all rounded-lg bg-slate-100 p-2 text-sm text-slate-700">{shareLink}</p>
        <button onClick={copy} className="btn-light">{copied ? "Copied ✓" : "Copy link"}</button>
      </div>

      <p className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">
        Bookmark this page. Its URL is your private scanner link. Don't share it with attendees.
      </p>

      {!scanning ? (
        <button onClick={() => setScanning(true)} className="btn">Open scanner</button>
      ) : (
        <div className="space-y-3">
          <Scanner onScan={handleScan} />
          {result ? (
            <div className={`rounded-2xl p-4 text-center ring-1 ${STYLES[result.status] || STYLES.error}`}>
              <p className="text-2xl font-bold">{ICONS[result.status]} {result.message}</p>
              {result.name && <p className="mt-1">{result.name}</p>}
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500">Point the camera at a QR code.</p>
          )}
          <button onClick={() => { setScanning(false); setResult(null); }} className="btn-light">Close scanner</button>
        </div>
      )}
    </div>
  );
}
