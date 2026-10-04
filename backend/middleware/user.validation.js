const Joi = require("joi");

const updateUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100),

  email: Joi.string()
    .trim()
    .email()
    .max(150),

  role: Joi.string()
    .valid(
      "admin",
      "loan_officer",
      "customer"
    ),

  status: Joi.string()
    .valid("active", "inactive"),

  password: Joi.string()
    .min(6)
    .max(100),
}).min(1);

const updateUserStatusSchema = Joi.object({
  status: Joi.string()
    .valid("active", "inactive")
    .required(),
});

const validateUpdateUser = (req, res, next) => {
  const { error, value } =
    updateUserSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "User validation failed",
      errors: error.details.map(
        (detail) => detail.message
      ),
    });
  }

  req.body = value;

  next();
};

const validateUpdateUserStatus = (
  req,
  res,
  next
) => {
  const { error, value } =
    updateUserStatusSchema.validate(
      req.body,
      {
        abortEarly: false,
        stripUnknown: true,
      }
    );

  if (error) {
    return res.status(400).json({
      success: false,
      message: "User status validation failed",
      errors: error.details.map(
        (detail) => detail.message
      ),
    });
  }

  req.body = value;

  next();
};

module.exports = {
  validateUpdateUser,
  validateUpdateUserStatus,
};