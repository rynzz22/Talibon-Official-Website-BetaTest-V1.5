import { useState, useEffect } from "react";
import { Sun, CloudRain, Wind, Waves, Thermometer, Navigation } from "lucide-react";


export default function WeatherWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const tideData = [
    { time: "04:12 AM", level: "1.2m", type: "High" },
    { time: "10:45 AM", level: "0.3m", type: "Low" },
    { time: "05:20 PM", level: "1.1m", type: "High" },
    { time: "11:30 PM", level: "0.4m", type: "Low" },
  ];

  const textShadowStyle = { textShadow: "0 2px 6px rgba(0,0,0,0.85), 0 1px 2px rgba(0,0,0,0.9)" };
  const filterShadowStyle = { filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.8))" };

  return (
    <section 
      className="relative w-full overflow-hidden bg-cover bg-center py-12 sm:py-16 lg:py-20 text-white z-20"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=3840&q=90')` }}
    >
      {/* Light subtle overlay for soft contrast */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 100%)" }} 
      />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
          
          {/* Left Section: Weather Data */}
          <div className="lg:col-span-2 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="flex items-center gap-5 sm:gap-6">
              {/* Sun icon sitting directly on the photo with drop shadow, no box */}
              <Sun 
                size={54} 
                className="text-amber-300 animate-spin-slow shrink-0" 
                style={filterShadowStyle}
              />
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span 
                    className="text-xs font-extrabold text-sky-200 uppercase tracking-widest"
                    style={textShadowStyle}
                  >
                    LIVE WEATHER DATA
                  </span>
                  <span 
                    className="text-xs text-sky-100/90 font-medium"
                    style={textShadowStyle}
                  >
                    • PAGASA Meteorological Stream
                  </span>
                </div>
                <span 
                  className="text-xs font-black text-amber-300 uppercase tracking-[0.25em] mb-1 block"
                  style={textShadowStyle}
                >
                  Current Weather
                </span>
                <div className="flex items-baseline gap-1.5">
                  <h3 
                    className="text-5xl sm:text-6xl font-black text-white font-display tracking-tight"
                    style={{ textShadow: "0 3px 10px rgba(0,0,0,0.7)" }}
                  >
                    29°
                  </h3>
                  <span 
                    className="text-2xl font-bold text-sky-100"
                    style={textShadowStyle}
                  >
                    C
                  </span>
                </div>
                <p 
                  className="text-sm sm:text-base font-black text-white uppercase tracking-widest mt-1.5"
                  style={textShadowStyle}
                >
                  Sunny • Talibon, Bohol
                </p>
              </div>
            </div>

            {/* Weather Metrics */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/30">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-sky-200" style={textShadowStyle}>
                  <Wind size={15} className="text-amber-300" style={filterShadowStyle} />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Wind</span>
                </div>
                <p className="text-sm sm:text-base font-black text-white" style={textShadowStyle}>12 km/h NE</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-sky-200" style={textShadowStyle}>
                  <CloudRain size={15} className="text-amber-300" style={filterShadowStyle} />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Humidity</span>
                </div>
                <p className="text-sm sm:text-base font-black text-white" style={textShadowStyle}>78%</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-sky-200" style={textShadowStyle}>
                  <Thermometer size={15} className="text-amber-300" style={filterShadowStyle} />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Feels Like</span>
                </div>
                <p className="text-sm sm:text-base font-black text-white" style={textShadowStyle}>32°C</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-sky-200" style={textShadowStyle}>
                  <Navigation size={15} className="text-amber-300" style={filterShadowStyle} />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Visibility</span>
                </div>
                <p className="text-sm sm:text-base font-black text-white" style={textShadowStyle}>10 km</p>
              </div>
            </div>
          </div>

          {/* Right Section: Tide Forecast Panel directly floating on photo without background card */}
          <div className="flex flex-col justify-between h-full py-1">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span 
                    className="text-xs font-extrabold text-sky-200 uppercase tracking-[0.25em] mb-0.5 block"
                    style={textShadowStyle}
                  >
                    Tide Forecast
                  </span>
                  <h3 
                    className="text-xl font-bold font-display tracking-tight text-white"
                    style={textShadowStyle}
                  >
                    Coastal Info
                  </h3>
                </div>
                <Waves 
                  size={24} 
                  className="text-amber-300 animate-bounce" 
                  style={filterShadowStyle}
                />
              </div>

              <div className="space-y-2.5">
                {tideData.map((tide, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/25 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className={`w-2 h-2 rounded-full ${tide.type === "High" ? "bg-amber-300" : "bg-sky-300"}`}
                        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.6)" }} 
                      />
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white" style={textShadowStyle}>
                        {tide.time}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-black text-white" style={textShadowStyle}>
                        {tide.level}
                      </p>
                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-sky-200" style={textShadowStyle}>
                        {tide.type} Tide
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-white/25 flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-widest text-sky-200" style={textShadowStyle}>
                Local Time
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-white" style={textShadowStyle}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
