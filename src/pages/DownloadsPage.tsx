import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Download, FileText, FileSpreadsheet, FileArchive, Search, Filter, ExternalLink, Building2, Briefcase, FileCheck, Landmark, Target, Activity } from 'lucide-react';
import { formsApi } from '../services/api';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface DownloadItem {
  id: string | number;
  title: string;
  url: string;
  category: string;
  fileSize?: string;
  fileType?: 'PDF' | 'DOCX' | 'XLSX' | 'ZIP';
}

const DownloadsPage: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const [permits, buildings, zoning] = await Promise.all([
          formsApi.getBusinessPermits(),
          formsApi.getBuildingPermits(),
          formsApi.getZoningClearance()
        ]);

        let liveDownloadables: DownloadItem[] = [];
        if (isSupabaseConfigured) {
          try {
            const { data, error } = await supabase
              .from("downloadables")
              .select("*")
              .eq("status", "published");
            if (!error && data) {
              liveDownloadables = (data as any[]).map(item => ({
                id: item.id,
                title: item.title,
                url: item.file_url,
                category: item.category || 'General',
                fileSize: item.file_size || '1.2 MB',
                fileType: 'PDF'
              }));
            }
          } catch (e) {
            console.warn("Failed to fetch live downloadables from Supabase", e);
          }
        }

        const combined: DownloadItem[] = [
          ...liveDownloadables,
          ...(Array.isArray(permits?.data) ? permits.data : []).map((item: any) => ({ ...item, id: `business-${item.id}`, category: 'Business' })),
          ...(Array.isArray(buildings?.data) ? buildings.data : []).map((item: any) => ({ ...item, id: `building-${item.id}`, category: 'Building' })),
          ...(Array.isArray(zoning?.data) ? zoning.data : []).map((item: any) => ({ ...item, id: `zoning-${item.id}`, category: 'Zoning' })),
          // Adding hardcoded common forms for completeness
          { id: 'tax-dec', title: 'Tax Declaration Application', url: '#', category: 'Assessor', fileSize: '450 KB', fileType: 'PDF' },
          { id: 'residency', title: 'Barangay Residency Request Form', url: '#', category: 'Barangay', fileSize: '120 KB', fileType: 'PDF' },
          { id: 'civil-reg', title: 'Birth Certificate Request Form', url: '#', category: 'Civil Registrar', fileSize: '310 KB', fileType: 'PDF' },
          { id: 'gad-manual', title: 'GAD-IMS Implementation Manual', url: '#', category: 'GAD', fileSize: '2.4 MB', fileType: 'PDF' },
        ];

        setDownloads(combined);
      } catch (error) {
        console.error("Failed to fetch downloads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, []);

  const categories = ['all', ...Array.from(new Set(downloads.map(d => d.category)))];

  const filteredDownloads = downloads.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (category: string) => {
    switch (category) {
      case 'Business': return <Briefcase className="text-brand-primary" />;
      case 'Building': return <Building2 className="text-brand-primary" />;
      case 'Zoning': return <Landmark className="text-brand-primary" />;
      case 'GAD': return <FileCheck className="text-brand-primary" />;
      default: return <FileText className="text-brand-primary" />;
    }
  };

  return (
    <div className="pb-12 min-h-screen bg-brand-bg relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-brand-primary/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-brand-secondary/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5 mb-3"
          >
            <div className="w-8 h-1 bg-brand-primary rounded-full" />
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Resources</span>
          </motion.div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight uppercase font-display">
                DOWNLOADABLES
              </h1>
              <p className="text-brand-muted mt-1 text-xs sm:text-sm font-medium max-w-xl">
                Access official forms, application documents, and informative materials from the Municipality of Talibon.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto shrink-0">
              <div className="relative group w-full md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-primary transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-brand-border rounded-xl py-2 pl-9 pr-4 text-xs font-medium tracking-tight focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/30 transition-all w-full shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
                  selectedCategory === cat 
                  ? 'bg-brand-primary text-white border-brand-primary shadow-xs' 
                  : 'bg-white text-brand-muted border-brand-border hover:border-brand-primary/30 hover:text-brand-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Downloads Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={`skeleton-download-${i}`} className="p-4 rounded-xl border border-brand-border bg-white animate-pulse">
                <div className="w-10 h-10 bg-brand-border rounded-lg mb-4" />
                <div className="h-5 bg-brand-border rounded-md w-3/4 mb-3" />
                <div className="h-3 bg-brand-border rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredDownloads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDownloads.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="p-4 rounded-xl border border-brand-border bg-white flex flex-col group hover:border-brand-primary/40 shadow-xs transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-brand-primary/5 rounded-lg border border-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                    {getIcon(item.category)}
                  </div>
                  <span className="text-[10px] font-bold text-brand-muted bg-gray-100 px-2 py-0.5 rounded border border-brand-border/40 uppercase tracking-wider">
                    {item.fileType || 'PDF'}
                  </span>
                </div>
                
                <h3 className="text-sm font-bold text-brand-text mb-2 group-hover:text-brand-primary transition-colors leading-snug font-display">
                  {item.title}
                </h3>
                
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-brand-border/40">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                    {item.category}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-brand-border" />
                  <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider">
                    {item.fileSize || 'N/A'}
                  </span>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full py-2 bg-brand-text hover:bg-brand-text/90 text-white font-bold text-[11px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs group/btn"
                >
                  <Download size={14} className="transition-transform group-hover/btn:-translate-y-0.5" />
                  <span>Download File</span>
                </a>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-brand-border">
            <Search className="mx-auto text-brand-border mb-3" size={40} />
            <h3 className="text-base font-bold text-brand-text mb-1 font-display">No files found</h3>
            <p className="text-brand-muted font-medium text-xs">No downloadable files match your current search criteria.</p>
          </div>
        )}

        {/* GAD Links Section */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-brand-border" />
            <h2 className="text-base font-bold text-brand-text uppercase tracking-tight font-display text-center">
              Specialized Resource Centers
            </h2>
            <div className="h-px flex-1 bg-brand-border" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div 
              whileHover={{ y: -2 }}
              className="p-5 rounded-xl bg-brand-primary group overflow-hidden relative shadow-xs"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 text-white transform translate-x-1/4 -translate-y-1/4">
                <Target size={140} />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight font-display">GAD-IMS Portal</h3>
                <p className="text-white/85 text-xs font-medium mb-4 leading-relaxed">
                  Access comprehensive Gender and Development data, reports, and management tools for the Municipality.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <a href="/executive/gad-ims" className="bg-white text-brand-primary font-bold px-4 py-2 rounded-lg text-[11px] uppercase tracking-wider hover:bg-brand-secondary transition-all shadow-xs">
                    GO TO GAD-IMS
                  </a>
                  <a href="#" className="bg-brand-primary-dark/30 text-white border border-white/20 font-bold px-4 py-2 rounded-lg text-[11px] uppercase tracking-wider hover:bg-white/10 transition-all flex items-center gap-1.5">
                    <Download size={13} /> MANUAL
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -2 }}
              className="p-5 rounded-xl bg-white border border-brand-border group overflow-hidden relative shadow-xs"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 text-brand-primary transform translate-x-1/4 -translate-y-1/4">
                <Landmark size={140} />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-brand-text mb-1.5 tracking-tight font-display">Legislative Archive</h3>
                <p className="text-brand-muted text-xs font-medium mb-4 leading-relaxed">
                  Browse and download enacted municipal ordinances, resolutions, and legislative documents.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <a href="/legislative/ordinances" className="bg-brand-primary text-white font-bold px-4 py-2 rounded-lg text-[11px] uppercase tracking-wider hover:bg-brand-secondary transition-all shadow-xs">
                    ORDINANCES
                  </a>
                  <a href="/legislative/resolutions" className="bg-white text-brand-text border border-brand-border font-bold px-4 py-2 rounded-lg text-[11px] uppercase tracking-wider hover:border-brand-primary hover:text-brand-primary transition-all">
                    RESOLUTIONS
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadsPage;
