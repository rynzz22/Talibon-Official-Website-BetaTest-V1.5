import React from "react";
import { 
  FileText, 
  Globe, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Calendar, 
  AlertTriangle 
} from "lucide-react";

export type AllowedStatus = 
  | "draft" 
  | "published" 
  | "pending" 
  | "processing"
  | "approved" 
  | "rejected" 
  | "completed"
  | "available" 
  | "coming-soon" 
  | "coming_soon"
  | "maintenance"
  | "DRAFT"
  | "PUBLISHED"
  | "PENDING"
  | "PROCESSING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "AVAILABLE"
  | "COMING-SOON"
  | "MAINTENANCE";

interface StatusBadgeProps {
  status: AllowedStatus | string;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = "" }) => {
  const normalized = status.toLowerCase().replace("_", "-");

  const getStatusConfig = () => {
    switch (normalized) {
      case "draft":
        return {
          bg: "bg-gray-50 text-gray-600 border-gray-200/60 dark:bg-gray-900/40 dark:text-gray-400 dark:border-gray-800",
          text: label || "Draft",
          icon: FileText,
          dotColor: "bg-gray-400"
        };
      case "published":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50",
          text: label || "Published",
          icon: Globe,
          dotColor: "bg-blue-500"
        };
      case "pending":
        return {
          bg: "bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/50",
          text: label || "Pending",
          icon: Clock,
          dotColor: "bg-sky-500 animate-pulse"
        };
      case "processing":
        return {
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50",
          text: label || "Processing",
          icon: Clock,
          dotColor: "bg-indigo-500"
        };
      case "approved":
      case "completed":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50",
          text: label || (normalized === "completed" ? "Completed" : "Approved"),
          icon: CheckCircle2,
          dotColor: "bg-emerald-500"
        };
      case "rejected":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50",
          text: label || "Rejected",
          icon: XCircle,
          dotColor: "bg-rose-500"
        };
      case "available":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50",
          text: label || "Available",
          icon: Sparkles,
          dotColor: "bg-emerald-500"
        };
      case "coming-soon":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/50",
          text: label || "Coming Soon",
          icon: Calendar,
          dotColor: "bg-purple-500"
        };
      case "maintenance":
        return {
          bg: "bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50",
          text: label || "Maintenance",
          icon: AlertTriangle,
          dotColor: "bg-red-500"
        };
      default:
        return {
          bg: "bg-gray-50 text-gray-600 border-gray-200/60 dark:bg-gray-900/40 dark:text-gray-400",
          text: label || status,
          icon: FileText,
          dotColor: "bg-gray-400"
        };
    }
  };

  const { bg, text, icon: Icon, dotColor } = getStatusConfig();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${bg} transition-all duration-200 shadow-2xs hover:scale-[1.01] ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
      <Icon size={11} className="shrink-0" />
      <span>{text}</span>
    </span>
  );
};

export default StatusBadge;
