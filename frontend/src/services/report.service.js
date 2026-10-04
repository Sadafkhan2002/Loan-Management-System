import api from "../api/axios";

const getLoanReports = async (params = {}) => {
  const response = await api.get("/reports/loans", {
    params,
  });

  return response.data;
};

const getPaymentReports = async (params = {}) => {
  const response = await api.get("/reports/payments", {
    params,
  });

  return response.data;
};

const getCustomerReports = async (params = {}) => {
  const response = await api.get("/reports/customers", {
    params,
  });

  return response.data;
};

const getFinancialReports = async (params = {}) => {
  const response = await api.get("/reports/financial", {
    params,
  });

  return response.data;
};

export default {
  getLoanReports,
  getPaymentReports,
  getCustomerReports,
  getFinancialReports,
};