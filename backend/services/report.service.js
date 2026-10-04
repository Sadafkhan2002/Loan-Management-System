const { Op } = require("sequelize");

const reportRepository = require("../repositories/report.repository");

const buildDateFilter = (
  field,
  startDate,
  endDate
) => {
  const condition = {};

  if (startDate) {
    condition[Op.gte] =
      new Date(`${startDate}T00:00:00`);
  }

  if (endDate) {
    condition[Op.lte] =
      new Date(`${endDate}T23:59:59`);
  }

  if (
    Object.keys(condition).length === 0
  ) {
    return null;
  }

  return {
    [field]: condition,
  };
};

const getLoanReport = async ({
  status,
  search,
  startDate,
  endDate,
}) => {
  const where = {};

  if (status) {
    where.status = status;
  }

  if (search && search.trim()) {
    where.loanNumber = {
      [Op.like]: `%${search.trim()}%`,
    };
  }

  const dateFilter = buildDateFilter(
    "createdAt",
    startDate,
    endDate
  );

  if (dateFilter) {
    Object.assign(where, dateFilter);
  }

  return await reportRepository.getLoanReport({
    where,
  });
};

const getPaymentReport = async ({
  paymentMethod,
  startDate,
  endDate,
}) => {
  const where = {};

  if (paymentMethod) {
    where.paymentMethod = paymentMethod;
  }

  const dateFilter = buildDateFilter(
    "paymentDate",
    startDate,
    endDate
  );

  if (dateFilter) {
    Object.assign(where, dateFilter);
  }

  return await reportRepository.getPaymentReport({
    where,
  });
};

const getCustomerReport = async () => {
  return await reportRepository.getCustomerReport();
};

const getFinancialReport = async () => {
  const report =
    await reportRepository.getFinancialReport();

  return {
    totalLoanAmount:
      Number(
        report.totalLoanAmount
      ).toFixed(2),

    totalCollected:
      Number(
        report.totalCollected
      ).toFixed(2),

    outstandingBalance:
      Number(
        report.outstandingBalance
      ).toFixed(2),
  };
};

module.exports = {
  getLoanReport,
  getPaymentReport,
  getCustomerReport,
  getFinancialReport,
};