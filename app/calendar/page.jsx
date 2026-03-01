"use client";
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useAdmin } from '@/context/AdminContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Tag, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- HELPER: FORMAT LINKS ---
const formatTextWithLinks = (text) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={i} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-500 font-bold hover:text-blue-700 underline underline-offset-2 transition-colors break-all"
          onClick={(e) => e.stopPropagation()} 
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

/* --- CUSTOM COMPONENT: EXPANDABLE DESCRIPTION --- */
function ExpandableDescription({ text }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = text?.length > 150;

  return (
    <div className="mt-2">
      <div className="relative">
        <p className={`text-xs text-slate-500 leading-relaxed whitespace-pre-wrap transition-all duration-300 ${!isExpanded && isLong ? 'max-h-[3.5rem] overflow-hidden' : 'max-h-[1000px]'}`}>
          {formatTextWithLinks(text)}
        </p>
        {!isExpanded && isLong && (
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        )}
      </div>
      
      {isLong && (
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsExpanded(!isExpanded); }}
          className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isExpanded ? <>View Less <ChevronUp size={12}/></> : <>View More <ChevronDown size={12}/></>}
        </button>
      )}
    </div>
  );
}

// --- HELPER: COLOR CODING BY EVENT TYPE ---
const getTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'workshop': return { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-500' };
    case 'hackathon': return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-500' };
    case 'seminar': return { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500', border: 'border-yellow-500' };
    case 'placement': return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-500' };
    default: return { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500', border: 'border-slate-500' };
  }
};

/* --- SLOW ANIMATION VARIANTS --- */
const slowFadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 1.2, ease: "easeOut" } 
  }
};

