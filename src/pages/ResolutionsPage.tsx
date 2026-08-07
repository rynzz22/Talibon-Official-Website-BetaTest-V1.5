import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, Calendar, User, ChevronDown, ChevronUp, Download, Filter, ArrowUpDown, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Resolution {
  id?: string;
  no: string;
  date: string;
  author: string;
  title: string;
  file_url?: string;
}

const MOCK_RESOLUTIONS: Resolution[] = [
  {
    id: "r1",
    no: "101",
    date: "2024-03-15",
    author: "Hon. Maria Santos",
    title: "A Resolution Requesting Additional Funding for Coastal Defense Facilities from the Department of Public Works and Highways",
    file_url: "#"
  },
  {
    id: "r2",
    no: "102",
    date: "2024-03-20",
    author: "Hon. Jose Reyes",
    title: "A Resolution Expressing Strong Support for the Cooperative Livelihood Expansion of Talibon Seaweed Farmers",
    file_url: "#"
  },
  {
    id: "r3",
    no: "85",
    date: "2023-11-10",
    author: "Hon. Antonio Cruz",
    title: "A Resolution Approving the Annual Barangay Investment Plans for the 25 Barangays of Talibon",
    file_url: "#"
  }
];

type SortKey = 'no' | 'date' | 'title';
type SortOrder = 'asc' | 'desc';

const ResolutionsPage: React.FC = () => {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('no');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setResolutions(MOCK_RESOLUTIONS);
      setLoading(false);
      return;
    }

    const fetchResolutions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('resolutions')
        .select('*')
        .order('no', { ascending: false });

      if (error) {
        console.warn("Error fetching resolutions:", error);
        setResolutions(MOCK_RESOLUTIONS);
      } else {
        setResolutions(data as Resolution[]);
      }
      setLoading(false);
    };

    fetchResolutions();

    // Subscribe to changes
    const channel = supabase
      .channel('resolutions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resolutions' }, () => fetchResolutions())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedResolutions = useMemo(() => {
    let result = resolutions.filter(res => 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === 'no') {
        const numA = parseInt(a.no);
        const numB = parseInt(b.no);
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }

      if (sortKey === 'date') {
        const dateA = new Date(a.date.split('/').reverse().join('-')).getTime();
        const dateB = new Date(b.date.split('/').reverse().join('-')).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (sortOrder === 'asc') {
        return valA.localeCompare(valB);
      } else {
        return valB.localeCompare(valA);
      }
    });

    return result;
  }, [searchQuery, sortKey, sortOrder]);

  return (
    <div className="pt-6 sm:pt-8 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="mb-16 relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="w-12 h-1 bg-gold-500 rounded-full" />
          <span className="text-sm font-black text-gold-500 uppercase tracking-[0.3em]">Legislative Archive</span>
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-8">
          Resolutions
        </h1>
        <p className="text-xl text-gray-500 font-medium max-w-3xl leading-relaxed">
          Official resolutions passed by the Sangguniang Bayan of Talibon. Explore our legislative records, search by topic, or filter by date.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-12 flex flex-col md:flex-row gap-6 items-stretch">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search by resolution number, title, or author..."
            className="w-full pl-14 pr-8 py-5 bg-white border-2 border-gray-100 rounded-2xl text-base font-bold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-5 bg-white border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm">
            <Filter size={18} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-6 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Modern Table Layout */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/5 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading Resolutions...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th 
                  className="px-8 py-6 cursor-pointer group"
                  onClick={() => handleSort('no')}
                >
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-blue-600 transition-colors">
                    Resolution No.
                    <ArrowUpDown size={12} className={sortKey === 'no' ? 'text-blue-600' : 'opacity-0 group-hover:opacity-100'} />
                  </div>
                </th>
                <th 
                  className="px-8 py-6 cursor-pointer group"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-blue-600 transition-colors">
                    Date Approved
                    <ArrowUpDown size={12} className={sortKey === 'date' ? 'text-blue-600' : 'opacity-0 group-hover:opacity-100'} />
                  </div>
                </th>
                <th className="px-8 py-6">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Author / Sponsored By
                  </div>
                </th>
                <th 
                  className="px-8 py-6 cursor-pointer group"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-blue-600 transition-colors">
                    Titles of Resolutions
                    <ArrowUpDown size={12} className={sortKey === 'title' ? 'text-blue-600' : 'opacity-0 group-hover:opacity-100'} />
                  </div>
                </th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filteredAndSortedResolutions.length > 0 ? (
                  filteredAndSortedResolutions.map((res, idx) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={res.no}
                      className="group hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-8 py-8">
                        <span className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                          {res.no}
                        </span>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <Calendar size={14} className="text-gray-300" />
                          {res.date}
                        </div>
                      </td>
                      <td className="px-8 py-8 max-w-xs">
                        <div className="text-xs font-bold text-gray-600 leading-relaxed">
                          {res.author || <span className="text-gray-300 italic">N/A</span>}
                        </div>
                      </td>
                      <td className="px-8 py-8 max-w-md">
                        <h3 className="text-sm font-black text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                          {res.title}
                        </h3>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <button className="p-3 bg-gray-50 rounded-xl text-gray-300 group-hover:text-blue-600 group-hover:bg-blue-100 transition-all">
                          <FileText size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Search size={48} className="text-gray-200" />
                        <p className="text-lg font-black text-gray-400 uppercase tracking-widest">
                          No resolutions found matching your search.
                        </p>
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="text-sm font-bold text-blue-600 hover:underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Mobile View (Cards) */}
      <div className="lg:hidden mt-8 space-y-4">
        {filteredAndSortedResolutions.map((res) => (
          <div key={res.no} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                No. {res.no}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {res.date}
              </span>
            </div>
            <h3 className="text-base font-black text-gray-900 mb-4 leading-tight">
              {res.title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 truncate max-w-[200px]">
                <User size={12} />
                {res.author || 'N/A'}
              </div>
              <button className="p-2 bg-gray-50 rounded-lg text-blue-600">
                <FileText size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResolutionsPage;
