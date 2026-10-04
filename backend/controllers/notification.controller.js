const notificationService =
  require("../services/notification.service");

const getNotifications = async (
  req,
  res
) => {
  try {
    const result =
      await notificationService.getNotifications({
        user: req.user,
        page: req.query.page,
        limit: req.query.limit,
      });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

const markAsRead = async (
  req,
  res
) => {
  try {
    const notification =
      await notificationService.markAsRead(
        req.params.id,
        req.user
      );

    return res.status(200).json({
      success: true,
      message:
        "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

const markAllAsRead = async (
  req,
  res
) => {
  try {
    await notificationService.markAllAsRead(
      req.user
    );

    return res.status(200).json({
      success: true,
      message:
        "All notifications marked as read",
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};