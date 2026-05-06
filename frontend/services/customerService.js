import { axiosInstance } from "@/services/axiosInstance";

export const customerService = {
  getCustomer: async (id) => {
    const response = await axiosInstance.get(`/customers/${id}`);
    return response.data.data;
  },
  getCustomerOrders: async (id, { startDate, endDate } = {}) => {
    const response = await axiosInstance.get(`/customers/${id}/orders`, {
      params: { startDate, endDate },
    });
    return response.data.data;
  },
  filterOrders: async ({ name, startDate, endDate } = {}) => {
    const response = await axiosInstance.get(`/customers/orders/filter`, {
      params: { name, startDate, endDate },
    });
    return response.data.data;
  },
};

