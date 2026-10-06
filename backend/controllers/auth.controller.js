const authService = require("../services/auth.service");
const asyncHandler = require("../middleware/asyncHandler");
const HttpStatus = require("../enums/http-status.enum");

const register = asyncHandler(
  async (req, res) => {
    const result =
      await authService.register(req.body);

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Registration successful",
      data: result,
    });
  }
);

const login = asyncHandler(
  async (req, res) => {
    const result =
      await authService.login(req.body);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  }
);

const getMe = asyncHandler(
  async (req, res) => {
    const user =
      await authService.getMe(req.user.id);

    return res.status(HttpStatus.OK).json({
      success: true,
      data: {
        user,
      },
    });
  }
);

module.exports = {
  register,
  login,
  getMe,
};