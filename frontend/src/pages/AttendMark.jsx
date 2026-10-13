import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import api from "../api";
import ProfileForm from "../components/ProfileForm";
import { getDeviceId, getProfile, saveProfile } from "../student";

const STYLES = {
  success: "bg-green-100 text-green-800 ring-green-300",
  already: "bg-amber-100 text-amber-800 ring-amber-300",
};
const FAIL = "bg-red-100 text-red-800 ring-red-300";
const ICONS = { success: "✅", already: "⚠️" };
const NETWORK_ERROR = { status: "error", message: "Network error. Scan again" };

export default function AttendMark() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const token = params.get("t") || "";

  const [profile, setProfile] = useState(getProfile());
  const [ticket, setTicket] = useState("");
  const [result, setResult] = useState(null);
  const [marking, setMarking] = useState(false);
  const started = useRef(false);

  const mark = (p, tk) => {
    setMarking(true);
    api
      .post(`/classes/${id}/attend`, { ticket: tk, name: p.name, rollNo: p.rollNo, deviceId: getDeviceId() })
      .then((r) => setResult(r.data))
      .catch(() => setResult(NETWORK_ERROR));
  };

  // Step 1 runs immediately on opening the page, while the scanned QR is still fresh
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    api
      .post(`/classes/${id}/claim`, { token, deviceId: getDeviceId() })
      .then(({ data }) => {
        if (data.status !== "ok") return setResult(data);
        setTicket(data.ticket);
        const saved = getProfile();
        if (saved) mark(saved, data.ticket);
      })
      .catch(() => setResult(NETWORK_ERROR));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (result) {
    const ok = result.status === "success" || result.status === "already";
    const timeStr = result.markedAt
      ? new Date(result.markedAt).toLocaleTimeString([], { timeStyle: "short" })
      : "";
    return (
      <div className="space-y-4 text-center">
        <div className={`rounded-2xl p-5 ring-1 ${STYLES[result.status] || FAIL}`}>
          <p className="text-2xl font-bold">{ICONS[result.status] || "❌"} {result.message}</p>
          {ok && result.name && <p className="mt-1 font-medium">{result.name} · {result.rollNo}</p>}
          {ok && timeStr && (
            <p className="mt-1 text-sm opacity-75">
              {result.status === "already" ? "Originally marked at" : "Marked at"} {timeStr}
            </p>
          )}
        </div>
        {!ok && <Link to="/attend" className="btn block">Scan again</Link>}
        <Link to="/" className="btn-light block">Done</Link>
      </div>
    );
  }

  if (!ticket) return <p className="text-center text-slate-500">Checking QR…</p>;
  if (marking || profile) return <p className="text-center text-slate-500">Marking attendance…</p>;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Your details</h1>
      <p className="text-sm text-slate-600">QR accepted. Enter your details to mark attendance. They are saved on this phone for next time.</p>
      <ProfileForm
        submitLabel="Mark attendance"
        onSave={(p) => {
          saveProfile(p);
          setProfile(p);
          mark(p, ticket);
        }}
      />
    </div>
  );
}
