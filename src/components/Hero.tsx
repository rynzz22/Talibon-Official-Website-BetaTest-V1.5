import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Globe, Smartphone, Volume2, VolumeX, Play, Pause, Music, Settings, X, Check } from "lucide-react";
import { Link } from "react-router-dom";

import { useLanguage } from "../contexts/LanguageContext";

interface HeroProps {
  overrideTitle?: string;
  overrideSubtitle?: string;
}

const OFFICIAL_TALIBON_VIDEO_URL = "https://talibon.gov.ph/wp-content/uploads/2025/11/AQNfA76VxqBsdOkCQGUI91qEDtBLVfxVALb-H9LBY6HdxHPZYsDhTPqmq4uncItBA1u5CUFmq7KAQA3usI2om9XI_dJCwqeJLyINzeVU7fug1A.mp4";
const DEFAULT_POSTER_URL = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=3840&q=90";

const Hero: React.FC<HeroProps> = ({ overrideTitle, overrideSubtitle }) => {
  const { t, language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>(() => {
    const saved = localStorage.getItem('hero_video_url');
    if (!saved || saved.includes('sea_turtle.mp4')) {
      return OFFICIAL_TALIBON_VIDEO_URL;
    }
    return saved;
  });
  const [customInput, setCustomInput] = useState<string>(videoUrl);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (!isMuted) {
        videoRef.current.play().catch(() => {
          // Fallback if browser blocks unmuted playback
          setIsMuted(true);
        });
      }
    }
  }, [isMuted]);

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted && videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleSaveVideoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    setVideoUrl(customInput.trim());
    localStorage.setItem('hero_video_url', customInput.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    setShowSettings(false);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleResetVideoUrl = () => {
    setVideoUrl(OFFICIAL_TALIBON_VIDEO_URL);
    setCustomInput(OFFICIAL_TALIBON_VIDEO_URL);
    localStorage.removeItem('hero_video_url');
    setShowSettings(false);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden flex flex-col items-start justify-center pt-28 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 lg:pb-20 px-0">
      {/* Background Image / Video Stream */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-slate-900"
        style={{ 
          backgroundImage: `url('${DEFAULT_POSTER_URL}')` 
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          poster={DEFAULT_POSTER_URL}
          className="w-full h-full object-cover object-center min-w-full min-h-full scale-[1.01]"
        >
          <source 
            src={videoUrl} 
            type="video/mp4" 
          />
        </video>
        {/* Subtle left-side overlay to ensure text legibility while keeping background bright and vibrant */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent z-10" />
      </div>

      {/* Hero Video & Sound Controls Widget (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-2xl">
        <button
          onClick={toggleMute}
          title={isMuted ? "Unmute Audio / Music" : "Mute Sound"}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
            !isMuted 
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
              : 'bg-white/10 hover:bg-white/20 text-white/90 hover:text-white'
          }`}
        >
          {!isMuted ? (
            <>
              <Volume2 size={16} className="animate-pulse" />
              <span className="hidden sm:inline">Audio On</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
              </span>
            </>
          ) : (
            <>
              <VolumeX size={16} />
              <span className="hidden sm:inline">Sound Off</span>
            </>
          )}
        </button>

        <button
          onClick={togglePlay}
          title={isPlaying ? "Pause Video" : "Play Video"}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <button
          onClick={() => setShowSettings(true)}
          title="Custom Video Settings"
          className="p-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-xl transition-all"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-md w-full text-white shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                  <Music size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Hero Video & Audio</h3>
                  <p className="text-xs text-slate-400">Customize the background video & audio stream</p>
                </div>
              </div>

              <form onSubmit={handleSaveVideoUrl} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Direct Video MP4 URL
                  </label>
                  <input 
                    type="url"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter a direct MP4 video link with audio included.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-xl transition-colors shadow-lg"
                  >
                    <Check size={16} />
                    <span>Apply Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetVideoUrl}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold uppercase rounded-xl transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-10 w-full text-left my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-12 flex flex-col items-start"
          >
            {/* Tagline */}
            <div className="inline-flex items-center gap-2.5 text-white text-xs sm:text-sm font-semibold uppercase tracking-widest mb-4 sm:mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <Globe size={16} className="text-[#4FA8D8] shrink-0 filter drop-shadow" />
              <span>Home of the Most Illustrious Son of Bohol</span>
            </div>

            {/* Main Title */}
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-tighter leading-none mb-3 sm:mb-4 uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              #TALIBOOM!
            </h2>
            
            {/* Primary Hero Headline */}
            <h1 
              className="text-5xl sm:text-6xl md:text-[4.25rem] lg:text-[5.5rem] xl:text-[6.5rem] font-display font-black text-white leading-[0.95] tracking-tighter mb-6 sm:mb-8 uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {overrideTitle || (
                <>
                  Seafood Terminal <br />
                  <span className="bg-gradient-to-r from-white via-yellow-200 to-amber-400 bg-clip-text text-transparent filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                    & Eco-Agri Hub.
                  </span>
                </>
              )}
            </h1>
            
            {/* Description Paragraph */}
            <p 
              className="text-white text-base sm:text-lg lg:text-xl font-medium leading-relaxed sm:leading-8 max-w-2xl mb-8 sm:mb-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] font-display"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {overrideSubtitle || (
                "Talibon stands as Bohol's premier center for seafood & fisheries, eco-agricultural development, and vibrant municipal tourism — committed to innovation, environmental stewardship, and citizen service."
              )}
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mb-8 sm:mb-10">
              <a 
                href="https://talibon-citizen-stg.multisyscorp.io/e-services"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 h-10 bg-gradient-to-r from-[#00a852] to-[#008c44] hover:from-[#00b85a] hover:to-[#00964a] text-white font-bold text-xs tracking-wider rounded-xl transition-all duration-300 uppercase shadow-md hover:shadow-green-500/20 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap font-display"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                <ArrowRight size={15} className="stroke-[2.5] shrink-0" />
                <span>eGovSuite Portal</span>
              </a>
              
              <Link 
                to="/about/profile"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-xl border border-white/30 hover:border-white/50 text-white font-bold text-xs tracking-wider rounded-xl transition-all duration-300 uppercase shadow-md hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap font-display"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                <Smartphone size={15} className="stroke-[2] shrink-0" />
                <span>Municipal Profile</span>
              </Link>

              {/* Quick Sound Toggle CTA */}
              <button
                onClick={toggleMute}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 h-10 bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/30 text-white font-bold text-xs tracking-wider rounded-xl transition-all duration-300 uppercase shadow-md hover:-translate-y-0.5 active:translate-y-0 font-display"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {!isMuted ? <Volume2 size={16} className="text-emerald-400" /> : <VolumeX size={16} />}
                <span>{isMuted ? "Enable Music/Sound" : "Mute Sound"}</span>
              </button>
            </div>

            {/* Quick Links */}
            <div className="w-full max-w-3xl pt-6 border-t border-white/15">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                {[
                  { name: 'Permit', path: '/forms/business' },
                  { name: 'Charter', path: '/transparency/charter' },
                  { name: 'IMS', path: '/executive/gad-ims' },
                  { name: 'News', path: '/news/articles' }
                ].map((item) => (
                  <Link 
                    key={item.name}
                    to={item.path} 
                    className="inline-flex items-center justify-center px-4 py-1.5 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 hover:border-white/40 text-white/90 hover:text-white rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 shadow-sm whitespace-nowrap font-display"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
