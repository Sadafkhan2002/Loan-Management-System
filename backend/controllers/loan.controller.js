const loanService = require("../services/loan.service");
const asyncHandler = require("../middleware/asyncHandler");
const HttpStatus = require("../enums/http-status.enum");

const createLoan = asyncHandler(
  async (req, res) => {
    const loan =
      await loanService.createLoan(
        req.body,
        req.user
      );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Loan created successfully",
      data: { loan },
    });
  }
);

const getLoans = asyncHandler(
  async (req, res) => {
    const {
      page,
      limit,
      search,
      status,
    } = req.query;

    const result =
      await loanService.getLoans({
        page,
        limit,
        search,
        status,
      });

    return res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  }
);

const getLoanById = asyncHandler(
  async (req, res) => {
    const loan =
      await loanService.getLoanById(
        req.params.id,
        req.user
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      data: { loan },
    });
  }
);

const updateLoan = asyncHandler(
  async (req, res) => {
    const loan =
      await loanService.updateLoan(
        req.params.id,
        req.body
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Loan updated successfully",
      data: { loan },
    });
  }
);

const approveLoan = asyncHandler(
  async (req, res) => {
    const loan =
      await loanService.approveLoan(
        req.params.id,
        req.user.id
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Loan approved successfully",
      data: { loan },
    });
  }
);

const rejectLoan = asyncHandler(
  async (req, res) => {
    const loan =
      await loanService.rejectLoan(
        req.params.id,
        req.user.id
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Loan rejected successfully",
      data: { loan },
    });
  }
);

const activateLoan = asyncHandler(
  async (req, res) => {
    const loan =
      await loanService.activateLoan(
        req.params.id
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Loan activated successfully",
      data: { loan },
    });
  }
);

module.exports = {
  createLoan,
  getLoans,
  getLoanById,
  updateLoan,
  approveLoan,
  rejectLoan,
  activateLoan,
};