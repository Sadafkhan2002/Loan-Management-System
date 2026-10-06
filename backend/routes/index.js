const express = require("express");

const authRoutes = require("./auth.routes");
const adminRoutes = require("./admin.routes");
const customerRoutes = require("./customer.routes");
const loanRoutes = require("./loan.routes");
const paymentRoutes = require("./payment.routes");
const userRoutes = require("./user.routes");
const dashboardRoutes = require("./dashboard.routes");
const reportRoutes = require("./report.routes");
const notificationRoutes =
  require("./notification.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/customers", customerRoutes);
router.use("/loans", loanRoutes);
router.use("/payments", paymentRoutes);
router.use("/users", userRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use(
  "/notifications",
  notificationRoutes
);

module.exports = router;