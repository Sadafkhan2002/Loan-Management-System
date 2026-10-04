const notificationRepository =
  require("../repositories/notification.repository");

const customerRepository =
  require("../repositories/customer.repository");

const createNotification = async ({
  userId = null,
  customerId = null,
  type,
  title,
  message,
}) => {
  return await notificationRepository.create({
    userId,
    customerId,
    type,
    title,
    message,
    isRead: false,
  });
};

const notifyCustomer = async ({
  customerId,
  type,
  title,
  message,
}) => {
  return await createNotification({
    customerId,
    type,
    title,
    message,
  });
};

const notifyUser = async ({
  userId,
  type,
  title,
  message,
}) => {
  return await createNotification({
    userId,
    type,
    title,
    message,
  });
};

const getNotifications = async ({
  user,
  page = 1,
  limit = 10,
}) => {
  page = Number(page);
  limit = Number(limit);

  if (page < 1) {
    page = 1;
  }

  if (limit < 1) {
    limit = 10;
  }

  if (limit > 100) {
    limit = 100;
  }

  const offset = (page - 1) * limit;

  let result;

  /*
   * Customer accounts receive notifications
   * through their linked customer profile.
   */
  if (user.role === "customer") {
    const customer =
      await customerRepository.findByUserId(
        user.id
      );

    if (!customer) {
      return {
        notifications: [],
        pagination: {
          totalItems: 0,
          currentPage: page,
          itemsPerPage: limit,
          totalPages: 0,
        },
      };
    }

    result =
      await notificationRepository.findByCustomerId({
        customerId: customer.id,
        limit,
        offset,
      });
  } else {
    result =
      await notificationRepository.findByUserId({
        userId: user.id,
        limit,
        offset,
      });
  }

  return {
    notifications: result.rows,
    pagination: {
      totalItems: result.count,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(
        result.count / limit
      ),
    },
  };
};

const markAsRead = async (
  id,
  user
) => {
  const notification =
    await notificationRepository.findById(id);

  if (!notification) {
    const error = new Error(
      "Notification not found"
    );

    error.statusCode = 404;
    throw error;
  }

  let allowed = false;

  if (
    user.role === "customer"
  ) {
    const customer =
      await customerRepository.findByUserId(
        user.id
      );

    allowed =
      customer &&
      Number(notification.customerId) ===
        Number(customer.id);
  } else {
    allowed =
      Number(notification.userId) ===
      Number(user.id);
  }

  if (!allowed) {
    const error = new Error(
      "You are not allowed to access this notification"
    );

    error.statusCode = 403;
    throw error;
  }

  return await notificationRepository.update(
    notification,
    {
      isRead: true,
    }
  );
};

const markAllAsRead = async (user) => {
  if (user.role === "customer") {
    const customer =
      await customerRepository.findByUserId(
        user.id
      );

    if (!customer) {
      return;
    }

    return await notificationRepository
      .markAllAsReadByCustomerId(
        customer.id
      );
  }

  return await notificationRepository
    .markAllAsReadByUserId(user.id);
};

module.exports = {
  createNotification,
  notifyCustomer,
  notifyUser,
  getNotifications,
  markAsRead,
  markAllAsRead,
};