const paymentService = require("../services/payment.service");

const createPayment = async (req, res) => {
  try {
    const payment =
      await paymentService.createPayment(
        req.body
      );

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment,
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

const getPaymentById = async (req, res) => {
  try {
    const payment =
      await paymentService.getPaymentById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: payment,
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

const getPaymentsByLoanId = async (
  req,
  res
) => {
  try {
    const payments =
      await paymentService.getPaymentsByLoanId(
        req.params.loanId
      );

    return res.status(200).json({
      success: true,
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

const getPayments = async (req, res) => {
  try {
    const result =
      await paymentService.getPayments({
        page: req.query.page,
        limit: req.query.limit,
        loanId: req.query.loanId,
        paymentMethod:
          req.query.paymentMethod,
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

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentsByLoanId,
  getPayments,
};