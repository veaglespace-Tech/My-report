export const publicPlanService = {
  getPlans: async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
    const response = await fetch(`${baseUrl}/public/plans`, {
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
