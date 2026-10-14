import { request } from "./client.js";

export const fetchAccount = () => request("/account");
export const updateAccount = (body) => request("/account/update", { method: "POST", body });
export const deleteAccount = () => request("/account/delete", { method: "POST", body: {} });
export const fetchBilling = () => request("/billing");
