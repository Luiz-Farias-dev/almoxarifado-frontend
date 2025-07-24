import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Envia cookies automaticamente
});

// Variáveis de controle
let isRefreshing = false;
let failedRequestsQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Interceptor de resposta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest.url?.includes("/login")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // Chamada SIMPLES ao refresh endpoint
        await api.post(`refresh-token/`);

        // Repete a requisição original
        return api(originalRequest);
      } catch (refreshError) {
        // Redireciona para login em caso de erro
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        // Processa fila de requisições
        failedRequestsQueue.forEach((req) => req.resolve());
        failedRequestsQueue = [];
      }
    }

    return Promise.reject(error);
  }
);

export default api;
