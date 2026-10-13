import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import userService from "../../services/user.service";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";
import { getErrorMessage } from "../../utils/error";

// ==========================================
// Initial Values
// ==========================================

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: ROLES.LOAN_OFFICER,
  status: "active",
};

const initialPagination = {
  totalItems: 0,
  currentPage: 1,
  itemsPerPage: 10,
  totalPages: 0,
};

// ==========================================
// Helpers
// ==========================================

const getRoleClass = (role) => {
  const classes = {
    [ROLES.ADMIN]: "bg-purple-100 text-purple-700",
    [ROLES.LOAN_OFFICER]: "bg-blue-100 text-blue-700",
    [ROLES.CUSTOMER]: "bg-green-100 text-green-700",
  };

  return classes[role] || "bg-slate-100 text-slate-700";
};

const getStatusClass = (status) => {
  return status === "active"
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";
};

const formatRole = (role) => {
  if (!role) return "-";

  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

// ==========================================
// Users Component
// ==========================================

const Users = () => {
  const { user } = useAuth();

  // ==========================================
  // Permissions
  // ==========================================

  const isAdmin = user?.role === ROLES.ADMIN;

  // ==========================================
  // State
  // ==========================================

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState(initialPagination);

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState(initialForm);

  // ==========================================
  // Fetch Users
  // ==========================================

  const fetchUsers = async (
    currentPage = page,
    currentSearch = search,
    currentRole = role,
    currentStatus = status,
  ) => {
    try {
      setLoading(true);
      setError("");

      const response = await userService.getUsers({
        page: currentPage,
        limit: 10,
        search: currentSearch,
        role: currentRole,
        status: currentStatus,
      });

      setUsers(response.data?.users || []);

      setPagination(response.data?.pagination || initialPagination);

      return true;
    } catch (error) {
      setError(getErrorMessage(error, "Failed to load users."));

      return false;
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Initial Fetch / Filter Changes
  // ==========================================

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [page, role, status, isAdmin]);

  // ==========================================
  // Search
  // ==========================================

  const handleSearch = (event) => {
    event.preventDefault();

    const value = searchInput.trim();

    setSearch(value);

    if (page !== 1) {
      setPage(1);
    } else {
      fetchUsers(1, value);
    }
  };

  // ==========================================
  // Form Change
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // Create User Modal
  // ==========================================

  const openCreateModal = () => {
    if (!isAdmin || submitting || deletingId !== null) {
      return;
    }

    setEditingUser(null);
    setForm(initialForm);

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // ==========================================
  // Edit User Modal
  // ==========================================

  const openEditModal = (selected) => {
    if (!isAdmin || submitting || deletingId !== null) {
      return;
    }

    setEditingUser(selected);

    setForm({
      name: selected.name || "",
      email: selected.email || "",
      password: "",
      role: selected.role || ROLES.LOAN_OFFICER,
      status: selected.status || "active",
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
    setEditingUser(null);
    setForm(initialForm);
  };

  // ==========================================
  // Create / Update User
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAdmin || submitting) return;

    const isEditing = Boolean(editingUser);

    // Password is mandatory for a new account.
    if (!isEditing && !form.password.trim()) {
      setError("Password is required when creating a user.");
      return;
    }

    try {
      setSubmitting(true);

      setError("");
      setSuccess("");

      const userData = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        status: form.status,
      };

      // During editing, an empty password means
      // the existing password should remain unchanged.

      if (form.password.trim()) {
        userData.password = form.password;
      }

      if (isEditing) {
        await userService.updateUser(editingUser.id, userData);
      } else {
        await userService.createUser(userData);
      }

      // Close the modal directly after success.
      // closeModal() intentionally blocks while submitting.

      setShowModal(false);
      setEditingUser(null);
      setForm(initialForm);

      const targetPage = isEditing ? page : 1;

      if (targetPage !== page) {
        setPage(targetPage);
      } else {
        await fetchUsers(targetPage, search, role, status);
      }

      setSuccess(
        isEditing ? "User updated successfully." : "User created successfully.",
      );
    } catch (error) {
      setError(getErrorMessage(error, "Failed to save user."));
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // View User Details
  // ==========================================

  const handleViewUser = async (selected) => {
    if (!isAdmin || detailsLoading) return;

    try {
      setDetailsLoading(true);
      setError("");

      const response = await userService.getUserById(selected.id);

      setSelectedUser(response.data?.user || selected);

      setShowDetails(true);
    } catch (error) {
      setError(getErrorMessage(error, "Failed to load user details."));
    } finally {
      setDetailsLoading(false);
    }
  };

  // ==========================================
  // Delete User
  // ==========================================

  const handleDelete = async (selected) => {
    if (!isAdmin || submitting || deletingId !== null) {
      return;
    }

    // Prevent deleting the currently logged-in admin.
    if (Number(selected.id) === Number(user?.id)) {
      setError("You cannot delete your own account.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.name}?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(selected.id);

      setError("");
      setSuccess("");

      await userService.deleteUser(selected.id);

      // If this was the final record on the page,
      // return to the previous page.

      const nextPage = users.length === 1 && page > 1 ? page - 1 : page;

      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        await fetchUsers(nextPage, search, role, status);
      }

      setSuccess("User deleted successfully.");
    } catch (error) {
      setError(getErrorMessage(error, "Failed to delete user."));
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // Access Protection
  // ==========================================

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="text-lg font-bold text-red-800">Access Denied</h2>

        <p className="mt-2 text-sm text-red-700">
          Only administrators can manage users.
        </p>
      </div>
    );
  }

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="space-y-6">
      {/* ======================================
          Header
      ====================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage system users, roles and account status.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          disabled={submitting || deletingId !== null}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* ======================================
          Messages
      ====================================== */}

      {error && <ErrorMessage message={error} />}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      {/* ======================================
          Search / Filters
      ====================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 lg:flex-row"
        >
          {/* Search Input */}

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name or email..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Role Filter */}

          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(1);
            }}
            aria-label="Filter users by role"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">All Roles</option>
            <option value={ROLES.ADMIN}>Admin</option>
            <option value={ROLES.LOAN_OFFICER}>Loan Officer</option>
            <option value={ROLES.CUSTOMER}>Customer</option>
          </select>

          {/* Status Filter */}

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter users by status"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50"
          >
            Search
          </button>
        </form>
      </div>

      {/* ======================================
          Desktop Table
      ====================================== */}

      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
        {loading ? (
          <div className="p-10">
            <Loading message="Loading users..." />
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    User
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Role
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Created
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    {/* User */}

                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">
                        {item.name}
                      </p>

                      <p className="text-xs text-slate-500">{item.email}</p>
                    </td>

                    {/* Role */}

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleClass(
                          item.role,
                        )}`}
                      >
                        {formatRole(item.role)}
                      </span>
                    </td>

                    {/* Status */}

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Created */}

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {formatDate(item.createdAt)}
                    </td>

                    {/* Actions */}

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewUser(item)}
                          disabled={detailsLoading}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                          title="View"
                          aria-label={`View ${item.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          disabled={submitting || deletingId !== null}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                          title="Edit"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          disabled={
                            deletingId !== null ||
                            submitting ||
                            Number(item.id) === Number(user?.id)
                          }
                          onClick={() => handleDelete(item)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          title={
                            Number(item.id) === Number(user?.id)
                              ? "You cannot delete your own account"
                              : "Delete"
                          }
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================
          Mobile Cards
      ====================================== */}

      <div className="space-y-4 lg:hidden">
        {loading ? (
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <Loading message="Loading users..." />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm">
            No users found.
          </div>
        ) : (
          users.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              {/* User Header */}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>

                  <p className="mt-1 text-xs text-slate-500">{item.email}</p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(
                    item.status,
                  )}`}
                >
                  {item.status}
                </span>
              </div>

              {/* Role */}

              <div className="mt-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleClass(
                    item.role,
                  )}`}
                >
                  {formatRole(item.role)}
                </span>
              </div>

              {/* Actions */}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => handleViewUser(item)}
                  disabled={detailsLoading}
                  className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  View
                </button>

                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  disabled={submitting || deletingId !== null}
                  className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 disabled:opacity-50"
                >
                  <Edit className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </button>

                <button
                  type="button"
                  disabled={
                    deletingId !== null ||
                    submitting ||
                    Number(item.id) === Number(user?.id)
                  }
                  onClick={() => handleDelete(item)}
                  className="inline-flex items-center rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ======================================
          Pagination
      ====================================== */}

      {!loading && pagination.totalPages > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {pagination.currentPage} of {pagination.totalPages} (
            {pagination.totalItems} users)
          </p>

          <div className="flex gap-2">
            {/* Previous */}

            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-slate-300 p-2 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Next */}

            <button
              type="button"
              disabled={page >= pagination.totalPages || loading}
              onClick={() =>
                setPage((value) => Math.min(pagination.totalPages, value + 1))
              }
              className="rounded-lg border border-slate-300 p-2 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================
          Create / Edit Modal
      ====================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            {/* Modal Header */}

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2
                  id="user-modal-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {editingUser ? "Edit User" : "Create User"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage user account information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                aria-label="Close user form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Form */}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Name */}

                <Input
                  label="Name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  required
                />

                {/* Email */}

                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />

                {/* Password */}

                <Input
                  label={editingUser ? "New Password (optional)" : "Password"}
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={
                    editingUser
                      ? "Leave empty to keep current password"
                      : "Enter password"
                  }
                  required={!editingUser}
                />

                {/* Role */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Role
                  </label>

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value={ROLES.ADMIN}>Admin</option>

                    <option value={ROLES.LOAN_OFFICER}>Loan Officer</option>

                    <option value={ROLES.CUSTOMER}>Customer</option>
                  </select>
                </div>

                {/* Status */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="active">Active</option>

                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Form Buttons */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingUser
                      ? "Update User"
                      : "Create User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================
          User Details Modal
      ====================================== */}

      {showDetails && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-details-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            {/* Details Header */}

            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2
                  id="user-details-title"
                  className="text-xl font-bold text-slate-900"
                >
                  User Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  User #{selectedUser.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close user details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Details */}

            <div className="space-y-3">
              {/* Name */}

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Name</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {selectedUser.name}
                </p>
              </div>

              {/* Email */}

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Email</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {selectedUser.email}
                </p>
              </div>

              {/* Role / Status */}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Role</p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatRole(selectedUser.role)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Status</p>

                  <p className="mt-1 font-semibold capitalize text-slate-900">
                    {selectedUser.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Footer */}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
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

export default Users;
