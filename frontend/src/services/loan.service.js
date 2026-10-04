import api from "../api/axios";

const getLoans = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
} = {}) => {
  const response = await api.get("/loans", {
    params: {
      page,
      limit,
      search,
      status,
    },
  });

  return response.data;
};

const getLoanById = async (id) => {
  const response = await api.get(`/loans/${id}`);

  return response.data;
};

const createLoan = async (loanData) => {
  const response = await api.post("/loans", loanData);

  return response.data;
};

const updateLoan = async (id, loanData) => {
  const response = await api.put(`/loans/${id}`, loanData);

  return response.data;
};

const approveLoan = async (id) => {
  const response = await api.patch(`/loans/${id}/approve`);

  return response.data;
};

const rejectLoan = async (id) => {
  const response = await api.patch(`/loans/${id}/reject`);

  return response.data;
};

const activateLoan = async (id) => {
  const response = await api.patch(`/loans/${id}/activate`);

  return response.data;
};

export default {
  getLoans,
  getLoanById,
  createLoan,
  updateLoan,
  approveLoan,
  rejectLoan,
  activateLoan,
};