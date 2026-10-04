import { useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Plus,
  Search,
  X,
  XCircle,
} from "lucide-react";

import loanService from "../../services/loan.service";
import customerService from "../../services/customer.service";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  customerId: "",
  amount: "",
  interestRate: "",
  durationMonths: "",
  purpose: "",
};

const Loans = () => {
  const { user } = useAuth();

  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 0,
  });

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingLoan, setEditingLoan] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isStaff = user?.role === "admin" || user?.role === "loan_officer";

  const isAdmin = user?.role === "admin";

  // ==========================================
  // Fetch Loans
  // ==========================================

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await loanService.getLoans({
        page,
        limit: 10,
        search,
        status,
      });

      setLoans(response.data?.loans || []);

      setPagination(
        response.data?.pagination || {
          totalItems: 0,
          currentPage: 1,
          itemsPerPage: 10,
          totalPages: 0,
        },
      );
    } catch (error) {
      console.error("Fetch loans error:", error);

      setError(error.response?.data?.message || "Failed to load loans.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Fetch Customers
  // ==========================================

  const fetchCustomers = async () => {
    if (!isStaff) return;

    try {
      setCustomersLoading(true);

      const response = await customerService.getCustomers({
        page: 1,
        limit: 100,
      });

      setCustomers(response.data?.customers || []);
    } catch (error) {
      console.error("Fetch customers error:", error);
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [page, status]);

  useEffect(() => {
    fetchCustomers();
  }, [user?.role]);

  // ==========================================
  // Search
  // ==========================================

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    fetchLoans();
  };

  // ==========================================
  // Form Change
  // ==========================================

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  // ==========================================
  // Open Create Modal
  // ==========================================

  const openCreateModal = () => {
    setEditingLoan(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // ==========================================
  // Open Edit Modal
  // ==========================================

  const openEditModal = (loan) => {
    setEditingLoan(loan);

    setForm({
      customerId: loan.customerId || "",
      amount: loan.amount || "",
      interestRate: loan.interestRate || "",
      durationMonths: loan.durationMonths || "",
      purpose: loan.purpose || "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // ==========================================
  // Close Modal
  // ==========================================

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingLoan(null);
    setForm(initialForm);
  };

  // ==========================================
  // Submit Loan
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const loanData = {
        customerId: Number(form.customerId),
        amount: Number(form.amount),
        interestRate: Number(form.interestRate),
        durationMonths: Number(form.durationMonths),
        purpose: form.purpose.trim(),
      };

      if (editingLoan) {
        await loanService.updateLoan(editingLoan.id, loanData);

        setSuccess("Loan updated successfully.");
      } else {
        await loanService.createLoan(loanData);

        setSuccess("Loan application created successfully.");
      }

      closeModal();
      await fetchLoans();
    } catch (error) {
      console.error("Submit loan error:", error);

      setError(error.response?.data?.message || "Failed to save loan.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // Loan Action
  // ==========================================

  const handleLoanAction = async (action, loan) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      if (action === "approve") {
        await loanService.approveLoan(loan.id);

        setSuccess("Loan approved successfully.");
      }

      if (action === "reject") {
        await loanService.rejectLoan(loan.id);

        setSuccess("Loan rejected successfully.");
      }

      if (action === "activate") {
        await loanService.activateLoan(loan.id);

        setSuccess("Loan activated successfully.");
      }

      await fetchLoans();
    } catch (error) {
      console.error("Loan action error:", error);

      setError(error.response?.data?.message || "Loan action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // View Details
  // ==========================================

  const handleViewDetails = async (loan) => {
    try {
      setError("");

      const response = await loanService.getLoanById(loan.id);

      setSelectedLoan(response.data?.loan || loan);

      setShowDetails(true);
    } catch (error) {
      console.error("Get loan details error:", error);

      setError(error.response?.data?.message || "Failed to load loan details.");
    }
  };

  // ==========================================
  // Helpers
  // ==========================================

  const formatCurrency = (value) => {
    return `PKR ${Number(value || 0).toLocaleString()}`;
  };

  const getStatusClass = (loanStatus) => {
    const classes = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-blue-100 text-blue-700",
      active: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      completed: "bg-purple-100 text-purple-700",
    };

    return classes[loanStatus] || "bg-slate-100 text-slate-700";
  };

  const getCustomerName = (loan) => {
    if (loan.customer) {
      return `${loan.customer.firstName || ""} ${
        loan.customer.lastName || ""
      }`.trim();
    }

    const customer = customers.find(
      (item) => Number(item.id) === Number(loan.customerId),
    );

    if (!customer) {
      return `Customer #${loan.customerId}`;
    }

    return `${customer.firstName} ${customer.lastName}`;
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loans</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage loan applications and loan status.
          </p>
        </div>

        <Button onClick={openCreateModal} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Loan
        </Button>
      </div>

      {/* Messages */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Search / Filter */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 md:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search loan number or purpose..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Statuses</option>

            <option value="pending">Pending</option>

            <option value="approved">Approved</option>

            <option value="active">Active</option>

            <option value="rejected">Rejected</option>

            <option value="completed">Completed</option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
          >
            Search
          </button>
        </form>
      </div>

      {/* Desktop Table */}

      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Loading loans...
          </div>
        ) : loans.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No loans found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Loan
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Customer
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Amount
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Installment
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">
                        {loan.loanNumber}
                      </p>

                      <p className="text-xs text-slate-500">
                        {loan.purpose || "No purpose"}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700">
                      {getCustomerName(loan)}
                    </td>

                    <td className="px-4 py-4 text-sm font-medium text-slate-900">
                      {formatCurrency(loan.amount)}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700">
                      {formatCurrency(loan.monthlyInstallment)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                          loan.status,
                        )}`}
                      >
                        {loan.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(loan)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {isStaff && loan.status === "pending" && (
                          <button
                            onClick={() => openEditModal(loan)}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}

                        {isStaff && loan.status === "pending" && (
                          <>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleLoanAction("approve", loan)}
                              className="rounded-lg p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>

                            <button
                              disabled={actionLoading}
                              onClick={() => handleLoanAction("reject", loan)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {isStaff && loan.status === "approved" && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleLoanAction("activate", loan)}
                            className="rounded-lg p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
                            title="Activate"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Cards */}

      <div className="space-y-4 lg:hidden">
        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading loans...
          </div>
        ) : loans.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm">
            No loans found.
          </div>
        ) : (
          loans.map((loan) => (
            <div
              key={loan.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {loan.loanNumber}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {getCustomerName(loan)}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(
                    loan.status,
                  )}`}
                >
                  {loan.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Amount</p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatCurrency(loan.amount)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Monthly</p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatCurrency(loan.monthlyInstallment)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Remaining</p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatCurrency(loan.remainingAmount)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Duration</p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {loan.durationMonths} months
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <button
                  onClick={() => handleViewDetails(loan)}
                  className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  View
                </button>

                {isStaff && loan.status === "pending" && (
                  <>
                    <button
                      onClick={() => openEditModal(loan)}
                      className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
                    >
                      <Edit className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </button>

                    <button
                      disabled={actionLoading}
                      onClick={() => handleLoanAction("approve", loan)}
                      className="inline-flex items-center rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700"
                    >
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      Approve
                    </button>

                    <button
                      disabled={actionLoading}
                      onClick={() => handleLoanAction("reject", loan)}
                      className="inline-flex items-center rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      Reject
                    </button>
                  </>
                )}

                {isStaff && loan.status === "approved" && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleLoanAction("activate", loan)}
                    className="inline-flex items-center rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700"
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}

      {!loading && pagination.totalPages > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {pagination.currentPage} of {pagination.totalPages} (
            {pagination.totalItems} loans)
          </p>

          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-slate-300 p-2 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              disabled={page >= pagination.totalPages}
              onClick={() =>
                setPage((value) => Math.min(pagination.totalPages, value + 1))
              }
              className="rounded-lg border border-slate-300 p-2 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingLoan ? "Edit Loan" : "Create New Loan"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the loan information below.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Customer
                </label>

                <select
                  name="customerId"
                  value={form.customerId}
                  onChange={handleChange}
                  disabled={Boolean(editingLoan) || customersLoading}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {customersLoading
                      ? "Loading customers..."
                      : "Select customer"}
                  </option>

                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Loan Amount"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  required
                />

                <Input
                  label="Interest Rate (%)"
                  type="number"
                  name="interestRate"
                  value={form.interestRate}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  required
                />

                <Input
                  label="Duration (Months)"
                  type="number"
                  name="durationMonths"
                  value={form.durationMonths}
                  onChange={handleChange}
                  placeholder="e.g. 12"
                  required
                />

                <Input
                  label="Purpose"
                  type="text"
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  placeholder="Loan purpose"
                  required
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingLoan
                      ? "Update Loan"
                      : "Create Loan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}

      {showDetails && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Loan Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedLoan.loanNumber}
                </p>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Customer</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {getCustomerName(selectedLoan)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Status</p>

                <span
                  className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                    selectedLoan.status,
                  )}`}
                >
                  {selectedLoan.status}
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Amount</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {formatCurrency(selectedLoan.amount)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Interest Rate</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {selectedLoan.interestRate}%
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Duration</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {selectedLoan.durationMonths} months
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Monthly Installment</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {formatCurrency(selectedLoan.monthlyInstallment)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Total Payable</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {formatCurrency(selectedLoan.totalPayable)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Paid Amount</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {formatCurrency(selectedLoan.paidAmount)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs text-slate-500">Remaining Amount</p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {formatCurrency(selectedLoan.remainingAmount)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
