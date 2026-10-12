import { request } from "./client.js";

export const lookupProfile = (type, query) =>
  request(`/lookup/${type}`, { method: "POST", body: { query } });
export const reopenProfile = (type, id) => request(`/lookup/${type}/${id}`);
export const fetchHistory = (type) => request(type ? `/history?type=${type}` : "/history");
export const deleteHistoryEntry = (id) => request(`/history/${id}`, { method: "DELETE" });
