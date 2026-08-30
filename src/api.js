const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://hyeve.net/api"
).replace(/\/$/, "");

export default API_BASE_URL;
