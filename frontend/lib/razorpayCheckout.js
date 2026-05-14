"use client";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout({
  key,
  orderId,
  amount,
  currency = "INR",
  name = "MyReport",
  description,
  prefill,
  notes,
  onSuccess,
  onDismiss,
} = {}) {
  const ok = await loadRazorpayScript();
  if (!ok) throw new Error("Failed to load Razorpay checkout");

  if (!key || !orderId) throw new Error("Missing Razorpay key/order id");

  const options = {
    key,
    order_id: orderId,
    amount: Math.round(Number(amount || 0) * 100),
    currency,
    name,
    description,
    prefill,
    notes,
    theme: { color: "#4fd1c5" },
    handler: (response) => onSuccess?.(response),
    modal: {
      ondismiss: () => onDismiss?.(),
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
  return rzp;
}

