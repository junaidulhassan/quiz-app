import API_BASE_URL from "../../api.js";

const SESSION_KEY = "hyeve_env2_session";
export const SIGNUP_PREFILL_KEY = "hyeve_signup_prefill";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data || {};
  }
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session.token || Date.now() >= session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveSession(token, expiresIn) {
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ token, expiresAt: Date.now() + expiresIn * 1000 })
    );
  } catch {
    return;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    return;
  }
}

async function readBody(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const session = getSession();
    if (session) headers.Authorization = `Bearer ${session.token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/hyeve${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  const data = await readBody(response);
  if (response.ok) return data;

  if (response.status === 401 && auth && getSession()) {
    clearSession();
    window.dispatchEvent(new Event("hyeve:session-expired"));
  }

  throw new ApiError(data.detail || `Server error (${response.status})`, response.status, data);
}
