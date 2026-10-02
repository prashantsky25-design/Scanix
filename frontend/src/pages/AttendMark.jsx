import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../api";
import ProfileForm from "../components/ProfileForm";
import { getDeviceId, getProfile, saveProfile } from "../student";

const STYLES = {
  success: "bg-green-100 text-green-800 ring-green-300",
  already: "bg-amber-100 text-amber-800 ring-amber-300",
};
const FAIL = "bg-red-100 text-red-800 ring-red-300";
const ICONS = { success: "✅", already: "⚠️" };

export default function AttendMark() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const token = params.get("t") || "";
  const navigate = useNavigate();

  const [profile] = useState(getProfile());
  const [result, setResult] = useState(null);
  const sent = useRef(false);

  // With saved details, mark attendance immediately so the token is still fresh
  useEffect(() => {
    if (!profile || sent.current) return;
    sent.current = true;
    api
      .post(`/classes/${id}/attend`, {
        token,
        name: profile.name,
        rollNo: profile.rollNo,
        deviceId: getDeviceId(),
      })
      .then((r) => setResult(r.data))
      .catch(() => setResult({ status: "error", message: "Network error. Scan again" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!profile) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-bold">Your details</h1>
        <p className="text-sm text-slate-600">Enter these once, then scan the QR again.</p>
        <ProfileForm
          submitLabel="Save and scan"
          onSave={(p) => {
            saveProfile(p);
            navigate("/attend");
          }}
        />
      </div>
    );
  }

  if (!result) return <p className="text-center text-slate-500">Marking attendance…</p>;

  const ok = result.status === "success" || result.status === "already";
  return (
    <div className="space-y-4 text-center">
      <div className={`rounded-2xl p-5 ring-1 ${STYLES[result.status] || FAIL}`}>
        <p className="text-2xl font-bold">{ICONS[result.status] || "❌"} {result.message}</p>
        {ok && result.name && <p className="mt-1">{result.name} · {result.rollNo}</p>}
      </div>
      {!ok && <Link to="/attend" className="btn block">Scan again</Link>}
      <Link to="/" className="btn-light block">Done</Link>
    </div>
  );
}
