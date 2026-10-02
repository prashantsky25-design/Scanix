import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import { formatDate } from "../utils";

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/events/${id}`).then((r) => setEvent(r.data)).catch(() => setError("Event not found."));
  }, [id]);

  if (error) return <p className="text-center text-red-600 dark:text-red-400">{error}</p>;
  if (!event) return <p className="text-center text-slate-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="card space-y-2">
        <h1 className="text-xl font-bold">{event.title}</h1>
        <p className="text-sm text-slate-600">📅 {formatDate(event.date)}</p>
        <p className="text-sm text-slate-600">📍 {event.venue}</p>
        {event.description && (
          <p className="whitespace-pre-line pt-2 text-slate-700">{event.description}</p>
        )}
      </div>
      <Link to={`/events/${id}/register`} className="btn block">Register</Link>
    </div>
  );
}
