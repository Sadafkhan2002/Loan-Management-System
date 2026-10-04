import api from "../api/axios";

const getCustomers = async ({
  page = 1,
  limit = 10,
  search = "",
} = {}) => {
  const response = await api.get("/customers", {
    params: {
      page,
      limit,
      search,
    },
  });

  return response.data;
};

const getCustomerById = async (id) => {
  const response = await api.get(`/customers/${id}`);

  return response.data;
};

const createCustomer = async (customerData) => {
  const response = await api.post("/customers", customerData);

  return response.data;
};

const updateCustomer = async (id, customerData) => {
  const response = await api.put(
    `/customers/${id}`,
    customerData
  );

  return response.data;
};

const deleteCustomer = async (id) => {
  const response = await api.delete(`/customers/${id}`);

  return response.data;
};

export default {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};