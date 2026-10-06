const { Customer, Loan } = require("../database/models");
const create = async (data) => {
  return await Customer.create(data);
};

const findById = async (id) => {
  return await Customer.findByPk(id);
};

const findByUserId = async (userId) => {
  return await Customer.findOne({
    where: { userId },
  });
};

const findByEmail = async (email) => {
  return await Customer.findOne({ where: { email } });
};

const findAll = async ({ limit, offset, where }) => {
  return await Customer.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });
};

const update = async (customer, data) => {
  return await customer.update(data);
};

const deleteCustomer = async (customer) => {
  return await customer.destroy();
};

const countLoans = async (customerId) => {
  return await Loan.count({ where: { customerId } });
};

module.exports = {
  create,
  findById,
  findByUserId,
  findByEmail,
  findAll,
  update,
  deleteCustomer,
  countLoans,
};

