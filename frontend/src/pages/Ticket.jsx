import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "qrcode";
import api from "../api";
import { formatDate } from "../utils";

export default function Ticket() {
  const { qrToken } = useParams();
  const [ticket, setTicket] = useState(null);
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/registrations/${qrToken}`);
        const url = await QRCode.toDataURL(qrToken, { width: 320, margin: 2 });
        if (!cancelled) {
          setTicket(data);
          setQr(url);
        }
      } catch {
        if (!cancelled) setError("Ticket not found.");
      }
    })();
    return () => { cancelled = true; };
  }, [qrToken]);

  if (error) return <p className="text-center text-red-600 dark:text-red-400">{error}</p>;
  if (!ticket) return <p className="text-center text-slate-500">Loading…</p>;

  return (
    <div className="space-y-4 text-center">
      <p className="font-semibold text-green-600 dark:text-green-400">You're registered ✅</p>
      <div className="card space-y-3">
        <img src={qr} alt="Your QR code" className="mx-auto w-full max-w-xs" />
        <div>
          <p className="font-bold">{ticket.name}</p>
          <p className="text-sm text-slate-600">{ticket.event.title}</p>
          <p className="text-sm text-slate-500">{formatDate(ticket.event.date)} · {ticket.event.venue}</p>
        </div>
      </div>
      <p className="text-sm text-slate-500">
        Show this QR at the entrance. Bookmark this page or take a screenshot so you can find it again.
      </p>
      <Link to="/events" className="btn-light block">Back to events</Link>
    </div>
  );
}
