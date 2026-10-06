const {
  Customer,
  Loan,
  Payment,
} = require("../database/models");

const { Op } = require("sequelize");

const getLoanReport = async ({
  where,
}) => {
  return await Loan.findAll({
    where,
    include: [
      {
        model: Customer,
        as: "customer",
        attributes: [
          "id",
          "firstName",
          "lastName",
          "email",
          "phone",
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

const getPaymentReport = async ({
  where,
}) => {
  return await Payment.findAll({
    where,
    include: [
      {
        model: Loan,
        as: "loan",
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: [
              "id",
              "firstName",
              "lastName",
              "email",
            ],
          },
        ],
      },
    ],
    order: [["paymentDate", "DESC"]],
  });
};

const getCustomerReport = async () => {
  return await Customer.findAll({
    include: [
      {
        model: Loan,
        as: "loans",
        required: false,
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

const getFinancialReport = async () => {
  const totalLoanAmount =
    await Loan.sum("amount", {
      where: {
        status: {
          [Op.in]: [
            "approved",
            "active",
            "completed",
          ],
        },
      },
    });

  const totalCollected =
    await Payment.sum("amount");

  const outstandingBalance =
    await Loan.sum("remainingAmount", {
      where: {
        status: {
          [Op.in]: [
            "approved",
            "active",
          ],
        },
      },
    });

  return {
    totalLoanAmount:
      Number(totalLoanAmount || 0),

    totalCollected:
      Number(totalCollected || 0),

    outstandingBalance:
      Number(outstandingBalance || 0),
  };
};

module.exports = {
  getLoanReport,
  getPaymentReport,
  getCustomerReport,
  getFinancialReport,
};