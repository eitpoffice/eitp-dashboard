"use client";
import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { useAdmin } from '@/context/AdminContext';
import { Zap, Mic, Code, Award, Calendar, Megaphone, ChevronDown, ChevronUp, Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const slowFadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
};

// HELPER: Format dates to short readable strings (e.g., "Mar 01, 2026")
const formatReadableDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString('default', { month: 'short', day: '2-digit', year: 'numeric' });
};

function EventCard({ event, style, status }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = style.icon;

  const isRunning = status === 'running';
  const isUpcoming = status === 'upcoming';

  // Use the new dates or fallback to the old 'date'
  const displayStartDateStr = event.start_date || event.date;
  const displayEndDateStr = event.deadline || event.start_date || event.date;

  const displayStartDate = new Date(displayStartDateStr);

  return (
    <motion.div 
      layout
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={slowFadeUp}
      className={`bg-white p-8 rounded-[2rem] shadow-sm border transition-all duration-500 group relative overflow-hidden ${
        isRunning ? 'border-red-200 ring-2 ring-red-500/10' : 
        isUpcoming ? 'border-blue-200 ring-2 ring-blue-500/5' : 
        'border-slate-200 opacity-90'
      }`}
    >
      {/* Visual Indicator for Status */}
      <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
        isRunning ? 'bg-red-600 text-white' :
        isUpcoming ? 'bg-blue-600 text-white' : 
        'bg-slate-100 text-slate-500'
      }`}>
        {isRunning ? <><PlayCircle size={12} className="animate-pulse"/> Running Today</> : 
         isUpcoming ? <><Clock size={12}/> Upcoming</> : 
         <><CheckCircle2 size={12}/> Completed</>}
      </div>

      <div className="flex flex-col md:flex-row gap-8 relative z-10 pt-4 md:pt-0">
        
        {/* Date Badge (Shows Start Date) */}
        <div className={`shrink-0 flex md:flex-col items-center justify-center w-full md:w-24 h-20 md:h-32 rounded-2xl border text-center px-4 shadow-inner ${
          isRunning ? 'bg-red-50 border-red-100' :
          isUpcoming ? 'bg-blue-50 border-blue-100' : 
          'bg-slate-50 border-slate-100'
        }`}>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">
            {displayStartDate.toLocaleString('default', { month: 'short' })}
          </span>
          <span className={`text-4xl font-black ${isRunning ? 'text-red-600' : isUpcoming ? 'text-blue-600' : 'text-slate-800'}`}>
            {displayStartDate.getDate()}
          </span>
        </div>

        {/* Content Section */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${style.bg} ${style.color} ${style.border}`}>
              <Icon size={14} /> {event.type || 'General'}
            </div>
            
            {/* NEW: Displays the full date range if it spans multiple days */}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Calendar size={12} />
              {formatReadableDate(displayStartDateStr)} 
              {displayEndDateStr && displayEndDateStr !== displayStartDateStr ? ` to ${formatReadableDate(displayEndDateStr)}` : ''}
            </span>
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
            {event.title}
          </h3>
          
          <div className="relative">
            {/* NEW: whitespace-pre-wrap added to respect admin's paragraph formatting */}
            <p className={`text-slate-600 leading-relaxed text-base transition-all duration-500 whitespace-pre-wrap ${!isExpanded ? 'max-h-20 overflow-hidden line-clamp-3' : 'max-h-[1000px]'}`}>
              {event.description}
            </p>
            {!isExpanded && event.description?.length > 150 && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
            )}
          </div>

          {event.description?.length > 150 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors group/btn"
            >
              {isExpanded ? (
                <>Show Less <ChevronUp size={16} className="group-hover/btn:-translate-y-1 transition-transform" /></>
              ) : (
                <>More Details <ChevronDown size={16} className="group-hover/btn:translate-y-1 transition-transform" /></>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ActivitiesPage() {
  const { events = [] } = useAdmin(); 
  const [isMounted, setIsMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); 

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- UPDATED SORTING AND FILTERING LOGIC ---
  const filteredAndSortedEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    // Clean and sort events by start_date (newest first)
    let processed = [...events].sort((a, b) => {
      const timeA = new Date(a.start_date || a.date).getTime();
      const timeB = new Date(b.start_date || b.date).getTime();
      return timeB - timeA;
    });

    return processed.filter(e => {
      const startDateStr = e.start_date || e.date;
      const endDateStr = e.deadline || e.start_date || e.date;

      if (!startDateStr) return false;

      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      const startTime = start.getTime();

      const end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);
      const endTime = end.getTime();

      if (activeFilter === 'running') return todayTime >= startTime && todayTime <= endTime;
      if (activeFilter === 'upcoming') return todayTime < startTime;
      if (activeFilter === 'completed') return todayTime > endTime;
      return true; // 'all'
    });
  }, [events, activeFilter]);

  // --- UPDATED STATUS CHECKER ---
  const getEventStatus = (eventObj) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const startDateStr = eventObj.start_date || eventObj.date;
    const endDateStr = eventObj.deadline || eventObj.start_date || eventObj.date;

    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    const startTime = start.getTime();

    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);
    const endTime = end.getTime();

    if (todayTime >= startTime && todayTime <= endTime) return 'running';
    if (todayTime < startTime) return 'upcoming';
    return 'completed';
  };

  const getTypeStyles = (type) => {
    switch (type?.toLowerCase()) {
      case 'workshop': return { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' };
      case 'hackathon': return { icon: Code, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' };
      case 'seminar': return { icon: Mic, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
      case 'placement': return { icon: Award, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' };
      default: return { icon: Calendar, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' };
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />
      
      <motion.div initial="hidden" animate="visible" variants={slowFadeUp} className="pt-40 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Activities</h1>
        <p className="text-slate-500 mt-6 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
           Bridging the gap between RGUKT and the industry.
        </p>

        {/* --- FILTER TABS --- */}
        <div className="mt-12 flex flex-wrap justify-center p-1 bg-slate-200/50 w-fit mx-auto rounded-2xl border border-slate-200 shadow-inner">
          {['all', 'running', 'upcoming', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-6 md:px-8 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeFilter === tab 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 space-y-8">
        <AnimatePresence mode='popLayout'>
          {isMounted && filteredAndSortedEvents.length > 0 ? (
            filteredAndSortedEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                style={getTypeStyles(event.type)} 
                status={getEventStatus(event)} // Fixed to pass the full object
              />
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
              <Megaphone size={40} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-900 font-black text-xl uppercase tracking-tighter">No items found</p>
              <p className="text-slate-400 text-sm mt-2 font-medium">Try switching to another category.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
