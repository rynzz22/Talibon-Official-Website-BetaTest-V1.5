import React from "react";
import { motion } from "motion/react";
import { Facebook, Twitter, Instagram, ArrowUpRight, MessageSquare, ShieldCheck, Flame, Camera } from "lucide-react";

export default function SocialMediaUpdates() {
  const channels = [
    { name: "Information Office", icon: MessageSquare, color: "bg-blue-500" },
    { name: "Abante Talibon", icon: Facebook, color: "bg-brand-primary" },
    { name: "SK Federation", icon: Instagram, color: "bg-pink-500" },
    { name: "PESO Talibon", icon: Facebook, color: "bg-blue-600" },
    { name: "PNP Talibon", icon: ShieldCheck, color: "bg-slate-800" },
    { name: "BFP Talibon", icon: Flame, color: "bg-sky-600" },
    { name: "Tourism Office", icon: Camera, color: "bg-emerald-600" },
  ];

  // Using some icons from lucide that match the context
  const getIcon = (name: string) => {
    if (name.includes("PNP")) return <ShieldCheck size={20} />;
    if (name.includes("BFP")) return <Flame size={20} />;
    if (name.includes("Tourism")) return <Camera size={20} />;
    if (name.includes("SK")) return <Instagram size={20} />;
    if (name.includes("Information")) return <MessageSquare size={20} />;
    return <Facebook size={20} />;
  };

  return (
    <section className="py-10 sm:py-14 bg-brand-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <span className="section-label">Stay Connected</span>
            <h2 className="section-title">Social Media Updates</h2>
            <p className="text-xs sm:text-sm text-brand-muted font-medium leading-relaxed mb-6 max-w-lg">
              Stay informed with the latest announcements, events, and updates from Talibon through our official social media channels.
            </p>
            
            <div className="flex flex-wrap gap-2.5">
              {channels.map((channel, idx) => (
                <motion.a
                  key={channel.name}
                  href="#"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-2 px-3.5 py-2 bg-white border border-brand-border rounded-xl hover:border-brand-primary/30 hover:shadow-md transition-all group"
                >
                  <div className={`w-6 h-6 rounded-lg ${channel.color} flex items-center justify-center text-white transition-transform group-hover:rotate-12`}>
                    {React.cloneElement(getIcon(channel.name), { size: 14 })}
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-brand-text uppercase tracking-widest">{channel.name}</span>
                </motion.a>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Real Facebook Feed */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl sm:rounded-2xl border border-brand-border shadow-lg shadow-black/5 p-3 sm:p-4 overflow-hidden"
            >
              <div className="w-full flex justify-center">
                <iframe 
                  src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent("https://www.facebook.com/profile.php?id=100092810378501")}&tabs=timeline&width=500&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`} 
                  width="100%" 
                  height="500" 
                  style={{ border: 'none', overflow: 'hidden', borderRadius: '1rem' }} 
                  scrolling="no" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title="Talibon Facebook Feed"
                />
              </div>
            </motion.div>
            
            {/* Decorative element */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-accent/5 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
