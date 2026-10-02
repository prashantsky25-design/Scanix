import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import QRCode from "qrcode";
import api from "../api";

export default function ClassLive() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const key = params.get("key") || "";
  const headers = { "x-host-key": key };

  const [qr, setQr] = useState("");
  const [rotate, setRotate] = useState(10);
  const [info, setInfo] = useState({ title: "", active: true, count: 0, records: [] });
  const [error, setError] = useState("");

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

  // Live attendance list
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
      await api.post(`/classes/${id}/end`, {}, { headers });
      setInfo((i) => ({ ...i, active: false }));
    } catch {
      setError("Could not end the class. Try again.");
    }
  };

  if (!key) return <p className="text-center text-red-600 dark:text-red-400">This link is missing its key. Open the class from "Start class".</p>;
  if (error) return <p className="text-center text-red-600 dark:text-red-400">{error}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{info.title || "Class"}</h1>

      {info.active ? (
        <div className="card space-y-2 text-center">
          {qr ? <img src={qr} alt="Attendance QR code" className="mx-auto w-full max-w-sm" /> : <p className="py-16 text-slate-500">Loading QR…</p>}
          <p className="text-sm text-slate-600">Students scan this to mark attendance. It changes every {rotate} seconds.</p>
        </div>
      ) : (
        <p className="card text-center font-semibold text-slate-700">Class ended</p>
      )}

      <div className="card space-y-2">
        <h2 className="font-semibold">Present: {info.count}</h2>
        {info.records.length === 0 && <p className="text-sm text-slate-500">No one has marked attendance yet.</p>}
        <ul className="divide-y divide-slate-100">
          {info.records.map((r) => (
            <li key={r.rollNo} className="flex justify-between py-2 text-sm">
              <span>{r.name}</span>
              <span className="text-slate-500">{r.rollNo}</span>
            </li>
          ))}
        </ul>
      </div>

      {info.active && <button onClick={endClass} className="btn-light">End class</button>}
    </div>
  );
}
