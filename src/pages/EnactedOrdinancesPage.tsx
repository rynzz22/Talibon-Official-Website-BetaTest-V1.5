import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, Download, Folder, Grid, List as ListIcon, ChevronRight } from 'lucide-react';

interface Ordinance {
  id: string;
  title: string;
  year: string;
  file_url: string;
  file_size?: string;
  created_at: string;
  barangay_id?: string;
}

const MOCK_ORDINANCES: Ordinance[] = [
  {
    id: "o1",
    title: "Ordinance No. 2024-01: An Ordinance Prescribing Guidelines for Solid Waste Management and Penalties for Violators",
    year: "2024",
    file_url: "#",
    file_size: "1.2 MB",
    created_at: new Date().toISOString()
  },
  {
    id: "o2",
    title: "Ordinance No. 2024-02: Regulation of Single-Use Plastic Bags and Encouragement of Biodegradable Alternatives",
    year: "2024",
    file_url: "#",
    file_size: "890 KB",
    created_at: new Date().toISOString()
  },
  {
    id: "o3",
    title: "Ordinance No. 2023-05: Standardizing Safety Guidelines and Licensing for Local Motorized Tricycles and Sea Vessels",
    year: "2023",
    file_url: "#",
    file_size: "2.1 MB",
    created_at: new Date().toISOString()
  }
];

const EnactedOrdinancesPage: React.FC = () => {
  const [ordinances, setOrdinances] = useState<Ordinance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeYear, setActiveYear] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setOrdinances(MOCK_ORDINANCES);
      const yearsList = Array.from(new Set(MOCK_ORDINANCES.map(o => o.year))).sort((a, b) => b.localeCompare(a));
      setActiveYear(yearsList[0] || "");
      setLoading(false);
      return;
    }

    const fetchOrdinances = async () => {
      setLoading(true);
      // Fetch only macro (municipal) ordinances for the main site
      const { data, error } = await supabase
        .from('ordinances')
        .select('*')
        .is('barangay_id', null)
        .order('year', { ascending: false })
        .order('title', { ascending: true });

      if (error) {
        console.warn("Error fetching ordinances:", error);
        setOrdinances(MOCK_ORDINANCES);
        const yearsList = Array.from(new Set(MOCK_ORDINANCES.map(o => o.year))).sort((a, b) => b.localeCompare(a));
        setActiveYear(yearsList[0] || "");
      } else {
        const docs = data as Ordinance[];
        setOrdinances(docs);
        
        if (docs.length > 0 && !activeYear) {
          const yearsList = Array.from(new Set(docs.map(o => o.year))).sort((a, b) => b.localeCompare(a));
          setActiveYear(yearsList[0]);
        }
      }
      setLoading(false);
    };

    fetchOrdinances();

    // Setup Realtime subscription
    const channel = supabase
      .channel('ordinances-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordinances' }, () => {
        fetchOrdinances();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Only on mount

  const years = Array.from(new Set(ordinances.map(o => o.year))).sort((a, b) => b.localeCompare(a));
  
  const filteredOrdinances = ordinances.filter(o => 
    o.year === activeYear && 
    o.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-bg pt-6 sm:pt-8 pb-20 relative overflow-hidden">
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
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
              <FileText size={24} />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-brand-text tracking-tight uppercase font-display">Enacted Ordinances</h1>
          </div>
          <p className="text-lg text-brand-muted font-medium max-w-2xl">
            Access the official legislative records and municipal ordinances of Talibon.
          </p>
        </div>

        {/* Year Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {years.map(year => (
            <button
              key={year}
              onClick={() => setActiveYear(year)}
              className={`px-8 py-4 rounded-2xl font-bold text-sm tracking-widest transition-all ${
                activeYear === year 
                ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' 
                : 'bg-white text-brand-muted hover:bg-brand-bg border border-brand-border'
              }`}
            >
              MUN - ORD {year}
            </button>
          ))}
        </div>

        {/* Search & Controls */}
        <div className="pro-card p-6 mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-bg border border-transparent rounded-2xl py-4 pl-16 pr-6 text-sm font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white focus:border-brand-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 p-1 bg-brand-bg rounded-2xl border border-brand-border">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-muted hover:text-brand-text'}`}
            >
              <ListIcon size={20} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-muted hover:text-brand-text'}`}
            >
              <Grid size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-brand-muted font-bold uppercase tracking-widest text-xs">Loading records...</p>
          </div>
        ) : filteredOrdinances.length > 0 ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" : "space-y-4"}>
            <AnimatePresence mode="popLayout">
              {filteredOrdinances.map((ord) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={ord.id}
                  className={viewMode === 'grid' 
                    ? "group pro-card p-8 flex flex-col items-center text-center hover:border-brand-primary/30 transition-all"
                    : "group pro-card p-6 flex items-center gap-6 hover:border-brand-primary/30 transition-all"
                  }
                >
                  <div className={viewMode === 'grid' ? "mb-8 relative" : "relative"}>
                    <div className="w-24 h-32 bg-brand-bg rounded-2xl flex flex-col items-center justify-center border border-brand-border group-hover:bg-brand-primary/5 transition-colors">
                      <FileText size={40} className="text-brand-muted/30 group-hover:text-brand-primary/30 transition-colors" />
                      <div className="absolute bottom-4 bg-brand-accent text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg shadow-brand-accent/20">PDF</div>
                    </div>
                  </div>

                  <div className={viewMode === 'grid' ? "flex-1 flex flex-col" : "flex-1"}>
                    <h3 className="text-lg font-extrabold text-brand-text leading-tight mb-4 group-hover:text-brand-primary transition-colors font-display">
                      {ord.title}
                    </h3>
                    <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                      <span>{ord.file_size || '2 MB'}</span>
                      <span className="w-1 h-1 bg-brand-border rounded-full" />
                      <span>{new Date(ord.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <a
                    href={ord.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={viewMode === 'grid'
                      ? "mt-8 w-full py-4 bg-brand-bg text-brand-muted rounded-2xl font-bold text-[10px] tracking-widest hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                      : "px-8 py-4 bg-brand-bg text-brand-muted rounded-2xl font-bold text-[10px] tracking-widest hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                    }
                  >
                    <Download size={14} className="group-hover/btn:scale-110 transition-transform" />
                    DOWNLOAD
                  </a>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-32 pro-card border-dashed border-brand-border">
            <Folder className="mx-auto text-brand-muted/20 mb-6" size={64} />
            <h3 className="text-2xl font-extrabold text-brand-text mb-2 font-display">No ordinances found</h3>
            <p className="text-brand-muted font-medium">Try adjusting your search or selecting a different year.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnactedOrdinancesPage;
