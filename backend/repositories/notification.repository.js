const { Notification } = require("../database/models");

const create = async (data) => {
  return await Notification.create(data);
};

const findById = async (id) => {
  return await Notification.findByPk(id);
};

const findByUserId = async ({
  userId,
  limit,
  offset,
}) => {
  return await Notification.findAndCountAll({
    where: {
      userId,
    },
    limit,
    offset,
    order: [
      ["createdAt", "DESC"],
    ],
  });
};

const findByCustomerId = async ({
  customerId,
  limit,
  offset,
}) => {
  return await Notification.findAndCountAll({
    where: {
      customerId,
    },
    limit,
    offset,
    order: [
      ["createdAt", "DESC"],
    ],
  });
};

const update = async (
  notification,
  data
) => {
  return await notification.update(data);
};

const markAllAsReadByUserId = async (
  userId
) => {
  return await Notification.update(
    {
      isRead: true,
    },
    {
      where: {
        userId,
        isRead: false,
      },
    }
  );
};

const markAllAsReadByCustomerId = async (
  customerId
) => {
  return await Notification.update(
    {
      isRead: true,
    },
    {
      where: {
        customerId,
        isRead: false,
      },
    }
  );
};

module.exports = {
  create,
  findById,
  findByUserId,
  findByCustomerId,
  update,
  markAllAsReadByUserId,
  markAllAsReadByCustomerId,
};