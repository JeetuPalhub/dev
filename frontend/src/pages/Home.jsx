import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

function fmtViews(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n || 0;
}

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load(query = "") {
    setLoading(true);
    try {
      const res = await api.getVideos(query);
      setVideos(res.data?.docs || []);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Trending on <span className="text-red-500">DevTube</span></h1>
        <form
          onSubmit={(e) => { e.preventDefault(); load(q); }}
          className="relative w-full sm:w-80"
        >
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
          <input className="input pl-10" placeholder="Search videos…" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
      </div>

      <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-video rounded-xl bg-white/5" />
            <div className="mt-3 h-4 w-3/4 rounded bg-white/10" />
            <div className="mt-2 h-3 w-1/2 rounded bg-white/5" />
          </div>
        ))}

        {!loading && videos.map((v) => (
          <Link key={v._id} to={`/video/${v._id}`} className="group">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-900">
              <img src={v.thumbnail} alt={v.title} className="h-full w-full object-cover transition group-hover:scale-105" />
              {v.duration ? (
                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
                  {Math.floor(v.duration / 60)}:{String(Math.floor(v.duration % 60)).padStart(2, "0")}
                </span>
              ) : null}
            </div>
            <div className="mt-3 flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-red-500 to-rose-700 text-sm font-bold text-white">
                {(v.owner?.username || "U")[0].toUpperCase()}
              </span>
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-sm font-semibold text-white group-hover:text-red-300">{v.title}</h3>
                <p className="mt-1 text-xs text-zinc-400">{v.owner?.fullName || v.owner?.username || "Unknown"}</p>
                <p className="text-xs text-zinc-500">{fmtViews(v.views)} views</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!loading && videos.length === 0 && (
        <div className="flex flex-col items-center py-24 text-center">
          <span className="text-5xl">📺</span>
          <h3 className="mt-4 text-lg font-semibold text-white">No videos yet</h3>
          <p className="mt-1 text-sm text-zinc-500">Be the first to upload — published videos show up here.</p>
        </div>
      )}
    </main>
  );
}
