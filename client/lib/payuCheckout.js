"use client";

export const PENDING_PAYU_SIGNUP_KEY = "myreport:pendingPayuSignup";

export function submitPayUCheckout(order) {
  if (typeof window === "undefined") {
    throw new Error("PayU checkout can only open in a browser");
  }

  const paymentUrl = order?.paymentUrl;
  const formFields = order?.formFields;
  if (!paymentUrl || !formFields || typeof formFields !== "object") {
    throw new Error("Missing PayU payment details");
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = paymentUrl;
  form.style.display = "none";

  Object.entries(formFields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value == null ? "" : String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
