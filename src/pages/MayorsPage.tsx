import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Landmark, History, Quote, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const MayorsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const eras = [
    {
      title: "Capitanes Municipales",
      subtitle: "Spanish Colonial Regime",
      period: "1733 to 1898",
      mayors: [
        { name: "Nicolas Calagan", term: "1733 – ?", note: "First Elected Mayor" },
        { name: "Mateo Auxtero", term: "1854 – ?" },
        { name: "Francisco Auxtero", term: "" },
        { name: "Feliciano Evangelista", term: "" },
        { name: "Anatalio Orjaleza", term: "" },
        { name: "Maximo Evangelista", term: "" },
        { name: "Pablo Gurrea", term: "" },
        { name: "Maximino Mumar", term: "" },
        { name: "Cipriano Tabigue", term: "" },
        { name: "Santiago Evangelista", term: "" },
        { name: "Gregorio Evangelista", term: "" },
        { name: "Modesto Evangelista", term: "" },
        { name: "Quiterio Garcia", term: "" },
        { name: "Eugenio Evangelista", term: "" },
        { name: "Maximo Rosales", term: "" },
      ]
    },
    {
      title: "Alcaldes Mayores",
      subtitle: "Republic of Bohol and Early American Occupation",
      period: "1898 to 1912",
      mayors: [
        { name: "Eufemio Mumar", term: "" },
        { name: "Miguel Valmoria", term: "" },
        { name: "Pedro Valmoria", term: "" },
        { name: "Fortunato Boncales", term: "" },
        { name: "Marcelino Avergonzado", term: "" },
      ]
    },
    {
      title: "Municipal Presidents",
      subtitle: "Jones Law / Commonwealth",
      period: "1912 to 1946",
      mayors: [
        { name: "Policronio Garcia, Sr.", term: "1912-1916" },
        { name: "Gregorio G. Valmoria", term: "1916-1919" },
        { name: "Longino Avergonzado", term: "1919-1922" },
        { name: "Rosendo Evangelista", term: "1922-1925" },
        { name: "Policronio Garcia, Sr.", term: "1925-1933" },
        { name: "Ernesto B. Flores", term: "1934-1937" },
        { name: "Maximino A. Garcia, Sr.", term: "1938-1946" },
      ]
    },
    {
      title: "Municipal Mayors",
      subtitle: "Japanese Occupation",
      period: "1942 to 1945",
      mayors: [
        { name: "Maximino Boiser, Sr.", term: "1942-1943", note: "Died in office; execution" },
        { name: "Luis B. Goyeneche", term: "1944", note: "Appointed Mayor" },
        { name: "Frederico Aguhar", term: "1946", note: "Acting Mayor" },
        { name: "Eulalio Revilles", term: "1946-1948" },
      ]
    },
    {
      title: "Municipal Mayors",
      subtitle: "Postwar Philippines",
      period: "1946 to 1972",
      mayors: [
        { name: "Pio Mabanag", term: "1948-1951", note: "Appointed Mayor" },
        { name: "Deogracias Mumar", term: "1951", note: "Acting Mayor" },
        { name: "Maximino A. Garcia, Sr.", term: "1952-1957" },
        { name: "Lazaro Evardo", term: "1957-1963" },
        { name: "Catalino Y. Casoyla", term: "1964-1971" },
      ]
    },
    {
      title: "Municipal Mayors",
      subtitle: "Martial Law Period",
      period: "1972 to 1986",
      mayors: [
        { name: "Vidal V. Crescencio, Sr.", term: "1972-1979" },
        { name: "Aureliano Evardo", term: "1979-1986" },
      ]
    },
    {
      title: "Municipal Mayors",
      subtitle: "Fifth Philippine Republic",
      period: "1986 to present",
      mayors: [
        { name: "Sergio E. Credo", term: "1986", note: "OIC" },
        { name: "Esperanza E. Cañete", term: "1986-1987", note: "OIC" },
        { name: "Samuel T. Turtoga", term: "1987-1988", note: "OIC" },
        { name: "Flordelis A. Garcia", term: "1988-1988", note: "OIC" },
        { name: "Gaudencio A. Artiaga", term: "1988-1995" },
        { name: "Juanario A. Item", term: "1995-2001" },
        { name: "Marcos Q. Aurestila", term: "2001-2004" },
        { name: "Juanario A. Item", term: "2004-2010" },
        { name: "Restituto B. Auxtero", term: "2010-2019" },
        { name: "Janette A. Garcia", term: "2019-present" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg pt-6 sm:pt-8 pb-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-[40rem] h-[40rem] bg-brand-primary/5 rounded-full blur-[120px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-brand-primary font-bold text-[10px] tracking-widest uppercase mb-12 hover:gap-4 transition-all"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 text-brand-primary text-[11px] font-extrabold uppercase tracking-[0.2em] mb-4">
              <Landmark size={15} />
              <span>Leadership Timeline</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold text-brand-text leading-[0.85] tracking-tighter mb-8 font-display">
              MAYORS OF <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">TALIBON</span>
            </h1>
            <p className="text-xl text-brand-muted font-medium leading-relaxed max-w-2xl">
              Honoring the leaders who shaped the history and progress of our beloved municipality through different eras of our nation's history.
            </p>
          </motion.div>
        </div>

        {/* eras list */}
        <div className="space-y-24">
          {eras.map((era, eraIdx) => (
            <motion.section
              key={eraIdx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="flex flex-col lg:flex-row gap-12">
                <div className="lg:w-1/3">
                  <div className="sticky top-40 space-y-4">
                    <div className="text-brand-primary font-bold text-[10px] tracking-[0.3em] uppercase">{era.period}</div>
                    <h2 className="text-3xl font-extrabold text-brand-text tracking-tight leading-tight font-display">
                      {era.title} <br />
                      <span className="text-brand-primary text-lg font-bold">{era.subtitle}</span>
                    </h2>
                    <div className="w-12 h-1.5 bg-brand-secondary rounded-full" />
                  </div>
                </div>

                <div className="lg:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {era.mayors.map((mayor, mIdx) => (
                      <div 
                        key={mIdx}
                        className="pro-card p-6 hover:border-brand-primary/30 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-extrabold text-brand-text group-hover:text-brand-primary transition-colors font-display">{mayor.name}</h3>
                          <Users size={16} className="text-brand-muted/30 group-hover:text-brand-primary transition-colors" />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                          <Calendar size={12} />
                          {mayor.term || "Term Not Recorded"}
                        </div>
                        {mayor.note && (
                          <div className="mt-3 text-[10px] font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/5 px-3 py-1 rounded-full w-fit border border-brand-primary/10">
                            {mayor.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Commentary for specific eras */}
                  {(eraIdx === 1 || eraIdx === 4) && (
                    <div className="mt-12 p-10 bg-brand-primary/5 rounded-[2.5rem] border border-brand-primary/10 relative overflow-hidden">
                      <div className="absolute -top-4 -right-4 text-brand-primary/10">
                        <Quote size={120} fill="currentColor" />
                      </div>
                      <h4 className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2">
                        <History size={14} />
                        Historical Commentary
                      </h4>
                      <div className="text-sm text-brand-text/80 leading-relaxed space-y-4 relative z-10 font-medium">
                        {eraIdx === 1 ? (
                          <p>
                            Recent research by Prof. Emmanuel Luis A. Romanillos reveals that Talibon became a separate municipality from Inabanga in 1733, with Nicolas Calagan elected as its first mayor. This finding, based on primary sources, contrasted with the existing ordinance that officially recognizes Talibon’s founding year as April 22, 1854.
                          </p>
                        ) : (
                          <p>
                            On April 13, 1942, Japanese soldiers invaded Talibon. They forced the townspeople to form a new government under Atty. Maximino C. Boiser, Sr. From 1942 to 1944, Boiser acted as the de facto mayor while Mayor Garcia represented the Commonwealth government-in-exile.
                          </p>
                        )}
                        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pt-4 border-t border-brand-primary/10">Apawan, Y. A. (2024)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MayorsPage;
