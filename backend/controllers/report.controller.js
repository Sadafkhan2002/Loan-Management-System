const reportService = require("../services/report.service");
const asyncHandler = require("../middleware/asyncHandler");
const HttpStatus = require("../enums/http-status.enum");

const getLoanReport = asyncHandler(
  async (req, res) => {
    const loans =
      await reportService.getLoanReport({
        status: req.query.status,
        search: req.query.search,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      });

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Loan report retrieved successfully",
      data: loans,
    });
  }
);

const getPaymentReport = asyncHandler(
  async (req, res) => {
    const payments =
      await reportService.getPaymentReport({
        paymentMethod:
          req.query.paymentMethod,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      });

    return res.status(HttpStatus.OK).json({
      success: true,
      message:
        "Payment report retrieved successfully",
      data: payments,
    });
  }
);

const getCustomerReport = asyncHandler(
  async (req, res) => {
    const customers =
      await reportService.getCustomerReport();

    return res.status(HttpStatus.OK).json({
      success: true,
      message:
        "Customer report retrieved successfully",
      data: customers,
    });
  }
);

const getFinancialReport = asyncHandler(
  async (req, res) => {
    const financial =
      await reportService.getFinancialReport();

    return res.status(HttpStatus.OK).json({
      success: true,
      message:
        "Financial report retrieved successfully",
      data: financial,
    });
  }
);

module.exports = {
  getLoanReport,
  getPaymentReport,
  getCustomerReport,
  getFinancialReport,
};