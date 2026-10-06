const paymentService = require("../services/payment.service");
const asyncHandler = require("../middleware/asyncHandler");
const HttpStatus = require("../enums/http-status.enum");

const createPayment = asyncHandler(
  async (req, res) => {
    const payment =
      await paymentService.createPayment(
        req.body
      );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment,
    });
  }
);

const getPaymentById = asyncHandler(
  async (req, res) => {
    const payment =
      await paymentService.getPaymentById(
        req.params.id
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      data: payment,
    });
  }
);

const getPaymentsByLoanId = asyncHandler(
  async (req, res) => {
    const payments =
      await paymentService.getPaymentsByLoanId(
        req.params.loanId
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      data: payments,
    });
  }
);

const getPayments = asyncHandler(
  async (req, res) => {
    const result =
      await paymentService.getPayments({
        page: req.query.page,
        limit: req.query.limit,
        loanId: req.query.loanId,
        paymentMethod:
          req.query.paymentMethod,
      });

    return res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  }
);

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentsByLoanId,
  getPayments,
};