import React from 'react';
import { motion } from 'motion/react';
import { Map as MapIcon, Navigation, Info, ExternalLink, Camera, MapPin } from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap';
import { useLanguage } from '../contexts/LanguageContext';

const TourismMapPage: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <div className="pb-20 px-4 md:px-8 max-w-7xl mx-auto bg-brand-bg relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-24 -right-24 w-[50rem] h-[50rem] bg-brand-primary/5 rounded-full blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-1 bg-brand-primary rounded-full" />
            <span className="text-sm font-bold text-brand-primary uppercase tracking-[0.3em] font-mono">
              {language === 'en' ? 'Geospatial Navigator' : 'Mapa sa Turismo'}
            </span>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text tracking-tight leading-none mb-6 font-display">
                {language === 'en' ? (
                  <>INTERACTIVE <br />TOURISM MAP</>
                ) : (
                  <>INTERAKTIBONG <br />MAPA SA LUNGSOD</>
                )}
              </h1>
              <p className="text-brand-muted text-base font-normal leading-relaxed">
                {language === 'en' 
                  ? 'Locate our premier tourist spots, government centers, and historical landmarks across the seafood capital of Bohol.'
                  : 'Pangitaa ang atong mga nindot nga suroyanan, sentro sa gobyerno, ug makasaysayanong mga dapit sa kaulohan sa isda sa Bohol.'}
              </p>
            </div>

            <div className="flex gap-4">
               <div className="p-8 bg-white border border-brand-border rounded-[2rem] shadow-sm flex items-center gap-6 group hover:border-brand-primary transition-all">
                  <div className="w-16 h-16 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                    <Camera size={32} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-brand-text leading-none">12+</p>
                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-1">Featured Spots</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* The Map Component */}
        <section className="mb-20">
          <InteractiveMap />
        </section>

        {/* Featured Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="pro-card p-10 border border-brand-border group hover:border-brand-primary/30"
          >
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <MapPin size={24} />
             </div>
             <h3 className="text-xl font-black text-brand-text uppercase tracking-tight mb-4 font-display">Coastal Hub</h3>
             <p className="text-brand-muted text-sm font-medium leading-relaxed">
                Experience the vibrant port area and the gateway to the double barrier reef of Danajon Bank.
             </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="pro-card p-10 border border-brand-border group hover:border-brand-secondary/30"
          >
             <div className="w-12 h-12 bg-brand-secondary/10 text-brand-secondary rounded-xl flex items-center justify-center mb-6">
                <Navigation size={24} />
             </div>
             <h3 className="text-xl font-black text-brand-text uppercase tracking-tight mb-4 font-display">Civic Center</h3>
             <p className="text-brand-muted text-sm font-medium leading-relaxed">
                The heart of our local governance and public services, conveniently located for all residents.
             </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="pro-card p-10 border border-brand-border group hover:border-brand-accent/30"
          >
             <div className="w-12 h-12 bg-brand-accent/10 text-brand-accent rounded-xl flex items-center justify-center mb-6">
                <Info size={24} />
             </div>
             <h3 className="text-xl font-black text-brand-text uppercase tracking-tight mb-4 font-display">Heritage Zone</h3>
             <p className="text-brand-muted text-sm font-medium leading-relaxed">
                Discover the rich history of the Blessed Trinity Cathedral and our historic municipal roots.
             </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default TourismMapPage;
