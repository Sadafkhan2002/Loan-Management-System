const Joi = require("joi");

const createLoanSchema = Joi.object({
  customerId: Joi.number().integer().positive().required(),

  amount: Joi.number().positive().required(),

  interestRate: Joi.number().min(0).max(100).required(),

  durationMonths: Joi.number().integer().positive().max(360).required(),

  purpose: Joi.string().trim().min(3).max(500).required(),
});

const updateLoanSchema = Joi.object({
  amount: Joi.number().positive(),

  interestRate: Joi.number().min(0).max(100),

  durationMonths: Joi.number().integer().positive().max(360),

  purpose: Joi.string().trim().min(3).max(500),
}).min(1);

const validateCreateLoan = (req, res, next) => {
  const { error, value } = createLoanSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Loan validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  req.body = value;
  next();
};

const validateUpdateLoan = (req, res, next) => {
  const { error, value } = updateLoanSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Loan validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  req.body = value;
  next();
};

module.exports = {
  validateCreateLoan,
  validateUpdateLoan,
};