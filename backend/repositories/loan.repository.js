const {
  Loan,
  Customer,
  User,
  Payment,
} = require("../database/models");
const create = async (data) => {
  return await Loan.create(data);
};

const findById = async (id) => {
  return await Loan.findByPk(id, {
    include: [
      {
        model: Customer,
        as: "customer",
      },
      {
        model: User,
        as: "approver",
        attributes: ["id", "name", "email", "role"],
        required: false,
      },
      {
        model: Payment,
        as: "payments",
        required: false,
      },
    ],
  });
};

const findByIdWithoutRelations = async (id) => {
  return await Loan.findByPk(id);
};

const findByLoanNumber = async (loanNumber) => {
  return await Loan.findOne({
    where: {
      loanNumber,
    },
  });
};

const findAll = async ({ where, limit, offset }) => {
  return await Loan.findAndCountAll({
    where,
    limit,
    offset,
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
      {
        model: User,
        as: "approver",
        attributes: ["id", "name", "email"],
        required: false,
      },
    ],
    order: [["createdAt", "DESC"]],
    distinct: true,
  });
};

const update = async (loan, data) => {
  return await loan.update(data);
};

module.exports = {
  create,
  findById,
  findByIdWithoutRelations,
  findByLoanNumber,
  findAll,
  update,
};