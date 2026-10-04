const dashboardRepository = require("../repositories/dashboard.repository");

const getDashboardStatistics = async () => {
  const [
    totalCustomers,
    totalLoans,
    pendingLoans,
    approvedLoans,
    activeLoans,
    rejectedLoans,
    completedLoans,
    totalDisbursedAmount,
    totalCollectedPayments,
    outstandingBalance,
  ] = await Promise.all([
    dashboardRepository.getCustomerCount(),

    dashboardRepository.getLoanCount(),

    dashboardRepository.getLoanCountByStatus(
      "pending"
    ),

    dashboardRepository.getLoanCountByStatus(
      "approved"
    ),

    dashboardRepository.getLoanCountByStatus(
      "active"
    ),

    dashboardRepository.getLoanCountByStatus(
      "rejected"
    ),

    dashboardRepository.getLoanCountByStatus(
      "completed"
    ),

    dashboardRepository.getDisbursedAmount(),

    dashboardRepository.getCollectedAmount(),

    dashboardRepository.getOutstandingAmount(),
  ]);

  return {
    customers: {
      total: totalCustomers,
    },

    loans: {
      total: totalLoans,
      pending: pendingLoans,
      approved: approvedLoans,
      active: activeLoans,
      rejected: rejectedLoans,
      completed: completedLoans,
    },

    financial: {
      totalDisbursedAmount:
        Number(
          totalDisbursedAmount
        ).toFixed(2),

      totalCollectedPayments:
        Number(
          totalCollectedPayments
        ).toFixed(2),

      outstandingBalance:
        Number(
          outstandingBalance
        ).toFixed(2),
    },
  };
};

module.exports = {
  getDashboardStatistics,
};