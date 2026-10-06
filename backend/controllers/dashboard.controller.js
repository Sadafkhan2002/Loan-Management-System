const dashboardService =
  require("../services/dashboard.service");

const asyncHandler =
  require("../middleware/asyncHandler");

const HttpStatus =
  require("../enums/http-status.enum");

const getDashboardStatistics =
  asyncHandler(async (req, res) => {
    const statistics =
      await dashboardService.getDashboardStatistics();

    return res.status(HttpStatus.OK).json({
      success: true,
      message:
        "Dashboard statistics retrieved successfully",
      data: statistics,
    });
  });

module.exports = {
  getDashboardStatistics,
};