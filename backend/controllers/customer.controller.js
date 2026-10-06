const customerService = require("../services/customer.service");
const asyncHandler = require("../middleware/asyncHandler");
const HttpStatus = require("../enums/http-status.enum");

const createCustomer = asyncHandler(
  async (req, res) => {
    const customer =
      await customerService.createCustomer(
        req.body
      );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Customer created successfully",
      data: {
        customer,
      },
    });
  }
);

const getCustomers = asyncHandler(
  async (req, res) => {
    const {
      page,
      limit,
      search,
    } = req.query;

    const result =
      await customerService.getCustomers({
        page,
        limit,
        search,
      });

    return res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  }
);

const getCustomerById = asyncHandler(
  async (req, res) => {
    const customer =
      await customerService.getCustomerById(
        req.params.id
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      data: {
        customer,
      },
    });
  }
);

const updateCustomer = asyncHandler(
  async (req, res) => {
    const customer =
      await customerService.updateCustomer(
        req.params.id,
        req.body
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Customer updated successfully",
      data: {
        customer,
      },
    });
  }
);

const deleteCustomer = asyncHandler(
  async (req, res) => {
    await customerService.deleteCustomer(
      req.params.id
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Customer deleted successfully",
    });
  }
);

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};