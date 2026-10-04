const {
  Payment,
  Loan,
  Customer,
} = require("../models");

const create = async (data) => {
  return await Payment.create(data);
};

const findById = async (id) => {
  return await Payment.findByPk(id, {
    include: [
      {
        model: Loan,
        as: "loan",
        include: [
          {
            model: Customer,
            as: "customer",
          },
        ],
      },
    ],
  });
};

const findByReferenceNumber = async (referenceNumber) => {
  return await Payment.findOne({
    where: {
      referenceNumber,
    },
  });
};

const findByLoanId = async (loanId) => {
  return await Payment.findAll({
    where: {
      loanId,
    },
    order: [["paymentDate", "DESC"]],
  });
};

const findAll = async ({
  where,
  limit,
  offset,
}) => {
  return await Payment.findAndCountAll({
    where,
    limit,
    offset,
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
              "phone",
            ],
          },
        ],
      },
    ],
    order: [["paymentDate", "DESC"]],
    distinct: true,
  });
};

const update = async (payment, data) => {
  return await payment.update(data);
};

const deletePayment = async (payment) => {
  return await payment.destroy();
};

module.exports = {
  create,
  findById,
  findByReferenceNumber,
  findByLoanId,
  findAll,
  update,
  deletePayment,
};