// ============================================================
// Module: Shared API client
// Contributor: Member 2 (Dashboard & Infra) — used by every page
// ============================================================

const API_BASE = "http://localhost:5000/api";

const Session = {
  getToken: () => localStorage.getItem("stocksense_token"),
  getUser: () => JSON.parse(localStorage.getItem("stocksense_user") || "null"),
  save(token, user) {
    localStorage.setItem("stocksense_token", token);
    localStorage.setItem("stocksense_user", JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem("stocksense_token");
    localStorage.removeItem("stocksense_user");
  },
  requireAuth() {
    if (!Session.getToken()) window.location.href = "index.html";
  },
};

async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = Session.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      Session.clear();
      window.location.href = "index.html";
    }
    throw new Error(data.message || "Something went wrong. Please try again.");
  }
  return data;
}
