import api from "../api/axios";

const getPayments = async ({
  page = 1,
  limit = 10,
  loanId = "",
} = {}) => {
  const response = await api.get("/payments", {
    params: {
      page,
      limit,
      loanId,
    },
  });

  return response.data;
};

const getPaymentById = async (id) => {
  const response = await api.get(`/payments/${id}`);

  return response.data;
};

const createPayment = async (paymentData) => {
  const response = await api.post(
    "/payments",
    paymentData
  );

  return response.data;
};

const deletePayment = async (id) => {
  const response = await api.delete(
    `/payments/${id}`
  );

  return response.data;
};

export default {
  getPayments,
  getPaymentById,
  createPayment,
  deletePayment,
};