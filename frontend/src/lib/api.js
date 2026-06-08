const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

async function request(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export const api = {
  login: (body) => request("/users/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/users/logout", { method: "POST" }),
  currentUser: () => request("/users/current-user"),
  getVideos: (q = "") => request(`/videos${q ? `?query=${encodeURIComponent(q)}` : ""}`),
  getVideo: (id) => request(`/videos/${id}`),
  getComments: (videoId) => request(`/comments/${videoId}`),
  addComment: (videoId, content) =>
    request(`/comments/${videoId}`, { method: "POST", body: JSON.stringify({ content }) }),
  toggleLike: (videoId) => request(`/likes/toggle/v/${videoId}`, { method: "POST" }),
};
