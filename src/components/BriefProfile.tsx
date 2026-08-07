import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Users, Briefcase, Award, Anchor, Waves, Ship, Landmark, FileText } from 'lucide-react';

interface ProfileData {
  title: string;
  content: string;
}

const BriefProfile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    fetch('/api/about/profile')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => setProfile(data))
      .catch(err => console.error('Error fetching profile:', err));
  }, []);

  const stats = [
    { label: "Land Area", value: "140.46 sq km", icon: MapPin, color: "text-brand-primary bg-brand-primary/10" },
    { label: "Population", value: "71,272", icon: Users, color: "text-brand-accent bg-brand-accent/10" },
    { label: "Barangays", value: "25", icon: Landmark, color: "text-brand-secondary bg-brand-secondary/10" },
    { label: "CMCI Rank", value: "17th", icon: Award, color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <section id="profile" className="py-10 sm:py-14 bg-brand-bg overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-text tracking-tight mb-3 font-display uppercase">
            Brief <span className="text-brand-primary">Profile</span>
          </h2>
          <p className="text-base text-brand-muted max-w-3xl mx-auto font-normal">
            Talibon is a 1st class municipality that lies in the northernmost part of the island Province of Bohol in Central Visayas, Philippines.
          </p>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="civic-card p-8 text-center group hover:-translate-y-2"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110 shadow-sm ${stat.color}`}>
                <stat.icon size={28} />
              </div>
              <p className="text-3xl font-black text-brand-text tracking-tight font-display uppercase">{stat.value}</p>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: General & Geography */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="civic-card p-10 space-y-6">
              <div className="flex items-center gap-4 text-brand-primary mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shadow-sm">
                  <Waves size={24} />
                </div>
                <h3 className="text-2xl font-black tracking-tight font-display uppercase">Geography & Resources</h3>
              </div>
              <p className="text-brand-text leading-relaxed font-medium">
                Its coastline has significant patches of the <span className="text-brand-primary font-black">Danajon Bank</span>, the only documented double barrier reef in the Philippines that is teeming with bountiful natural marine resources. Hence, Talibon is considered as the official <span className="text-brand-primary font-black">Seafood Capital of Bohol</span>.
              </p>
              <p className="text-brand-muted text-sm font-medium leading-relaxed">
                The municipality is bounded on the North by the Camotes Sea, South by Trinidad, East by Bien Unido, West by Getafe, and Southwest by Buenavista.
              </p>
            </div>

            <div className="civic-card p-10 space-y-6">
              <div className="flex items-center gap-4 text-brand-primary mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shadow-sm">
                  <Navigation size={24} />
                </div>
                <h3 className="text-2xl font-black tracking-tight font-display uppercase">Accessibility</h3>
              </div>
              <p className="text-brand-text leading-relaxed font-medium">
                Located approximately 114.8 km North of Tagbilaran City, 611.28 km Southeast of Manila, and 49.01 km Southeast of Cebu City.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary shrink-0">
                    <Ship size={16} />
                  </div>
                  <p className="text-sm text-brand-muted font-medium">Directly accessible to Cebu City by boat (approx. 4 hours) and Southern Leyte via Bato (approx. 3 hours).</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary shrink-0">
                    <Navigation size={16} />
                  </div>
                  <p className="text-sm text-brand-muted font-medium">Accessible via RORO ferries or high-speed catamaran via Tubigon or Getafe ports.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Economy & Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="civic-card p-10 space-y-6">
              <div className="flex items-center gap-4 text-brand-primary mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shadow-sm">
                  <Briefcase size={24} />
                </div>
                <h3 className="text-2xl font-black tracking-tight font-display uppercase">Economy & Industry</h3>
              </div>
              <p className="text-brand-text leading-relaxed font-medium">
                Major industries are farming and fishing with products such as bangus, shrimp, tilapia, banana, coconut, oyster, rice, seaweeds, and more.
              </p>
              <p className="text-brand-muted text-sm font-medium leading-relaxed">
                A leading commercial hub with 1,409+ registered retailers. Home to a shipyard in Sitio Tabon since 2024 and Alturas Group mall since 2003.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Farming', 'Fishing', 'Shipyard', 'Mining', 'Commerce'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-brand-primary/5 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-primary/10">{tag}</span>
                ))}
              </div>
            </div>

            <div className="bg-brand-primary p-10 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-brand-primary/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Award size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
                    <Award size={24} className="text-brand-accent" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight font-display uppercase">2024 Achievements</h3>
                </div>
                <p className="text-white/90 leading-relaxed font-bold text-lg">
                  Ranked <span className="text-brand-accent font-black">17th</span> among 1st & 2nd class municipalities nationwide in the CMCI 2024.
                </p>
                <p className="text-white/70 text-sm font-medium leading-relaxed">
                  A massive leap from 336th in 2023 to 178th in 2024 among all LGUs, showcasing significant improvement in economic dynamism.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Demographics Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 civic-card p-12"
        >
          <div className="grid lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1">
              <h3 className="text-3xl font-black text-brand-text mb-4 font-display uppercase tracking-tight">Demographics</h3>
              <p className="text-brand-muted font-medium">
                With a population of 71,272, Talibon is the second-most populous town in Bohol.
              </p>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-brand-bg p-8 rounded-3xl border border-brand-border shadow-sm">
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-3">DENSITY</p>
                <p className="text-brand-text text-sm font-medium leading-relaxed">507 people per square kilometer. Home to some of the world's most densely populated islands: Nocnocan, Guindacpan, Calituban, and Cataban.</p>
              </div>
              <div className="bg-brand-bg p-8 rounded-3xl border border-brand-border shadow-sm">
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-3">BARANGAY GROUPS</p>
                <p className="text-brand-text text-sm font-medium leading-relaxed">25 Barangays: 8 Island, 9 Coastal, and 8 Inland. Major urban hubs include Poblacion, San Jose, and San Francisco.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Full Narrative Profile */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 civic-card p-12"
          >
            <div className="flex items-center gap-4 text-brand-primary mb-10">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center shadow-lg">
                <FileText size={28} />
              </div>
              <h3 className="text-3xl font-black tracking-tight font-display uppercase">Full Profile Narrative</h3>
            </div>
            <div className="prose prose-blue max-w-none">
              {profile.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-brand-text leading-relaxed font-medium mb-6 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BriefProfile;
