const paymentRepository = require("../repositories/payment.repository");
const loanRepository = require("../repositories/loan.repository");
const notificationService = require("./notification.service");

// ==========================================
// Generate Payment Reference Number
// ==========================================

const generateReferenceNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `PAY-${timestamp}-${random}`;
};

// ==========================================
// Record Payment
// ==========================================

const recordPayment = async ({
  loanId,
  amount,
  paymentDate,
  paymentMethod,
  referenceNumber,
  notes,
}) => {
  // ========================================
  // Find Loan
  // ========================================

  const loan =
    await loanRepository.findByIdWithoutRelations(
      loanId
    );

  if (!loan) {
    const error = new Error(
      "Loan not found"
    );

    error.statusCode = 404;
    throw error;
  }

  // ========================================
  // Loan Must Be Active
  // ========================================

  if (loan.status !== "active") {
    const error = new Error(
      "Payment can only be recorded for an active loan"
    );

    error.statusCode = 400;
    throw error;
  }

  // ========================================
  // Validate Payment Amount
  // ========================================

  const paymentAmount = Number(amount);

  if (
    !Number.isFinite(paymentAmount) ||
    paymentAmount <= 0
  ) {
    const error = new Error(
      "Payment amount must be greater than zero"
    );

    error.statusCode = 400;
    throw error;
  }

  // ========================================
  // Current Loan Amounts
  // ========================================

  const totalPayable =
    Number(loan.totalPayable || 0);

  const paidAmount =
    Number(loan.paidAmount || 0);

  const remainingAmount =
    Number(loan.remainingAmount || 0);

  // ========================================
  // Prevent Overpayment
  // ========================================

  if (paymentAmount > remainingAmount) {
    const error = new Error(
      `Payment amount cannot exceed the remaining loan balance of ${remainingAmount.toFixed(
        2
      )}`
    );

    error.statusCode = 400;
    throw error;
  }

  // ========================================
  // Generate Reference Number
  // ========================================

  const finalReferenceNumber =
    referenceNumber ||
    generateReferenceNumber();

  // ========================================
  // Create Payment
  // ========================================

  const payment =
    await paymentRepository.create({
      loanId,
      amount: paymentAmount,
      paymentDate:
        paymentDate || new Date(),
      paymentMethod,
      referenceNumber:
        finalReferenceNumber,
      notes: notes || null,
    });

  // ========================================
  // Calculate New Loan Balance
  // ========================================

  const newPaidAmount =
    Number(
      (paidAmount + paymentAmount).toFixed(2)
    );

  const newRemainingAmount =
    Number(
      Math.max(
        0,
        totalPayable - newPaidAmount
      ).toFixed(2)
    );

  // ========================================
  // Determine Loan Status
  // ========================================

  const newStatus =
    newRemainingAmount <= 0
      ? "completed"
      : "active";

  // ========================================
  // Update Loan
  // ========================================

  await loanRepository.update(
    loan,
    {
      paidAmount: newPaidAmount,

      remainingAmount:
        newRemainingAmount,

      status: newStatus,
    }
  );

  // ========================================
  // Notification: Payment Received
  // ========================================

  await notificationService.notifyCustomer({
    customerId:
      loan.customerId,

    type:
      "payment_received",

    title:
      "Payment Received",

    message:
      `Payment of ${paymentAmount.toFixed(
        2
      )} has been received for loan ${
        loan.loanNumber
      }.`,
  });

  // ========================================
  // Notification: Loan Completed
  // ========================================

  if (newRemainingAmount <= 0) {
    await notificationService.notifyCustomer({
      customerId:
        loan.customerId,

      type:
        "loan_completed",

      title:
        "Loan Completed",

      message:
        `Congratulations. Your loan ${
          loan.loanNumber
        } has been fully paid and completed.`,
    });
  }

  // ========================================
  // Return Updated Payment Information
  // ========================================

  return {
    payment,

    loan: {
      id: loan.id,

      loanNumber:
        loan.loanNumber,

      totalPayable,

      paidAmount:
        newPaidAmount,

      remainingAmount:
        newRemainingAmount,

      status:
        newStatus,
    },
  };
};

