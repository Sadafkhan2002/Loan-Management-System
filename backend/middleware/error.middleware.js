const HttpStatus = require("../enums/http-status.enum");

const getSafeMessage = (statusCode, errorMessage) => {
  const messages = {
    [HttpStatus.BAD_REQUEST]: "Invalid request.",

    [HttpStatus.UNAUTHORIZED]:
      errorMessage || "Authentication required.",

    [HttpStatus.FORBIDDEN]:
      "You do not have permission to access this resource.",

    [HttpStatus.NOT_FOUND]:
      "The requested resource was not found.",

    [HttpStatus.CONFLICT]:
      "The request conflicts with existing data.",

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
      : Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status < 600
  ? error.status
  : HttpStatus.INTERNAL_SERVER_ERROR;

  // Allow only recognized, user-safe authentication messages.
const allowedAuthMessages = [
  "Invalid email or password.",
  "Invalid or expired token.",
  "Authentication required.",
];

const errorMessage =
  statusCode === HttpStatus.UNAUTHORIZED &&
  allowedAuthMessages.includes(error.message?.trim())
    ? error.message.trim()
    : undefined;

  return res.status(statusCode).json({
    success: false,
    message: getSafeMessage(statusCode, errorMessage),
  });
};

module.exports = errorHandler;