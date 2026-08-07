import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, Users, Database, Search, 
  BarChart3, Activity, FileCheck, Landmark, 
  GraduationCap, Settings, ChevronRight, Info,
  Globe, UserPlus, ExternalLink
} from 'lucide-react';
import GadEntryModule from './GadEntryModule';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell 
} from 'recharts';

interface SubSection {
  subTitle: string;
  items: string[];
}

interface Section {
  id: string;
  title: string;
  content: SubSection[];
}

interface GadImsData {
  title: string;
  subtitle: string;
  sections: Section[];
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  overview: <Info size={18} />,
  governance: <Landmark size={18} />,
  "data-entry": <UserPlus size={18} />,
  "data-modules": <Database size={18} />,
  analysis: <Search size={18} />,
  budgeting: <BarChart3 size={18} />,
  me: <Activity size={18} />,
  reporting: <ClipboardList size={18} />,
  barangay: <Users size={18} />,
  knowledge: <GraduationCap size={18} />,
  admin: <Settings size={18} />,
  annexes: <FileCheck size={18} />,
};

const MOCK_CHART_DATA = [
  { name: 'Health', value: 400, color: '#2563eb' },
  { name: 'Education', value: 300, color: '#3b82f6' },
  { name: 'Economy', value: 300, color: '#60a5fa' },
  { name: 'Governance', value: 200, color: '#93c5fd' },
];

const MOCK_BAR_DATA = [
  { year: '2021', budget: 45 },
  { year: '2022', budget: 52 },
  { year: '2023', budget: 61 },
  { year: '2024', budget: 75 },
];

