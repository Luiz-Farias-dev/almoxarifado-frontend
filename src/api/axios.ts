import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de request: adiciona Access Token no header
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Variáveis de controle
let isRefreshing = false;
let failedRequestsQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Interceptor de resposta: tenta refresh em caso de 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest.url?.includes("/login")
    ) {
      return Promise.reject(error); // Deixa o componente tratar o erro
    }

    // Demais casos de 401 (token expirado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Se não estiver em refresh, dispara o refresh
      isRefreshing = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        // Sem refresh token, desloga
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Chama o endpoint /refresh-token mandando o refresh token no header:
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}refresh-token/`,
          {},
          {
            headers: {
              "x-refresh-token": refreshToken,
            },
          }
        );

        const { access_token, refresh_token: newRefreshToken } =
          refreshResponse.data;

        // Atualiza no localStorage
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Resolve as requisições que estavam na fila
        failedRequestsQueue.forEach((req) => {
          req.resolve(access_token);
        });
        failedRequestsQueue = [];

        // Refaz a requisição original com o novo token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axios(originalRequest);
      } catch (err) {
        // Se deu erro no refresh, desloga
        failedRequestsQueue.forEach((req) => {
          req.reject(err);
        });
        failedRequestsQueue = [];
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
