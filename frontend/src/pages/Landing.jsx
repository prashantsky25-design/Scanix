import { Link } from "react-router-dom";
import Logo from "../components/Logo";

const OPTIONS = [
  { to: "/attend", icon: "📲", title: "Mark my attendance", text: "Students: scan the QR on the teacher's screen" },
  { to: "/class", icon: "👩‍🏫", title: "Start a class", text: "Teachers: show a QR that changes every few seconds" },
  { to: "/qr", icon: "🔳", title: "Generate QR", text: "Turn a link or text into a QR code" },
];

export default function Landing() {
  return (
    <div className="space-y-4">
      <Logo variant="full" className="mx-auto mb-2 w-64" />
      <h1 className="text-2xl font-bold">What would you like to do?</h1>
      {OPTIONS.map((o) => (
        <Link key={o.to} to={o.to} className="card flex items-center gap-4 active:bg-slate-50">
          <span className="text-3xl" aria-hidden="true">{o.icon}</span>
          <span>
            <span className="block text-lg font-semibold">{o.title}</span>
            <span className="block text-sm text-slate-600">{o.text}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
