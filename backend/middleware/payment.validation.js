const Joi = require("joi");

const createPaymentSchema = Joi.object({
  loanId: Joi.number()
    .integer()
    .positive()
    .required(),

  amount: Joi.number()
    .positive()
    .required(),

  paymentDate: Joi.date()
    .iso()
    .required(),

  paymentMethod: Joi.string()
    .valid("cash", "bank", "online")
    .required(),

  referenceNumber: Joi.string()
    .trim()
    .max(100)
    .allow("", null),

  notes: Joi.string()
    .trim()
    .max(500)
    .allow("", null),
});

const validateCreatePayment = (req, res, next) => {
  const { error, value } = createPaymentSchema.validate(
    req.body,
    {
      abortEarly: false,
      stripUnknown: true,
    }
  );

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Payment validation failed",
      errors: error.details.map(
        (detail) => detail.message
      ),
    });
  }

  req.body = value;
  next();
};

module.exports = {
  validateCreatePayment,
};