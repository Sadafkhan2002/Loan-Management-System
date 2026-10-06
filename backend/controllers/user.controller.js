const userService = require("../services/user.service");
const asyncHandler = require("../middleware/asyncHandler");
const HttpStatus = require("../enums/http-status.enum");

const getUsers = asyncHandler(
  async (req, res) => {
    const result =
      await userService.getUsers({
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        role: req.query.role,
        status: req.query.status,
      });

    return res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  }
);

const getUserById = asyncHandler(
  async (req, res) => {
    const user =
      await userService.getUserById(
        req.params.id
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      data: user,
    });
  }
);

const updateUser = asyncHandler(
  async (req, res) => {
    const user =
      await userService.updateUser(
        req.params.id,
        req.body,
        req.user.id
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  }
);

const updateUserStatus = asyncHandler(
  async (req, res) => {
    const user =
      await userService.updateUserStatus(
        req.params.id,
        req.body.status,
        req.user.id
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      message:
        "User status updated successfully",
      data: user,
    });
  }
);

const deleteUser = asyncHandler(
  async (req, res) => {
    await userService.deleteUser(
      req.params.id,
      req.user.id
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "User deleted successfully",
    });
  }
);

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
};