export default function CalendarPage() {
  const { events = [] } = useAdmin();
  
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState('all'); 
  const [activeEventId, setActiveEventId] = useState(null); // Tracks the currently clicked event

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper to get days in month
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  // Navigation
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const jumpToToday = () => {
    setCurrentDate(new Date());
    setSelectedFilter('all');
    setActiveEventId(null);
  };

  const today = new Date(); 
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  // --- 1. FILTER & SORT LOGIC ---
  const filteredEvents = events.filter(event => {
    if (!isMounted) return true; 
    
    const startStr = event.start_date || event.date;
    if (!startStr) return false;

    const eventStart = new Date(startStr);
    eventStart.setHours(0, 0, 0, 0);
    
    const endStr = event.deadline || event.start_date || event.date;
    const eventEnd = new Date(endStr);
    eventEnd.setHours(23, 59, 59, 999);

    if (selectedFilter === 'upcoming') return eventStart.getTime() > todayTime;
    if (selectedFilter === 'past') return eventEnd.getTime() < todayTime;
    return true; // 'all'
  }).sort((a, b) => {
    const timeA = new Date(a.start_date || a.date).getTime();
    const timeB = new Date(b.start_date || b.date).getTime();
    if (selectedFilter === 'upcoming') return timeA - timeB; // Closest upcoming first
    return timeB - timeA; // Newest first
  });

  // Calendar Grid Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  // --- 2. EXACT START DATE CALENDAR LOGIC ---
  const getEventsForDay = (day) => {
    const targetDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return events.filter(e => {
      const startStr = e.start_date || e.date;
      return startStr === targetDateString; // EXACT MATCH ONLY
    });
  };

  // --- 3. CLICK-TO-SCROLL & HIGHLIGHT LOGIC ---
  const scrollToEvent = (eventId) => {
    setSelectedFilter('all'); 
    setActiveEventId(eventId);
    
    setTimeout(() => {
      const el = document.getElementById(`event-${eventId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Helper: Format date range for the List View
  const renderDateRange = (event) => {
    const startStr = event.start_date || event.date;
    const endStr = event.deadline || event.start_date || event.date;
    if (!startStr) return "No Date";
    
    const formatOpts = { month: 'short', day: 'numeric', year: 'numeric' };
    let result = new Date(startStr).toLocaleDateString('default', formatOpts);
    
    if (endStr && endStr !== startStr) {
      result += ` - ${new Date(endStr).toLocaleDateString('default', formatOpts)}`;
    }
    return result;
  };

  if (!isMounted) return null; 

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <motion.div 
        initial="hidden" animate="visible" variants={slowFadeUp}
        className="pt-32 pb-12 bg-slate-900 text-white text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full"></div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold relative z-10 tracking-tight">Academic Calendar</h1>
        <p className="text-slate-300 mt-4 max-w-2xl mx-auto relative z-10 text-lg font-medium">
          Stay updated with workshops, placement drives, and tech fests happening at RGUKT - AP.
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* --- LEFT: CALENDAR WIDGET --- */}
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: false }} variants={slowFadeUp}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-slate-50/50 p-6 flex flex-col sm:flex-row justify-between items-center border-b border-slate-100 gap-4">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><CalendarIcon size={24} /></div>
                {monthName} {year}
              </h2>
              <div className="flex items-center gap-3">
                <button onClick={jumpToToday} className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  Today
                </button>
                <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                  <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-blue-600 transition"><ChevronLeft size={20}/></button>
                  <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-blue-600 transition"><ChevronRight size={20}/></button>
                </div>
              </div>
            </div>

            {/* Days Grid */}
            <div className="p-6">
              <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2 md:gap-3">
                {emptyDays.map(i => <div key={`empty-${i}`} className="h-24 md:h-32 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100"></div>)}
                
                {daysArray.map(day => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = isMounted && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  
                  return (
                    <div 
                      key={day} 
                      onClick={() => dayEvents.length > 0 && scrollToEvent(dayEvents[0].id)}
                      className={`h-24 md:h-32 rounded-2xl border flex flex-col items-start justify-start p-2 transition-all duration-300 relative group overflow-hidden
                        ${isToday ? 'bg-blue-50/50 border-blue-200 shadow-inner' : 'bg-white border-slate-100'}
                        ${dayEvents.length > 0 ? 'cursor-pointer hover:border-blue-400 hover:shadow-lg hover:-translate-y-1' : ''}
                      `}
                    >
                      <span className={`text-sm font-bold mb-1 ml-1 ${isToday ? 'text-blue-600 bg-blue-100 w-7 h-7 flex items-center justify-center rounded-full shadow-sm' : 'text-slate-700 mt-1'}`}>
                        {day}
                      </span>
                      
                      {/* --- EVENT NAME DISPLAY --- */}
                      <div className="w-full flex flex-col gap-1.5 overflow-y-auto custom-scrollbar px-1 pb-1">
                        {dayEvents.map((evt, idx) => {
                          const colors = getTypeColor(evt.type);
                          return (
                            <div 
                              key={idx} 
                              title={evt.title}
                              onClick={(e) => { e.stopPropagation(); scrollToEvent(evt.id); }}
                            >
                               {/* Desktop/Tablet: Show Title */}
                               <div className={`hidden md:block w-full text-[10px] font-bold ${colors.bg} ${colors.text} px-2 py-1.5 rounded-lg truncate border-l-2 ${colors.border} hover:opacity-80 transition-opacity`}>
                                 {evt.title}
                               </div>
                               {/* Mobile: Show Dot */}
                               <div className={`md:hidden w-2.5 h-2.5 ${colors.dot} rounded-full mx-auto mt-1 shadow-sm`}></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- RIGHT: EVENTS LIST --- */}
        <motion.div 
           initial="hidden" whileInView="visible" viewport={{ once: false }} variants={slowFadeUp}
        >
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-between">
              Event Details
              <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1.5 rounded-full font-black uppercase tracking-widest shadow-sm">
                {filteredEvents.length} Events
              </span>
            </h3>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6 shadow-inner">
              {['all', 'upcoming', 'past'].map(filter => (
                <button
                  key={filter}
                  onClick={() => { setSelectedFilter(filter); setActiveEventId(null); }}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${
                    selectedFilter === filter ? 'bg-white text-slate-900 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Scrollable List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const eventEndStr = event.deadline || event.start_date || event.date;
                  const isPast = new Date(eventEndStr).getTime() < todayTime;
                  const isActive = activeEventId === event.id;
                  const colors = getTypeColor(event.type);

                  return (
                    <motion.div 
                      key={event.id}
                      id={`event-${event.id}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }} 
                      className={`p-5 rounded-2xl border transition-all duration-500 group scroll-mt-24 relative overflow-hidden
                        ${isActive ? `bg-white border-${colors.border.split('-')[1]}-400 shadow-xl scale-[1.02] ring-4 ring-${colors.border.split('-')[1]}-50` : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'}
                      `}
                    >
                      {/* Active Indicator Bar */}
                      {isActive && <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${colors.dot}`}></div>}

                      <div className="flex justify-between items-start mb-3">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${colors.bg} ${colors.text} ${colors.border}`}>
                            {event.type || 'Event'}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                            isPast ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700'
                          }`}>
                            {isPast ? 'Completed' : 'Upcoming'}
                          </span>
                      </div>
                      
                      <h4 className={`font-black text-lg mb-2 leading-tight transition-colors ${isActive ? 'text-slate-900' : 'text-slate-800 group-hover:text-blue-600'}`}>
                        {event.title}
                      </h4>
                      
                      <div className="flex flex-col gap-2 text-[11px] font-bold text-slate-500 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                         <div className="flex items-center">
                            <Clock size={14} className="mr-2 text-slate-400"/> 
                            <span className="uppercase tracking-wide">{renderDateRange(event)}</span>
                         </div>
                      </div>

                      <ExpandableDescription text={event.description || "Detailed information regarding this event will be shared shortly."} />
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                   <Star size={32} className="mx-auto text-slate-300 mb-3" />
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">No events found.</p>
                </div>
              )}
            </div>

          </div>
        </motion.div>

      </div>
    </main>
  );
}
