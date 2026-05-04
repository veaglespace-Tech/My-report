import axios from "axios";
import { getSessionToken } from "@/lib/session";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getSessionToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiMessage = error?.response?.data?.message;
    const validationErrors = error?.response?.data?.data;

    if (validationErrors && typeof validationErrors === "object" && !Array.isArray(validationErrors)) {
      const details = Object.entries(validationErrors)
        .map(([field, message]) => `${field}: ${message}`)
        .join(", ");
      return Promise.reject(new Error(details || apiMessage || "Request failed"));
    }

    return Promise.reject(apiMessage ? new Error(apiMessage) : error);
  }
);
