/**
 * Axios instance pre-configured for the AutoDrop API.
 * - Sends cookies with every request (withCredentials)
 * - Auto-retries once on 401 by attempting a token refresh
 */
import axios from "axios";

const api = axios.create({
    baseURL: "/api/v1",
    withCredentials: true,           // send HTTP-only cookies
    headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;

// Try to refresh the access token on 401, then replay the original request
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (
            error.response?.status === 401 &&
            !original._retry &&
            !original.url?.includes("/auth/")
        ) {
            if (isRefreshing) return Promise.reject(error);
            isRefreshing = true;
            original._retry = true;
            try {
                await api.post("/auth/refresh");
                return api(original);
            } catch {
                // refresh failed — caller handles redirect to /login
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
