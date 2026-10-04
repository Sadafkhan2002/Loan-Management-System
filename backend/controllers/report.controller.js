const reportService = require("../services/report.service");

const getLoanReport = async (req, res) => {
  try {
    const loans =
      await reportService.getLoanReport({
        status: req.query.status,
        search: req.query.search,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      });

    return res.status(200).json({
      success: true,
      message: "Loan report retrieved successfully",
      data: loans,
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

const getPaymentReport = async (
  req,
  res
) => {
  try {
    const payments =
      await reportService.getPaymentReport({
        paymentMethod:
          req.query.paymentMethod,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      });

    return res.status(200).json({
      success: true,
      message:
        "Payment report retrieved successfully",
      data: payments,
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

const getCustomerReport = async (
  req,
  res
) => {
  try {
    const customers =
      await reportService.getCustomerReport();

    return res.status(200).json({
      success: true,
      message:
        "Customer report retrieved successfully",
      data: customers,
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

const getFinancialReport = async (
  req,
  res
) => {
  try {
    const financial =
      await reportService.getFinancialReport();

    return res.status(200).json({
      success: true,
      message:
        "Financial report retrieved successfully",
      data: financial,
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
  getLoanReport,
  getPaymentReport,
  getCustomerReport,
  getFinancialReport,
};