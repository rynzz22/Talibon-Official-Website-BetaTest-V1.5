import { motion } from "motion/react";
import { 
  FileText, 
  CreditCard, 
  Users, 
  HeartPulse, 
  GraduationCap, 
  Building2, 
  ArrowUpRight, 
  Sprout, 
  ShieldCheck,
  Smartphone,
  Globe,
  Search,
  Building
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Services() {
  const services = [
    {
      icon: FileText,
      title: "Business Permits",
      description: "Apply or renew your business permits online with our streamlined process.",
      href: "/forms/business",
      iconColor: "text-sky-400"
    },
    {
      icon: CreditCard,
      title: "Real Property Tax",
      description: "Pay your RPT online and avoid long queues.",
      href: "/transparency/finance",
      iconColor: "text-amber-400"
    },
    {
      icon: Users,
      title: "Civil Registry",
      description: "Request birth, marriage, and death certificates.",
      href: "/executive/directory",
      iconColor: "text-sky-400"
    },
    {
      icon: Building2,
      title: "Building Permits",
      description: "Apply for building permits and structural clearances.",
      href: "/forms/building",
      iconColor: "text-indigo-400"
    },
    {
      icon: HeartPulse,
      title: "Health Services",
      description: "Public health programs and assistance.",
      href: "/executive/directory",
      iconColor: "text-emerald-400"
    },
    {
      icon: Sprout,
      title: "Agriculture",
      description: "Support for farmers and fisherfolk.",
      href: "/executive/directory",
      iconColor: "text-teal-400"
    }
  ];

  return (
    <section 
      id="services" 
      className="relative py-14 sm:py-20 text-white overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=2000')`
      }}
    >
      {/* Immersive Real Estate & Architecture Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{ 
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.94) 100%)" 
        }} 
      />

      {/* Decorative Ambient Lighting */}
      <div className="absolute -top-24 right-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building size={15} className="text-sky-300" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-300">
              MUNICIPAL SERVICES & REAL ESTATE
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white via-sky-100 to-amber-200 bg-clip-text text-transparent uppercase tracking-tight font-display drop-shadow-sm">
            Digital Governance
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-xl mx-auto mt-1.5 leading-relaxed drop-shadow-2xs">
            Streamlining public services through innovation. Access essential municipal functions directly from your device.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {services.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="group relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-slate-900/80 backdrop-blur-md border border-white/10 hover:border-sky-400/40 hover:bg-slate-800/90 shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center transition-transform group-hover:scale-105">
                  <service.icon size={20} className={service.iconColor} />
                </div>
                
                <div>
                  <h3 className="text-base font-bold mb-1 tracking-tight font-display text-white group-hover:text-sky-300 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>

              <Link 
                to={service.href}
                className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black text-sky-400 hover:text-sky-300 uppercase tracking-widest transition-all group-hover:gap-2"
              >
                <span>Learn More</span>
                <ArrowUpRight size={13} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


