import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Building2,
  FileText,
  MapPin,
  Calendar,
  Newspaper,
  CloudSun,
  ShieldAlert,
  PhoneCall,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  id: string;
  role: "bot" | "user";
  text: string;
  route?: string;
  actionText?: string;
  timestamp: string;
}

interface ChatbotIntent {
  id: string;
  category: string;
  icon: React.ReactNode;
  keywords: string[];
  title: string;
  response: string;
  route?: string;
  actionText?: string;
  sampleQuestion: string;
}

const CHATBOT_INTENTS: ChatbotIntent[] = [
  {
    id: "mayor_office",
    category: "🏛️ Municipal Services",
    icon: <Building2 size={14} />,
    keywords: ["mayor", "office", "executive", "janette", "garcia", "administration", "leadership", "governor", "official"],
    title: "Mayor & Executive Office",
    response: "You can find information about Hon. Mayor Janette A. Garcia and the executive leadership under Executive Mandate, or view the historical list of mayors under About Talibon.",
    route: "/about/mayors",
    actionText: "View List of Mayors",
    sampleQuestion: "Where can I find information about the Mayor?"
  },
  {
    id: "e_services",
    category: "🏛️ Municipal Services",
    icon: <Building2 size={14} />,
    keywords: ["service", "services", "e-services", "permit", "permits", "business", "building", "zoning", "clearance", "online", "application"],
    title: "Online Municipal Services",
    response: "You can access available online municipal services, digital application portals, business permits, building clearances, and zoning forms through our E-Services section.",
    route: "/e-services",
    actionText: "Access E-Services",
    sampleQuestion: "How do I apply for a business or building permit?"
  },
  {
    id: "certificates_forms",
    category: "📄 Certificates & Documents",
    icon: <FileText size={14} />,
    keywords: ["certificate", "certificates", "form", "forms", "document", "documents", "download", "downloads", "charter", "requirements", "paperwork"],
    title: "Downloadable Forms & Citizen Charter",
    response: "You can browse downloadable municipal forms, business registration guidelines, and Citizen's Charter service requirements in the Downloads and Transparency sections.",
    route: "/downloads",
    actionText: "Browse Downloads",
    sampleQuestion: "Where can I download municipal forms?"
  },
  {
    id: "tourism_spots",
    category: "🌴 Tourism",
    icon: <MapPin size={14} />,
    keywords: ["tourist", "tourism", "spot", "spots", "visit", "destination", "destinations", "danajon", "reef", "beach", "cathedral", "place", "places", "attraction", "suroy"],
    title: "Tourist Destinations",
    response: "Discover Talibon's premier tourist spots, including the Blessed Trinity Cathedral, Danajon Bank double barrier reef, coastal promenades, and island resorts in our Tourism section.",
    route: "/tourism/spots",
    actionText: "Explore Tourist Spots",
    sampleQuestion: "What tourist spots can I visit in Talibon?"
  },
  {
    id: "festivals_delicacies",
    category: "🎉 Festivals & Events",
    icon: <Calendar size={14} />,
    keywords: ["festival", "festivals", "festivities", "fiesta", "celebration", "delicacy", "delicacies", "seafood", "food", "eat", "event", "events", "parade"],
    title: "Festivities & Local Delicacies",
    response: "Talibon is celebrated as the Seafood Capital of Bohol! Learn about our annual patronal festivities and mouth-watering marine delicacies on our Tourism pages.",
    route: "/tourism/festivities",
    actionText: "View Festivities",
    sampleQuestion: "When are the festivals in Talibon?"
  },
  {
    id: "news_articles",
    category: "📰 News & Updates",
    icon: <Newspaper size={14} />,
    keywords: ["news", "update", "updates", "article", "articles", "press", "release", "orts", "announcement", "bulletin"],
    title: "LGU News & ORTS Updates",
    response: "Stay informed with official press releases, municipal accomplishment reports, and ORTS updates directly from the Talibon Public Information Office.",
    route: "/news/articles",
    actionText: "Read LGU News",
    sampleQuestion: "Where can I read the latest LGU news?"
  },
  {
    id: "weather_advisories",
    category: "🌦️ Weather & Advisories",
    icon: <CloudSun size={14} />,
    keywords: ["weather", "forecast", "rain", "storm", "typhoon", "climate", "sea", "condition", "advisory", "advisories", "alert", "warning", "emergency"],
    title: "Weather & Public Advisories",
    response: "Check current local weather reports on the homepage. For official emergency advisories, utility maintenance alerts, and disaster warnings, visit Public Advisories.",
    route: "/news/advisories",
    actionText: "View Public Advisories",
    sampleQuestion: "Where can I check weather and advisories?"
  },
  {
    id: "maps_location",
    category: "🗺️ Maps & Locations",
    icon: <MapPin size={14} />,
    keywords: ["map", "maps", "location", "locations", "interactive", "where", "vicinity", "directions", "address", "barangay", "barangays", "find"],
    title: "Interactive Tourism & Vicinity Map",
    response: "Use our Interactive Tourism Map to locate municipal offices, health centers, hospitals, historical sites, and tourist landmarks across Talibon.",
    route: "/tourism/map",
    actionText: "Open Interactive Map",
    sampleQuestion: "Where can I find an interactive map of Talibon?"
  },
  {
    id: "contact_lgu",
    category: "📞 Contact the LGU",
    icon: <PhoneCall size={14} />,
    keywords: ["contact", "phone", "email", "reach", "call", "inquire", "inquiry", "address", "poblacion", "hall", "directory"],
    title: "Contact LGU Talibon",
    response: "You can reach the Municipality of Talibon through the Municipal Directory or visit the Municipal Hall located at Poblacion, Talibon, Bohol, Philippines.",
    route: "/executive/directory",
    actionText: "View Department Directory",
    sampleQuestion: "How do I contact LGU offices?"
  },
  {
    id: "about_talibon",
    category: "ℹ️ About Talibon",
    icon: <Info size={14} />,
    keywords: ["about", "history", "profile", "seal", "hymn", "demographics", "population", "industry", "bohol", "seafood", "capital"],
    title: "About Municipality of Talibon",
    response: "Learn about Talibon's brief history, official seal, municipal hymn, demographic profiles, and economic industries under the About section.",
    route: "/about/profile",
    actionText: "About Talibon",
    sampleQuestion: "Tell me about Talibon's profile and history."
  }
];

