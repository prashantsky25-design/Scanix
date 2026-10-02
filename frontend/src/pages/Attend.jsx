import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Scanner from "../components/Scanner";
import ProfileForm from "../components/ProfileForm";
import { getProfile, saveProfile } from "../student";

export default function Attend() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(getProfile());
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");

  const onScan = (text) => {
    try {
      const u = new URL(text);
      if (u.pathname.startsWith("/attend/")) {
        navigate(u.pathname + u.search);
        return;
      }
    } catch {
      // not a URL
    }
    setMsg("That is not a class QR code.");
  };

  if (!profile || editing) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-bold">Your details</h1>
        <p className="text-sm text-slate-600">Enter these once. They are saved on this phone.</p>
        <ProfileForm
          submitLabel="Save and scan"
          onSave={(p) => {
            saveProfile(p);
            setProfile(p);
            setEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Mark attendance</h1>
      <p className="text-sm text-slate-600">
        {profile.name} · {profile.rollNo}{" "}
        <button onClick={() => setEditing(true)} className="font-medium text-indigo-600 dark:text-indigo-400">Change</button>
      </p>
      <Scanner onScan={onScan} />
      <p className="text-center text-sm text-slate-500">{msg || "Scan the QR shown by your teacher."}</p>
    </div>
  );
}
