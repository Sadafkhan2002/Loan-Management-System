const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const HttpStatus = require("./enums/http-status.enum");
const errorHandler =
  require("./middleware/error.middleware");

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
  res.status(HttpStatus.OK).json({
    success: true,
    message:
      "Loan Management System API is running",
  });
});

app.get("/api/test", (req, res) => {
  res.status(HttpStatus.OK).json({
    success: true,
    message: "API test successful",
  });
});

// ==========================================
// API Routes
// ==========================================

app.use("/api", routes);

// ==========================================
// 404 Handler
// ==========================================

app.use((req, res, next) => {
  const error = new Error(
    "Route not found"
  );

  error.statusCode = HttpStatus.NOT_FOUND;

  next(error);
});

// ==========================================
// Central Error Handler
// ==========================================

app.use(errorHandler);

module.exports = app;