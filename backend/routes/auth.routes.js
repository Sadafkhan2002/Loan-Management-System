const express = require("express");

const {
  register,
  login,
  getMe,
} = require("../controllers/auth.controller");

const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected route
router.get("/me", authenticate, getMe);

module.exports = router;