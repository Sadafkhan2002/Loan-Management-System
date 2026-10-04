const customerService = require("../services/customer.service");

const createCustomer = async (req, res) => {
  try {
    const customer = await customerService.createCustomer(req.body);

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: {
        customer,
      },
    });
  } catch (error) {
    console.error("Create customer error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create customer",
    });
  }
};

const getCustomers = async (req, res) => {
  try {
    const { page, limit, search } = req.query;

    const result = await customerService.getCustomers({
      page,
      limit,
      search,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to get customers",
    });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);

    return res.status(200).json({
      success: true,
      data: {
        customer,
      },
    });
  } catch (error) {
    console.error("Get customer error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to get customer",
    });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await customerService.updateCustomer(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: {
        customer,
      },
    });
  } catch (error) {
    console.error("Update customer error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update customer",
    });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    await customerService.deleteCustomer(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete customer",
    });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};