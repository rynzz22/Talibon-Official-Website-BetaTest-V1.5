import React from "react";
import { Check, Clock, AlertTriangle } from "lucide-react";

interface ServiceStatusBadgeProps {
  status: "available" | "coming-soon" | "maintenance";
}

export const ServiceStatusBadge: React.FC<ServiceStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "available":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
          dot: "bg-emerald-500",
          text: "Online Processing Available",
          icon: <Check size={12} className="mr-1.5" />
        };
      case "coming-soon":
        return {
          bg: "bg-sky-50 dark:bg-sky-950/30 border-sky-500/20 text-sky-700 dark:text-sky-400",
          dot: "bg-sky-500 animate-pulse",
          text: "Coming Soon to E-Services",
          icon: <Clock size={12} className="mr-1.5" />
        };
      case "maintenance":
        return {
          bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-500/20 text-rose-700 dark:text-rose-400",
          dot: "bg-rose-500",
          text: "Temporary Offline Maintenance",
          icon: <AlertTriangle size={12} className="mr-1.5" />
        };
      default:
        return {
          bg: "bg-gray-50 border-gray-500/20 text-gray-700",
          dot: "bg-gray-500",
          text: "Status Unknown",
          icon: null
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${config.bg} shadow-2xs`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`} />
      {config.icon}
      {config.text}
    </div>
  );
};

export default ServiceStatusBadge;
