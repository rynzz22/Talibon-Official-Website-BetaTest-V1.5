import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ArrowLeft, Loader2, Share2, Bookmark, Printer, ShieldCheck, Clock, Tag, Check, ArrowRight, Building2 } from 'lucide-react';
import { newsService } from '../services/newsService';
import { NewsItem } from '../services/cmsService';

const MOCK_NEWS_DETAILS: Record<string, NewsItem> = {
  "1": {
    id: "1",
    slug: "talibon-annual-festival-parade",
    title: "Talibon Celebrates Annual Festival with Vibrant Cultural Parade",
    content: "The vibrant coastal town of Talibon came alive today as the community celebrated its annual patronal festival. Local schools, civic organizations, and barangay groups lined the streets in spectacular costumes showcasing Boholano heritage and modern progress.\n\nThe municipal leadership commended the volunteers and security personnel for a safe and deeply enriching celebration that attracted tourists from neighboring towns.\n\nMayor and LGU officials highlighted that this year's festival emphasized coastal conservation and youth participation, setting a precedent for sustainable municipal cultural activities in the province.",
    summary: "The municipality of Talibon marks its historic community celebration with a spectacular parade highlighting local culture, heritage, and unity.",
    category: "Events",
    image_url: "https://picsum.photos/seed/festival/1200/800",
    date: new Date().toISOString(),
    author: "LGU Media Relations",
    status: "published"
  },
  "2": {
    id: "2",
    slug: "public-health-program-coastal-barangays",
    title: "New Public Health Program Launched for Coastal Barangays",
    content: "In an effort to bring quality healthcare directly to the community, the local government unit of Talibon launched 'LGU Kalusugan'. The program deploys a team of physicians, dentists, nurses, and pharmacists to remote island barangays.\n\nOver 500 residents received free physical checkups, dental extractions, diagnostic screenings, and maintenance medicines during the first leg of the mission.\n\nThe Municipal Health Office (MHO) announced that monthly schedules for coastal health visits will now be posted across all municipal communication channels and barangay halls.",
    summary: "LGU Talibon extends comprehensive medical services, checkups, and educational seminars to remote island and coastal communities.",
    category: "Health",
    image_url: "https://picsum.photos/seed/health/1200/800",
    date: new Date(Date.now() - 86400000).toISOString(),
    author: "LGU Health Division",
    status: "published"
  },
  "3": {
    id: "3",
    slug: "sea-wall-extension-completion",
    title: "Infrastructure Update: Sea Wall Extension Nears Completion",
    date: new Date(Date.now() - 172800000).toISOString(),
    category: "Infrastructure",
    summary: "The defense infrastructure project along the coastal zone is on schedule, ensuring safety and climate resilience for shoreline residents.",
    content: "Construction of the 500-meter shoreline sea wall extension is now 90% complete, according to the municipal engineering office. This project aims to shield low-lying coastal neighborhoods from tidal surges during the typhoon season.\n\nLocal residents expressed their relief and gratitude, noting that the sea wall has already proven effective during high tides last month.\n\nThe Municipal Engineering Office confirms that final turn-over and ribbon cutting are slated for the upcoming month.",
    image_url: "https://picsum.photos/seed/infra/1200/800",
    author: "Municipal Engineering Office",
    status: "published"
  }
};

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        console.log(`[NewsDetailPage] Loading article for identifier: "${id}"`);
        const found = await newsService.getNewsById(id);
        if (found) {
          setItem(found);
        } else if (MOCK_NEWS_DETAILS[id]) {
          setItem(MOCK_NEWS_DETAILS[id]);
        } else {
          setItem(null);
        }
      } catch (err: any) {
        console.warn("[NewsDetailPage] Failed to fetch news detail:", err.message || err);
        setItem(MOCK_NEWS_DETAILS[id] || null);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
    window.scrollTo(0, 0);
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center min-h-[60vh] bg-slate-50">
        <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Article Details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="py-20 px-4 max-w-3xl mx-auto text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <Building2 size={32} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2 font-display uppercase tracking-tight">Article Not Found</h1>
        <p className="text-slate-600 mb-6 text-sm">The official release or article you requested could not be found or may have been updated.</p>
        <button 
          onClick={() => navigate('/news/articles')}
          className="px-6 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all inline-flex items-center gap-2 shadow-sm"
        >
          <ArrowLeft size={14} /> Back to News Hub
        </button>
      </div>
    );
  }

  // Calculate estimated reading time
  const wordCount = (item.content + " " + item.summary).split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Split content into clean paragraphs
  const paragraphs = item.content ? item.content.split(/\n+/).filter(p => p.trim().length > 0) : [];

  return (
    <div className="py-3 sm:py-5 bg-brand-bg min-h-screen">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16">
        
        {/* Navigation Breadcrumb & Badges */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-brand-border/60">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-text hover:text-sky-600 bg-white px-3 py-1.5 rounded-lg border border-brand-border shadow-2xs hover:border-sky-300 transition-all uppercase tracking-wider group"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform text-sky-600" />
            <span>Back to News & Updates</span>
          </button>

          <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Official LGU Public Update</span>
          </div>
        </div>

        {/* Full-Width Unboxed Article Layout */}
        <article className="space-y-5">
          
          {/* Article Header Section */}
          <div className="space-y-3">
            {/* Category Tag & Reading Time */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-sky-600 text-white rounded-md text-[9px] font-black uppercase tracking-widest shadow-2xs inline-flex items-center gap-1">
                <Tag size={10} />
                {item.category || "Official Release"}
              </span>

              <span className="text-[11px] font-bold text-brand-muted flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-md border border-brand-border">
                <Clock size={12} className="text-sky-600" />
                {readingTime} min read
              </span>
            </div>

            {/* Formal Headline - Refined & Compact */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-brand-text tracking-tight leading-tight font-display">
              {item.title}
            </h1>

            {/* Sub-headline / Executive Summary Callout */}
            {item.summary && (
              <p className="text-sm sm:text-base font-medium text-brand-muted leading-relaxed italic border-l-3 border-sky-600 pl-3 py-0.5">
                "{item.summary}"
              </p>
            )}

            {/* Author & Published Date Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-b border-brand-border/60 py-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-600/10 border border-sky-600/20 flex items-center justify-center text-sky-600 shrink-0">
                  <User size={15} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">ISSUED BY</p>
                  <p className="font-extrabold text-brand-text text-xs">{item.author || "Office of the Municipal Mayor"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-brand-text font-semibold text-xs">
                  <Calendar size={14} className="text-sky-600 shrink-0" />
                  <span>
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Article Tools */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleShare}
                    title="Copy Article Link"
                    className="p-1.5 text-brand-muted hover:text-sky-600 hover:bg-white rounded-md transition-colors border border-transparent hover:border-brand-border relative"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                    {copied && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900 text-white text-[9px] font-bold rounded shadow whitespace-nowrap">
                        Link Copied!
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setSaved(!saved)}
                    title="Bookmark Article"
                    className={`p-1.5 rounded-md transition-colors border border-transparent ${
                      saved ? 'text-amber-500 bg-amber-50 border-amber-200' : 'text-brand-muted hover:text-sky-600 hover:bg-white'
                    }`}
                  >
                    <Bookmark size={14} className={saved ? 'fill-amber-500' : ''} />
                  </button>

                  <button
                    onClick={handlePrint}
                    title="Print Official Document"
                    className="p-1.5 text-brand-muted hover:text-sky-600 hover:bg-white rounded-md transition-colors"
                  >
                    <Printer size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {item.image_url && (
            <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] min-h-[220px] max-h-[420px] overflow-hidden rounded-xl border border-brand-border shadow-xs bg-slate-900">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2 right-2 px-2.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-bold text-white tracking-wider uppercase">
                LGU Official Photo
              </div>
            </div>
          )}

          {/* Full-Width Article Content */}
          <div className="pt-1 space-y-4 max-w-none">
            <div className="text-brand-text text-sm sm:text-base leading-relaxed space-y-3.5 font-sans max-w-5xl">
              {paragraphs.map((p, idx) => (
                <p key={idx} className={`${idx === 0 ? "first-letter:text-2xl first-letter:font-black first-letter:text-sky-600 first-letter:mr-1.5 first-letter:float-left" : ""}`}>
                  {p}
                </p>
              ))}
            </div>

            {/* Official Verification Notice Bar */}
            <div className="mt-6 pt-4 border-t border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black text-[10px] shrink-0 shadow-2xs">
                  LGU
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-brand-text uppercase tracking-wider font-display">
                    Official Public Document
                  </h4>
                  <p className="text-[10px] text-brand-muted font-medium">
                    Published by LGU Talibon Public Information Office • Bohol, Philippines
                  </p>
                </div>
              </div>

              <a
                href="http://talibon.gov.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-black text-sky-600 hover:text-sky-700 uppercase tracking-widest inline-flex items-center gap-1 hover:underline"
              >
                <span>Official LGU Portal</span>
                <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </article>

        {/* Back Link at bottom */}
        <div className="mt-6 text-center pt-4 border-t border-brand-border/60">
          <Link
            to="/news/articles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-brand-border text-brand-text hover:text-sky-600 hover:border-sky-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xs"
          >
            <ArrowLeft size={14} />
            <span>View More LGU News & Bulletins</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default NewsDetailPage;

