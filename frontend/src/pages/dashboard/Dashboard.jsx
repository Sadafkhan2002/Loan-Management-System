import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  FileCheck,
  FileX,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

import dashboardService from "../../services/dashboard.service";

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await dashboardService.getStatistics();

      if (!response?.success || !response?.data) {
        throw new Error(
          response?.message || "Unable to load dashboard statistics.",
        );
      }

      setStatistics(response.data);
    } catch (error) {
      console.error("Dashboard statistics error:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to load dashboard statistics.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return `Rs. ${amount.toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

          <p className="mt-1 text-sm text-slate-500">
            Loading dashboard statistics...
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of your loan management system.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-800">
            Unable to load dashboard
          </h2>

          <p className="mt-1 text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={fetchStatistics}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Customers",
      value: statistics?.customers?.total ?? 0,
      icon: Users,
      description: "Registered customers",
    },
    {
      title: "Total Loans",
      value: statistics?.loans?.total ?? 0,
      icon: CreditCard,
      description: "All loan applications",
    },
    {
      title: "Collected Payments",
      value: formatCurrency(statistics?.financial?.totalCollectedPayments),
      icon: DollarSign,
      description: "Total payments received",
    },
    {
      title: "Outstanding Balance",
      value: formatCurrency(statistics?.financial?.outstandingBalance),
      icon: Wallet,
      description: "Remaining loan balance",
    },
  ];

  const loanStatuses = [
    {
      title: "Pending",
      value: statistics?.loans?.pending ?? 0,
      icon: Clock,
    },
    {
      title: "Approved",
      value: statistics?.loans?.approved ?? 0,
      icon: FileCheck,
    },
    {
      title: "Active",
      value: statistics?.loans?.active ?? 0,
      icon: Activity,
    },
    {
      title: "Rejected",
      value: statistics?.loans?.rejected ?? 0,
      icon: XCircle,
    },
    {
      title: "Completed",
      value: statistics?.loans?.completed ?? 0,
      icon: CheckCircle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of your loan management system.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStatistics}
          className="inline-flex w-fit items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {/* Main Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-slate-500">{card.title}</p>

                  <p className="mt-2 break-words text-2xl font-bold text-slate-900">
                    {card.value}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {card.description}
                  </p>
                </div>

                <div className="shrink-0 rounded-lg bg-blue-50 p-3 text-blue-600">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loan Status */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Loan Status</h2>

          <p className="mt-1 text-sm text-slate-500">
            Current status of all loans.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {loanStatuses.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{item.title}</span>

                  <Icon size={20} className="text-slate-400" />
                </div>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Financial Summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Overview of loan amounts and payments.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total Disbursed</p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {formatCurrency(statistics?.financial?.totalDisbursedAmount)}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total Collected</p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {formatCurrency(statistics?.financial?.totalCollectedPayments)}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Outstanding Balance</p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {formatCurrency(statistics?.financial?.outstandingBalance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
