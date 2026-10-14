import API_BASE_URL from "../../api.js";
import { authFetch, getSession, readError } from "../../session.js";

const PREFIX = "/hyeve-admin";

function query(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : "";
}

async function json(path, options) {
  const response = await authFetch(`${PREFIX}${path}`, options);
  return response.json();
}

const post = (path, body) => json(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });

export const fetchMe = () => json("/me");
export const fetchOverview = () => json("/overview");
export const fetchReports = (params) => json(`/reports${query(params)}`);
export const fetchNetworkIntelligence = () => json("/network-intelligence");
export const fetchCleanup = () => json("/data/cleanup");
export const fetchList = (path, params) => json(`/${path}${query(params)}`);
export const fetchAuditOptions = () => json("/audit/options");
export const fetchDatasets = () => json("/datasets");
export const fetchDeleted = () => json("/data/deleted");

export const updateUser = (id, body) => post(`/users/${id}/update`, body);
export const setUserStatus = (id, action) => post(`/users/${id}/status`, { action });
export const deleteUser = (id) => post(`/users/${id}/delete`);
export const setVerification = (id, value) => post(`/property-managers/${id}/verification`, { value });
export const flagActivity = (id, flagged) => post(`/activity/${id}/flag`, { flagged });
export const restoreProfile = (id) => post(`/data/deleted/${id}/restore`);
export const purgeProfile = (id) => post(`/data/deleted/${id}/purge`);
export const createAdmin = (body) => post("/admins", body);
export const setAdminRole = (id, role) => post(`/admins/${id}/role`, { role });
export const setAdminActive = (id, active) => post(`/admins/${id}/active`, { active });

export async function downloadDataset(dataset, mask) {
  const response = await authFetch(`${PREFIX}/export/${dataset}${query({ mask })}`);
  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="([^"]+)"/);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = match ? match[1] : `hyeve-${dataset}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function changePassword(username, oldPassword, newPassword) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, old_password: oldPassword, new_password: newPassword }),
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function adminLogin(username, password) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${PREFIX}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || `Server error (${response.status})`);
  return data;
}

export async function adminLogout() {
  const session = getSession();
  if (!session) return;
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.token}` },
    });
  } catch {
    return;
  }
}
