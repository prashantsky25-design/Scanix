import { useState } from "react";
import { getProfile } from "../student";

export default function ProfileForm({ onSave, submitLabel = "Save details" }) {
  const existing = getProfile();
  const [name, setName] = useState(existing?.name || "");
  const [rollNo, setRollNo] = useState(existing?.rollNo || "");

  const submit = (e) => {
    e.preventDefault();
    onSave({ name: name.trim(), rollNo: rollNo.trim().toUpperCase() });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input className="input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
      <input className="input" placeholder="Roll number" value={rollNo} onChange={(e) => setRollNo(e.target.value)} required maxLength={30} />
      <button className="btn">{submitLabel}</button>
    </form>
  );
}
