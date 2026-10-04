import { useEffect, useState } from "react";
import {
  BarChart3,
  CreditCard,
  Download,
  FileText,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";

import reportService from "../../services/report.service";

const Reports = () => {
  const [activeReport, setActiveReport] = useState("financial");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reportTabs = [
    {
      id: "financial",
      label: "Financial",
      icon: Wallet,
    },
    {
      id: "loans",
      label: "Loans",
      icon: CreditCard,
    },
    {
      id: "payments",
      label: "Payments",
      icon: BarChart3,
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
    },
  ];

  const getParams = () => {
    const params = {};

    if (dateFrom) {
      params.from = dateFrom;
    }

    if (dateTo) {
      params.to = dateTo;
    }

    return params;
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      const params = getParams();

      if (activeReport === "financial") {
        response = await reportService.getFinancialReports(params);
      } else if (activeReport === "loans") {
        response = await reportService.getLoanReports(params);
      } else if (activeReport === "payments") {
        response = await reportService.getPaymentReports(params);
      } else if (activeReport === "customers") {
        response = await reportService.getCustomerReports(params);
      }

      setData(response?.data || null);
    } catch (err) {
      console.error("Reports error:", err);

      setError(
        err.response?.data?.message || err.message || "Failed to load report.",
      );

      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeReport]);

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleClearFilters = () => {
    setDateFrom("");
    setDateTo("");

    setTimeout(() => {
      fetchReport();
    }, 0);
  };

  const formatCurrency = (value) => {
    const number = Number(value || 0);

    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 2,
    }).format(number);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-PK").format(Number(value || 0));
  };

  const getValue = (obj, keys, fallback = 0) => {
    if (!obj) return fallback;

    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }
    }

    return fallback;
  };

  const renderFinancialReport = () => {
    if (!data) return null;

    const totalDisbursed = getValue(data, [
      "totalDisbursedAmount",
      "totalDisbursed",
    ]);

    const totalCollected = getValue(data, [
      "totalCollectedPayments",
      "totalCollected",
    ]);

    const outstanding = getValue(data, [
      "outstandingBalance",
      "totalOutstanding",
    ]);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Disbursed
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(totalDisbursed)}
                </h3>
              </div>

              <div className="rounded-xl bg-blue-50 p-3">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Collected
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(totalCollected)}
                </h3>
              </div>

              <div className="rounded-xl bg-green-50 p-3">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Outstanding Balance
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(outstanding)}
                </h3>
              </div>

              <div className="rounded-xl bg-orange-50 p-3">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Financial Summary
          </h3>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-sm text-slate-600">Total Disbursed</span>

              <span className="font-semibold text-slate-900">
                {formatCurrency(totalDisbursed)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-sm text-slate-600">
                Total Payments Collected
              </span>

              <span className="font-semibold text-green-600">
                {formatCurrency(totalCollected)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Outstanding Balance
              </span>

              <span className="font-semibold text-orange-600">
                {formatCurrency(outstanding)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLoansReport = () => {
    if (!data) return null;

    const loans = Array.isArray(data) ? data : data.loans || data.rows || [];

    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h3 className="text-lg font-semibold text-slate-900">Loan Report</h3>

          <p className="mt-1 text-sm text-slate-500">
            Loan records for the selected period.
          </p>
        </div>

        {loans.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No loan records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Loan Number
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Amount
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {loan.loanNumber || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatCurrency(loan.amount)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                        {loan.status || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {loan.createdAt
                        ? new Date(loan.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderPaymentsReport = () => {
    if (!data) return null;

    const payments = Array.isArray(data)
      ? data
      : data.payments || data.rows || [];

    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Payment Report
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Payment records for the selected period.
          </p>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No payment records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Payment ID
                  </th>

                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Loan ID
                  </th>

                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Amount
                  </th>

                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Method
                  </th>

                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      #{payment.id}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {payment.loanId || "-"}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-900">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="px-5 py-4 capitalize text-slate-600">
                      {payment.paymentMethod || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {payment.paymentDate
                        ? new Date(payment.paymentDate).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderCustomersReport = () => {
    if (!data) return null;

    const customers = Array.isArray(data)
      ? data
      : data.customers || data.rows || [];

    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Customer Report
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Customer records for the selected period.
          </p>
        </div>

        {customers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No customer records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Name
                  </th>

                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Email
                  </th>

                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Phone
                  </th>

                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {customer.firstName} {customer.lastName}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {customer.email || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {customer.phone || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium capitalize text-green-700">
                        {customer.status || "active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderReport = () => {
    if (loading) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-blue-600" />

          <p className="mt-3 text-sm text-slate-500">Loading report...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-700">{error}</p>

          <button
            type="button"
            onClick={fetchReport}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (activeReport === "financial") {
      return renderFinancialReport();
    }

    if (activeReport === "loans") {
      return renderLoansReport();
    }

    if (activeReport === "payments") {
      return renderPaymentsReport();
    }

    return renderCustomersReport();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View financial, loan, payment and customer reports.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReport}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Report Tabs */}
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;

            const active = activeReport === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveReport(tab.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />

                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-500" />

          <h2 className="font-semibold text-slate-900">Report Filters</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="dateFrom"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              From Date
            </label>

            <input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="dateTo"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              To Date
            </label>

            <input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleApplyFilters}
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Apply Filters
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {renderReport()}
    </div>
  );
};

export default Reports;
