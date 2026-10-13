import { useCallback, useEffect, useRef, useState } from "react";

import {
  Activity,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  FileCheck,
  RefreshCw,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

import dashboardService from "../../services/dashboard.service";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

import { getErrorMessage } from "../../utils/error";

// ==========================================
// Formatting Helpers
// ==========================================

const formatCurrency = (value) => {
  const amount = Number(value ?? 0);

  return `Rs. ${(Number.isFinite(amount) ? amount : 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatNumber = (value) => {
  const number = Number(value ?? 0);

  return (Number.isFinite(number) ? number : 0).toLocaleString("en-PK");
};

// ==========================================
// Dashboard Component
// ==========================================

const Dashboard = () => {
  // ==========================================
  // State
  // ==========================================

  const [statistics, setStatistics] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Prevent outdated requests from updating state.
  const requestIdRef = useRef(0);

  // ==========================================
  // Fetch Dashboard Statistics
  // ==========================================

  const fetchStatistics = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError("");

      const response = await dashboardService.getStatistics();

      // Ignore an outdated API response.
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!response?.success || !response?.data) {
        throw new Error(
          response?.message || "Unable to load dashboard statistics.",
        );
      }

      setStatistics(response.data);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setStatistics(null);

      setError(getErrorMessage(err, "Unable to load dashboard statistics."));
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // ==========================================
  // Initial Data Loading
  // ==========================================

  useEffect(() => {
    fetchStatistics();

    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchStatistics]);

  // ==========================================
  // Refresh
  // ==========================================

  const handleRefresh = () => {
    fetchStatistics();
  };

  // ==========================================
  // Main Statistics Cards
  // ==========================================

  const cards = [
    {
      title: "Total Customers",
      value: formatNumber(statistics?.customers?.total),
      icon: Users,
      description: "Registered customers",
    },
    {
      title: "Total Loans",
      value: formatNumber(statistics?.loans?.total),
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

  // ==========================================
  // Loan Status Cards
  // ==========================================

  const loanStatuses = [
    {
      title: "Pending",
      value: formatNumber(statistics?.loans?.pending),
      icon: Clock,
    },
    {
      title: "Approved",
      value: formatNumber(statistics?.loans?.approved),
      icon: FileCheck,
    },
    {
      title: "Active",
      value: formatNumber(statistics?.loans?.active),
      icon: Activity,
    },
    {
      title: "Rejected",
      value: formatNumber(statistics?.loans?.rejected),
      icon: XCircle,
    },
    {
      title: "Completed",
      value: formatNumber(statistics?.loans?.completed),
      icon: CheckCircle,
    },
  ];

  // ==========================================
  // Shared Header
  // ==========================================

  const renderHeader = () => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

        <p className="mt-1 text-sm text-slate-500">
          Overview of your loan management system.
        </p>
      </div>

      <button
        type="button"
        onClick={handleRefresh}
        disabled={loading}
        className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </button>
    </div>
  );

  // ==========================================
  // Loading State
  // ==========================================

  if (loading) {
    return (
      <div className="space-y-6">
        {renderHeader()}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Loading message="Loading dashboard statistics..." />
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

  // ==========================================
  // Error State
  // ==========================================

  if (error) {
    return (
      <div className="space-y-6">
        {renderHeader()}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-slate-900">
            Unable to load dashboard
          </h2>

          <ErrorMessage message={error} onRetry={handleRefresh} />
        </div>
      </div>
    );
  }

  // ==========================================
  // Dashboard Content
  // ==========================================

  return (
    <div className="space-y-6">
      {/* Header */}

      {renderHeader()}

      {/* ======================================
          Main Statistics
      ====================================== */}

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

                  <p className="mt-2 wrap-break-word text-2xl font-bold text-slate-900">
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

      {/* ======================================
          Loan Status
      ====================================== */}

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

      {/* ======================================
          Financial Summary
      ====================================== */}

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
          {/* Total Disbursed */}

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total Disbursed</p>

            <p className="mt-2 wrap-break-word text-xl font-bold text-slate-900">
              {formatCurrency(statistics?.financial?.totalDisbursedAmount)}
            </p>
          </div>

          {/* Total Collected */}

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total Collected</p>

            <p className="mt-2 wrap-break-word text-xl font-bold text-slate-900">
              {formatCurrency(statistics?.financial?.totalCollectedPayments)}
            </p>
          </div>

          {/* Outstanding Balance */}

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Outstanding Balance</p>

            <p className="mt-2 wrap-break-word text-xl font-bold text-slate-900">
              {formatCurrency(statistics?.financial?.outstandingBalance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