// ==========================================
// Get Payments By Loan
// ==========================================

const getPaymentsByLoan = async (
  loanId
) => {
  const loan =
    await loanRepository.findByIdWithoutRelations(
      loanId
    );

  if (!loan) {
    const error = new Error(
      "Loan not found"
    );

    error.statusCode = 404;
    throw error;
  }

  return await paymentRepository.findByLoanId(
    loanId
  );
};

// ==========================================
// Get Payment By ID
// ==========================================

const getPaymentById = async (
  id
) => {
  const payment =
    await paymentRepository.findById(
      id
    );

  if (!payment) {
    const error = new Error(
      "Payment not found"
    );

    error.statusCode = 404;
    throw error;
  }

  return payment;
};

// ==========================================
// Get All Payments
// ==========================================

const getPayments = async ({
  page = 1,
  limit = 10,
  paymentMethod,
  startDate,
  endDate,
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

  const offset =
    (page - 1) * limit;

  const where = {};

  // Payment method filter
  if (paymentMethod) {
    where.paymentMethod =
      paymentMethod;
  }

  // Date filter
  if (startDate || endDate) {
    const { Op } = require("sequelize");

    where.paymentDate = {};

    if (startDate) {
      where.paymentDate[Op.gte] =
        new Date(
          `${startDate}T00:00:00`
        );
    }

    if (endDate) {
      where.paymentDate[Op.lte] =
        new Date(
          `${endDate}T23:59:59`
        );
    }
  }

  const result =
    await paymentRepository.findAll({
      where,
      limit,
      offset,
    });

  return {
    payments:
      result.rows,

    pagination: {
      totalItems:
        result.count,

      currentPage:
        page,

      itemsPerPage:
        limit,

      totalPages:
        Math.ceil(
          result.count / limit
        ),
    },
  };
};

// ==========================================
// Delete Payment
// ==========================================

const deletePayment = async (
  id
) => {
  const payment =
    await paymentRepository.findById(
      id
    );

  if (!payment) {
    const error = new Error(
      "Payment not found"
    );

    error.statusCode = 404;
    throw error;
  }

  const loan =
    await loanRepository.findByIdWithoutRelations(
      payment.loanId
    );

  if (!loan) {
    const error = new Error(
      "Associated loan not found"
    );

    error.statusCode = 404;
    throw error;
  }

  // ========================================
  // Do Not Delete Payment From Completed Loan
  // ========================================

  if (loan.status === "completed") {
    const error = new Error(
      "Payment cannot be deleted from a completed loan"
    );

    error.statusCode = 400;
    throw error;
  }

  const paymentAmount =
    Number(payment.amount || 0);

  const currentPaidAmount =
    Number(loan.paidAmount || 0);

  const totalPayable =
    Number(loan.totalPayable || 0);

  // ========================================
  // Recalculate Loan Balance
  // ========================================

  const newPaidAmount =
    Number(
      Math.max(
        0,
        currentPaidAmount -
          paymentAmount
      ).toFixed(2)
    );

  const newRemainingAmount =
    Number(
      Math.max(
        0,
        totalPayable -
          newPaidAmount
      ).toFixed(2)
    );

  // ========================================
  // Delete Payment
  // ========================================

  await paymentRepository.deletePayment(
    payment
  );

  // ========================================
  // Restore Loan Status
  // ========================================

  await loanRepository.update(
    loan,
    {
      paidAmount:
        newPaidAmount,

      remainingAmount:
        newRemainingAmount,

      status:
        "active",
    }
  );

  return {
    message:
      "Payment deleted successfully",

    loan: {
      id: loan.id,

      loanNumber:
        loan.loanNumber,

      paidAmount:
        newPaidAmount,

      remainingAmount:
        newRemainingAmount,

      status:
        "active",
    },
  };
};

// ==========================================
// Export
// ==========================================

module.exports = {
  createPayment: recordPayment,
  recordPayment,
  getPaymentsByLoan,
  getPaymentById,
  getPayments,
  deletePayment,
};