import { axiosInstance } from "@/services/axiosInstance";

export async function createRazorpayOrder(payload) {
  try {
    const response = await axiosInstance.post("/payments/razorpay/order", payload);
    return response.data.data;
  } catch (error) {
    return {
      configured: false,
      keyId: "rzp_test_your_key",
      orderId: `order_${Date.now()}`,
      amount: payload.amount,
      currency: "INR",
      mode: "demo",
      planName: payload.planName,
    };
  }
}

export async function verifyRazorpayPayment(payload) {
  const response = await axiosInstance.post("/payments/razorpay/verify", payload);
  return response.data.data;
}
