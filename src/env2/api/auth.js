import { request } from "./client.js";

export const signup = (body) => request("/auth/signup", { method: "POST", body, auth: false });
export const login = (body) => request("/auth/login", { method: "POST", body, auth: false });
export const googleLogin = (credential) =>
  request("/auth/google", { method: "POST", body: { credential }, auth: false });
export const logout = () => request("/auth/logout", { method: "POST" });
export const forgotPassword = (email) =>
  request("/auth/forgot-password", { method: "POST", body: { email }, auth: false });
export const resetPassword = (token, password) =>
  request("/auth/reset-password", { method: "POST", body: { token, password }, auth: false });
export const verifyEmail = (token) =>
  request("/auth/verify-email", { method: "POST", body: { token }, auth: false });
export const resendVerification = (email) =>
  request("/auth/resend-verification", { method: "POST", body: { email }, auth: false });

export const fetchMe = () => request("/me");
export const chooseRole = (role) => request("/onboarding/role", { method: "POST", body: { role } });
export const fetchPropertySetup = () => request("/onboarding/property-manager-setup");
export const savePropertySetup = (body) =>
  request("/onboarding/property-manager-setup", { method: "POST", body });
