const Joi = require("joi");

const customerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(100).required(),

  lastName: Joi.string().trim().min(2).max(100).required(),

  email: Joi.string().trim().email().max(150).required(),

  phone: Joi.string().trim().min(7).max(30).required(),

  address: Joi.string().trim().max(255).allow("", null),

  city: Joi.string().trim().max(100).allow("", null),

  occupation: Joi.string().trim().max(150).allow("", null),

  monthlyIncome: Joi.number().min(0).allow(null),
});

const validateCustomer = (req, res, next) => {
  const { error, value } = customerSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  req.body = value;
  next();
};

module.exports = validateCustomer;