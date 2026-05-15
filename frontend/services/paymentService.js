import { axiosInstance } from "@/services/axiosInstance";

export async function createRazorpayOrder(payload) {
  const response = await axiosInstance.post("/payments/razorpay/order", payload);
  return response.data.data;
}

export async function verifyRazorpayPayment(payload) {
  const response = await axiosInstance.post("/payments/razorpay/verify", payload);
  return response.data.data;
}

export async function createPayUOrder(payload) {
  const response = await axiosInstance.post("/payments/payu/order", payload);
  return response.data.data;
}

export async function getPayUPaymentStatus(txnid) {
  const response = await axiosInstance.get("/payments/payu/status", {
    params: { txnid },
  });
  return response.data.data;
}
