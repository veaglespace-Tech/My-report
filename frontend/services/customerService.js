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
  filterOrders: async ({ query, name, startDate, endDate } = {}) => {
    const response = await axiosInstance.get(`/customers/orders/filter`, {
      params: { query, name, startDate, endDate },
    });
    return response.data.data;
  },
};

