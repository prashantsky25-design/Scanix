import { Link, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import Register from "./pages/Register";
import Ticket from "./pages/Ticket";
import CreateEvent from "./pages/CreateEvent";
import HostEvent from "./pages/HostEvent";
import QrGenerator from "./pages/QrGenerator";
import Presence from "./pages/Presence";
import ClassHome from "./pages/ClassHome";
import ClassLive from "./pages/ClassLive";
import Attend from "./pages/Attend";
import AttendMark from "./pages/AttendMark";
import Logo from "./components/Logo";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link to="/" aria-label="Scanix home"><Logo className="h-9 w-auto" /></Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-5">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/class" element={<ClassHome />} />
          <Route path="/class/:id" element={<ClassLive />} />
          <Route path="/attend" element={<Attend />} />
          <Route path="/attend/:id" element={<AttendMark />} />
          <Route path="/events" element={<Home />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/events/:id/register" element={<Register />} />
          <Route path="/ticket/:qrToken" element={<Ticket />} />
          <Route path="/qr" element={<QrGenerator />} />
          <Route path="/presence" element={<Presence />} />
          <Route path="/host/create" element={<CreateEvent />} />
          <Route path="/host/:id" element={<HostEvent />} />
          <Route path="*" element={<p className="text-center text-slate-500">Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
