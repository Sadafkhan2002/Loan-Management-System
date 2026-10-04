const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const customerRoutes = require("./routes/customer.routes");
const loanRoutes = require("./routes/loan.routes");
const paymentRoutes = require("./routes/payment.routes");
const userRoutes = require("./routes/user.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reportRoutes = require("./routes/report.routes");
const notificationRoutes =
  require("./routes/notification.routes");

const app = express();

// ==========================================
// Middleware
// ==========================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ==========================================
// Basic Routes
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Loan Management System API is running",
  });
});

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API test successful",
  });
});

// ==========================================
// Authentication Routes
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);
app.use(
  "/api/dashboard",
  dashboardRoutes
);
app.use(
  "/api/reports",
  reportRoutes
);
app.use(
  "/api/notifications",
  notificationRoutes
);

// ==========================================
// 404 Handler
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================================
// Export
// ==========================================

module.exports = app;