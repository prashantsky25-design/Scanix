import { Link } from "react-router-dom";
import { getHosted } from "../hosted";

export default function Presence() {
  const events = getHosted();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Mark presence</h1>

      {events.length === 0 ? (
        <div className="card space-y-3">
          <p className="text-slate-700">
            No events found on this device. Create an event first, or open the private host link you saved when you created it.
          </p>
          <Link to="/host/create" className="btn block">Host event</Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-600">Choose the event to scan for.</p>
          {events.map((e) => (
            <Link key={e.id} to={`/host/${e.id}?key=${e.key}`} className="card block active:bg-slate-50">
              <span className="block font-semibold">{e.title}</span>
              <span className="block text-sm text-indigo-600 dark:text-indigo-400">Open scanner</span>
            </Link>
          ))}
        </>
      )}
    </div>
  );
}
