const loanService = require("../services/loan.service");

const createLoan = async (req, res) => {
  try {
    const loan = await loanService.createLoan(req.body);

    return res.status(201).json({
      success: true,
      message: "Loan application created successfully",
      data: {
        loan,
      },
    });
  } catch (error) {
    console.error("Create loan error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create loan",
    });
  }
};

const getLoans = async (req, res) => {
  try {
    const { page, limit, search, status } = req.query;

    const result = await loanService.getLoans({
      page,
      limit,
      search,
      status,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get loans error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to get loans",
    });
  }
};

const getLoanById = async (req, res) => {
  try {
    const loan = await loanService.getLoanById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: {
        loan,
      },
    });
  } catch (error) {
    console.error("Get loan error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to get loan",
    });
  }
};

const updateLoan = async (req, res) => {
  try {
    const loan = await loanService.updateLoan(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Loan updated successfully",
      data: {
        loan,
      },
    });
  } catch (error) {
    console.error("Update loan error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update loan",
    });
  }
};

const approveLoan = async (req, res) => {
  try {
    const loan = await loanService.approveLoan(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Loan approved successfully",
      data: {
        loan,
      },
    });
  } catch (error) {
    console.error("Approve loan error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to approve loan",
    });
  }
};

const rejectLoan = async (req, res) => {
  try {
    const loan = await loanService.rejectLoan(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Loan rejected successfully",
      data: {
        loan,
      },
    });
  } catch (error) {
    console.error("Reject loan error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to reject loan",
    });
  }
};

const activateLoan = async (req, res) => {
  try {
    const loan = await loanService.activateLoan(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Loan activated successfully",
      data: {
        loan,
      },
    });
  } catch (error) {
    console.error("Activate loan error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to activate loan",
    });
  }
};

module.exports = {
  createLoan,
  getLoans,
  getLoanById,
  updateLoan,
  approveLoan,
  rejectLoan,
  activateLoan,
};