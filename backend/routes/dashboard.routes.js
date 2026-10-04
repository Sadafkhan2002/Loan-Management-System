const express = require("express");

const {
  getDashboardStatistics,
} = require("../controllers/dashboard.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize(
    "admin",
    "loan_officer"
  ),
  getDashboardStatistics
);

router.get(
  "/statistics",
  authenticate,
  authorize(
    "admin",
    "loan_officer"
  ),
  getDashboardStatistics
);

module.exports = router;