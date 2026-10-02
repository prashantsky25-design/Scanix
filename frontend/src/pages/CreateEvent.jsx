import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api";
import { saveHosted } from "../hosted";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", date: "", venue: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/events", {
        ...form,
        date: new Date(form.date).toISOString(),
      });
      saveHosted({ id: data.id, key: data.hostKey, title: form.title.trim() });
      navigate(`/host/${data.id}?key=${data.hostKey}`);
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <h1 className="text-xl font-bold">Create event</h1>
      <input className="input" name="title" placeholder="Event title" value={form.title} onChange={change} required maxLength={120} />
      <textarea className="input" name="description" placeholder="Description (optional)" rows={4} value={form.description} onChange={change} maxLength={2000} />
      <input className="input" name="date" type="datetime-local" value={form.date} onChange={change} required />
      <input className="input" name="venue" placeholder="Venue" value={form.venue} onChange={change} required maxLength={200} />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button className="btn" disabled={loading}>{loading ? "Creating…" : "Create event"}</button>
    </form>
  );
}
