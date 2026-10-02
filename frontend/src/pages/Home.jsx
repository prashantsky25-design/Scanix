import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { formatDate } from "../utils";

export default function Home() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/events").then((r) => setEvents(r.data)).catch(() => setError("Could not load events."));
  }, []);

  if (error) return <p className="text-center text-red-600 dark:text-red-400">{error}</p>;
  if (!events) return <p className="text-center text-slate-500">Loading…</p>;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Upcoming events</h1>
      {events.length === 0 && <p className="text-slate-500">No upcoming events yet.</p>}
      {events.map((e) => (
        <Link key={e._id} to={`/events/${e._id}`} className="card block active:bg-slate-50">
          <h2 className="font-semibold">{e.title}</h2>
          <p className="text-sm text-slate-600">{formatDate(e.date)}</p>
          <p className="text-sm text-slate-500">{e.venue}</p>
        </Link>
      ))}
    </div>
  );
}
