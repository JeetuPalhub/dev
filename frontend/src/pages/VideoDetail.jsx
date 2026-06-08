import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";

export default function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [liked, setLiked] = useState(false);

  async function loadComments() {
    try {
      const res = await api.getComments(id);
      setComments(res.data?.docs || []);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    api.getVideo(id).then((r) => setVideo(r.data)).catch((e) => setErr(e.message));
    loadComments();
  }, [id]);

  async function postComment(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setErr("");
    try {
      await api.addComment(id, text);
      setText("");
      await loadComments();
    } catch (e) { setErr(e.message); }
  }

  async function like() {
    try { const r = await api.toggleLike(id); setLiked(r.data?.liked); }
    catch (e) { setErr(e.message); }
  }

  if (err && !video)
    return (
      <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <span className="text-5xl">⚠️</span>
        <p className="mt-4 text-zinc-400">{err}</p>
        <Link to="/" className="btn-ghost mt-6">← Back home</Link>
      </main>
    );

  if (!video)
    return (
      <main className="mx-auto max-w-4xl px-5 py-10">
        <div className="aspect-video animate-pulse rounded-2xl bg-white/5" />
      </main>
    );

  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <Link to="/" className="text-sm text-zinc-400 hover:text-white">← Back</Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
        {video.videoFile?.endsWith(".mp4") ? (
          <video src={video.videoFile} poster={video.thumbnail} controls className="aspect-video w-full" />
        ) : (
          <img src={video.thumbnail} alt={video.title} className="aspect-video w-full object-cover" />
        )}
      </div>

      <h1 className="mt-5 text-xl font-bold text-white">{video.title}</h1>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-red-500 to-rose-700 text-sm font-bold text-white">
            {(video.owner?.username || "U")[0].toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{video.owner?.fullName || video.owner?.username}</p>
            <p className="text-xs text-zinc-500">{video.views} views</p>
          </div>
        </div>
        <button onClick={like} className={`btn ${liked ? "bg-red-600 text-white" : "btn-ghost"}`}>
          {liked ? "♥ Liked" : "♡ Like"}
        </button>
      </div>

      <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-zinc-300">{video.description}</p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-white">{comments.length} Comments</h2>
        {err && <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">{err}</div>}

        <form onSubmit={postComment} className="mt-4 flex gap-3">
          <input className="input" placeholder="Add a comment…" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn-primary whitespace-nowrap">Comment</button>
        </form>

        <div className="mt-6 space-y-5">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-bold text-white">
                {(c.owner?.username || "U")[0].toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-medium text-white">@{c.owner?.username || "user"}</p>
                <p className="text-sm text-zinc-300">{c.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="text-sm text-zinc-500">No comments yet — be the first!</p>}
        </div>
      </section>
    </main>
  );
}
