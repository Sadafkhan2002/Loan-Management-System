const { Op } = require("sequelize");
const customerRepository = require("../repositories/customer.repository");

const createCustomer = async (data) => {
  const existingCustomer = await customerRepository.findByEmail(data.email);

  if (existingCustomer) {
    const error = new Error("A customer with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  return await customerRepository.create({
    ...data,
    status: "active",
  });
};

const getCustomerById = async (id) => {
  const customer = await customerRepository.findById(id);

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  return customer;
};

const getCustomers = async ({ page = 1, limit = 10, search = "" }) => {
  page = Number(page);
  limit = Number(limit);

  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const offset = (page - 1) * limit;

  const where = {};

  if (search.trim()) {
    where[Op.or] = [
      {
        firstName: {
          [Op.like]: `%${search.trim()}%`,
        },
      },
      {
        lastName: {
          [Op.like]: `%${search.trim()}%`,
        },
      },
      {
        email: {
          [Op.like]: `%${search.trim()}%`,
        },
      },
      {
        phone: {
          [Op.like]: `%${search.trim()}%`,
        },
      },
    ];
  }

  const result = await customerRepository.findAll({
    limit,
    offset,
    where,
  });

  return {
    customers: result.rows,
    pagination: {
      totalItems: result.count,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(result.count / limit),
    },
  };
};

const updateCustomer = async (id, data) => {
  const customer = await customerRepository.findById(id);

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.email && data.email !== customer.email) {
    const existingCustomer = await customerRepository.findByEmail(data.email);

    if (existingCustomer) {
      const error = new Error("A customer with this email already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  return await customerRepository.update(customer, data);
};

const deleteCustomer = async (id) => {
  const customer = await customerRepository.findById(id);

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  const loanCount = await customerRepository.countLoans(id);

  if (loanCount > 0) {
    const error = new Error(
      "Customer cannot be deleted because loan records exist"
    );
    error.statusCode = 409;
    throw error;
  }

  await customerRepository.deleteCustomer(customer);

  return true;
};

module.exports = {
  createCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
  deleteCustomer,
};