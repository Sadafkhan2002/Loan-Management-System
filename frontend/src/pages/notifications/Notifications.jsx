import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import notificationService from "../../services/notification.service";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await notificationService.getNotifications({
        page,
        limit,
      });

      setNotifications(response?.data?.notifications || []);

      setPagination(
        response?.data?.pagination || {
          totalItems: 0,
          currentPage: page,
          itemsPerPage: limit,
          totalPages: 0,
        },
      );
    } catch (err) {
      console.error("Get notifications error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const handleMarkAsRead = async (id) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await notificationService.markAsRead(id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
        ),
      );

      setSuccess("Notification marked as read.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Mark notification as read error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to mark notification as read.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await notificationService.markAllAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      setSuccess("All notifications marked as read.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Mark all notifications error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to mark all notifications as read.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "loan_submitted":
        return "📝";

      case "loan_approved":
        return "✅";

      case "loan_rejected":
        return "❌";

      case "loan_activated":
        return "🚀";

      case "payment_received":
        return "💰";

      case "loan_completed":
        return "🎉";

      default:
        return "🔔";
    }
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case "loan_submitted":
        return "Loan Submitted";

      case "loan_approved":
        return "Loan Approved";

      case "loan_rejected":
        return "Loan Rejected";

      case "loan_activated":
        return "Loan Activated";

      case "payment_received":
        return "Payment Received";

      case "loan_completed":
        return "Loan Completed";

      case "system":
        return "System";

      default:
        return "Notification";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Notifications
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View and manage your notifications.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={actionLoading || unreadCount === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </button>
        </div>
      </div>

      {/* Unread Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Unread on this page
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {unreadCount}
            </p>
          </div>

          <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            {pagination.totalItems} total
          </div>
        </div>
      </div>

      {/* Success */}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">{error}</p>

          <button
            type="button"
            onClick={handleRefresh}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Notifications */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <RefreshCw className="mx-auto h-7 w-7 animate-spin text-blue-600" />

            <p className="mt-3 text-sm text-slate-500">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Bell className="h-7 w-7 text-slate-400" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No notifications
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              You don't have any notifications yet.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-2xl border bg-white p-4 shadow-sm transition sm:p-5 ${
                notification.isRead
                  ? "border-slate-200"
                  : "border-blue-200 bg-blue-50/30"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg ${
                    notification.isRead ? "bg-slate-100" : "bg-blue-100"
                  }`}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`text-base ${
                            notification.isRead
                              ? "font-medium text-slate-800"
                              : "font-bold text-slate-900"
                          }`}
                        >
                          {notification.title ||
                            getNotificationTypeLabel(notification.type)}
                        </h3>

                        {!notification.isRead && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {getNotificationTypeLabel(notification.type)}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs text-slate-400">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {notification.message}
                  </p>

                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={actionLoading}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && notifications.length > 0 && pagination.totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination.totalPages, current + 1),
                )
              }
              disabled={page >= pagination.totalPages || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
