const express = require("express");

const {
  createLoan,
  getLoans,
  getLoanById,
  updateLoan,
  approveLoan,
  rejectLoan,
  activateLoan,
} = require("../controllers/loan.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  validateCreateLoan,
  validateUpdateLoan,
} = require("../middleware/loan.validation");

const router = express.Router();

// Create loan application
router.post(
  "/",
  authenticate,
  authorize("admin", "loan_officer", "customer"),
  validateCreateLoan,
  createLoan
);

// Get all loans
router.get(
  "/",
  authenticate,
  authorize("admin", "loan_officer"),
  getLoans
);

// Get loan by ID
router.get(
  "/:id",
  authenticate,
  authorize("admin", "loan_officer", "customer"),
  getLoanById
);

// Update pending loan
router.put(
  "/:id",
  authenticate,
  authorize("admin", "loan_officer"),
  validateUpdateLoan,
  updateLoan
);

// Approve loan
router.patch(
  "/:id/approve",
  authenticate,
  authorize("admin", "loan_officer"),
  approveLoan
);

// Reject loan
router.patch(
  "/:id/reject",
  authenticate,
  authorize("admin", "loan_officer"),
  rejectLoan
);

// Activate approved loan
router.patch(
  "/:id/activate",
  authenticate,
  authorize("admin", "loan_officer"),
  activateLoan
);

module.exports = router;