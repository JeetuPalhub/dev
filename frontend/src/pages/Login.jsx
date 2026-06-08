import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const body = form.email
        ? { email: form.email, password: form.password }
        : { username: form.username, password: form.password };
      await api.login(body);
      navigate("/");
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center px-5 py-12">
      <div className="card w-full">
        <div className="mb-6 text-center">
          <span className="grid mx-auto mb-3 h-12 w-12 place-items-center rounded-2xl bg-red-600 text-2xl">📺</span>
          <h1 className="text-2xl font-bold text-white">Sign in to DevTube</h1>
          <p className="mt-1 text-sm text-zinc-400">Use your email or username</p>
        </div>

        {err && <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{err}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={update("email")} /></div>
          <div className="text-center text-xs text-zinc-600">— or —</div>
          <div><label className="label">Username</label>
            <input className="input" placeholder="jeetu" value={form.username} onChange={update("username")} /></div>
          <div><label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••" required value={form.password} onChange={update("password")} /></div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          New here? Create an account via the API (avatar upload uses Cloudinary).
        </p>
      </div>
    </main>
  );
}
