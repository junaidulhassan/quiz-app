import API_BASE_URL from "./api";

const SESSION_KEY = "dashboard_session";

export function getSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!session || !session.token) return null;
    if (session.expires_at && Date.now() >= session.expires_at) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function saveSession(data) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      token: data.token,
      user_id: data.user_id,
      username: data.username,
      expires_at: data.expires_in ? Date.now() + data.expires_in * 1000 : null,
    })
  );
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // storage unavailable — nothing to clear
  }
}

export class SessionExpiredError extends Error {
  constructor(message = "Your session has expired. Please log in again.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

/** Turn any error response body into a readable message. */
export async function readError(res, fallback) {
  const body = await res.json().catch(() => ({}));
  if (typeof body.detail === "string" && body.detail) return body.detail;
  return fallback || `Server error (${res.status})`;
}

/**
 * fetch() against the API with the dashboard token attached. A 401 clears the
 * stored session and throws SessionExpiredError so callers can send the user to login.
 */
export async function authFetch(path, options = {}) {
  const session = getSession();
  if (!session) throw new SessionExpiredError();

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
        Authorization: `Bearer ${session.token}`,
      },
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }

  if (res.status === 401) {
    clearSession();
    throw new SessionExpiredError(await readError(res, undefined));
  }
  if (!res.ok) throw new Error(await readError(res));
  return res;
}
