import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { errorMessage } from "../api";

export default function Register() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/events/${id}`).then((r) => setTitle(r.data.title)).catch(() => setError("Event not found."));
  }, [id]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post(`/events/${id}/register`, form);
      navigate(`/ticket/${data.qrToken}`);
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <h1 className="text-xl font-bold">Register</h1>
      {title && <p className="text-slate-600">{title}</p>}
      <input className="input" name="name" placeholder="Full name" value={form.name} onChange={change} required maxLength={100} />
      <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={change} required />
      <input className="input" name="phone" type="tel" placeholder="Phone (optional)" value={form.phone} onChange={change} maxLength={20} />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button className="btn" disabled={loading}>{loading ? "Registering…" : "Get my QR"}</button>
    </form>
  );
}