const GadImsSystem: React.FC<{ data: GadImsData }> = ({ data }) => {
  const [activeTab, setActiveTab] = useState(data?.sections?.[0]?.id || "overview");

  // Inject Data Entry tab if not in data sections
  const sections = data?.sections ? [
    ...data.sections.slice(0, 2),
    { id: 'data-entry', title: '03. Individual Profiling', content: [] },
    ...data.sections.slice(2)
  ] : [];

  if (!data?.sections || data.sections.length === 0) {
    return (
      <div className="p-12 text-center bg-gray-50 rounded-[2rem] border border-brand-border">
        <Database size={48} className="mx-auto text-brand-muted mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-brand-text mb-2 tracking-tight">GAD-IMS Database Offline</h3>
        <p className="text-sm text-brand-muted font-medium max-w-md mx-auto">
          The Gender and Development Integrated Management System data has not been seeded yet. 
          Please contact the system administrator to initialize the GAD database.
        </p>
      </div>
    );
  }

  const activeSection = sections.find(s => s.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Top Call-to-Action Banner for External GAD-IMS System */}
      <div className="py-2 px-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-1.5 text-brand-primary text-[11px] font-extrabold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live System Available
          </div>
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-brand-text font-display">
            Access GAD-IMS Portal
          </h2>
          <p className="text-xs text-brand-muted font-medium leading-relaxed">
            Open the GAD-IMS Management System for real-time gender profiling, budget tracking, and governance reports.
          </p>
        </div>
        <a
          href="https://tagad-sys.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-brand-primary font-bold text-xs uppercase tracking-wider underline underline-offset-4 hover:text-brand-primary/80 transition-colors py-1 shrink-0"
        >
          <span>Access GAD-IMS</span>
          <ExternalLink size={14} className="shrink-0" />
        </a>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 bg-brand-surface border border-brand-border rounded-2xl p-4 lg:p-6 shadow-xs relative overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
          <div className="px-1 py-1 space-y-1.5 pb-2">
            <h2 className="text-sm font-bold leading-tight uppercase tracking-tight text-brand-text font-display">Talibon GAD-IMS</h2>
            <p className="text-[10px] font-medium text-brand-muted uppercase tracking-wider leading-relaxed">
              Mainstreaming Gender-Responsive Governance through Data
            </p>
            <div className="pt-0.5">
              <a
                href="https://tagad-sys.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-primary font-bold text-xs uppercase tracking-wider underline underline-offset-4 hover:text-brand-primary/80 transition-colors"
              >
                <span>Access GAD-IMS</span>
                <ExternalLink size={13} className="shrink-0" />
              </a>
            </div>
          </div>
        
        <nav className="flex flex-col gap-1 p-1.5 bg-brand-bg rounded-xl border border-brand-border/50">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all text-left relative group ${
                activeTab === section.id 
                  ? 'bg-brand-bg text-brand-text shadow-xs border border-brand-border' 
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg/50'
              }`}
            >
              <span className={`transition-colors p-1.5 rounded-md ${activeTab === section.id ? 'bg-brand-primary text-white' : 'bg-brand-bg text-brand-muted group-hover:bg-brand-surface transition-all'}`}>
                {SECTION_ICONS[section.id] || <ChevronRight size={14} />}
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider leading-none">
                  {section.title.split('. ')[1] || section.title}
                </span>
              </div>
              {activeTab === section.id && (
                <motion.div 
                  layoutId="active-nav-bg"
                  className="absolute left-1 w-1 h-5 bg-brand-primary rounded-full"
                />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex-1 flex flex-col gap-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-brand-border relative">
              <div className="space-y-1 max-w-xl">
                <h1 className="text-xl md:text-2xl font-bold text-brand-text uppercase tracking-tight leading-tight">
                  {activeSection?.title}
                </h1>
                <p className="text-xs text-brand-muted font-medium">
                  Open the GAD-IMS Management System
                </p>
              </div>
              <a
                href="https://tagad-sys.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-primary font-bold text-xs uppercase tracking-wider underline underline-offset-4 hover:text-brand-primary/80 transition-colors py-1 shrink-0"
              >
                <span>Access GAD-IMS</span>
                <ExternalLink size={14} className="shrink-0" />
              </a>
            </div>

            {/* Dashboard Visualization Overlay (Optional based on section) */}
            {activeTab === 'reporting' || activeTab === 'budgeting' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-brand-bg border border-brand-border rounded-xl relative overflow-hidden">
                <div className="space-y-4 relative z-10">
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-brand-muted">System Dashboard / Metrics</h4>
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MOCK_BAR_DATA}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }}
                        />
                        <Bar dataKey="budget" fill="#3A8FC2" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="space-y-4 relative z-10">
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-brand-muted">Gender Sector Distribution</h4>
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={MOCK_CHART_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {MOCK_CHART_DATA.map((entry, index) => (
                            <Cell key={`recharts-pie-cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {MOCK_CHART_DATA.map(d => (
                      <div key={`chart-legend-${d.name}`} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[8px] font-bold uppercase tracking-wider text-brand-muted">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === 'data-entry' ? (
              <div className="flex-1 mt-2">
                <GadEntryModule />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {activeSection?.content.map((sub, idx) => (
                  <motion.div 
                    key={`gad-subsection-${idx}`} 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="relative z-10">
                      <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider pb-3 mb-4 border-b border-brand-border flex items-center justify-between">
                        {sub.subTitle}
                      </h3>
                      <ul className="space-y-3">
                        {sub.items.map((item, i) => (
                          <li key={`gad-item-${idx}-${i}`} className="flex gap-3 text-xs text-brand-muted font-medium leading-relaxed group/item">
                            <div className="mt-1 flex flex-col items-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary group-hover/item:scale-125 transition-transform shrink-0" />
                              <div className="w-px h-full bg-brand-border/60 mt-1" />
                            </div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-[0.03] group-hover:scale-105 transition-transform duration-700">
                      <Database size={80} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Background Narrative Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none">
              {activeTab && SECTION_ICONS[activeTab] && (
                <div className="scale-[15]">
                  {SECTION_ICONS[activeTab]}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  </div>
);
};

export default GadImsSystem;
