export const fallbackPublicPlans = [
  {
    id: 1,
    name: "FREE TRIAL",
    planName: "FREE TRIAL",
    duration: "7 Days",
    price: 0,
    description: "7-day free trial to explore MyReport.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxProducts: 250,
    maxCustomers: 1000,
    features: "Starter workspace, Billing, Reports, Trial support",
    trialAvailable: true,
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Starter",
    planName: "Starter",
    duration: "1 Month",
    price: 1499,
    description: "Essential billing, customers, and sales reporting for growing stores.",
    monthlyPrice: 1499,
    yearlyPrice: 14999,
    maxProducts: 250,
    maxCustomers: 1000,
    features: "POS Billing, GST invoices, Weekly reports, Email support",
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Growth",
    planName: "Growth",
    duration: "6 Months",
    price: 3499,
    description: "Advanced analytics, inventory intelligence, and multi-user workflows.",
    monthlyPrice: 3499,
    yearlyPrice: 34999,
    maxProducts: 2000,
    maxCustomers: 10000,
    features: "Animated dashboards, Teams, Multi-export, Priority support",
    status: "ACTIVE",
  },
  {
    id: 4,
    name: "Enterprise",
    planName: "Enterprise",
    duration: "12 Months",
    price: 6999,
    description: "Custom workflows, SLAs, deeper visibility, and premium onboarding.",
    monthlyPrice: 6999,
    yearlyPrice: 69999,
    maxProducts: 10000,
    maxCustomers: 50000,
    features: "Dedicated success, Custom roles, API access, SLA support",
    status: "ACTIVE",
  },
];

export function getPublicPlanItems(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.items)) {
    return response.items;
  }

  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  if (response?.data && Array.isArray(response.data.items)) {
    return response.data.items;
  }

  return [];
}

export const publicPlanService = {
  getPlans: async () => {
    try {
      const response = await fetch("/api/public/plans", {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const message = await response.text().catch(() => "");
        const isHtmlError = /^\s*<!doctype html/i.test(message) || /^\s*<html/i.test(message);
        throw new Error(isHtmlError || !message ? `Failed to load plans (${response.status})` : message);
      }

      const data = await response.json();
      const items = getPublicPlanItems(data);
      return items.length ? data : { success: true, data: { items: fallbackPublicPlans } };
    } catch {
      return { success: true, data: { items: fallbackPublicPlans } };
    }
  },
};
