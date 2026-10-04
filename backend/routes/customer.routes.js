const express = require("express");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customer.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validateCustomer = require("../middleware/customer.validation");

const router = express.Router();

// Create customer
router.post(
  "/",
  authenticate,
  authorize("admin", "loan_officer"),
  validateCustomer,
  createCustomer
);

// Get all customers
router.get(
  "/",
  authenticate,
  authorize("admin", "loan_officer"),
  getCustomers
);

// Get customer by ID
router.get(
  "/:id",
  authenticate,
  authorize("admin", "loan_officer"),
  getCustomerById
);

// Update customer
router.put(
  "/:id",
  authenticate,
  authorize("admin", "loan_officer"),
  validateCustomer,
  updateCustomer
);

// Delete customer - admin only
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteCustomer
);

module.exports = router;