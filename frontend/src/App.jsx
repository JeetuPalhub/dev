import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "./lib/api";
import Home from "./pages/Home";
import Login from "./pages/Login";
import VideoDetail from "./pages/VideoDetail";

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.currentUser().then((r) => setUser(r.data)).catch(() => setUser(null));
  }, []);

  async function logout() {
    try { await api.logout(); } catch { /* ignore */ }
    setUser(null);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-600 text-lg">📺</span>
          <span className="text-lg font-extrabold text-white">Dev<span className="text-red-500">Tube</span></span>
        </Link>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-zinc-400 sm:inline">@{user.username}</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-red-500 to-rose-700 text-sm font-bold text-white">
              {(user.username || "U")[0].toUpperCase()}
            </span>
            <button onClick={logout} className="btn-ghost py-2">Logout</button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary py-2">Sign in</Link>
        )}
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/video/:id" element={<VideoDetail />} />
      </Routes>
    </div>
  );
}
