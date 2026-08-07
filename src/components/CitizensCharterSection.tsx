import { motion } from "motion/react";
import { Download, ArrowRight, BookOpen, HeartPulse, Sprout, ShieldCheck, Globe, FileText, CreditCard, Scale, Briefcase, Landmark, Shovel, MapPin, Trash2, Camera, Users, Cross } from "lucide-react";

export default function CitizensCharterSection() {
  const offices = [
    { name: "Mayor's Office", services: 5, desc: "Issues permits, clearances, business licenses, and handles executive services.", icon: Landmark },
    { name: "SB Office", services: 5, desc: "Reviews barangay ordinances, accredits NGOs, and processes tricycle franchises.", icon: Scale },
    { name: "MSWDO", services: 7, desc: "Provides social protection services for senior citizens, PWDs, and families in crisis.", icon: HeartPulse },
    { name: "HRMO", services: 5, desc: "Issues service records, employment certificates, and salary adjustments for LGU employees.", icon: Users },
    { name: "Budget Office", services: 3, desc: "Certifies obligation requests and reviews barangay and SK budgets.", icon: FileText },
    { name: "Assessor's Office", services: 4, desc: "Issues tax declarations, land certifications, and processes property transfers.", icon: MapPin },
    { name: "Accounting Office", services: 3, desc: "Processes and approves disbursement vouchers and financial documents.", icon: CreditCard },
    { name: "Treasurer's Office", services: 8, desc: "Handles business registrations, tax collections, and treasury services.", icon: Landmark },
    { name: "Agriculture Office", services: 7, desc: "Provides agricultural support services including AI and crop programs.", icon: Sprout },
    { name: "Engineering Office", services: 5, desc: "Issues building permits, certificates of occupancy, and oversees infrastructure.", icon: Shovel },
    { name: "LCRO", services: 12, desc: "Processes civil registry documents including birth, marriage, and death certificates.", icon: FileText },
    { name: "MPDO", services: 4, desc: "Issues locational clearances and coordinates comprehensive land use planning.", icon: Globe },
    { name: "LDRRMO", services: 5, desc: "Responds to emergencies, provides ambulance services, and conducts training.", icon: ShieldCheck },
    { name: "RHU", services: 6, desc: "Provides primary healthcare services including prenatal care and consultations.", icon: HeartPulse },
    { name: "Solid Waste Office", services: 3, desc: "Manages waste collection, disposal, and environmental sanitation.", icon: Trash2 },
    { name: "Tourism Office", services: 3, desc: "Facilitates ecotourism activities and tourist coordination.", icon: Camera },
    { name: "PESO", services: 4, desc: "Facilitates employment programs including SPES and GIP.", icon: Briefcase },
    { name: "Cemetery Office", services: 4, desc: "Administers burial lot availments and niche reservations.", icon: Cross },
  ];

  const pdfUrl = "http://talibon.gov.ph/wp-content/uploads/2026/02/2025-CITIZENS-CHARTER-FINALE.pdf";

  return (
    <section id="charter" className="py-12 sm:py-16 bg-brand-surface relative overflow-hidden border-y border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={15} className="text-brand-primary" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-primary">
                RA 11032 — ANTI-RED TAPE AUTHORITY
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-brand-text uppercase tracking-tight font-display">
              Citizen's Charter 2026
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted font-medium mt-1.5 leading-relaxed">
              Official guide to government services — requirements, step-by-step procedures, fees, and processing times for each municipal office.
            </p>
          </div>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-brand-primary hover:bg-brand-accent text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all inline-flex items-center gap-2 self-start md:self-auto shadow-md border border-brand-primary/30 hover:scale-105 active:scale-95 shrink-0"
          >
            <span>Download Full Charter (PDF)</span>
            <Download size={14} />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {offices.map((office, idx) => (
            <motion.div
              key={office.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.03 }}
              className="p-3.5 sm:p-4 rounded-2xl bg-brand-bg border border-brand-border/80 hover:border-brand-primary/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
                    <office.icon size={16} />
                  </div>
                  <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[9px] font-black rounded-full uppercase tracking-wider">
                    {office.services} {office.services === 1 ? 'service' : 'services'}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-brand-text mb-1 font-display uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                    {office.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-brand-muted font-normal leading-relaxed line-clamp-2">
                    {office.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

