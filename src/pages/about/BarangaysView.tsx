import React, { useState } from "react";
import { motion } from "motion/react";
import { Building2, Search, User, Phone, MapPin, Clock, Users } from "lucide-react";

interface Barangay {
  id: string;
  name?: string;
  barangay_name?: string;
  captain?: string | null;
  captain_name?: string | null;
  population?: number;
  contact_number?: string | null;
  office_address?: string | null;
  office_hours?: string | null;
  cover_image?: string | null;
}

interface BarangaysViewProps {
  data: Barangay[];
}

export default function BarangaysView({ data }: BarangaysViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Normalization helper
  const normalizeBarangay = (brgy: Barangay) => {
    return {
      id: brgy.id,
      name: brgy.barangay_name || brgy.name || "Unnamed Barangay",
      captain: brgy.captain_name || brgy.captain || "Not Specified",
      population: brgy.population || 0,
      contact_number: brgy.contact_number || "",
      office_address: brgy.office_address || "",
      office_hours: brgy.office_hours || "Monday to Friday, 8:00 AM - 5:00 PM",
      cover_image: brgy.cover_image || ""
    };
  };

  const rawData = Array.isArray(data) ? data : [];
  const normalizedData = rawData.map(normalizeBarangay);

  const filteredBarangays = normalizedData.filter((brgy) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = brgy.name.toLowerCase().includes(term);
    const captainMatch = brgy.captain.toLowerCase().includes(term);
    return nameMatch || captainMatch;
  });

  // Calculate pagination
  const totalItems = filteredBarangays.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  // Reset page if searchTerm changes and filtered list shrinks
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBarangays = filteredBarangays.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-brand-surface/40 p-4 sm:p-5 rounded-2xl border border-brand-border/60">
        <div className="text-left">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text font-display">Barangay Directory Search</h2>
          <p className="text-[10px] font-mono text-brand-muted uppercase tracking-wider mt-0.5">
            Filter through Talibon's {normalizedData.length || 25} official communities
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
          <input
            type="text"
            placeholder="Search by Barangay or Captain..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset pagination on search
            }}
            className="w-full bg-white border border-brand-border/60 hover:border-brand-primary/40 focus:border-brand-primary/80 focus:ring-2 focus:ring-brand-primary/10 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold text-brand-text outline-none transition-all placeholder:text-brand-muted/70"
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {paginatedBarangays.length > 0 ? (
          paginatedBarangays.map((brgy, idx) => (
            <motion.div
              key={brgy.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
              className="group relative bg-white rounded-xl border border-brand-border hover:border-brand-primary/40 hover:shadow-md transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header Row */}
                <div className="flex justify-between items-center gap-2 mb-3 pb-2.5 border-b border-brand-border/50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/5 text-brand-primary flex items-center justify-center shrink-0 border border-brand-primary/10">
                      <Building2 size={16} />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-brand-text group-hover:text-brand-primary transition-colors uppercase tracking-tight font-display">
                      {brgy.name}
                    </h3>
                  </div>
                  {brgy.population > 0 && (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-brand-primary/5 text-brand-primary rounded-full text-[10px] font-mono font-medium uppercase tracking-wider shrink-0 border border-brand-primary/10">
                      <Users size={12} /> {brgy.population.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Info Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                  {/* Barangay Captain */}
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50/80 border border-brand-border/30">
                    <User size={14} className="text-brand-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold uppercase tracking-wider text-brand-muted leading-none">Barangay Captain</p>
                      <p className="text-xs font-semibold text-brand-text mt-1 leading-snug">{brgy.captain}</p>
                    </div>
                  </div>

                  {/* Office Hours */}
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50/80 border border-brand-border/30">
                    <Clock size={14} className="text-brand-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold uppercase tracking-wider text-brand-muted leading-none">Office Hours</p>
                      <p className="text-xs font-semibold text-brand-text mt-1 leading-snug">{brgy.office_hours}</p>
                    </div>
                  </div>

                  {/* Contact Number */}
                  {brgy.contact_number && (
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50/80 border border-brand-border/30">
                      <Phone size={14} className="text-brand-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-brand-muted leading-none">Contact Number</p>
                        <p className="text-xs font-semibold text-brand-text mt-1 leading-snug">{brgy.contact_number}</p>
                      </div>
                    </div>
                  )}

                  {/* Office Address */}
                  {brgy.office_address && (
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50/80 border border-brand-border/30">
                      <MapPin size={14} className="text-brand-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-brand-muted leading-none">Office Address</p>
                        <p className="text-xs font-semibold text-brand-text mt-1 leading-snug">{brgy.office_address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-brand-surface/20 rounded-2xl border border-dashed border-brand-border">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">No barangays match your search</p>
            <p className="text-[10px] font-mono text-brand-muted/70 uppercase tracking-wider mt-1">Try a different name or spelling</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-8 border-t border-brand-border/50">
          <span className="text-[10px] text-brand-muted font-black uppercase tracking-widest">
            Showing Page {safeCurrentPage} of {totalPages} ({totalItems} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={safeCurrentPage === 1}
              className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest bg-white border border-brand-border text-brand-muted rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-xs flex items-center justify-center min-w-16 cursor-pointer"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}
              className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest bg-white border border-brand-border text-brand-muted rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-xs flex items-center justify-center min-w-16 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
