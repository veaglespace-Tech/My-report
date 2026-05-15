export const publicPlanService = {
  getPlans: async () => {
    const response = await fetch("/api/public/plans", {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const message = await response.text().catch(() => "");
      throw new Error(message || `Failed to load plans (${response.status})`);
    }

    return response.json();
  },
};
