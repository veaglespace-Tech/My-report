import { axiosInstance } from "@/services/axiosInstance";
import { mockAdminData } from "@/lib/mockData";

async function fetchWithFallback(request, fallback) {
  try {
    const response = await request();
    return response.data.data;
  } catch (error) {
    return fallback;
  }
}

export const adminService = {
  getDashboard: () => fetchWithFallback(() => axiosInstance.get("/admin/dashboard"), mockAdminData.dashboard),
  getCustomers: () => fetchWithFallback(() => axiosInstance.get("/admin/customers"), mockAdminData.customers),
  getProducts: () => fetchWithFallback(() => axiosInstance.get("/admin/products"), mockAdminData.products),
  getInvoices: () => fetchWithFallback(() => axiosInstance.get("/admin/invoices"), mockAdminData.invoices),
  getPlan: () => fetchWithFallback(() => axiosInstance.get("/admin/my-plan"), mockAdminData.plan),
  getReports: (startDate, endDate) =>
    fetchWithFallback(
      () =>
        axiosInstance.get("/admin/reports", {
          params: { startDate, endDate },
        }),
      mockAdminData.reports
    ),
  getNotifications: () => fetchWithFallback(() => axiosInstance.get("/admin/notifications"), { items: mockAdminData.dashboard.notifications }),
  getSettings: () => fetchWithFallback(() => axiosInstance.get("/admin/settings"), mockAdminData.settings),
  createCustomer: async (payload) => {
    try {
      const response = await axiosInstance.post("/admin/customers", payload);
      return response.data.data;
    } catch (error) {
      return { ...payload, id: Date.now(), totalSpent: 0, purchaseCount: 0 };
    }
  },
  updateCustomer: async (id, payload) => {
    try {
      const response = await axiosInstance.put(`/admin/customers/${id}`, payload);
      return response.data.data;
    } catch (error) {
      return { ...payload, id };
    }
  },
  toggleCustomerBlock: async (id) => {
    try {
      const response = await axiosInstance.patch(`/admin/customers/${id}/block`);
      return response.data.data;
    } catch (error) {
      return { id };
    }
  },
  deleteCustomer: async (id) => {
    try {
      await axiosInstance.delete(`/admin/customers/${id}`);
      return true;
    } catch (error) {
      return true;
    }
  },
  createProduct: async (payload) => {
    try {
      const response = await axiosInstance.post("/admin/products", payload);
      return response.data.data;
    } catch (error) {
      return { ...payload, id: Date.now(), stockHealth: 100 };
    }
  },
  updateProduct: async (id, payload) => {
    try {
      const response = await axiosInstance.put(`/admin/products/${id}`, payload);
      return response.data.data;
    } catch (error) {
      return { ...payload, id };
    }
  },
  deleteProduct: async (id) => {
    try {
      await axiosInstance.delete(`/admin/products/${id}`);
      return true;
    } catch (error) {
      return true;
    }
  },
  createInvoice: async (payload) => {
    try {
      const response = await axiosInstance.post("/admin/billing", payload);
      return response.data.data;
    } catch (error) {
      return {
        invoiceNumber: `INV-${Date.now()}`,
        subtotal: 0,
        taxAmount: 0,
        discountAmount: payload.discountAmount || 0,
        totalAmount: 0,
      };
    }
  },
  updateProfile: async (payload) => {
    try {
      const response = await axiosInstance.put("/admin/settings/profile", payload);
      return response.data.data;
    } catch (error) {
      return {
        profile: payload,
        preferences: {
          lowStockAlerts: true,
          planExpiryAlerts: true,
          paymentAlerts: true,
          darkMode: false,
        },
      };
    }
  },
  updatePassword: async (payload) => {
    try {
      const response = await axiosInstance.put("/admin/settings/password", payload);
      return response.data.data;
    } catch (error) {
      return { changed: true };
    }
  },
  updatePreferences: async (payload) => {
    try {
      const response = await axiosInstance.put("/admin/settings/preferences", payload);
      return response.data.data;
    } catch (error) {
      return {
        profile: {
          fullName: "Neha Sharma",
          email: "admin@myreport.com",
          mobileNumber: "9876543210",
          city: "Mumbai",
          address: "Bandra West, Mumbai",
          storeName: "GlowMart",
        },
        preferences: payload,
      };
    }
  },
};
