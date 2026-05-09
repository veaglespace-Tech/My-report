import { axiosInstance } from "@/services/axiosInstance";

export async function login(payload) {
  const response = await axiosInstance.post("/auth/login", payload);
  return response.data.data;
}

export async function register(payload) {
  const response = await axiosInstance.post("/auth/register", payload);
  return response.data.data;
}

export async function createSignupRazorpayOrder(payload) {
  const response = await axiosInstance.post("/auth/register/razorpay/order", payload);
  return response.data.data;
}

export async function verifySignupRazorpayPayment(payload) {
  const response = await axiosInstance.post("/auth/register/razorpay/verify", payload);
  return response.data.data;
}

export async function signupAdmin(payload) {
  const response = await axiosInstance.post("/auth/admin/signup", payload);
  return response.data.data;
}

export async function verifyOtp(payload) {
  const response = await axiosInstance.post("/auth/admin/verify-otp", payload);
  return response.data.data;
}

export async function fetchMe() {
  const response = await axiosInstance.get("/auth/me");
  return response.data.data;
}
