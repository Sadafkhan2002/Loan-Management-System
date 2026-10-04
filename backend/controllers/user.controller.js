const userService = require("../services/user.service");

const getUsers = async (req, res) => {
  try {
    const result =
      await userService.getUsers({
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        role: req.query.role,
        status: req.query.status,
      });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user =
      await userService.getUserById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const user =
      await userService.updateUser(
        req.params.id,
        req.body,
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUserStatus = async (
  req,
  res
) => {
  try {
    const user =
      await userService.updateUserStatus(
        req.params.id,
        req.body.status,
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
};