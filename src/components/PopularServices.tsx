import { motion } from "motion/react";
import { 
  FileText, 
  ShieldCheck, 
  FileCheck, 
  CreditCard, 
  ExternalLink,
  Globe,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

export default function PopularServices() {
  const services = [
    { name: "ePermits (Business Permits)", to: "/e-services?service=business_permit", color: "bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-500", status: "Active" },
    { name: "eClearance (Barangay Clearance)", to: "/e-services?service=barangay_clearance", color: "bg-blue-50 text-blue-800 border-blue-200 hover:border-blue-500", status: "Active" },
    { name: "eCedula (Community Tax)", to: "/e-services?service=e-cedula", color: "bg-purple-50 text-purple-800 border-purple-200 hover:border-purple-500", status: "Active" },
    { name: "eCertificate (Indigency)", to: "/e-services?service=certificate_of_indigency", color: "bg-sky-50 text-sky-800 border-sky-200 hover:border-sky-500", status: "Active" },
    { name: "eBuilding Permit", to: "/e-services?service=building_permit", color: "bg-teal-50 text-teal-800 border-teal-200 hover:border-teal-500", status: "Active" },
    { name: "Real Property Tax Assessment", to: "/e-services?service=zoning_clearance", color: "bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-500", status: "Information Only" },
  ];

  return (
    <section className="py-8 sm:py-10 bg-brand-bg" id="popular-services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-brand-text uppercase tracking-tight font-display">
            ONLINE SERVICES
          </h2>
          <p className="text-xs text-brand-muted font-medium max-w-lg mx-auto mt-1">
            Access official municipal e-services, apply for business permits, track applications, and utilize Philippine government digital portals.
          </p>
        </div>

        {/* FiliPizen Featured Banner Card */}
        <div className="mb-8 max-w-4xl mx-auto bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-indigo-400/30 text-left flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-200">FiliPizen Official Partner</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
              Access Citizen Services via FiliPizen
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl font-normal leading-relaxed">
              Pay real property taxes, business permits, civil registry requests, and local government fees securely through the national FiliPizen portal.
            </p>
          </div>

          <a 
            href="https://www.filipizen.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="shrink-0 font-extrabold text-xs sm:text-sm uppercase tracking-widest text-emerald-400 hover:text-emerald-300 underline underline-offset-4 flex items-center gap-2 transition-colors py-1"
          >
            <Globe size={16} />
            <span>Access FiliPizen</span>
            <ExternalLink size={14} />
          </a>
        </div>
        
        {/* Services List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service, idx) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link 
                to={service.to}
                className={`p-6 rounded-2xl border font-bold text-sm transition-all hover:shadow-xl hover:-translate-y-1 block text-left relative overflow-hidden ${service.color}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-black uppercase tracking-tight text-slate-900 font-display">
                    {service.name}
                  </span>
                  {service.status === "Active" ? (
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-800 text-[9px] font-black rounded-full flex items-center gap-1 border border-emerald-300">
                      <CheckCircle2 size={10} /> Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-sky-500/20 text-sky-800 text-[9px] font-black rounded-full flex items-center gap-1 border border-sky-300">
                      <Clock size={10} /> Info Only
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-primary font-bold mt-4">
                  <span>Open Service</span>
                  <ExternalLink size={12} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link 
            to="/e-services" 
            className="px-8 py-3 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-primary/90 transition-all flex items-center gap-2 shadow-lg"
          >
            View All Municipal E-Services <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
