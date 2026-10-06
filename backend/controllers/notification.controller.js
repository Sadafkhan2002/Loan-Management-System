const notificationService =
  require("../services/notification.service");

const asyncHandler =
  require("../middleware/asyncHandler");

const HttpStatus =
  require("../enums/http-status.enum");

const getNotifications = asyncHandler(
  async (req, res) => {
    const result =
      await notificationService.getNotifications({
        user: req.user,
        page: req.query.page,
        limit: req.query.limit,
      });

    return res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  }
);

const markAsRead = asyncHandler(
  async (req, res) => {
    const notification =
      await notificationService.markAsRead(
        req.params.id,
        req.user
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  }
);

const markAllAsRead = asyncHandler(
  async (req, res) => {
    await notificationService.markAllAsRead(
      req.user
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "All notifications marked as read",
    });
  }
);

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};