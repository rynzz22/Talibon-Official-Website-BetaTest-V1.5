import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  AlertCircle,
  FileText,
  FileCheck,
  CreditCard,
  Search,
  BookOpen,
  MapPin,
  Compass,
  Loader2,
  Clock,
  Building2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Printer
} from "lucide-react";

// Data
import { SERVICES_DATA, ServiceInfo } from "../data/servicesData";
import { supabase } from "../lib/supabase";

// Shared Reusable Components
import { ServiceStatusBadge } from "../components/ServiceStatusBadge";
import { RequirementList } from "../components/RequirementList";
import { DownloadFormCard } from "../components/DownloadFormCard";
import { ContactOfficeCard } from "../components/ContactOfficeCard";
import { ComingSoonNotice } from "../components/ComingSoonNotice";

const ServiceInfoPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<ServiceInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Scroll to top on route load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  useEffect(() => {
    let isMounted = true;
    async function loadService() {
      setLoading(true);
      if (!slug) {
        setLoading(false);
        return;
      }

      const rawParam = decodeURIComponent(slug).trim();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawParam);

      try {
        let query = supabase
          .from("municipal_services")
          .select("*, departments:office_responsible_id(id, name)")
          .is("deleted_at", null);

        if (isUuid) {
          query = query.or(`id.eq.${rawParam},slug.eq.${rawParam}`);
        } else {
          query = query.or(`slug.eq.${rawParam},slug.eq.${rawParam.toLowerCase()}`);
        }

        const { data, error } = await query;

        if (error) {
          console.error("[ServiceInfoPage] Error loading service from Supabase:", error);
        } else if (data && data.length > 0) {
          const item = data[0];
          const mapped: ServiceInfo = {
            id: item.slug || item.id,
            title: item.name,
            description: item.description || "",
            purpose: item.purpose || "Official municipal government service for the Municipality of Talibon.",
            requirements: Array.isArray(item.requirements) ? item.requirements : [],
            processingTime: item.processing_time || "3 to 5 business days",
            officeResponsible: item.departments?.name || item.office_responsible || "Municipal Office",
            officeHours: item.office_hours || "Monday to Friday, 8:00 AM - 5:00 PM (except holidays)",
            contactInfo: item.contact_info || "Phone: (038) 422-2895 | Email: info@talibon.gov.ph",
            physicalAddress: item.physical_address || "Talibon Municipal Hall, Bohol, Philippines",
            status: (item.status as any) || "available",
            downloadableForms: Array.isArray(item.downloadable_forms) ? item.downloadable_forms : []
          };
          if (isMounted) {
            setService(mapped);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("[ServiceInfoPage] Error loading service from Supabase:", err);
      }

      const fallbackKey = rawParam.toLowerCase();
      if (SERVICES_DATA[fallbackKey] || SERVICES_DATA[rawParam]) {
        if (isMounted) {
          setService(SERVICES_DATA[fallbackKey] || SERVICES_DATA[rawParam]);
          setLoading(false);
        }
      } else {
        if (isMounted) {
          setService(null);
          setLoading(false);
        }
      }
    }

    loadService();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Dynamic SEO Metadata Integration
  useEffect(() => {
    if (service) {
      document.title = `${service.title} | Municipality of Talibon`;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', `${service.description} Learn the purpose, requirements, processing times, and responsible offices for ${service.title} in Talibon, Bohol.`);

      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', `${service.title} - Official E-Services Guide | Talibon`);

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', service.description);
    } else if (!loading) {
      document.title = "Service Not Found | Municipality of Talibon";
    }

    return () => {
      document.title = "Municipality of Talibon | Official Website";
    };
  }, [service, loading]);

  if (loading) {
    return (
      <div className="py-24 px-4 w-full text-center flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
          Loading Municipal Service Information...
        </p>
      </div>
    );
  }

  // Handle Invalid Route / Service Not Found
  if (!service) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 py-12">
        <div className="max-w-2xl mx-auto space-y-8 py-12 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto text-brand-primary border border-brand-primary/20 shadow-inner"
          >
            <Compass size={44} className="animate-spin-slow text-brand-primary" />
          </motion.div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 font-display uppercase tracking-tight">
              Service Guide Not Found
            </h1>
            <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed max-w-lg mx-auto">
              We couldn't locate the specific municipal service page you are searching for. It may have been relocated, renamed, or is currently undergoing administrative updates.
            </p>
          </div>

          {/* Quick Available Services Guide list */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-md mx-auto text-left space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Available E-Service Guides
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(SERVICES_DATA).map((item) => (
                <Link 
                  key={item.id} 
                  to={`/services/${item.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group text-sm font-semibold text-slate-600 hover:text-brand-primary"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                    {item.id === "apply-permit" && <FileText size={14} />}
                    {item.id === "request-certificate" && <FileCheck size={14} />}
                    {item.id === "pay-online" && <CreditCard size={14} />}
                    {item.id === "track-request" && <Search size={14} />}
                  </div>
                  <span className="truncate">{item.title}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <HashLink 
              to="/#popular-services"
              scroll={(el) => {
                const yOffset = -130;
                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 w-full text-xs font-bold uppercase tracking-wider rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 transition-all shadow-sm"
            >
              <ArrowLeft size={14} />
              Return to Online Services
            </HashLink>
          </div>
        </div>
      </div>
    );
  }

  // Get matching header icon for the service
  const getHeaderIcon = () => {
    switch (service.id) {
      case "apply-permit":
        return <FileText className="text-brand-primary" size={20} />;
      case "request-certificate":
        return <FileCheck className="text-brand-primary" size={20} />;
      case "pay-online":
        return <CreditCard className="text-brand-primary" size={20} />;
      case "track-request":
        return <Search className="text-brand-primary" size={20} />;
      default:
        return <FileText className="text-brand-primary" size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 relative pb-16 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-brand-primary/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-3 sm:pt-4 space-y-4 sm:space-y-5">
        
        {/* Navigation & Breadcrumb Header Bar (Compact) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <HashLink
            to="/#popular-services"
            scroll={(el) => {
              const yOffset = -130;
              const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 font-bold text-[11px] uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-2xs active:scale-95 shrink-0"
          >
            <ArrowLeft size={13} className="shrink-0" />
            <span>Back to Online Services</span>
          </HashLink>

          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
            <Link to="/" className="text-slate-400 hover:text-brand-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <HashLink 
              to="/#popular-services" 
              scroll={(el) => {
                const yOffset = -130;
                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }}
              className="text-slate-400 hover:text-brand-primary"
            >
              Online Services
            </HashLink>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800 uppercase tracking-wide truncate max-w-xs sm:max-w-md">
              {service.title}
            </span>
          </div>
        </div>

        {/* Compact Hero Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs relative overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2.5 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary text-[10px] font-extrabold uppercase tracking-wider">
                  <Sparkles size={11} />
                  <span>Municipal Guide</span>
                </div>
                <ServiceStatusBadge status={service.status} />
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-primary/10 border border-brand-primary/15 flex items-center justify-center shrink-0 shadow-2xs">
                  {getHeaderIcon()}
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight font-display">
                    {service.title}
                  </h1>
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Talibon Municipal Government • Service Workflow & Citizen Guidelines
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Service Highlights */}
            <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2 lg:w-64 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:border-slate-100 lg:pl-5">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 w-full">
                <div className="p-1.5 rounded-lg bg-white text-brand-primary border border-slate-200/60 shrink-0">
                  <Clock size={13} />
                </div>
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Processing Time</div>
                  <div className="text-xs font-extrabold text-slate-800">{service.processingTime}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 w-full">
                <div className="p-1.5 rounded-lg bg-white text-brand-primary border border-slate-200/60 shrink-0">
                  <Building2 size={13} />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Office In-Charge</div>
                  <div className="text-xs font-extrabold text-slate-800 truncate">{service.officeResponsible}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Core Layout Grid: Clean Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT COLUMN: Main Details (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Service Overview & Purpose Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-primary block">
                    Service Details
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
                    Overview & Scope
                  </h2>
                </div>
              </div>

              {service.description && (
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {service.description}
                </p>
              )}

              {/* Purpose Box */}
              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-brand-primary">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Purpose of Service
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                  {service.purpose}
                </p>
              </div>
            </div>

            {/* Requirements Checklist */}
            <div className="space-y-2.5">
              <div className="px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-primary block">
                  Citizen Prerequisites
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
                  Requirements Checklist
                </h3>
              </div>

              <RequirementList requirements={service.requirements} />
            </div>

            {/* Downloadable Forms */}
            <div className="space-y-2.5">
              <div className="px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-primary block">
                  Documentation
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
                  Downloadable Application Forms
                </h3>
              </div>

              <DownloadFormCard forms={service.downloadableForms} />
            </div>

            {/* Online Portal Action Card (Clean Compact) */}
            <div className="bg-gradient-to-r from-slate-900 via-brand-primary to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-sky-300">
                  Online Portal
                </span>
                <h4 className="text-sm sm:text-base font-black uppercase font-display">
                  Access Talibon E-Services Hub
                </h4>
                <p className="text-xs text-slate-200 font-normal max-w-md">
                  Submit applications and track transaction milestones online without waiting in line.
                </p>
              </div>

              <Link
                to="/e-services"
                className="px-4 py-2 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider shadow-sm transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>Launch Portal</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-36">
            
            {/* Responsible Office Card */}
            <ContactOfficeCard 
              officeResponsible={service.officeResponsible}
              officeHours={service.officeHours}
              contactInfo={service.contactInfo}
              physicalAddress={service.physicalAddress}
            />

            {/* Citizen Advisory */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                Citizen Advisory & Guidelines
              </h4>
              
              <ul className="space-y-2 text-xs font-medium text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Bring valid government photo IDs when visiting municipal counters.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Processing times are counted during official government business days.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Present Official Receipts upon claiming stamped municipal clearances.</span>
                </li>
              </ul>
            </div>

            {/* Coming Soon notice if applicable */}
            {service.status === "coming-soon" && (
              <ComingSoonNotice serviceTitle={service.title} />
            )}
          </div>
        </div>

        {/* Bottom Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <HashLink 
            to="/#popular-services"
            scroll={(el) => {
              const yOffset = -130;
              const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-brand-primary hover:border-brand-primary font-bold text-xs uppercase tracking-wider transition-all duration-150 shadow-2xs w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={14} />
            <span>Back to All Online Services</span>
          </HashLink>
          
          <Link
            to="/downloads"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-brand-primary hover:border-brand-primary font-bold text-xs uppercase tracking-wider transition-all duration-150 shadow-2xs w-full sm:w-auto justify-center"
          >
            <BookOpen size={14} />
            <span>Browse Downloadable Forms</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ServiceInfoPage;
