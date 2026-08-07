import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  X,
  Check,
  CheckSquare,
  Archive,
  Bell,
  Workflow,
  ShieldCheck,
  Newspaper,
  FolderOpen,
  MessageSquare,
  Landmark,
  FileCheck,
  Clock,
  Eye,
  Inbox
} from "lucide-react";
import { useAuth } from "../contexts/SupabaseAuthContext";
import { notificationService, AppNotification, NotificationCategory } from "../services/notificationService";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationsUpdated?: () => void;
  onViewAction?: (actionUrl: string) => void; // Called when clicking 'View'
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  onNotificationsUpdated,
  onViewAction
}: NotificationDrawerProps) {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeTab, setActiveTab] = useState<"unread" | "all" | "archived">("unread");
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(profile);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[NotificationDrawer] Load error:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && profile) {
      fetchNotifs();
    }
  }, [isOpen, profile, activeTab]);

  useEffect(() => {
    if (!profile) return;
    
    let unsubscribe: (() => void) | null = null;
    try {
      // Set up live event listener
      unsubscribe = notificationService.subscribeToNotifications(profile, () => {
        fetchNotifs();
        if (onNotificationsUpdated) {
          try {
            onNotificationsUpdated();
          } catch (updateErr) {
            console.error("[NotificationDrawer] Parent update handler failed:", updateErr);
          }
        }
      });
    } catch (err) {
      console.error("[NotificationDrawer] Failed to subscribe to live notifications:", err);
    }
    
    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (unsubErr) {
          console.warn("[NotificationDrawer] Error during unsubscribe cleanup:", unsubErr);
        }
      }
    };
  }, [profile]);

  // Format timestamps nicely (e.g. "15m ago", "2h ago")
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch (e) {
      return "Recently";
    }
  };

  // Get matching categoric metadata
  const getCategoryMeta = (category: NotificationCategory) => {
    try {
      switch (category) {
        case "Citizen Applications":
          return {
            icon: FileCheck,
            color: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400",
            label: "Citizen Apps"
          };
        case "Workflow Updates":
          return {
            icon: Workflow,
            color: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400",
            label: "Workflow"
          };
        case "Staff Verification":
          return {
            icon: ShieldCheck,
            color: "bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400",
            label: "Staff Registry"
          };
        case "News Approval":
          return {
            icon: Newspaper,
            color: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400",
            label: "News Moderation"
          };
        case "Document Updates":
          return {
            icon: FolderOpen,
            color: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400",
            label: "Documents"
          };
        case "System Messages":
          return {
            icon: Clock,
            color: "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400",
            label: "System Alerts"
          };
        case "Department Announcements":
          return {
            icon: Landmark,
            color: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400",
            label: "Office Bulletins"
          };
        default:
          return {
            icon: MessageSquare,
            color: "bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-900/40 dark:text-gray-400",
            label: "General Notice"
          };
      }
    } catch (e) {
      return {
        icon: MessageSquare,
        color: "bg-gray-50 text-gray-600 border-gray-100",
        label: "Notice"
      };
    }
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  // Filter list by tab criteria
  const filteredNotifications = safeNotifications.filter((n) => {
    if (!n) return false;
    if (activeTab === "unread") return !n.is_read && !n.is_archived;
    if (activeTab === "all") return !n.is_archived;
    if (activeTab === "archived") return n.is_archived;
    return true;
  });

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await notificationService.markAsRead(id);
    fetchNotifs();
    if (onNotificationsUpdated) onNotificationsUpdated();
  };

  const handleArchive = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await notificationService.archiveNotification(id);
    fetchNotifs();
    if (onNotificationsUpdated) onNotificationsUpdated();
  };

  const handleMarkAllAsRead = async () => {
    if (!profile) return;
    await notificationService.markAllAsRead(profile);
    fetchNotifs();
    if (onNotificationsUpdated) onNotificationsUpdated();
  };

  const handleView = (notif: AppNotification) => {
    handleMarkAsRead(notif.id);
    onClose();
    if (onViewAction && notif.action_url) {
      onViewAction(notif.action_url);
    } else {
      // Force direct dashboard redirect if not customized
      window.location.hash = "";
      window.location.href = `/admin?tab=${notif.action_url || "overview"}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden" id="notification-drawer-portal">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl border-l border-gray-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Bell size={18} className="animate-none" />
            </div>
            <div>
              <h2 className="font-display font-black text-gray-900 text-sm uppercase tracking-wide">
                Notification Center
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                {notifications.filter((n) => !n.is_read && !n.is_archived).length} Unread alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector & Controls */}
        <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex rounded-lg bg-gray-100 p-0.5 w-full">
              {(["unread", "all", "archived"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 text-[10px] font-black uppercase tracking-wider py-1.5 rounded-md transition-all text-center ${
                    activeTab === tab
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "unread" && filteredNotifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center justify-center gap-1.5 text-[9px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest text-center py-1 bg-blue-50/50 hover:bg-blue-50 border border-blue-100/30 rounded-lg transition-all"
            >
              <CheckSquare size={11} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notification List Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {loading && filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 space-y-2">
              <Clock size={24} className="animate-spin text-blue-500" />
              <p className="text-[10px] font-black uppercase tracking-widest">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300">
                <Inbox size={24} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-900">
                  {activeTab === "unread"
                    ? "Your inbox is clear"
                    : activeTab === "archived"
                    ? "No archived notifications"
                    : "No notifications found"}
                </p>
                <p className="text-[10px] font-bold text-gray-400 mt-1.5 max-w-xs mx-auto">
                  Only alerts specific to your municipal office role and clearance level will display here.
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const meta = getCategoryMeta(notif.category);
              const CategoryIcon = meta.icon;

              return (
                <div
                  key={notif.id}
                  onClick={() => handleView(notif)}
                  className={`group relative flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                    notif.is_read
                      ? "bg-white border-gray-100 hover:border-gray-200"
                      : "bg-blue-50/10 border-blue-100/30 hover:border-blue-100/50"
                  }`}
                >
                  {/* Read indicator dot */}
                  {!notif.is_read && (
                    <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  )}

                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.color}`}
                  >
                    <CategoryIcon size={18} />
                  </div>

                  {/* Content details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-gray-50 border border-gray-200 text-gray-500">
                        {meta.label}
                      </span>
                      {notif.department_id && (
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-50 border border-blue-100/30 text-blue-600">
                          {notif.department_id === "dept-1" || notif.department_id === "bplo" ? "BPLO" : notif.department_id === "dept-2" || notif.department_id === "treasury" ? "MTO" : "STAFF"}
                        </span>
                      )}
                    </div>

                    <h3 className={`text-xs font-black leading-snug ${notif.is_read ? "text-gray-900 font-medium" : "text-blue-950"}`}>
                      {notif.title}
                    </h3>

                    <p className="text-[11px] font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock size={10} />
                        {formatTimeAgo(notif.created_at)}
                      </span>

                      {/* Hover action bar */}
                      <div className="flex items-center gap-1">
                        {!notif.is_read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check size={12} />
                          </button>
                        )}
                        {!notif.is_archived && (
                          <button
                            onClick={(e) => handleArchive(notif.id, e)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Archive alert"
                          >
                            <Archive size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => handleView(notif)}
                          className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg flex items-center gap-0.5 opacity-90 group-hover:opacity-100 hover:bg-blue-700 transition-all ml-1"
                        >
                          <Eye size={10} />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
