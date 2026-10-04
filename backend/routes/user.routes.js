const express = require("express");

const {
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
} = require("../controllers/user.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  validateUpdateUser,
  validateUpdateUserStatus,
} = require("../middleware/user.validation");

const router = express.Router();

/*
 * Get all users
 */
router.get(
  "/",
  authenticate,
  authorize("admin"),
  getUsers
);

/*
 * Get one user
 */
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  getUserById
);

/*
 * Update user
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUpdateUser,
  updateUser
);

/*
 * Activate / deactivate user
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  validateUpdateUserStatus,
  updateUserStatus
);

/*
 * Delete user
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteUser
);

module.exports = router;