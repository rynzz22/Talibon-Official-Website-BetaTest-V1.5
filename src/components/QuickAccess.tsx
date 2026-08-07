import { motion } from "motion/react";
import { 
  FileText, 
  FileCheck, 
  CreditCard, 
  Search, 
  Map, 
  Download, 
  BookOpen 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function QuickAccess() {
  const quickLinks = [
    { name: "Apply for Permit", icon: FileText, href: "/services/apply-permit" },
    { name: "Request Certificate", icon: FileCheck, href: "/services/request-certificate" },
    { name: "Pay Online", icon: CreditCard, href: "/services/pay-online" },
    { name: "Track My Request", icon: Search, href: "/services/track-request" },
    { name: "Tourism Guide", icon: Map, href: "/tourism/spots" },
    { name: "Downloadables", icon: Download, href: "/downloads" },
    { name: "Citizen's Charter", icon: BookOpen, href: "/transparency/charter" },
  ];

  return (
    <section className="py-10 sm:py-12 bg-white border-y border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8">
          {quickLinks.map((link, idx) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04 }}
            >
              <Link
                to={link.href}
                className="flex flex-col items-center gap-2.5 group p-1.5 rounded-2xl transition-all duration-300"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-surface shadow-xs border border-brand-border flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:shadow-brand-primary/20">
                  <link.icon size={24} className="sm:w-7 sm:h-7 transition-colors" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-brand-text group-hover:text-brand-primary transition-colors text-center max-w-[105px] leading-tight">
                  {link.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
