import React, { useState, useRef, useEffect } from 'react';
import { motion } from "motion/react";
import { ArrowRight, Globe, Smartphone } from "lucide-react";
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
  const sectionRef = useRef<HTMLElement>(null);

  const [isMuted, setIsMuted] = useState<boolean>(true);
  const userWantsAudioRef = useRef<boolean>(false);
  const isHeroInViewRef = useRef<boolean>(true);
  const videoUrl = OFFICIAL_TALIBON_VIDEO_URL;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // IntersectionObserver to detect when Hero section is in view vs scrolled away
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const inView = entry.isIntersecting;
          isHeroInViewRef.current = inView;

          if (!inView) {
            // User scrolled away from Hero section -> automatically mute audio
            if (videoRef.current) {
              videoRef.current.muted = true;
            }
            setIsMuted(true);
            window.dispatchEvent(new CustomEvent('hero-audio-sync', { detail: { muted: true } }));
          } else {
            // User scrolled back into Hero section -> restore audio if user enabled it
            if (userWantsAudioRef.current && videoRef.current) {
              videoRef.current.muted = false;
              videoRef.current.play().then(() => {
                setIsMuted(false);
                window.dispatchEvent(new CustomEvent('hero-audio-sync', { detail: { muted: false } }));
              }).catch(() => {
                setIsMuted(true);
                window.dispatchEvent(new CustomEvent('hero-audio-sync', { detail: { muted: true } }));
              });
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleAudioToggle = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (typeof customEvt.detail?.muted === 'boolean') {
        const nextMuted = customEvt.detail.muted;
        userWantsAudioRef.current = !nextMuted;

        if (!nextMuted && isHeroInViewRef.current && videoRef.current) {
          videoRef.current.muted = false;
          videoRef.current.play().then(() => {
            setIsMuted(false);
            window.dispatchEvent(new CustomEvent('hero-audio-sync', { detail: { muted: false } }));
          }).catch(() => {
            setIsMuted(true);
            userWantsAudioRef.current = false;
            window.dispatchEvent(new CustomEvent('hero-audio-sync', { detail: { muted: true } }));
          });
        } else {
          setIsMuted(true);
          if (videoRef.current) {
            videoRef.current.muted = true;
          }
          window.dispatchEvent(new CustomEvent('hero-audio-sync', { detail: { muted: true } }));
        }
      }
    };

    window.addEventListener('hero-audio-toggle', handleAudioToggle);
    return () => window.removeEventListener('hero-audio-toggle', handleAudioToggle);
  }, []);

  return (
    <section ref={sectionRef} id="home" className="relative min-h-screen w-full overflow-hidden flex flex-col items-start justify-center pt-28 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 lg:pb-20 px-0">
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

      {/* Content */}
      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-left my-auto">
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
              className="text-white text-base sm:text-lg lg:text-xl font-medium leading-relaxed sm:leading-8 max-w-2xl mb-8 sm:mb-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
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
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-xl text-white font-bold text-xs tracking-wider rounded-xl transition-all duration-300 uppercase shadow-md hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap font-display"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                <Smartphone size={15} className="stroke-[2] shrink-0" />
                <span>Municipal Profile</span>
              </Link>
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
