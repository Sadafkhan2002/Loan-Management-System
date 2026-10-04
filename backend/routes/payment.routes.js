const express = require("express");

const {
  createPayment,
  getPaymentById,
  getPaymentsByLoanId,
  getPayments,
} = require("../controllers/payment.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  validateCreatePayment,
} = require("../middleware/payment.validation");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize(
    "admin",
    "loan_officer",
    "customer"
  ),
  validateCreatePayment,
  createPayment
);

router.get(
  "/",
  authenticate,
  authorize("admin", "loan_officer"),
  getPayments
);

router.get(
  "/:id",
  authenticate,
  authorize(
    "admin",
    "loan_officer",
    "customer"
  ),
  getPaymentById
);

router.get(
  "/loan/:loanId",
  authenticate,
  authorize(
    "admin",
    "loan_officer",
    "customer"
  ),
  getPaymentsByLoanId
);

module.exports = router;