import { motion } from "motion/react";
import { MapPin, Navigation, Globe, Ruler } from "lucide-react";

export default function Location() {
  return (
    <section id="location" className="py-32 bg-brand-surface relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <span className="section-label">Geography</span>
              <h2 className="section-title">Location</h2>
              <p className="text-xl text-brand-muted font-medium leading-relaxed">
                Talibon is a first-class municipality situated in the northernmost part of Bohol, Philippines, approximately 114.8 kilometers from Tagbilaran City.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-primary shadow-sm">
                  <Globe size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-brand-muted uppercase tracking-widest font-bold mb-1">Coordinates</p>
                  <p className="text-lg font-bold text-brand-text">10.12°N, 124.28°E</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-primary shadow-sm">
                  <Ruler size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-brand-muted uppercase tracking-widest font-bold mb-1">Land Area</p>
                  <p className="text-lg font-bold text-brand-text">140.46 km²</p>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <a 
                href="https://www.google.com/maps/place/Talibon,+Bohol" 
                target="_blank" 
                rel="noopener noreferrer"
                className="minimal-button-primary inline-flex items-center gap-2"
              >
                Find GPS Coordinates <Navigation size={18} />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-dark-border bg-brand-surface dark:bg-dark-surface">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15707.382483838237!2d124.321852028686!3d10.152377484462102!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3307cc27f5e8e8e9%3A0x63359784347716cc!2sTalibon%2C%20Bohol!5e0!3m2!1sen!2sph!4v1713290000000!5m2!1sen!2sph" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps - Talibon, Bohol"
                className="brightness-90 dark:invert-[0.9] dark:hue-rotate-180"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
