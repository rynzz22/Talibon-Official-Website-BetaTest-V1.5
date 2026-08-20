import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Globe, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

interface HeroProps {
  overrideTitle?: string;
  overrideSubtitle?: string;
}
const HERO_VIDEO_URL = "https://talibon.gov.ph/wp-content/uploads/2025/11/AQNfA76VxqBsdOkCQGUI91qEDtBLVfxVALb-H9LBY6HdxHPZYsDhTPqmq4uncItBA1u5CUFmq7KAQA3usI2om9XI_dJCwqeJLyINzeVU7fug1A.mp4";

const Hero: React.FC<HeroProps> = ({
  overrideTitle,
  overrideSubtitle,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const [isMuted, setIsMuted] = useState(true);

  const userWantsAudioRef = useRef(false);
  const isHeroInViewRef = useRef(true);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const startVideo = async () => {
      try {
        await video.play();
        console.log("[Hero] Video started");
      } catch (error) {
        console.warn("[Hero] Autoplay blocked:", error);
      }
    };

    startVideo();

    const handleCanPlay = () => {
      startVideo();
    };

    const handleFirstInteraction = () => {
      startVideo();

      window.removeEventListener(
        "click",
        handleFirstInteraction
      );

      window.removeEventListener(
        "touchstart",
        handleFirstInteraction
      );
    };

    video.addEventListener(
      "canplay",
      handleCanPlay
    );

    window.addEventListener(
      "click",
      handleFirstInteraction,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "touchstart",
      handleFirstInteraction,
      {
        passive: true,
      }
    );

    return () => {
      video.removeEventListener(
        "canplay",
        handleCanPlay
      );

      window.removeEventListener(
        "click",
        handleFirstInteraction
      );

      window.removeEventListener(
        "touchstart",
        handleFirstInteraction
      );
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;

        isHeroInViewRef.current = isVisible;

        const video = videoRef.current;

        if (!video) return;

        if (!isVisible) {
          video.muted = true;
          setIsMuted(true);

          window.dispatchEvent(
            new CustomEvent("hero-audio-sync", {
              detail: {
                muted: true,
              },
            })
          );

          return;
        }

        if (userWantsAudioRef.current) {
          video.muted = false;

          video
            .play()
            .then(() => {
              setIsMuted(false);

              window.dispatchEvent(
                new CustomEvent("hero-audio-sync", {
                  detail: {
                    muted: false,
                  },
                })
              );
            })
            .catch(() => {
              video.muted = true;
              setIsMuted(true);
            });
        } else {
          video.muted = true;
          video.play().catch(() => {});
        }
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleAudioToggle = (event: Event) => {
      const customEvent = event as CustomEvent<{
        muted?: boolean;
      }>;

      const requestedMutedState =
        customEvent.detail?.muted;

      if (
        typeof requestedMutedState !== "boolean"
      ) {
        return;
      }

      const video = videoRef.current;

      if (!video) return;

      if (
        requestedMutedState === false &&
        isHeroInViewRef.current
      ) {
        userWantsAudioRef.current = true;

        video.muted = false;

        video
          .play()
          .then(() => {
            setIsMuted(false);

            window.dispatchEvent(
              new CustomEvent("hero-audio-sync", {
                detail: {
                  muted: false,
                },
              })
            );
          })
          .catch((error) => {
            console.warn(
              "[Hero] Browser blocked audio:",
              error
            );

            video.muted = true;
            userWantsAudioRef.current = false;
            setIsMuted(true);

            window.dispatchEvent(
              new CustomEvent("hero-audio-sync", {
                detail: {
                  muted: true,
                },
              })
            );
          });

        return;
      }

      userWantsAudioRef.current = false;
      video.muted = true;

      setIsMuted(true);

      window.dispatchEvent(
        new CustomEvent("hero-audio-sync", {
          detail: {
            muted: true,
          },
        })
      );
    };

    window.addEventListener(
      "hero-audio-toggle",
      handleAudioToggle
    );

    return () => {
      window.removeEventListener(
        "hero-audio-toggle",
        handleAudioToggle
      );
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-start justify-center pt-28 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 lg:pb-20 px-0"
    >
      {/* BACKGROUND VIDEO */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          aria-hidden="true"
          onLoadedMetadata={() => {
            console.log("[Hero] Metadata loaded");
          }}
          onLoadedData={() => {
            console.log("[Hero] Video data loaded");
          }}
          onCanPlay={() => {
            console.log("[Hero] Video can play");
          }}
          onPlaying={() => {
            console.log("[Hero] Video playing");
          }}
          onError={(event) => {
            console.error(
              "[Hero] Video error:",
              event.currentTarget.error
            );

            console.error(
              "[Hero] Video path:",
              HERO_VIDEO_URL
            );
          }}
          className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover object-center"
        >
          <source
            src={HERO_VIDEO_URL}
            type="video/mp4"
          />

          Your browser does not support HTML5 video.
        </video>

        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
      </div>

      {/* HERO CONTENT */}
      <div className="relative z-20 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-left my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          <motion.div
            initial={{
              opacity: 0,
              x: -40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
            }}
            className="lg:col-span-12 flex flex-col items-start"
          >
            {/* Tagline */}
            <div className="inline-flex items-center gap-2.5 text-white text-xs sm:text-sm font-semibold uppercase tracking-widest mb-4 sm:mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <Globe
                size={16}
                className="text-[#4FA8D8] shrink-0 filter drop-shadow"
              />

              <span>
                Home of the Most Illustrious Son of Bohol
              </span>
            </div>

            {/* TALIBOOM */}
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-tighter leading-none mb-3 sm:mb-4 uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
              style={{
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              #TALIBOOM!
            </h2>

            {/* Main Heading */}
            <h1
              className="text-5xl sm:text-6xl md:text-[4.25rem] lg:text-[5.5rem] xl:text-[6.5rem] font-display font-black text-white leading-[0.95] tracking-tighter mb-6 sm:mb-8 uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]"
              style={{
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {overrideTitle || (
                <>
                  Seafood Terminal
                  <br />

                  <span className="bg-gradient-to-r from-white via-yellow-200 to-amber-400 bg-clip-text text-transparent filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                    & Eco-Agri Hub.
                  </span>
                </>
              )}
            </h1>

            {/* Description */}
            <p
              className="text-white text-base sm:text-lg lg:text-xl font-medium leading-relaxed sm:leading-8 max-w-2xl mb-8 sm:mb-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide"
              style={{
                fontFamily:
                  "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {overrideSubtitle ||
                "Talibon stands as Bohol's premier center for seafood & fisheries, eco-agricultural development, and vibrant municipal tourism — committed to innovation, environmental stewardship, and citizen service."}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mb-8 sm:mb-10">

              <a
                href="https://talibon-citizen-stg.multisyscorp.io/e-services"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 h-10 bg-gradient-to-r from-[#00a852] to-[#008c44] hover:from-[#00b85a] hover:to-[#00964a] text-white font-bold text-xs tracking-wider rounded-xl transition-all duration-300 uppercase shadow-md hover:shadow-green-500/20 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap font-display"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                <ArrowRight
                  size={15}
                  className="stroke-[2.5] shrink-0"
                />

                <span>
                  eGovSuite Portal
                </span>
              </a>

              <Link
                to="/about/profile"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-xl text-white font-bold text-xs tracking-wider rounded-xl transition-all duration-300 uppercase shadow-md hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap font-display"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                <Smartphone
                  size={15}
                  className="stroke-[2] shrink-0"
                />

                <span>
                  Municipal Profile
                </span>
              </Link>

            </div>

            {/* Quick Links */}
            <div className="w-full max-w-3xl pt-6 border-t border-white/15">

              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">

                {[
                  {
                    name: "Permit",
                    path: "/forms/business",
                  },
                  {
                    name: "Charter",
                    path: "/transparency/charter",
                  },
                  {
                    name: "IMS",
                    path: "/executive/gad-ims",
                  },
                  {
                    name: "News",
                    path: "/news/articles",
                  },
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="inline-flex items-center justify-center px-4 py-1.5 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 hover:border-white/40 text-white/90 hover:text-white rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 shadow-sm whitespace-nowrap font-display"
                    style={{
                      fontFamily:
                        "'Outfit', sans-serif",
                    }}
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