const express = require("express");

const {
  getLoanReport,
  getPaymentReport,
  getCustomerReport,
  getFinancialReport,
} = require("../controllers/report.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.get(
  "/loans",
  authenticate,
  authorize(
    "admin",
    "loan_officer"
  ),
  getLoanReport
);

router.get(
  "/payments",
  authenticate,
  authorize(
    "admin",
    "loan_officer"
  ),
  getPaymentReport
);

router.get(
  "/customers",
  authenticate,
  authorize(
    "admin",
    "loan_officer"
  ),
  getCustomerReport
);

router.get(
  "/financial",
  authenticate,
  authorize(
    "admin",
    "loan_officer"
  ),
  getFinancialReport
);

module.exports = router;