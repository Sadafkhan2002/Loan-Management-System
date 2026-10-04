const dashboardService = require("../services/dashboard.service");

const getDashboardStatistics = async (
  req,
  res
) => {
  try {
    const statistics =
      await dashboardService.getDashboardStatistics();

    return res.status(200).json({
      success: true,
      message:
        "Dashboard statistics retrieved successfully",
      data: statistics,
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
  getDashboardStatistics,
};