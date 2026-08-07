import { motion } from "motion/react";
import { FileText, BarChart3, ClipboardList, ShieldCheck, ArrowUpRight, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function TransparencyGovernance() {
  const items = [
    {
      title: "Annual Budget",
      desc: "Approved annual budget documents, appropriation ordinances, and budget allocation summaries.",
      icon: BarChart3,
      href: "/transparency/budget"
    },
    {
      title: "Bids & Public Offerings",
      desc: "Invitation to bid, abstracts of bids, notices of award, and approved contract documents.",
      icon: ClipboardList,
      href: "/transparency/biddings"
    },
    {
      title: "Annual Procurement Plan",
      desc: "Consolidated annual procurement plan and updates, including all procurement activities.",
      icon: FileText,
      href: "/transparency/disclosure"
    },
    {
      title: "Full Disclosure Policy",
      desc: "Compliance documents and reports under the DILG Full Disclosure Policy and SGLG.",
      icon: ShieldCheck,
      href: "/transparency/disclosure"
    }
  ];

  return (
    <section id="transparency" className="py-12 sm:py-16 bg-brand-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={15} className="text-brand-primary" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-primary">
                Good Governance & Compliance
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-brand-text uppercase tracking-tight font-display">
              Transparency & Accountability
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted font-medium mt-1.5 leading-relaxed">
              We are committed to open governance. Access official reports, budget allocations, and procurement activities of the Municipal Government of Talibon.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-white border border-brand-border shadow-2xs flex items-center justify-center p-2">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/0/0d/Philippine_Transparency_Seal.svg/960px-Philippine_Transparency_Seal.svg.png" 
                alt="Transparency Seal" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="w-12 h-12 rounded-xl bg-white border border-brand-border shadow-2xs flex items-center justify-center p-2">
              <img 
                src="https://ncda.gov.ph/wp-content/uploads/2023/06/freedom-of-information-logo.jpg" 
                alt="FOI" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {items.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="group p-5 rounded-2xl bg-brand-surface border border-brand-border/80 hover:border-brand-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-text mb-1 font-display tracking-tight group-hover:text-brand-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-brand-muted font-normal leading-relaxed line-clamp-3">
                    {item.desc}
                  </p>
                </div>
              </div>

              <Link 
                to={item.href}
                className="mt-4 pt-3 border-t border-brand-border/60 inline-flex items-center gap-1.5 text-[10px] font-black text-brand-primary hover:text-brand-accent uppercase tracking-widest transition-all group-hover:gap-2"
              >
                <span>View Documents</span>
                <ArrowUpRight size={13} />
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 pt-6 border-t border-brand-border/50 flex flex-wrap justify-center gap-6 items-center opacity-60 hover:opacity-100 transition-opacity duration-300">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bagong_Pilipinas_logo.png/1920px-Bagong_Pilipinas_logo.png" alt="Bagong Pilipinas" className="h-9 sm:h-10 object-contain" referrerPolicy="no-referrer" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Seal_of_the_Philippines.svg/1280px-Seal_of_the_Philippines.svg.png" alt="PH Seal" className="h-9 sm:h-10 object-contain" referrerPolicy="no-referrer" />
        </div>
      </div>
    </section>
  );
}
