import React, { useState } from "react";
import { MapPin, Clock, Phone, ExternalLink, X, Eye } from "lucide-react";

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

  const spots = Array.isArray(data) ? data : [];

  // Extract available categories dynamically or provide defaults
  const categories = ["ALL", ...Array.from(new Set(spots.map(s => s.category).filter(Boolean) as string[]))];

  const filteredSpots = selectedCategory === "ALL" 
    ? spots 
    : spots.filter(s => s.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Category Filter Pills if categories exist */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-105"
                  : "bg-brand-surface text-brand-muted hover:text-brand-text hover:bg-white border border-brand-primary/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid of Tourist Spots */}
      {filteredSpots.length === 0 ? (
        <div className="civic-card p-12 text-center text-brand-muted font-medium">
          No tourist destinations available in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSpots.map((spot: Spot, idx: number) => (
            <div 
              key={`${spot.id}-${idx}`} 
              className="civic-card overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full border border-brand-primary/10"
            >
              <div className="aspect-[4/3] bg-brand-surface relative overflow-hidden">
                <img 
                  src={spot.featured_image || `https://picsum.photos/seed/${encodeURIComponent(spot.name)}/800/600`} 
                  alt={spot.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />
                
                {spot.category && (
                  <span className="absolute top-4 left-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                    {spot.category}
                  </span>
                )}
              </div>

              <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-black text-brand-text group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight mb-2">
                    {String(spot.name)}
                  </h3>
                  
                  {spot.location && (
                    <div className="flex items-center gap-1.5 text-xs text-brand-muted font-bold mb-3">
                      <MapPin size={14} className="text-brand-primary shrink-0" />
                      <span className="truncate">{spot.location}</span>
                    </div>
                  )}

                  <p className="text-brand-muted text-sm font-medium leading-relaxed line-clamp-3">
                    {String(spot?.description || "Explore the scenic beauty and cultural charm of this municipal tourist landmark in Talibon, Bohol.")}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <button
                    onClick={() => setSelectedSpot(spot)}
                    className="flex items-center gap-2 text-xs font-black text-brand-primary uppercase tracking-wider hover:gap-3 transition-all cursor-pointer"
                  >
                    <Eye size={16} />
                    Explore Details
                  </button>

                  {spot.google_maps_link && (
                    <a
                      href={spot.google_maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-bg rounded-full transition-colors"
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

      {/* Spot Detail Modal */}
      {selectedSpot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 p-8 relative space-y-6">
            <button
              onClick={() => setSelectedSpot(null)}
              className="absolute top-6 right-6 p-3 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="aspect-video w-full rounded-[2rem] overflow-hidden bg-slate-100 relative">
              <img
                src={selectedSpot.featured_image || `https://picsum.photos/seed/${encodeURIComponent(selectedSpot.name)}/1000/600`}
                alt={selectedSpot.name}
                className="w-full h-full object-cover"
              />
              {selectedSpot.category && (
                <span className="absolute top-4 left-4 bg-brand-primary text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                  {selectedSpot.category}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-3xl font-black text-brand-text font-display uppercase tracking-tight mb-2">
                {selectedSpot.name}
              </h2>

              {selectedSpot.location && (
                <div className="flex items-center gap-2 text-sm text-brand-primary font-bold">
                  <MapPin size={16} />
                  <span>{selectedSpot.location}</span>
                </div>
              )}
            </div>

            <p className="text-brand-text text-base leading-relaxed font-medium">
              {selectedSpot.description || "A scenic municipal highlight located in Talibon, Bohol, welcoming tourists and locals alike."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              {selectedSpot.opening_hours && (
                <div className="flex items-center gap-3 p-4 bg-brand-bg rounded-2xl">
                  <Clock size={18} className="text-brand-primary shrink-0" />
                  <div>
                    <div className="text-[10px] font-black uppercase text-brand-muted">Operating Hours</div>
                    <div className="text-xs font-bold text-brand-text">{selectedSpot.opening_hours}</div>
                  </div>
                </div>
              )}

              {selectedSpot.contact_details && (
                <div className="flex items-center gap-3 p-4 bg-brand-bg rounded-2xl">
                  <Phone size={18} className="text-brand-primary shrink-0" />
                  <div>
                    <div className="text-[10px] font-black uppercase text-brand-muted">Contact Info</div>
                    <div className="text-xs font-bold text-brand-text">{selectedSpot.contact_details}</div>
                  </div>
                </div>
              )}
            </div>

            {selectedSpot.gallery_images && selectedSpot.gallery_images.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-muted">Photo Gallery</h4>
                <div className="grid grid-cols-3 gap-3">
                  {selectedSpot.gallery_images.map((imgUrl, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                      <img src={imgUrl} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSpot.google_maps_link && (
              <div className="pt-4 border-t border-slate-100">
                <a
                  href={selectedSpot.google_maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-secondary transition-colors cursor-pointer shadow-lg shadow-brand-primary/20"
                >
                  <MapPin size={18} />
                  Open in Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
