import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import paymentService from "../../services/payment.service";
import loanService from "../../services/loan.service";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  loanId: "",
  amount: "",
  paymentDate: "",
  paymentMethod: "cash",
  referenceNumber: "",
  notes: "",
};

const Payments = () => {
  const { user } = useAuth();

  const [payments, setPayments] = useState([]);
  const [loans, setLoans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loansLoading, setLoansLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchLoanId, setSearchLoanId] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 0,
  });

  const [showModal, setShowModal] = useState(false);

  const [showDetails, setShowDetails] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const isStaff = user?.role === "admin" || user?.role === "loan_officer";

  const isAdmin = user?.role === "admin";

  // ==========================================
  // Fetch Payments
  // ==========================================

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await paymentService.getPayments({
        page,
        limit: 10,
        loanId: searchLoanId,
      });

      setPayments(response.data?.payments || []);

      setPagination(
        response.data?.pagination || {
          totalItems: 0,
          currentPage: 1,
          itemsPerPage: 10,
          totalPages: 0,
        },
      );
    } catch (error) {
      console.error("Fetch payments error:", error);

      setError(error.response?.data?.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Fetch Loans
  // ==========================================

  const fetchLoans = async () => {
    try {
      setLoansLoading(true);

      const response = await loanService.getLoans({
        page: 1,
        limit: 100,
        status: "active",
      });

      setLoans(response.data?.loans || []);
    } catch (error) {
      console.error("Fetch loans error:", error);
    } finally {
      setLoansLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page]);

  useEffect(() => {
    if (isStaff) {
      fetchLoans();
    }
  }, [user?.role]);

  // ==========================================
  // Search
  // ==========================================

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);

    fetchPayments();
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
    setForm({
      ...initialForm,
      paymentDate: new Date().toISOString().split("T")[0],
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
    setForm(initialForm);
  };

  // ==========================================
  // Create Payment
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const paymentData = {
        loanId: Number(form.loanId),
        amount: Number(form.amount),
        paymentDate: form.paymentDate,
        paymentMethod: form.paymentMethod,
        referenceNumber: form.referenceNumber.trim() || null,
        notes: form.notes.trim() || null,
      };

      await paymentService.createPayment(paymentData);

      setSuccess("Payment recorded successfully.");

      closeModal();

      await fetchPayments();
    } catch (error) {
      console.error("Create payment error:", error);

      setError(error.response?.data?.message || "Failed to record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // View Payment
  // ==========================================

  const handleViewPayment = async (payment) => {
    try {
      setError("");

      const response = await paymentService.getPaymentById(payment.id);

      setSelectedPayment(response.data?.payment || payment);

      setShowDetails(true);
    } catch (error) {
      console.error("Get payment error:", error);

      setError(
        error.response?.data?.message || "Failed to load payment details.",
      );
    }
  };

  // ==========================================
  // Delete Payment
  // ==========================================

  const handleDelete = async (payment) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(payment.id);
      setError("");
      setSuccess("");

      await paymentService.deletePayment(payment.id);

      setSuccess("Payment deleted successfully.");

      await fetchPayments();
    } catch (error) {
      console.error("Delete payment error:", error);

      setError(error.response?.data?.message || "Failed to delete payment.");
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // Helpers
  // ==========================================

  const formatCurrency = (value) => {
    return `PKR ${Number(value || 0).toLocaleString()}`;
  };

  const getLoanNumber = (payment) => {
    if (payment.loan?.loanNumber) {
      return payment.loan.loanNumber;
    }

    const loan = loans.find(
      (item) => Number(item.id) === Number(payment.loanId),
    );

    return loan?.loanNumber || `Loan #${payment.loanId}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString();
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>

          <p className="mt-1 text-sm text-slate-500">
            Record and manage loan payments.
          </p>
        </div>

        {isStaff && (
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        )}
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

      {/* Search */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="number"
              value={searchLoanId}
              onChange={(event) => setSearchLoanId(event.target.value)}
              placeholder="Search by Loan ID..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

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
            Loading payments...
          </div>
        ) : payments.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No payments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Payment
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Loan
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Amount
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Method
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">
                        #{payment.id}
                      </p>

                      {payment.referenceNumber && (
                        <p className="text-xs text-slate-500">
                          Ref: {payment.referenceNumber}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm font-medium text-slate-700">
                      {getLoanNumber(payment)}
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {formatDate(payment.paymentDate)}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                        {payment.paymentMethod}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewPayment(payment)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {isAdmin && (
                          <button
                            disabled={deletingId === payment.id}
                            onClick={() => handleDelete(payment)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
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
            Loading payments...
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm">
            No payments found.
          </div>
        ) : (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Payment #{payment.id}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {getLoanNumber(payment)}
                  </p>
                </div>

                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">
                  {payment.paymentMethod}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Amount</p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Date</p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatDate(payment.paymentDate)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                <button
                  onClick={() => handleViewPayment(payment)}
                  className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  View
                </button>

                {isAdmin && (
                  <button
                    disabled={deletingId === payment.id}
                    onClick={() => handleDelete(payment)}
                    className="inline-flex items-center rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
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
            {pagination.totalItems} payments)
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

      {/* Create Payment Modal */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Record Payment
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter payment information.
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
              {/* Loan */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Loan
                </label>

                <select
                  name="loanId"
                  value={form.loanId}
                  onChange={handleChange}
                  disabled={loansLoading}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {loansLoading ? "Loading loans..." : "Select active loan"}
                  </option>

                  {loans.map((loan) => (
                    <option key={loan.id} value={loan.id}>
                      {loan.loanNumber} — {formatCurrency(loan.remainingAmount)}{" "}
                      remaining
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Payment Amount"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Enter payment amount"
                  required
                />

                <Input
                  label="Payment Date"
                  type="date"
                  name="paymentDate"
                  value={form.paymentDate}
                  onChange={handleChange}
                  required
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Payment Method
                  </label>

                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="cash">Cash</option>

                    <option value="bank">Bank</option>

                    <option value="online">Online</option>
                  </select>
                </div>

                <Input
                  label="Reference Number"
                  type="text"
                  name="referenceNumber"
                  value={form.referenceNumber}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Optional payment notes"
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  {submitting ? "Saving..." : "Record Payment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}

      {showDetails && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Payment Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Payment #{selectedPayment.id}
                </p>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Loan</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {getLoanNumber(selectedPayment)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Amount</p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {formatCurrency(selectedPayment.amount)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Date</p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatDate(selectedPayment.paymentDate)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Method</p>

                  <p className="mt-1 font-semibold capitalize text-slate-900">
                    {selectedPayment.paymentMethod}
                  </p>
                </div>
              </div>

              {selectedPayment.referenceNumber && (
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Reference Number</p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedPayment.referenceNumber}
                  </p>
                </div>
              )}

              {selectedPayment.notes && (
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Notes</p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedPayment.notes}
                  </p>
                </div>
              )}
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

export default Payments;
