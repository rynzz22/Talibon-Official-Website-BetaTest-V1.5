import React, { useState, useEffect } from "react";
import { MapPin, Clock, Phone, ExternalLink, X, Eye, ArrowLeft, Search, Compass, Sparkles } from "lucide-react";

interface Spot {
  id: string;
  name: string;
  description?: string;
  featured_image?: string;
  location?: string;
  opening_hours?: string;
  contact_details?: string;
  google_maps_link?: string;
  gallery_images?: string[];
  category?: string;
}

interface SpotsViewProps {
  data: Spot[];
}

export default function SpotsView({ data }: SpotsViewProps) {
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const spots = Array.isArray(data) ? data : [];

  // Scroll to top and listen for Escape key when spot is selected
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedSpot(null);
      }
    };
    if (selectedSpot) {
      window.addEventListener("keydown", handleKeyDown);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedSpot]);

  // Extract available categories dynamically
  const categories = ["ALL", ...Array.from(new Set(spots.map(s => s.category).filter(Boolean) as string[]))];

  // Filter spots by category and search query
  const filteredSpots = spots.filter((spot) => {
    const matchesCategory = selectedCategory === "ALL" || spot.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === "" || 
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (spot.location && spot.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spot.description && spot.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // If a spot is selected, render the detail page directly inline (full-width layout without dark modal backdrop)
  if (selectedSpot) {
    const formattedDescription = selectedSpot.description && !selectedSpot.description.startsWith("SAMPLE")
      ? selectedSpot.description
      : `${selectedSpot.name} is one of Talibon's premier tourist destinations, showcasing pristine natural landscapes, rich marine ecosystems, and welcoming local hospitality. Visitors can enjoy guided eco-tours, island hopping, photography opportunities, and memorable local experiences.`;

    return (
      <div className="space-y-8 animate-fadeIn w-full">
        {/* Top Navigation & Breadcrumb Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <button
            onClick={() => setSelectedSpot(null)}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
          >
            <ArrowLeft size={16} className="shrink-0" />
            <span>Back to Tourist Spots</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-slate-400">Tourism</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">Destinations</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800 uppercase tracking-wide">{selectedSpot.name}</span>
          </div>
        </div>

        {/* Full-Width Featured Image Banner */}
        <div className="relative w-full h-72 sm:h-96 md:h-[420px] rounded-3xl overflow-hidden bg-slate-900 shadow-lg">
          <img
            src={selectedSpot.featured_image || `https://picsum.photos/seed/${encodeURIComponent(selectedSpot.name)}/1200/600`}
            alt={selectedSpot.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          
          {selectedSpot.category && (
            <span className="absolute top-6 left-6 bg-brand-primary/95 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-md">
              {selectedSpot.category}
            </span>
          )}

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-300" />
              <span>Municipal Landmark</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display uppercase tracking-tight drop-shadow-md">
              {selectedSpot.name}
            </h1>
            {selectedSpot.location && (
              <div className="flex items-center gap-2 text-sm text-sky-300 font-semibold drop-shadow-sm">
                <MapPin size={16} />
                <span>{selectedSpot.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Responsive Layout for Content & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Column (8 cols): Description & Photo Gallery */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black font-display uppercase tracking-tight text-slate-900">
                  About Destination
                </h2>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Official Overview
                </span>
              </div>
              <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-normal capitalize-first">
                {formattedDescription.charAt(0).toUpperCase() + formattedDescription.slice(1)}
              </p>
            </div>

            {selectedSpot.gallery_images && selectedSpot.gallery_images.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <h2 className="text-lg font-black font-display uppercase tracking-tight text-slate-900 border-b border-slate-100 pb-4">
                  Destination Gallery
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedSpot.gallery_images.map((imgUrl, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                      <img 
                        src={imgUrl} 
                        alt={`Gallery photo ${i + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column (4 cols): Information & Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <h3 className="text-sm font-black font-display uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
                Visitor Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Operating Hours</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                      {selectedSpot.opening_hours || "Always Open / Daily"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Contact Details</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                      {selectedSpot.contact_details ? (
                        <a href={`tel:${selectedSpot.contact_details}`} className="hover:text-brand-primary hover:underline">
                          {selectedSpot.contact_details}
                        </a>
                      ) : (
                        "Talibon Tourism Office"
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Location</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                      {selectedSpot.location || "Talibon, Bohol, Philippines"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Maps Button */}
              <div className="pt-2">
                {selectedSpot.google_maps_link ? (
                  <a
                    href={selectedSpot.google_maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-brand-primary/20"
                  >
                    <MapPin size={16} />
                    <span>Open in Google Maps</span>
                  </a>
                ) : (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${selectedSpot.name} Talibon Bohol`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-brand-primary/20"
                  >
                    <Compass size={16} />
                    <span>Find on Google Maps</span>
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center space-y-3">
              <p className="text-xs text-slate-500 font-medium">
                Done exploring this destination?
              </p>
              <button
                onClick={() => setSelectedSpot(null)}
                className="w-full py-3 px-5 bg-slate-100 hover:bg-brand-primary hover:text-white text-slate-800 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200"
              >
                <ArrowLeft size={16} />
                <span>Back to All Tourist Spots</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destination, island, or spot..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all text-slate-800 placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        {categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/20 scale-[1.02]"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Tourist Spots */}
      {filteredSpots.length === 0 ? (
        <div className="civic-card p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <Compass size={36} className="mx-auto text-slate-300" />
          <p className="text-slate-600 font-semibold text-sm">
            No tourist destinations match your filter criteria.
          </p>
          {(searchQuery || selectedCategory !== "ALL") && (
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("ALL"); }}
              className="text-xs font-bold text-brand-primary hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredSpots.map((spot: Spot, idx: number) => (
            <div 
              key={`${spot.id}-${idx}`} 
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden group"
            >
              <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                <img 
                  src={spot.featured_image || `https://picsum.photos/seed/${encodeURIComponent(spot.name)}/800/500`} 
                  alt={spot.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                
                {spot.category && (
                  <span className="absolute top-3.5 left-3.5 bg-brand-primary/95 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
                    {spot.category}
                  </span>
                )}

                <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                  <h3 className="text-lg font-black font-display uppercase tracking-tight drop-shadow-xs line-clamp-1">
                    {spot.name}
                  </h3>
                  {spot.location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
                      <MapPin size={13} className="text-sky-400 shrink-0" />
                      <span className="truncate">{spot.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed line-clamp-3">
                  {spot.description && !spot.description.startsWith("SAMPLE")
                    ? spot.description
                    : `Discover ${spot.name}, a prominent tourist attraction in Talibon, Bohol known for its scenic views and rich coastal heritage.`
                  }
                </p>

                <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                  <button
                    onClick={() => setSelectedSpot(spot)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer group-hover:shadow-sm"
                  >
                    <Eye size={15} />
                    <span>Explore Details</span>
                  </button>

                  {spot.google_maps_link && (
                    <a
                      href={spot.google_maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-brand-primary hover:bg-slate-100 rounded-full transition-colors"
                      title="View on Google Maps"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* End of Tourist Spots List */}
    </div>
  );
}

