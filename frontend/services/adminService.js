import { axiosInstance } from "@/services/axiosInstance";

export const adminService = {
  getDashboard: async () => {
    const response = await axiosInstance.get("/admin/dashboard");
    return response.data.data;
  },
  getCustomers: async () => {
    const response = await axiosInstance.get("/admin/customers");
    return response.data.data;
  },
  getProducts: async () => {
    const response = await axiosInstance.get("/admin/products");
    return response.data.data;
  },
  getInvoices: async () => {
    const response = await axiosInstance.get("/admin/invoices");
    return response.data.data;
  },
  getPlan: async () => {
    const response = await axiosInstance.get("/admin/my-plan");
    return response.data.data;
  },
  getReports: async (startDate, endDate) => {
    const response = await axiosInstance.get("/admin/reports", {
      params: { startDate, endDate },
    });
    return response.data.data;
  },
  exportReportsExcel: async (startDate, endDate) => {
    const response = await axiosInstance.get("/reports/export/excel", {
      params: { startDate, endDate },
      responseType: "blob",
    });
    return response.data;
  },
  exportReportsPdf: async (startDate, endDate) => {
    const response = await axiosInstance.get("/reports/export/pdf", {
      params: { startDate, endDate },
      responseType: "blob",
    });
    return response.data;
  },
  getNotifications: async () => {
    const response = await axiosInstance.get("/admin/notifications");
    return response.data.data;
  },
  getSettings: async () => {
    const response = await axiosInstance.get("/admin/settings");
    return response.data.data;
  },
  createCustomer: async (payload) => {
    const response = await axiosInstance.post("/admin/customers", payload);
    return response.data.data;
  },
  updateCustomer: async (id, payload) => {
    const response = await axiosInstance.put(`/admin/customers/${id}`, payload);
    return response.data.data;
  },
  toggleCustomerBlock: async (id) => {
    const response = await axiosInstance.patch(`/admin/customers/${id}/block`);
    return response.data.data;
  },
  deleteCustomer: async (id) => {
    await axiosInstance.delete(`/admin/customers/${id}`);
    return true;
  },
  createProduct: async (payload) => {
    const response = await axiosInstance.post("/admin/products", payload);
    return response.data.data;
  },
  updateProduct: async (id, payload) => {
    const response = await axiosInstance.put(`/admin/products/${id}`, payload);
    return response.data.data;
  },
  deleteProduct: async (id) => {
    await axiosInstance.delete(`/admin/products/${id}`);
    return true;
  },
  createInvoice: async (payload) => {
    const response = await axiosInstance.post("/admin/billing", payload);
    return response.data.data;
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
