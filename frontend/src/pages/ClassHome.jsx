import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api";
import { getClasses, saveClass } from "../hosted";

export default function ClassHome() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const classes = getClasses();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/classes", { title });
      saveClass({ id: data.id, key: data.hostKey, title: title.trim() });
      navigate(`/class/${data.id}?key=${data.hostKey}`);
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="space-y-3">
        <h1 className="text-xl font-bold">Start a class</h1>
        <input className="input" placeholder="Class name, e.g. Maths – Unit 2" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button className="btn" disabled={loading}>{loading ? "Starting…" : "Start class"}</button>
      </form>

      {classes.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Your recent classes</h2>
          {classes.map((c) => (
            <Link key={c.id} to={`/class/${c.id}?key=${c.key}`} className="card block active:bg-slate-50">
              <span className="block font-medium">{c.title}</span>
              <span className="block text-sm text-indigo-600 dark:text-indigo-400">Open</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
