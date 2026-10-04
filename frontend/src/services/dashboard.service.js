import api from "../api/axios";

const getDashboard = async () => {
  const response = await api.get("/dashboard");

  return response.data;
};

const getStatistics = async () => {
  const response = await api.get("/dashboard/statistics");

  return response.data;
};

export default {
  getDashboard,
  getStatistics,
};