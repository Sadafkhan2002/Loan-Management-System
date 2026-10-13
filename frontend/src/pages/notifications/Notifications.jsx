import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import notificationService from "../../services/notification.service";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import { getErrorMessage } from "../../utils/error";

// ==========================================
// Constants
// ==========================================

const PAGE_LIMIT = 10;

const initialPagination = {
  totalItems: 0,
  currentPage: 1,
  itemsPerPage: PAGE_LIMIT,
  totalPages: 0,
};

// ==========================================
// Helpers
// ==========================================

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
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

// ==========================================
// Notifications Component
// ==========================================

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState(initialPagination);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [processingId, setProcessingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Track the latest list request.
  const requestIdRef = useRef(0);

  // Prevent duplicate read actions.
  const actionInProgressRef = useRef(false);

  // ==========================================
  // Fetch Notifications
  // ==========================================

  const fetchNotifications = useCallback(async (currentPage) => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError("");

      const response = await notificationService.getNotifications({
        page: currentPage,
        limit: PAGE_LIMIT,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      const receivedNotifications = response?.data?.notifications || [];

      const receivedPagination = response?.data?.pagination || {
        ...initialPagination,
        currentPage,
      };

      setNotifications(
        Array.isArray(receivedNotifications) ? receivedNotifications : [],
      );

      setPagination(receivedPagination);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setNotifications([]);

      setPagination({
        ...initialPagination,
        currentPage,
      });

      setError(getErrorMessage(err, "Failed to load notifications."));
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // ==========================================
  // Fetch When Page Changes
  // ==========================================

  useEffect(() => {
    fetchNotifications(page);

    return () => {
      requestIdRef.current += 1;
    };
  }, [page, fetchNotifications]);

  // ==========================================
  // Unread Count
  // ==========================================

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  // ==========================================
  // Mark Individual Notification as Read
  // ==========================================

  const handleMarkAsRead = async (id) => {
    if (actionInProgressRef.current || loading) {
      return;
    }

    const selectedNotification = notifications.find(
      (notification) => notification.id === id,
    );

    if (!selectedNotification || selectedNotification.isRead) {
      return;
    }

    actionInProgressRef.current = true;

    try {
      setActionLoading(true);
      setProcessingId(id);

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
    } catch (err) {
      setError(getErrorMessage(err, "Failed to mark notification as read."));
    } finally {
      actionInProgressRef.current = false;
      setActionLoading(false);
      setProcessingId(null);
    }
  };

  // ==========================================
  // Mark All Notifications as Read
  // ==========================================

  const handleMarkAllAsRead = async () => {
    if (actionInProgressRef.current || loading || unreadCount === 0) {
      return;
    }

    actionInProgressRef.current = true;

    try {
      setActionLoading(true);
      setProcessingId(null);

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
    } catch (err) {
      setError(
        getErrorMessage(err, "Failed to mark all notifications as read."),
      );
    } finally {
      actionInProgressRef.current = false;
      setActionLoading(false);
      setProcessingId(null);
    }
  };

  // ==========================================
  // Refresh
  // ==========================================

  const handleRefresh = () => {
    if (actionInProgressRef.current || loading) {
      return;
    }

    setSuccess("");
    fetchNotifications(page);
  };

  // ==========================================
  // Pagination
  // ==========================================

  const handlePreviousPage = () => {
    if (loading || actionLoading || page <= 1) {
      return;
    }

    setSuccess("");
    setPage((current) => Math.max(1, current - 1));
  };

  const handleNextPage = () => {
    if (loading || actionLoading || page >= pagination.totalPages) {
      return;
    }

    setSuccess("");

    setPage((current) => Math.min(pagination.totalPages, current + 1));
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        {/* Header Actions */}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || actionLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={loading || actionLoading || unreadCount === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />

            {actionLoading && processingId === null
              ? "Updating..."
              : "Mark All Read"}
          </button>
        </div>
      </div>

      {/* Unread Summary */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
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

      {/* Success Message */}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
        >
          {success}
        </div>
      )}

      {/* Error Message */}

      {error && (
        <ErrorMessage
          message={error}
          onRetry={!loading && !actionLoading ? handleRefresh : undefined}
        />
      )}

      {/* Notification List */}

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
            <Loading message="Loading notifications..." />
          </div>
        ) : error &&
          notifications.length === 0 ? null : notifications.length === 0 ? (
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
              className={`rounded-2xl border p-4 shadow-sm transition sm:p-5 ${
                notification.isRead
                  ? "border-slate-200 bg-white"
                  : "border-blue-200 bg-blue-50/30"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}

                <div
                  aria-hidden="true"
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

                  {/* Message */}

                  <p className="mt-3 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-600">
                    {notification.message || "-"}
                  </p>

                  {/* Mark as Read */}

                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={actionLoading || loading}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Mark notification ${notification.id} as read`}
                    >
                      <Check className="h-4 w-4" />

                      {processingId === notification.id
                        ? "Updating..."
                        : "Mark as read"}
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
              onClick={handlePreviousPage}
              disabled={page <= 1 || loading || actionLoading}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous notifications page"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={
                page >= pagination.totalPages || loading || actionLoading
              }
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next notifications page"
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
