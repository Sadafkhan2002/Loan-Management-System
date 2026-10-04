import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import customerService from "../../services/customer.service";
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  occupation: "",
  monthlyIncome: "",
};

const Customers = () => {
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [form, setForm] = useState(initialForm);

  const canDelete = user?.role === "admin";

  const fetchCustomers = async (page = 1, currentSearch = search) => {
    try {
      setLoading(true);
      setError("");

      const response = await customerService.getCustomers({
        page,
        limit: 10,
        search: currentSearch,
      });

      if (!response?.success || !response?.data) {
        throw new Error(response?.message || "Unable to load customers.");
      }

      setCustomers(response.data.customers || []);

      setPagination(
        response.data.pagination || {
          totalItems: 0,
          currentPage: 1,
          itemsPerPage: 10,
          totalPages: 0,
        },
      );
    } catch (error) {
      console.error("Get customers error:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to load customers.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1, "");
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const value = searchInput.trim();

    setSearch(value);
    fetchCustomers(1, value);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    fetchCustomers(1, "");
  };

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > pagination.totalPages ||
      page === pagination.currentPage
    ) {
      return;
    }

    fetchCustomers(page, search);
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);

    setForm({
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      city: customer.city || "",
      occupation: customer.occupation || "",
      monthlyIncome:
        customer.monthlyIncome !== null && customer.monthlyIncome !== undefined
          ? customer.monthlyIncome
          : "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (actionLoading) return;

    setShowModal(false);
    setEditingCustomer(null);
    setForm(initialForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const customerData = {
        ...form,
        monthlyIncome:
          form.monthlyIncome === "" ? null : Number(form.monthlyIncome),
      };

      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, customerData);

        setSuccess("Customer updated successfully.");
      } else {
        await customerService.createCustomer(customerData);

        setSuccess("Customer created successfully.");
      }

      setShowModal(false);
      setEditingCustomer(null);
      setForm(initialForm);

      await fetchCustomers(
        editingCustomer ? pagination.currentPage : 1,
        search,
      );
    } catch (error) {
      console.error("Customer save error:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to save customer.";

      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.firstName} ${customer.lastName}?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await customerService.deleteCustomer(customer.id);

      setSuccess("Customer deleted successfully.");

      const nextPage =
        customers.length === 1 && pagination.currentPage > 1
          ? pagination.currentPage - 1
          : pagination.currentPage;

      await fetchCustomers(nextPage, search);
    } catch (error) {
      console.error("Delete customer error:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to delete customer.";

      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "active") {
      return "bg-green-100 text-green-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage loan customers and their information.
          </p>
        </div>

        {(user?.role === "admin" || user?.role === "loan_officer") && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Customer
          </button>
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
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name, email or phone..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            Search
          </button>
        </form>
      </div>

      {/* Customer Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-slate-700">No customers found</p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or add a new customer.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      City
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Income
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {customer.firstName} {customer.lastName}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          ID: {customer.id}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-700">
                          {customer.email}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {customer.phone}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {customer.city || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {customer.monthlyIncome !== null &&
                        customer.monthlyIncome !== undefined
                          ? `Rs. ${Number(
                              customer.monthlyIncome,
                            ).toLocaleString()}`
                          : "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                            customer.status,
                          )}`}
                        >
                          {customer.status || "unknown"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(customer)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit customer"
                          >
                            <Edit size={17} />
                          </button>

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDelete(customer)}
                              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              title="Delete customer"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 p-4 md:hidden">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {customer.firstName} {customer.lastName}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        ID: {customer.id}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                        customer.status,
                      )}`}
                    >
                      {customer.status || "unknown"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <p className="text-slate-600">
                      <span className="font-medium">Email:</span>{" "}
                      {customer.email}
                    </p>

                    <p className="text-slate-600">
                      <span className="font-medium">Phone:</span>{" "}
                      {customer.phone}
                    </p>

                    <p className="text-slate-600">
                      <span className="font-medium">City:</span>{" "}
                      {customer.city || "-"}
                    </p>

                    <p className="text-slate-600">
                      <span className="font-medium">Income:</span>{" "}
                      {customer.monthlyIncome !== null &&
                      customer.monthlyIncome !== undefined
                        ? `Rs. ${Number(
                            customer.monthlyIncome,
                          ).toLocaleString()}`
                        : "-"}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(customer)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Edit size={16} />
                      Edit
                    </button>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(customer)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.totalItems} customers)
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                {pagination.currentPage}
              </span>

              <button
                type="button"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingCustomer ? "Edit Customer" : "Add Customer"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Enter customer information below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={actionLoading}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    First Name
                  </label>

                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    minLength={2}
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Last Name
                  </label>

                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    minLength={2}
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    maxLength={150}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    minLength={7}
                    maxLength={30}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    City
                  </label>

                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Occupation
                  </label>

                  <input
                    name="occupation"
                    value={form.occupation}
                    onChange={handleChange}
                    maxLength={150}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Monthly Income
                </label>

                <input
                  type="number"
                  name="monthlyIncome"
                  value={form.monthlyIncome}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Address
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  maxLength={255}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={actionLoading}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading
                    ? "Saving..."
                    : editingCustomer
                      ? "Update Customer"
                      : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
