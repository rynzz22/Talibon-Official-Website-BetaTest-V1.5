import { motion } from "motion/react";
import { Phone, ShieldAlert, HeartPulse, Flame, Siren } from "lucide-react";

export default function EmergencyHotlines() {
  const hotlines = [
    {
      name: "MDRRMO",
      label: "Municipal Disaster Risk Reduction & Management Office",
      numbers: ["0929-152-3330", "0917-323-0117"],
      icon: Siren,
      color: "text-brand-accent",
      bgColor: "bg-brand-accent/5"
    },
    {
      name: "PNP Station",
      label: "Talibon Municipal Police Station",
      numbers: ["0998-598-6433"],
      icon: ShieldAlert,
      color: "text-brand-primary",
      bgColor: "bg-brand-primary/5"
    },
    {
      name: "Rural Health Unit",
      label: "24/7 Emergency Medical Services",
      numbers: ["0946-336-0021"],
      icon: HeartPulse,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/5"
    },
    {
      name: "BFP Station",
      label: "Bureau of Fire Protection - Talibon",
      numbers: ["0945-862-7931"],
      icon: Flame,
      color: "text-sky-500",
      bgColor: "bg-sky-500/5"
    }
  ];

  return (
    <section id="emergency" className="py-32 bg-brand-text relative overflow-hidden">
      {/* Background Text - Embossment */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white/[0.02] select-none pointer-events-none leading-none font-display tracking-tighter uppercase whitespace-nowrap">
        TALIBON
      </div>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-6 font-display">Emergency Hotlines</h2>
          <p className="text-white/60 font-normal text-base max-w-2xl mx-auto">
            Quick response for life-threatening situations. Our emergency teams are available 24/7 to serve the people of Talibon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotlines.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 group"
            >
              <div className={`w-14 h-14 rounded-2xl ${item.bgColor} flex items-center justify-center ${item.color} mb-8 transition-transform group-hover:scale-110 duration-500`}>
                <item.icon size={28} />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 font-display uppercase tracking-tight">{item.name}</h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-tight">{item.label}</p>
                </div>
                
                <div className="space-y-2 pt-4">
                  {item.numbers.map((num) => (
                    <a 
                      key={num}
                      href={`tel:${num.replace(/-/g, '')}`}
                      className="flex items-center gap-3 text-white hover:text-brand-accent transition-colors group/link"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover/link:bg-brand-accent/20 transition-colors">
                        <Phone size={14} />
                      </div>
                      <span className="text-sm font-bold tracking-widest">{num}</span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-[2.5rem] bg-brand-accent/10 border border-brand-accent/20 text-center">
          <p className="text-brand-accent font-bold text-xs tracking-[0.2em] uppercase">
            Landline: (038) 510-1980
          </p>
        </div>
      </div>
    </section>
  );
}
