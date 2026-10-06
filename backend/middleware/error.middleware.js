const HttpStatus = require("../enums/http-status.enum");

const getSafeMessage = (statusCode) => {
  const messages = {
    [HttpStatus.BAD_REQUEST]: "Invalid request.",
    [HttpStatus.UNAUTHORIZED]: "Authentication required.",
    [HttpStatus.FORBIDDEN]:
      "You do not have permission to access this resource.",
    [HttpStatus.NOT_FOUND]: "The requested resource was not found.",
    [HttpStatus.CONFLICT]: "The request conflicts with existing data.",
    [HttpStatus.UNPROCESSABLE_ENTITY]:
      "The request could not be processed.",
    [HttpStatus.INTERNAL_SERVER_ERROR]:
      "An internal server error occurred.",
  };

  return (
    messages[statusCode] ||
    "An unexpected error occurred."
  );
};

const errorHandler = (error, req, res, next) => {
  console.error("Unhandled application error:", error);

  const statusCode =
    Number.isInteger(error.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode < 600
      ? error.statusCode
      : HttpStatus.INTERNAL_SERVER_ERROR;

  return res.status(statusCode).json({
    success: false,
    message: getSafeMessage(statusCode),
  });
};

module.exports = errorHandler;