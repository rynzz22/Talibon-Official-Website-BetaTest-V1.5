import React from "react";
import { motion } from "motion/react";

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

interface HistoryViewProps {
  data: {
    content: string;
    timeline?: TimelineEvent[];
  };
}

export default function HistoryView({ data }: HistoryViewProps) {
  return (
    <div className="space-y-12">
      <p className="text-lg text-brand-muted leading-relaxed font-medium whitespace-pre-line bg-brand-primary/5 p-8 rounded-2xl border-l-4 border-brand-primary mb-16">
        {data.content}
      </p>
      
      <div className="relative max-w-4xl mx-auto pl-8 md:pl-0">
        {/* Timeline Line */}
        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-brand-border md:-translate-x-1/2" />
        
        <div className="space-y-24">
          {data.timeline?.map((event: TimelineEvent, idx: number) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className={`relative flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Timeline Dot */}
              <div className="absolute left-0 md:left-1/2 top-2 md:top-1/2 md:-translate-y-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-brand-primary border-4 border-white shadow-lg z-10" />
              
              <div className="w-full md:w-1/2 text-right">
                <div className={`space-y-2 ${idx % 2 === 0 ? 'md:text-left' : 'md:text-right'} pl-8 md:pl-0`}>
                  <span className="text-4xl font-black text-brand-primary/20 font-display italic tracking-tighter">
                    {event.year}
                  </span>
                  <h3 className="text-2xl font-black text-brand-text uppercase tracking-tight leading-none group-hover:text-brand-primary transition-colors">
                    {event.title}
                  </h3>
                </div>
              </div>
              
              <div className="w-full md:w-1/2">
                <div className="p-6 bg-white border border-brand-border rounded-2xl shadow-sm hover:shadow-md transition-all group">
                  <p className="text-sm text-brand-muted leading-relaxed font-medium">
                    {event.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
