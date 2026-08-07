import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Compass
} from "lucide-react";

// Data
import { SERVICES_DATA, ServiceInfo } from "../data/servicesData";

// Shared Reusable Components
import { ServiceStatusBadge } from "../components/ServiceStatusBadge";
import { RequirementList } from "../components/RequirementList";
import { DownloadFormCard } from "../components/DownloadFormCard";
import { ContactOfficeCard } from "../components/ContactOfficeCard";
import { ComingSoonNotice } from "../components/ComingSoonNotice";
import { Breadcrumb } from "../components/Breadcrumb";

const ServiceInfoPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const service: ServiceInfo | undefined = slug ? SERVICES_DATA[slug] : undefined;

  // Dynamic SEO Metadata Integration
  useEffect(() => {
    if (service) {
      // Document Title
      document.title = `${service.title} | Municipality of Talibon`;

      // Meta Description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', `${service.description} Learn the purpose, requirements, processing times, and responsible offices for ${service.title} in Talibon, Bohol.`);

      // Open Graph Title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', `${service.title} - Official E-Services Guide | Talibon`);

      // Open Graph Description
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', service.description);
    } else {
      document.title = "Service Not Found | Municipality of Talibon";
    }

    // Cleanup or reset on unmount (optional, but keep simple)
    return () => {
      document.title = "Municipality of Talibon | Official Website";
    };
  }, [service]);

  // Handle Invalid Route / Service Not Found
  if (!service) {
    return (
      <div className="py-24 px-4 md:px-8 max-w-5xl mx-auto bg-brand-bg relative overflow-hidden text-center">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-primary/5 rounded-full blur-[80px]" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-secondary/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-8 py-12">
          {/* Illustration/Icon */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto text-brand-primary border border-brand-primary/20 shadow-inner"
          >
            <Compass size={44} className="animate-spin-slow text-brand-primary" />
          </motion.div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black text-brand-text font-display uppercase tracking-tight">
              Service Not Found
            </h1>
            <p className="text-brand-muted font-medium text-sm md:text-base leading-relaxed max-w-lg mx-auto">
              We couldn't locate the specific municipal service page you are searching for. It may have been relocated, renamed, or is currently undergoing administrative updates.
            </p>
          </div>

          {/* Quick Available Services Guide list */}
          <div className="p-6 bg-white dark:bg-dark-surface rounded-3xl border border-brand-border shadow-sm max-w-md mx-auto text-left space-y-4">
            <h3 className="text-[10px] font-black text-brand-text uppercase tracking-widest border-b border-brand-border pb-2.5">
              Available E-Service Guides
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(SERVICES_DATA).map((item) => (
                <Link 
                  key={item.id} 
                  to={`/services/${item.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-bg transition-colors group text-sm font-semibold text-brand-muted hover:text-brand-primary"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/5 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary/10 flex-shrink-0">
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
            <Link 
              to="/"
              className="pro-button inline-flex items-center justify-center gap-2.5 px-8 py-4.5 w-full text-xs"
            >
              <ArrowLeft size={14} />
              RETURN TO HOME
            </Link>
            
            <Link
              to="/downloads"
              className="minimal-button-outline inline-flex items-center justify-center gap-2.5 px-8 py-4.5 w-full text-xs font-black"
            >
              <BookOpen size={14} />
              VIEW DOWNLOADABLES
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get matching header icon for the service
  const getHeaderIcon = () => {
    switch (service.id) {
      case "apply-permit":
        return <FileText className="text-white" size={36} />;
      case "request-certificate":
        return <FileCheck className="text-white" size={36} />;
      case "pay-online":
        return <CreditCard className="text-white" size={36} />;
      case "track-request":
        return <Search className="text-white" size={36} />;
      default:
        return <FileText className="text-white" size={36} />;
    }
  };

  return (
    <div className="pb-24 px-4 md:px-8 max-w-7xl mx-auto bg-brand-bg relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [0, 45, 0],
            x: [0, 30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -left-32 w-[35rem] h-[35rem] bg-brand-primary/5 rounded-full blur-[100px]"
        />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-brand-secondary/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Navigation Breadcrumb - Improved and clickable */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2"
        >
          <Breadcrumb 
            items={[
              { label: "Services", path: "/" },
              { label: service.title }
            ]} 
          />
          
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 text-xs font-black text-brand-muted hover:text-brand-primary uppercase tracking-widest transition-colors self-start sm:self-auto"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
        </motion.div>

        {/* Unified Hero Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pro-card overflow-hidden"
        >
          <div className="bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/80 p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-48 h-48 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-secondary rounded-full translate-x-1/3 translate-y-1/3 blur-2xl" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              {/* Dynamic Status Badge */}
              <div className="mb-6">
                <ServiceStatusBadge status={service.status} />
              </div>

              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-md">
                {getHeaderIcon()}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white uppercase tracking-tight mb-4 font-display leading-tight">
                {service.title}
              </h1>
              <p className="text-white/80 text-xs md:text-sm font-bold uppercase tracking-[0.2em] max-w-xl">
                Talibon Municipal Government Service Guide
              </p>
            </div>
          </div>

          <div className="p-8 md:p-12 bg-white dark:bg-dark-surface border-t border-brand-border">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Left Column - Main Details */}
              <div className="lg:col-span-2 space-y-10">
                
                {/* Description & Purpose */}
                <div className="space-y-4">
                  <h2 className="text-xs font-bold text-brand-primary uppercase tracking-[0.25em]">
                    Service Overview
                  </h2>
                  <p className="text-base text-brand-muted font-medium leading-relaxed">
                    {service.description}
                  </p>
                  <div className="p-6 bg-brand-bg rounded-2xl border border-brand-border/60">
                    <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-2">
                      Purpose of Service
                    </h3>
                    <p className="text-sm text-brand-muted font-semibold leading-relaxed">
                      {service.purpose}
                    </p>
                  </div>
                </div>

                {/* Requirements (Reusable Component) */}
                <div className="space-y-4">
                  <h2 className="text-xs font-bold text-brand-primary uppercase tracking-[0.25em]">
                    Requirements Checklist
                  </h2>
                  <RequirementList requirements={service.requirements} />
                </div>

                {/* Downloadable Forms (Reusable Component) */}
                <div className="space-y-4">
                  <h2 className="text-xs font-bold text-brand-primary uppercase tracking-[0.25em]">
                    Downloadable Forms
                  </h2>
                  <DownloadFormCard forms={service.downloadableForms} />
                </div>
              </div>

              {/* Right Column - Sidebar Office & Contact Metadata */}
              <div className="space-y-8">
                
                {/* Contact Card (Reusable Component) */}
                <ContactOfficeCard 
                  officeResponsible={service.officeResponsible}
                  officeHours={service.officeHours}
                  contactInfo={service.contactInfo}
                  physicalAddress={service.physicalAddress}
                />

                {/* Online Coming Soon notice (Reusable Component) */}
                {service.status === "coming-soon" && (
                  <ComingSoonNotice serviceTitle={service.title} />
                )}

              </div>

            </div>
          </div>
        </motion.div>

        {/* Bottom CTA / Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-brand-border">
          <Link 
            to="/"
            className="pro-button inline-flex items-center gap-3 px-10 py-5 w-full sm:w-auto text-center justify-center"
          >
            <ArrowLeft size={16} />
            BACK TO HOME
          </Link>
          
          <Link
            to="/downloads"
            className="minimal-button-outline px-10 py-5 w-full sm:w-auto text-center font-extrabold text-xs justify-center"
          >
            EXPLORE ALL DOWNLOADABLE FORMS
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceInfoPage;
