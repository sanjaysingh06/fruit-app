import axios from "axios";

// Create custom instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 🔐 Attach access token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("access");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// 🔁 Auto refresh token
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");

        if (!refresh) {
          throw new Error("No refresh token");
        }

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/refresh/`,
          { refresh }
        );

        // Save new access token
        localStorage.setItem("access", res.data.access);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return API(originalRequest);

      } catch (err) {
        // Logout if refresh fails
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;