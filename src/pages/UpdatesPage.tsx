import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Facebook, ExternalLink, Lock } from 'lucide-react';

const UpdatesPage: React.FC = () => {
  const [activeFeed, setActiveFeed] = useState<'pio' | 'main'>('pio');
  const [loadedFeeds, setLoadedFeeds] = useState<{ [key: string]: boolean }>({});
  
  const feeds = {
    pio: {
      name: "Public Info Office",
      url: "https://www.facebook.com/profile.php?id=100092810378501",
      handle: "@PublicInfoOffice"
    },
    main: {
      name: "Official LGU Page",
      url: "https://www.facebook.com/TalibonOfficialPage",
      handle: "@TalibonOfficialPage"
    }
  };

  const isCurrentFeedLoaded = !!loadedFeeds[activeFeed];

  const handleLoadFeed = () => {
    setLoadedFeeds(prev => ({ ...prev, [activeFeed]: true }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12 px-4">
      <div className="mb-6">
        <span className="section-label">Official Bulletin</span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-text uppercase tracking-tight leading-none font-display mt-1">
          Municipal News Feed
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted font-normal mt-2">
          The official digital bulletin board for the Municipality of Talibon.
        </p>
      </div>

      {/* Feed Selector */}
      <div className="flex flex-wrap gap-3 justify-center">
        {(['pio', 'main'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setActiveFeed(key)}
            className={`px-5 py-2.5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all ${
              activeFeed === key 
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-102' 
                : 'bg-white border border-brand-border text-brand-muted hover:text-brand-text'
            }`}
          >
            {feeds[key].name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="lg:col-span-2">
          <motion.div
            key={activeFeed}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl sm:rounded-2xl border border-brand-border shadow-lg shadow-black/5 p-4 overflow-hidden min-h-[500px] flex flex-col justify-center"
          >
            {isCurrentFeedLoaded ? (
              <div className="w-full">
                <iframe 
                  src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(feeds[activeFeed].url)}&tabs=timeline&width=800&height=1200&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`} 
                  width="100%" 
                  height="700" 
                  style={{ border: 'none', overflow: 'hidden', borderRadius: '1rem' }} 
                  scrolling="no" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title={`Talibon Facebook Feed - ${feeds[activeFeed].name}`}
                />
              </div>
            ) : (
              <div className="text-center py-12 px-4 space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center shadow-xs">
                  <Facebook size={36} />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black tracking-widest text-[#1877F2] uppercase">
                    {feeds[activeFeed].name}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    Interactive Social Media Stream
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    Facebook content is provided by Meta. Loading this content may transfer information to Facebook (such as IP address and browser cookies).
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleLoadFeed}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Facebook size={16} />
                    Load Facebook Feed
                  </button>
                  <a
                    href={feeds[activeFeed].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Open on Facebook</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Privacy-first: No tracking requests to Meta are executed until you click Load.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.25em]">Source Info</h3>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary text-xs font-black shrink-0">
                 {activeFeed === 'pio' ? 'PIO' : 'LGU'}
               </div>
               <div>
                  <p className="text-xs sm:text-sm font-bold text-brand-text leading-tight">{feeds[activeFeed].name}</p>
                  <p className="text-[9px] text-brand-muted font-bold font-mono uppercase tracking-tighter mt-0.5">{feeds[activeFeed].handle}</p>
               </div>
            </div>
            <p className="text-[11px] text-brand-muted leading-relaxed font-normal">
              You are currently viewing the live feed for <span className="text-brand-text font-bold">{feeds[activeFeed].name}</span>. 
              This stream is updated in real-time as new content is posted to Facebook.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-brand-border/60">
            <div className="flex items-center gap-2 text-orange-600">
              <ShieldAlert size={16} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Anti-Fake News</h3>
            </div>
            <p className="text-[11px] text-brand-muted leading-normal font-normal">
              Only trust information from our official Facebook pages. Do not share unverified reports during disasters or emergencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatesPage;
