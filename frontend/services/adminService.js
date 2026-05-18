import { axiosInstance } from "@/services/axiosInstance";

export const adminService = {
  getDashboard: async () => {
    const response = await axiosInstance.get("/admin/dashboard");
    return response.data.data;
  },
  getTodaySales: async () => {
    const response = await axiosInstance.get("/admin/dashboard/today-sales");
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
  getReports: async (startDate, endDate, range) => {
    const response = await axiosInstance.get("/admin/reports", {
      params: { startDate, endDate, range },
    });
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
    const response = await axiosInstance.put("/admin/settings/profile", payload);
    return response.data.data;
  },
  uploadProfilePhoto: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post("/admin/settings/profile-photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },
  removeProfilePhoto: async () => {
    const response = await axiosInstance.delete("/admin/settings/profile-photo");
    return response.data.data;
  },
  updatePassword: async (payload) => {
    const response = await axiosInstance.put("/admin/settings/password", payload);
    return response.data.data;
  },
};
