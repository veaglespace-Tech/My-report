import { axiosInstance } from "@/services/axiosInstance";

export const publicPlanService = {
  getPlans: async () => {
    try {
      const response = await axiosInstance.get("/plans");
      return response.data;
    } catch {
      const response = await axiosInstance.get("/public/plans");
      return response.data;
    }
  },
};
