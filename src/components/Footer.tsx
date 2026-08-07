import { motion } from "motion/react";
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, ArrowUpRight, Globe, ArrowRight, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const hotlines = [
    { name: "BFP Talibon", number: "09506329025" },
    { name: "PNP Talibon", number: "09985986442" },
    { name: "MDRRMO", number: "09105035390" },
    { name: "RHU Talibon", number: "09175620239" },
  ];

  const govLinks = [
    { name: "Office of The President", href: "https://op-proper.gov.ph/" },
    { name: "Senate of the Philippines", href: "https://legacy.senate.gov.ph/" },
    { name: "House of Representatives", href: "https://www.congress.gov.ph/" },
  ];

  return (
    <footer id="contact" className="bg-brand-bg border-t border-brand-border pt-32 pb-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-32">
          {/* Branding */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12">
                <img 
                  src="http://talibon.gov.ph/wp-content/uploads/2025/09/Talibon-Official-Seal-v4-2003-to-2023-.png" 
                  alt="Official Seal" 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight font-display">TALIBON</h2>
                <p className="text-[10px] font-extrabold text-brand-primary tracking-[0.3em] uppercase">Province of Bohol</p>
              </div>
            </div>
            <p className="text-brand-muted text-sm font-medium leading-relaxed max-w-xs">
              The official digital gateway of the Municipality of Talibon. Committed to transparency, innovation, and service.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={`social-icon-${i}`} href="#" className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all text-brand-primary">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase mb-8 block text-brand-primary">Contact Us</span>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin size={18} className="text-brand-primary mt-1" />
                <p className="text-sm font-medium text-brand-text leading-relaxed">Municipal Hall, Poblacion, Talibon, Bohol, 6325, Philippines</p>
              </div>
              <div className="flex items-center gap-4">
                <Phone size={18} className="text-brand-primary" />
                <p className="text-sm font-medium text-brand-text leading-relaxed">(038) 422-2895</p>
              </div>
              <div className="flex items-center gap-4">
                <Mail size={18} className="text-brand-primary" />
                <p className="text-sm font-medium text-brand-text leading-relaxed">talibonofficial@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Hotlines */}
          <div>
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase mb-8 block text-brand-primary">Emergency</span>
            <div className="space-y-4">
              {hotlines.map((hotline, i) => (
                <div key={`hotline-${i}`} className="flex justify-between items-center group">
                  <span className="text-xs font-bold text-brand-muted group-hover:text-brand-text transition-colors uppercase tracking-widest">{hotline.name}</span>
                  <span className="text-xs font-bold text-brand-primary tracking-widest">{hotline.number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gov Links */}
          <div>
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase mb-8 block text-brand-primary">Government</span>
            <div className="space-y-4">
              {govLinks.map((link, i) => (
                <a key={`gov-link-${i}`} href={link.href} className="flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-primary transition-colors uppercase tracking-widest group">
                  {link.name}
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-12 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-bold text-brand-muted tracking-[0.2em] uppercase">
            © 2024 Municipality of Talibon. All Rights Reserved.
          </p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Powered by</span>
              <span className="text-[10px] font-extrabold text-brand-text uppercase">Felji</span>
            </div>
            <Link to="/login" className="text-[10px] font-bold text-brand-muted hover:text-brand-primary uppercase tracking-widest transition-colors flex items-center gap-2">
              <LogIn size={10} />
              Portal Access
            </Link>
          </div>
        </div>
      </div>

      {/* Background Text - Embossment */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-black text-brand-primary/[0.02] select-none pointer-events-none leading-none font-display tracking-tighter">
        TALIBON
      </div>
    </footer>
  );
}


