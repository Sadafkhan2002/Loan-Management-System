const {
  Customer,
  Loan,
  Payment,
} = require("../database/models");

const { Op } = require("sequelize");

const getCustomerCount = async () => {
  return await Customer.count();
};

const getLoanCount = async () => {
  return await Loan.count();
};

const getLoanCountByStatus = async (status) => {
  return await Loan.count({
    where: {
      status,
    },
  });
};

const getDisbursedAmount = async () => {
  const result = await Loan.sum("amount", {
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

  return Number(result || 0);
};

const getCollectedAmount = async () => {
  const result = await Payment.sum("amount");

  return Number(result || 0);
};

const getOutstandingAmount = async () => {
  const result = await Loan.sum(
    "remainingAmount",
    {
      where: {
        status: {
          [Op.in]: [
            "approved",
            "active",
          ],
        },
      },
    }
  );

  return Number(result || 0);
};

module.exports = {
  getCustomerCount,
  getLoanCount,
  getLoanCountByStatus,
  getDisbursedAmount,
  getCollectedAmount,
  getOutstandingAmount,
};