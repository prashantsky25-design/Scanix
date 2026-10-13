import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import QRCode from "qrcode";
import api from "../api";

// Format a date as "13 Oct 2026, 10:30 AM"
const fmt = (d) =>
  d ? new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "";

// Format just the time as "10:30 AM"
const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString([], { timeStyle: "short" }) : "";

// Live HH:MM:SS counter from a start ISO string
function useDuration(startIso, active) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    if (!startIso) return;
    const start = new Date(startIso).getTime();
    const tick = () => setSec(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    if (!active) return; // freeze counter when class ends
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [startIso, active]);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ClassLive() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const key = params.get("key") || "";
  const headers = { "x-host-key": key };

  const [qr, setQr] = useState("");
  const [rotate, setRotate] = useState(2.5);
  const [info, setInfo] = useState({
    title: "", active: true, count: 0, records: [],
    startTime: null, endTime: null,
  });
  const [error, setError] = useState("");

  const duration = useDuration(info.startTime, info.active);

  // Rotating QR: fetch a fresh token each time the current one expires
  useEffect(() => {
    if (!key || !info.active) return;
    let stopped = false;
    let timer;

    const load = async () => {
      try {
        const { data } = await api.get(`/classes/${id}/qr`, { headers });
        if (stopped) return;
        if (!data.active) {
          setInfo((i) => ({ ...i, active: false }));
          return;
        }
        const url = `${window.location.origin}/attend/${id}?t=${encodeURIComponent(data.token)}`;
        const img = await QRCode.toDataURL(url, { width: 420, margin: 2 });
        if (stopped) return;
        setQr(img);
        setRotate(data.rotateSeconds);
        timer = setTimeout(load, data.expiresInMs + 50);
      } catch (err) {
        if (stopped) return;
        if (err.response?.status === 403) setError("Invalid teacher link.");
        else timer = setTimeout(load, 2000);
      }
    };

    load();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, key, info.active]);

  // Live attendance list — poll every 4 s
  useEffect(() => {
    if (!key) return;
    let stopped = false;
    const poll = async () => {
      try {
        const { data } = await api.get(`/classes/${id}/attendance`, { headers });
        if (!stopped) setInfo(data);
      } catch {
        // keep the last list; try again next tick
      }
    };
    poll();
    const t = setInterval(poll, 4000);
    return () => {
      stopped = true;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, key]);

  const endClass = async () => {
    if (!window.confirm("End this class? Students will no longer be able to mark attendance.")) return;
    try {
      const { data } = await api.post(`/classes/${id}/end`, {}, { headers });
      setInfo((i) => ({ ...i, active: false, endTime: data.endTime || new Date().toISOString() }));
    } catch {
      setError("Could not end the class. Try again.");
    }
  };

  if (!key) return <p className="text-center text-red-600 dark:text-red-400">This link is missing its key. Open the class from &quot;Start class&quot;.</p>;
  if (error) return <p className="text-center text-red-600 dark:text-red-400">{error}</p>;

  return (
    <div className="space-y-4">

      {/* ── Header: title + lecture timing ── */}
      <div className="card space-y-1">
        <h1 className="text-xl font-bold">{info.title || "Class"}</h1>

        {info.startTime && (
          <div className="flex flex-wrap gap-x-4 text-sm text-slate-500">
            <span>🕐 Started: <span className="font-medium text-slate-700 dark:text-slate-200">{fmt(info.startTime)}</span></span>
            {info.active
              ? <span>⏱ Duration: <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{duration}</span></span>
              : info.endTime && <span>🕐 Ended: <span className="font-medium text-slate-700 dark:text-slate-200">{fmt(info.endTime)}</span></span>
            }
          </div>
        )}

        {!info.active && info.startTime && info.endTime && (
          <p className="text-sm text-slate-500">
            ⏱ Total duration: <span className="font-mono font-semibold">{duration}</span>
          </p>
        )}
      </div>

      {/* ── QR code ── */}
      {info.active ? (
        <div className="card space-y-2 text-center">
          {qr
            ? <img src={qr} alt="Attendance QR code" className="mx-auto w-full max-w-sm" />
            : <p className="py-16 text-slate-500">Loading QR…</p>
          }
          <p className="text-sm text-slate-600">
            Students scan this to mark attendance.{" "}
            <span className="font-medium text-indigo-600 dark:text-indigo-400">Refreshes every {rotate}s.</span>
          </p>
        </div>
      ) : (
        <p className="card text-center font-semibold text-slate-700 dark:text-slate-300">Class ended</p>
      )}

      {/* ── Attendance list ── */}
      <div className="card space-y-2">
        <h2 className="font-semibold">Present: {info.count}</h2>
        {info.records.length === 0
          ? <p className="text-sm text-slate-500">No one has marked attendance yet.</p>
          : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {info.records.map((r, i) => (
                <li key={r.rollNo} className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-right text-xs text-slate-400">{i + 1}.</span>
                    <span className="font-medium">{r.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-slate-500">{r.rollNo}</span>
                    <span className="block text-xs text-slate-400">✅ {fmtTime(r.markedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )
        }
      </div>

      {info.active && (
        <button onClick={endClass} className="btn-light w-full">End class</button>
      )}
    </div>
  );
}
