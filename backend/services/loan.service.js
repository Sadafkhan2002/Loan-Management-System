
const { Op } = require("sequelize");

const loanRepository = require("../repositories/loan.repository");
const customerRepository = require("../repositories/customer.repository");
const notificationService = require("./notification.service");

// Generate Loan Number
const generateLoanNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `LN-${timestamp}-${random}`;
};

// Calculate Loan
const calculateLoan = (amount, interestRate, durationMonths) => {
  const principal = Number(amount);
  const rate = Number(interestRate);
  const months = Number(durationMonths);

  const interest = principal * (rate / 100) * (months / 12);
  const totalPayable = principal + interest;
  const monthlyInstallment = totalPayable / months;

  return {
    totalPayable: Number(totalPayable.toFixed(2)),
    monthlyInstallment: Number(monthlyInstallment.toFixed(2)),
  };
};

// Create Loan
const createLoan = async (data, user) => {
  let customerId = data.customerId;

  // Customers can only create loans for their own customer profile.
  if (user.role === "customer") {
    const customer = await customerRepository.findByUserId(user.id);

    if (!customer) {
      const error = new Error(
        "Customer profile is not linked to this user account"
      );
      error.statusCode = 403;
      throw error;
    }

    if (customer.status !== "active") {
      const error = new Error(
        "Loan cannot be created for an inactive customer"
      );
      error.statusCode = 400;
      throw error;
    }

    // Ignore any customerId supplied by the customer.
    customerId = customer.id;
  }

  const customer = await customerRepository.findById(customerId);

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  if (customer.status !== "active") {
    const error = new Error(
      "Loan cannot be created for an inactive customer"
    );
    error.statusCode = 400;
    throw error;
  }

  const loanNumber = generateLoanNumber();

  const calculation = calculateLoan(
    data.amount,
    data.interestRate,
    data.durationMonths
  );

  const loan = await loanRepository.create({
    loanNumber,
    customerId,
    amount: data.amount,
    interestRate: data.interestRate,
    durationMonths: data.durationMonths,
    monthlyInstallment: calculation.monthlyInstallment,
    totalPayable: calculation.totalPayable,
    paidAmount: 0,
    remainingAmount: calculation.totalPayable,
    status: "pending",
    purpose: data.purpose,
  });

  await notificationService.notifyCustomer({
    customerId,
    type: "loan_submitted",
    title: "Loan Application Submitted",
    message: `Your loan application ${loan.loanNumber} has been submitted successfully and is awaiting review.`,
  });

  return loan;
};

// Get Loans
const getLoans = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
}) => {
  page = Number(page);
  limit = Number(limit);

  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const offset = (page - 1) * limit;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (search && search.trim()) {
    where[Op.or] = [
      {
        loanNumber: {
          [Op.like]: `%${search.trim()}%`,
        },
      },
      {
        purpose: {
          [Op.like]: `%${search.trim()}%`,
        },
      },
    ];
  }

  const result = await loanRepository.findAll({
    where,
    limit,
    offset,
  });

  return {
    loans: result.rows,
    pagination: {
      totalItems: result.count,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(result.count / limit),
    },
  };
};

// Get Loan By ID
const getLoanById = async (id, user) => {
  const loan = await loanRepository.findById(id);

  if (!loan) {
    const error = new Error("Loan not found");
    error.statusCode = 404;
    throw error;
  }

  // Customers can only view their own loans.
  if (user.role === "customer") {
    const customer = await customerRepository.findByUserId(user.id);

    if (!customer) {
      const error = new Error(
        "Customer profile is not linked to this user account"
      );
      error.statusCode = 403;
      throw error;
    }

    if (loan.customerId !== customer.id) {
      const error = new Error("You do not have access to this loan");
      error.statusCode = 403;
      throw error;
    }
  }

  return loan;
};

// Update Loan
const updateLoan = async (id, data) => {
  const loan = await loanRepository.findByIdWithoutRelations(id);

  if (!loan) {
    const error = new Error("Loan not found");
    error.statusCode = 404;
    throw error;
  }

  if (loan.status !== "pending") {
    const error = new Error("Only pending loans can be updated");
    error.statusCode = 400;
    throw error;
  }

  const amount =
    data.amount !== undefined ? data.amount : loan.amount;

  const interestRate =
    data.interestRate !== undefined
      ? data.interestRate
      : loan.interestRate;

  const durationMonths =
    data.durationMonths !== undefined
      ? data.durationMonths
      : loan.durationMonths;

  const calculation = calculateLoan(
    amount,
    interestRate,
    durationMonths
  );

  const paidAmount = Number(loan.paidAmount || 0);

  const remainingAmount = Math.max(
    0,
    calculation.totalPayable - paidAmount
  );

  return await loanRepository.update(loan, {
    ...data,
    monthlyInstallment: calculation.monthlyInstallment,
    totalPayable: calculation.totalPayable,
    remainingAmount,
  });
};

// Approve Loan
const approveLoan = async (id, userId) => {
  const loan = await loanRepository.findByIdWithoutRelations(id);

  if (!loan) {
    const error = new Error("Loan not found");
    error.statusCode = 404;
    throw error;
  }

  if (loan.status !== "pending") {
    const error = new Error("Only pending loans can be approved");
    error.statusCode = 400;
    throw error;
  }

  const updatedLoan = await loanRepository.update(loan, {
    status: "approved",
    approvedBy: userId,
    approvedAt: new Date(),
  });

  await notificationService.notifyCustomer({
    customerId: loan.customerId,
    type: "loan_approved",
    title: "Loan Approved",
    message: `Your loan ${loan.loanNumber} has been approved.`,
  });

  return updatedLoan;
};

// Reject Loan
const rejectLoan = async (id, userId) => {
  const loan = await loanRepository.findByIdWithoutRelations(id);

  if (!loan) {
    const error = new Error("Loan not found");
    error.statusCode = 404;
    throw error;
  }

  if (loan.status !== "pending") {
    const error = new Error("Only pending loans can be rejected");
    error.statusCode = 400;
    throw error;
  }

  const updatedLoan = await loanRepository.update(loan, {
    status: "rejected",
    approvedBy: userId,
    approvedAt: new Date(),
  });

  await notificationService.notifyCustomer({
    customerId: loan.customerId,
    type: "loan_rejected",
    title: "Loan Rejected",
    message: `Your loan ${loan.loanNumber} has been rejected.`,
  });

  return updatedLoan;
};

// Activate Loan
const activateLoan = async (id) => {
  const loan = await loanRepository.findByIdWithoutRelations(id);

  if (!loan) {
    const error = new Error("Loan not found");
    error.statusCode = 404;
    throw error;
  }

  if (loan.status !== "approved") {
    const error = new Error(
      "Only approved loans can be activated"
    );
    error.statusCode = 400;
    throw error;
  }

  const updatedLoan = await loanRepository.update(loan, {
    status: "active",
  });

  await notificationService.notifyCustomer({
    customerId: loan.customerId,
    type: "loan_activated",
    title: "Loan Activated",
    message: `Your loan ${loan.loanNumber} is now active.`,
  });

  return updatedLoan;
};

module.exports = {
  createLoan,
  getLoans,
  getLoanById,
  updateLoan,
  approveLoan,
  rejectLoan,
  activateLoan,
  calculateLoan,
};
