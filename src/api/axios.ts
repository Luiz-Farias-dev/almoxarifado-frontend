import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor: add Bearer token except for login/signup
api.interceptors.request.use(
  (config) => {
    const url = config.url ?? "";
    if (!url.includes("/login") && !url.includes("/signup")) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401 redirect to login (backend has no refresh endpoint)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest.url?.includes("/login")) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
