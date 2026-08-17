import React from "react";
import { 
  Building2, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Compass, 
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
  const emailPart = contactInfo.split("|")[1]?.replace("Email:", "")?.trim() || "info@talibon.gov.ph";

  const handleOpenMap = () => {
    const encodedAddress = encodeURIComponent(`${officeResponsible}, Talibon Municipal Hall, Bohol, Philippines`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-primary block">
            Department In-Charge
          </span>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
            Responsible Office
          </h4>
        </div>
        <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
          <Building2 size={14} />
        </div>
      </div>
      
      <div className="space-y-2.5">
        {/* Office Name */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
            Designated Department
          </span>
          <p className="text-xs font-bold text-slate-900 leading-snug">
            {officeResponsible}
          </p>
        </div>

        {/* Office Hours */}
        <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0 mt-0.5">
            <Clock size={13} />
          </div>
          <div>
            <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Operating Hours</div>
            <div className="text-xs font-semibold text-slate-800 leading-snug mt-0.5">
              {officeHours}
            </div>
          </div>
        </div>

        {/* Physical Location */}
        <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0 mt-0.5">
            <MapPin size={13} />
          </div>
          <div>
            <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Physical Location</div>
            <div className="text-xs font-semibold text-slate-800 leading-snug mt-0.5">
              {physicalAddress}
            </div>
          </div>
        </div>

        {/* Direct Contact Details */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
            Direct Communications
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-white rounded-md border border-slate-200 text-brand-primary shrink-0">
                <Phone size={11} />
              </div>
              <a 
                href={`tel:${phonePart}`} 
                className="text-xs font-semibold text-slate-800 hover:text-brand-primary transition-colors"
              >
                {phonePart}
              </a>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-1 bg-white rounded-md border border-slate-200 text-brand-primary shrink-0">
                <Mail size={11} />
              </div>
              <a 
                href={`mailto:${emailPart}`} 
                className="text-xs font-semibold text-slate-800 hover:text-brand-primary transition-colors break-all"
              >
                {emailPart}
              </a>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleOpenMap}
        className="w-full py-2.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 shadow-2xs cursor-pointer active:scale-98"
      >
        <Compass size={13} />
        <span>View on Municipal Map</span>
        <ExternalLink size={12} className="opacity-80" />
      </button>
    </div>
  );
};

export default ContactOfficeCard;

