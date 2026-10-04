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
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "loan_officer",
  status: "active",
};

const Users = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
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

  const [editingUser, setEditingUser] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState(initialForm);

  const isAdmin = user?.role === "admin";

  // ==========================================
  // Fetch Users
  // ==========================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await userService.getUsers({
        page,
        limit: 10,
        search,
        role,
        status,
      });

      setUsers(response.data?.users || []);

      setPagination(
        response.data?.pagination || {
          totalItems: 0,
          currentPage: 1,
          itemsPerPage: 10,
          totalPages: 0,
        },
      );
    } catch (error) {
      console.error("Fetch users error:", error);

      setError(error.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

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

    setPage(1);

    fetchUsers();
  };

  // ==========================================
  // Form
  // ==========================================

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  // ==========================================
  // Create User
  // ==========================================

  const openCreateModal = () => {
    setEditingUser(null);

    setForm(initialForm);

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // ==========================================
  // Edit User
  // ==========================================

  const openEditModal = (selected) => {
    setEditingUser(selected);

    setForm({
      name: selected.name || "",
      email: selected.email || "",
      password: "",
      role: selected.role || "loan_officer",
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
  // Submit
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

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

      if (form.password.trim()) {
        userData.password = form.password;
      }

      if (editingUser) {
        await userService.updateUser(editingUser.id, userData);

        setSuccess("User updated successfully.");
      } else {
        if (!form.password.trim()) {
          setError("Password is required when creating a user.");

          setSubmitting(false);
          return;
        }

        userData.password = form.password;

        await userService.createUser(userData);

        setSuccess("User created successfully.");
      }

      closeModal();

      await fetchUsers();
    } catch (error) {
      console.error("Save user error:", error);

      setError(error.response?.data?.message || "Failed to save user.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // View User
  // ==========================================

  const handleViewUser = async (selected) => {
    try {
      setError("");

      const response = await userService.getUserById(selected.id);

      setSelectedUser(response.data?.user || selected);

      setShowDetails(true);
    } catch (error) {
      console.error("Get user error:", error);

      setError(error.response?.data?.message || "Failed to load user details.");
    }
  };

  // ==========================================
  // Delete User
  // ==========================================

  const handleDelete = async (selected) => {
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

      setSuccess("User deleted successfully.");

      await fetchUsers();
    } catch (error) {
      console.error("Delete user error:", error);

      setError(error.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // Helpers
  // ==========================================

  const getRoleClass = (userRole) => {
    const classes = {
      admin: "bg-purple-100 text-purple-700",
      loan_officer: "bg-blue-100 text-blue-700",
      customer: "bg-green-100 text-green-700",
    };

    return classes[userRole] || "bg-slate-100 text-slate-700";
  };

  const getStatusClass = (userStatus) => {
    return userStatus === "active"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  };

  const formatRole = (userRole) => {
    return userRole
      ?.split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // ==========================================
  // Non-admin protection
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
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage system users, roles and account status.
          </p>
        </div>

        <Button onClick={openCreateModal} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add User
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

      {/* Filters */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 lg:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">All Roles</option>

            <option value="admin">Admin</option>

            <option value="loan_officer">Loan Officer</option>

            <option value="customer">Customer</option>
          </select>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">All Statuses</option>

            <option value="active">Active</option>

            <option value="inactive">Inactive</option>
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
            Loading users...
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
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">
                        {item.name}
                      </p>

                      <p className="text-xs text-slate-500">{item.email}</p>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleClass(
                          item.role,
                        )}`}
                      >
                        {formatRole(item.role)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewUser(item)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => openEditModal(item)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          disabled={deletingId === item.id}
                          onClick={() => handleDelete(item)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          title="Delete"
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

      {/* Mobile Cards */}

      <div className="space-y-4 lg:hidden">
        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading users...
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
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>

                  <p className="mt-1 text-xs text-slate-500">{item.email}</p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                    item.status,
                  )}`}
                >
                  {item.status}
                </span>
              </div>

              <div className="mt-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleClass(
                    item.role,
                  )}`}
                >
                  {formatRole(item.role)}
                </span>
              </div>

              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                <button
                  onClick={() => handleViewUser(item)}
                  className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  View
                </button>

                <button
                  onClick={() => openEditModal(item)}
                  className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
                >
                  <Edit className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </button>

                <button
                  disabled={deletingId === item.id}
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

      {/* Pagination */}

      {!loading && pagination.totalPages > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {pagination.currentPage} of {pagination.totalPages} (
            {pagination.totalItems} users)
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
                  {editingUser ? "Edit User" : "Create User"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage user account information.
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
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />

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
                    <option value="admin">Admin</option>

                    <option value="loan_officer">Loan Officer</option>

                    <option value="customer">Customer</option>
                  </select>
                </div>

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
                    : editingUser
                      ? "Update User"
                      : "Create User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details */}

      {showDetails && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  User Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  User #{selectedUser.id}
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
                <p className="text-xs text-slate-500">Name</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {selectedUser.name}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Email</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {selectedUser.email}
                </p>
              </div>

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

export default Users;
