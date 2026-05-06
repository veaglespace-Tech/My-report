import { axiosInstance } from "@/services/axiosInstance";
import { mockSuperAdminData } from "@/lib/mockData";

async function fetchWithFallback(request, fallback) {
  try {
    const response = await request();
    return response.data.data;
  } catch (error) {
    return fallback;
  }
}

export const superAdminService = {
  getDashboard: () => fetchWithFallback(() => axiosInstance.get("/super-admin/dashboard"), mockSuperAdminData.dashboard),
  getAdmins: () => fetchWithFallback(() => axiosInstance.get("/super-admin/admins"), mockSuperAdminData.admins),
  getStores: (storeType) =>
    fetchWithFallback(
      () => axiosInstance.get("/super-admin/stores", { params: { storeType } }),
      storeType
        ? {
            ...mockSuperAdminData.stores,
            items: mockSuperAdminData.stores.items.filter((s) => (s.storeType || "").toLowerCase() === String(storeType || "").toLowerCase()),
          }
        : mockSuperAdminData.stores
    ),
  getPlans: () => fetchWithFallback(() => axiosInstance.get("/super-admin/plans"), mockSuperAdminData.plans),
  getInvoices: () => fetchWithFallback(() => axiosInstance.get("/super-admin/invoices"), mockSuperAdminData.invoices),
  getReports: () => fetchWithFallback(() => axiosInstance.get("/super-admin/reports"), mockSuperAdminData.reports),
  getSettings: () => fetchWithFallback(() => axiosInstance.get("/super-admin/settings"), { profile: {} }),
  createAdmin: async (payload) => {
    try {
      const response = await axiosInstance.post("/super-admin/admins", payload);
      return response.data.data;
    } catch (error) {
      return { ...payload, id: Date.now(), status: "ACTIVE", emailVerified: true, plan: "Starter" };
    }
  },
  updateAdmin: async (id, payload) => {
    try {
      const response = await axiosInstance.put(`/super-admin/admins/${id}`, payload);
      return response.data.data;
    } catch (error) {
      return { ...payload, id };
    }
  },
  approveAdmin: async (id) => {
    try {
      const response = await axiosInstance.patch(`/super-admin/admins/${id}/approve`);
      return response.data.data;
    } catch (error) {
      return { id, status: "ACTIVE" };
    }
  },
  toggleAdminStatus: async (id) => {
    try {
      const response = await axiosInstance.patch(`/super-admin/admins/${id}/status`);
      return response.data.data;
    } catch (error) {
      return { id };
    }
  },
  deleteAdmin: async (id) => {
    try {
      await axiosInstance.delete(`/super-admin/admins/${id}`);
      return true;
    } catch (error) {
      return true;
    }
  },
  createPlan: async (payload) => {
    try {
      const response = await axiosInstance.post("/super-admin/plans", payload);
      return response.data.data;
    } catch (error) {
      return { ...payload, id: Date.now() };
    }
  },
  updatePlan: async (id, payload) => {
    try {
      const response = await axiosInstance.put(`/super-admin/plans/${id}`, payload);
      return response.data.data;
    } catch (error) {
      return { ...payload, id };
    }
  },
  togglePlan: async (id) => {
    try {
      const response = await axiosInstance.patch(`/super-admin/plans/${id}/toggle`);
      return response.data.data;
    } catch (error) {
      return { id };
    }
  },
  deletePlan: async (id) => {
    try {
      await axiosInstance.delete(`/super-admin/plans/${id}`);
      return true;
    } catch (error) {
      return true;
    }
  },
};
