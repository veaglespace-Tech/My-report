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
  getEnquiries: ({ status, source, q } = {}) =>
    fetchWithFallback(
      () =>
        axiosInstance.get("/support/enquiries", {
          params: {
            status,
            source,
            q,
          },
        }),
      { items: [], total: 0, stats: {} }
    ),
  replyEnquiry: async (payload) => {
    const response = await axiosInstance.post("/support/reply", payload);
    return response.data.data;
  },
  updateSupportStatus: async (payload) => {
    const response = await axiosInstance.put("/support/status", payload);
    return response.data.data;
  },
  deleteSupportEnquiry: async (id) => {
    const response = await axiosInstance.delete(`/support/delete/${id}`);
    return response.data.data;
  },
  getReports: ({ range, startDate, endDate } = {}) =>
    fetchWithFallback(
      () =>
        axiosInstance.get("/super-admin/reports", {
          params: {
            range,
            startDate,
            endDate,
          },
        }),
      mockSuperAdminData.reports
    ),
  getSettings: () => fetchWithFallback(() => axiosInstance.get("/super-admin/settings"), { profile: {}, preferences: {} }),
  updateProfile: async (payload) => {
    const response = await axiosInstance.put("/super-admin/settings/profile", payload);
    return response.data.data;
  },
  updatePassword: async (payload) => {
    const response = await axiosInstance.put("/super-admin/settings/password", payload);
    return response.data.data;
  },
  updatePreferences: async (payload) => {
    const response = await axiosInstance.put("/super-admin/settings/preferences", payload);
    return response.data.data;
  },
  createStore: async (payload) => {
    const response = await axiosInstance.post("/super-admin/stores", payload);
    return response.data.data;
  },
  createAdmin: async (payload) => {
    const response = await axiosInstance.post("/super-admin/admins", payload);
    return response.data.data;
  },
  updateAdmin: async (id, payload) => {
    const response = await axiosInstance.put(`/super-admin/admins/${id}`, payload);
    return response.data.data;
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
    const response = await axiosInstance.post("/super-admin/plans", payload);
    return response.data.data;
  },
  updatePlan: async (id, payload) => {
    const response = await axiosInstance.put(`/super-admin/plans/${id}`, payload);
    return response.data.data;
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
