import React from "react";
import { 
  Building2, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Map, 
  ExternalLink 
} from "lucide-react";

interface ContactOfficeCardProps {
  officeResponsible: string;
  officeHours: string;
  contactInfo: string;
  physicalAddress: string;
}

export const ContactOfficeCard: React.FC<ContactOfficeCardProps> = ({
  officeResponsible,
  officeHours,
  contactInfo,
  physicalAddress
}) => {
  // Parse contact info (e.g. Phone: (038) 422-2895 | Email: bplo-talibon@gov.ph)
  const phonePart = contactInfo.split("|")[0]?.replace("Phone:", "")?.trim() || "(038) 422-2895";
  const emailPart = contactInfo.split("|")[1]?.replace("Email:", "")?.trim() || "bplo-talibon@gov.ph";

  const handleOpenMap = () => {
    // Placeholder Google Maps link for Talibon Municipal Hall
    const encodedAddress = encodeURIComponent("Talibon Municipal Hall, Bohol, Philippines");
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
  };

  return (
    <div className="p-4 sm:p-5 bg-brand-bg rounded-xl sm:rounded-2xl border border-brand-border space-y-4 relative overflow-hidden group hover:border-brand-primary/30 transition-all duration-300">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-xl group-hover:bg-brand-primary/10 transition-colors pointer-events-none" />
      
      <h3 className="text-xs font-extrabold text-brand-text uppercase tracking-widest pb-3 border-b border-brand-border/60">
        Responsible Office
      </h3>
      
      <div className="space-y-5 relative z-10">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-surface border border-brand-border/60 flex items-center justify-center text-brand-primary flex-shrink-0 shadow-sm">
            <Building2 size={18} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest mb-1">
              Office Responsible
            </p>
            <p className="text-sm font-extrabold text-brand-text leading-snug">
              {officeResponsible}
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-surface border border-brand-border/60 flex items-center justify-center text-brand-primary flex-shrink-0 shadow-sm">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest mb-1">
              Office Hours
            </p>
            <p className="text-sm font-bold text-brand-text">
              {officeHours}
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-surface border border-brand-border/60 flex items-center justify-center text-brand-primary flex-shrink-0 shadow-sm">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest mb-1">
              Physical Location
            </p>
            <p className="text-xs font-semibold text-brand-muted leading-relaxed">
              {physicalAddress}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-brand-border/40">
          <div className="flex items-center gap-3">
            <Phone size={14} className="text-brand-primary flex-shrink-0" />
            <a href={`tel:${phonePart}`} className="text-xs font-bold text-brand-text hover:text-brand-primary transition-colors">
              {phonePart}
            </a>
          </div>
          
          <div className="flex items-center gap-3">
            <Mail size={14} className="text-brand-primary flex-shrink-0" />
            <a href={`mailto:${emailPart}`} className="text-xs font-bold text-brand-text hover:text-brand-primary transition-colors truncate">
              {emailPart}
            </a>
          </div>
        </div>
      </div>

      <button
        onClick={handleOpenMap}
        className="w-full mt-2 py-3 px-5 rounded-2xl bg-white dark:bg-dark-surface hover:bg-brand-primary border border-brand-border hover:border-brand-primary hover:text-white flex items-center justify-center gap-2.5 text-xs font-bold text-brand-muted transition-all duration-300 shadow-sm cursor-pointer hover:scale-[1.02]"
      >
        <Map size={14} />
        VIEW MUNICIPAL MAP
        <ExternalLink size={12} className="opacity-75" />
      </button>
    </div>
  );
};

export default ContactOfficeCard;
