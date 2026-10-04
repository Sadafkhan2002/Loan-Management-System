import api from "../api/axios";

const getNotifications = async ({
  page = 1,
  limit = 10,
} = {}) => {
  const response = await api.get("/notifications", {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};

const markAsRead = async (id) => {
  const response = await api.patch(
    `/notifications/${id}/read`
  );

  return response.data;
};

const markAllAsRead = async () => {
  const response = await api.patch(
    "/notifications/read-all"
  );

  return response.data;
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
};