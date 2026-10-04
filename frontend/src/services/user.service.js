import api from "../api/axios";

const getUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  role = "",
  status = "",
} = {}) => {
  const response = await api.get("/users", {
    params: {
      page,
      limit,
      search,
      role,
      status,
    },
  });

  return response.data;
};

const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);

  return response.data;
};

const createUser = async (userData) => {
  const response = await api.post(
    "/users",
    userData
  );

  return response.data;
};

const updateUser = async (id, userData) => {
  const response = await api.put(
    `/users/${id}`,
    userData
  );

  return response.data;
};

const deleteUser = async (id) => {
  const response = await api.delete(
    `/users/${id}`
  );

  return response.data;
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};