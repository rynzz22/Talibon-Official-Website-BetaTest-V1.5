import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, Briefcase, Building2, MapPin, Sparkles, 
  ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, ArrowLeft 
} from "lucide-react";
import { Link } from "react-router-dom";
import ECedulaForm from "./eservices/ECedula/ECedulaForm";

type ServiceType = "directory" | "e-cedula" | "business" | "building" | "zoning";

export default function EServices() {
  const [activeService, setActiveService] = useState<ServiceType>("directory");

  const availableServices = [
    {
      id: "e-cedula" as ServiceType,
      title: "E-Cedula (Community Tax Certificate)",
      description: "File and calculate your Community Tax Certificate (Cedula) electronically with instant assessment and printable slips.",
      badge: "Fully Online",
      badgeClass: "bg-green-50 text-green-700 border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30",
      action: "File Online Now",
      icon: FileText,
      iconBg: "bg-sky-50 text-brand-primary dark:bg-sky-950/20 dark:text-brand-secondary",
      isInternal: true,
    },
    {
      id: "business" as ServiceType,
      title: "Business Permit",
      description: "Apply for a new business permit or renew your existing licenses. Download templates and complete payments securely.",
      badge: "Form & Payment",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
      action: "Apply / Renew",
      icon: Briefcase,
      iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400",
      isInternal: false,
      href: "/forms/business",
    },
    {
      id: "building" as ServiceType,
      title: "Building Permit",
      description: "Apply for architectural, engineering, electrical, and structural building clearances required for municipal code verification.",
      badge: "Form & Payment",
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30",
      action: "Secure Clearances",
      icon: Building2,
      iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400",
      isInternal: false,
      href: "/forms/building",
    },
    {
      id: "zoning" as ServiceType,
      title: "Zoning Clearance",
      description: "Verify land usage conformity against local municipal zoning laws and secure environmental certificates.",
      badge: "Form & Payment",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30",
      action: "Validate Zoning",
      icon: MapPin,
      iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400",
      isInternal: false,
      href: "/forms/zoning",
    }
  ];

  const handleServiceSelect = (service: typeof availableServices[0]) => {
    if (service.isInternal) {
      setActiveService(service.id);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {activeService === "directory" ? (
          <motion.div
            key="services-directory"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="border-b border-brand-border pb-6">
              <h2 className="text-2xl font-black text-brand-text uppercase font-display tracking-tight">Available Digital Services</h2>
              <p className="text-xs text-brand-muted font-bold uppercase tracking-widest mt-1">Select a service to begin your electronic application</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableServices.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="pro-card hover:border-brand-primary/30 group cursor-pointer h-full flex flex-col justify-between"
                    onClick={() => !service.href && handleServiceSelect(service)}
                  >
                    {service.href ? (
                      /* External Routing Link */
                      <Link to={service.href} className="p-8 h-full flex flex-col justify-between">
                        <div className="space-y-6">
                          <div className="flex justify-between items-start">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${service.iconBg}`}>
                              <Icon size={24} />
                            </div>
                            <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border ${service.badgeClass}`}>
                              {service.badge}
                            </span>
                          </div>

                          <div className="space-y-2 text-left">
                            <h3 className="text-lg font-black text-brand-text uppercase tracking-tight group-hover:text-brand-primary transition-colors font-display">
                              {service.title}
                            </h3>
                            <p className="text-xs text-brand-muted leading-relaxed font-semibold">
                              {service.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-8 flex items-center gap-1 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:gap-2 transition-all">
                          <span>{service.action}</span>
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    ) : (
                      /* Interactive Internal Form Toggle */
                      <div className="p-8 h-full flex flex-col justify-between">
                        <div className="space-y-6">
                          <div className="flex justify-between items-start">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${service.iconBg}`}>
                              <Icon size={24} />
                            </div>
                            <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border ${service.badgeClass}`}>
                              {service.badge}
                            </span>
                          </div>

                          <div className="space-y-2 text-left">
                            <h3 className="text-lg font-black text-brand-text uppercase tracking-tight group-hover:text-brand-primary transition-colors font-display">
                              {service.title}
                            </h3>
                            <p className="text-xs text-brand-muted leading-relaxed font-semibold">
                              {service.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-8 flex items-center gap-1 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:gap-2 transition-all">
                          <span>{service.action}</span>
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Form Header controls */}
            <div className="flex items-center justify-between border-b border-brand-border pb-6">
              <button
                onClick={() => setActiveService("directory")}
                className="px-4 py-2 border border-brand-border hover:bg-gray-50 text-brand-text rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
              >
                <ArrowLeft size={14} className="text-brand-primary" /> Back to Services
              </button>
              
              <div className="text-right">
                <span className="text-[10px] font-extrabold text-brand-primary uppercase tracking-widest block bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">Active Session</span>
              </div>
            </div>

            {activeService === "e-cedula" && <ECedulaForm />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
