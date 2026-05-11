import { axiosInstance } from "@/services/axiosInstance";

export const publicPlanService = {
  getPlans: async () => {
    const response = await axiosInstance.get("/public/plans");
    return response.data.data;
  },
};