const INITIAL_BOT_MESSAGE: ChatMessage = {
  id: "init-1",
  role: "bot",
  text: "Mabuhay! I am your Talibon Digital Assistant. How can I assist you today? Select a suggested topic below or type your question.",
  timestamp: "Just now"
};

export default function MunicipalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_BOT_MESSAGE]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const matchIntent = (query: string): ChatbotIntent | null => {
    const cleanQuery = query.toLowerCase().replace(/[^\w\s]/gi, "");
    const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);

    let bestIntent: ChatbotIntent | null = null;
    let maxScore = 0;

    for (const intent of CHATBOT_INTENTS) {
      let score = 0;
      for (const keyword of intent.keywords) {
        if (cleanQuery.includes(keyword)) {
          score += 3;
        }
        for (const word of words) {
          if (keyword.includes(word) || word.includes(keyword)) {
            score += 1;
          }
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent;
      }
    }

    return maxScore >= 2 ? bestIntent : null;
  };

  const handleSend = (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText) return;

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const intent = matchIntent(queryText);

    let botMsg: ChatMessage;

    if (intent) {
      botMsg = {
        id: "bot-" + Date.now(),
        role: "bot",
        text: intent.response,
        route: intent.route,
        actionText: intent.actionText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } else {
      botMsg = {
        id: "bot-" + Date.now(),
        role: "bot",
        text: "I'm sorry, I don't have an exact answer for that yet. Try selecting one of the topics below or ask about municipal services, tourism, certificates, news, weather, or contact info!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    setMessages((prev) => [...prev, userMsg, botMsg]);
    if (!textToSend) setInput("");
  };

  const handleReset = () => {
    setMessages([INITIAL_BOT_MESSAGE]);
    setInput("");
  };

  const handleNavigate = (route?: string) => {
    if (route) {
      navigate(route);
      // On small screens, close the chat panel after navigating
      if (window.innerWidth < 640) {
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-[90]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-brand-primary text-white p-4 sm:p-4 rounded-full shadow-2xl hover:shadow-brand-primary/40 flex items-center gap-3 group transition-all border border-white/20"
          aria-label="Open Municipal Assistant Chat"
        >
          <div className="relative">
            <Bot size={24} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-brand-primary rounded-full animate-pulse" />
          </div>
          <span className="hidden md:inline-block font-black text-xs uppercase tracking-wider pr-1">
            Talibon Assistant
          </span>
        </motion.button>
      </div>

      {/* Compact Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-[95] w-[calc(100vw-1.5rem)] sm:w-96 md:w-[420px] h-[520px] sm:h-[580px] bg-white rounded-[2rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-text via-slate-900 to-brand-text text-white px-5 py-4 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary/20 border border-brand-primary/40 rounded-2xl flex items-center justify-center text-brand-accent">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight font-display flex items-center gap-1.5 text-white">
                    Talibon Assistant
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] rounded-full font-mono">Rule-Based</span>
                  </h3>
                  <p className="text-[10px] text-white/60 font-medium">Digital Navigation & Citizen Info</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  title="Reset Conversation"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  aria-label="Close Chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 mt-1 border border-brand-primary/20">
                      <Bot size={16} />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-2xs ${
                        msg.role === "user"
                          ? "bg-brand-primary text-white rounded-br-none"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {msg.route && msg.actionText && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100">
                          <button
                            onClick={() => handleNavigate(msg.route)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                          >
                            <span>{msg.actionText}</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-slate-400 font-mono px-1 block">
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Suggested Question Pills Bar */}
            <div className="p-2.5 bg-white border-t border-slate-100 overflow-x-auto shrink-0 flex gap-2 no-scrollbar">
              {CHATBOT_INTENTS.slice(0, 5).map((intent) => (
                <button
                  key={intent.id}
                  onClick={() => handleSend(intent.sampleQuestion)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-brand-primary/10 hover:text-brand-primary text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer shrink-0 border border-slate-200/60"
                >
                  {intent.category}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about mayor, tourism, forms, permits..."
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 font-medium"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-2.5 bg-brand-primary disabled:opacity-40 text-white rounded-xl hover:bg-brand-primary/90 transition-all cursor-pointer shrink-0"
                aria-label="Send query"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
