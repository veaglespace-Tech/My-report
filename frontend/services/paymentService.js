import { axiosInstance } from "@/services/axiosInstance";

export async function createRazorpayOrder(payload) {
  const response = await axiosInstance.post("/payments/razorpay/order", payload);
  return response.data.data;
}

export async function verifyRazorpayPayment(payload) {
  const response = await axiosInstance.post("/payments/razorpay/verify", payload);
  return response.data.data;
}
