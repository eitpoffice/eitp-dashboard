"use client";
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAdmin } from '@/context/AdminContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper to get days in month
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  // Navigation
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

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
    
    // If looking at upcoming, show closest future events first. Otherwise, show newest first.
    if (selectedFilter === 'upcoming') return timeA - timeB;
    return timeB - timeA;
  });

  // Calendar Grid Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  // --- 2. MULTI-DAY CALENDAR LOGIC ---
  const getEventsForDay = (day) => {
    const targetDate = new Date(year, month, day);
    targetDate.setHours(0, 0, 0, 0);
    const targetTime = targetDate.getTime();

    return events.filter(e => {
      const startStr = e.start_date || e.date;
      if (!startStr) return false;
      
      const start = new Date(startStr);
      start.setHours(0, 0, 0, 0);
      
      const endStr = e.deadline || e.start_date || e.date;
      const end = new Date(endStr);
      end.setHours(23, 59, 59, 999);
      
      // Check if this calendar day falls between the start and end dates!
      return targetTime >= start.getTime() && targetTime <= end.getTime();
    });
  };

  // --- 3. CLICK-TO-SCROLL LOGIC ---
  const scrollToEvent = (eventId) => {
    // Switch to "all" filter just in case the event is hidden by the current filter
    setSelectedFilter('all'); 
    
    // Small delay to allow React to render the full list if we just changed the filter
    setTimeout(() => {
      const el = document.getElementById(`event-${eventId}`);
      if (el) {
        // Scroll down to the element
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add a temporary highlight effect so the user sees which one we scrolled to
        el.classList.add('ring-4', 'ring-blue-400', 'bg-blue-50', 'scale-[1.02]');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-blue-400', 'bg-blue-50', 'scale-[1.02]');
        }, 1500);
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

  // Prevent Hydration Mismatch
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
        <h1 className="text-4xl md:text-5xl font-extrabold relative z-10">Academic Calendar</h1>
        <p className="text-slate-400 mt-4 max-w-2xl mx-auto relative z-10">
          Stay updated with workshops, placement drives, and tech fests happening at RGUKT - AP.
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* --- LEFT: CALENDAR WIDGET --- */}
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: false }} variants={slowFadeUp}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-slate-50 p-6 flex justify-between items-center border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <CalendarIcon className="text-blue-600" /> {monthName} {year}
              </h2>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 hover:bg-white rounded-full border border-slate-200 shadow-sm text-slate-600 hover:text-blue-600 transition"><ChevronLeft size={20}/></button>
                <button onClick={nextMonth} className="p-2 hover:bg-white rounded-full border border-slate-200 shadow-sm text-slate-600 hover:text-blue-600 transition"><ChevronRight size={20}/></button>
              </div>
            </div>

            {/* Days Grid */}
            <div className="p-6">
              <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {emptyDays.map(i => <div key={`empty-${i}`} className="h-24 md:h-32 bg-slate-50/50 rounded-xl"></div>)}
                
                {daysArray.map(day => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = isMounted && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  
                  return (
                    <div 
                      key={day} 
                      onClick={() => dayEvents.length > 0 && scrollToEvent(dayEvents[0].id)}
                      className={`h-24 md:h-32 rounded-xl border flex flex-col items-start justify-start p-2 transition-all duration-300 relative group overflow-hidden
                        ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md'}
                        ${dayEvents.length > 0 ? 'cursor-pointer' : ''}
                      `}
                    >
                      <span className={`text-sm font-bold mb-1 ${isToday ? 'text-blue-600 bg-blue-100 w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-700'}`}>
                        {day}
                      </span>
                      
                      {/* --- EVENT NAME DISPLAY --- */}
                      <div className="w-full flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                        {dayEvents.map((evt, idx) => (
                          <div 
                            key={idx} 
                            title={evt.title}
                            onClick={(e) => { e.stopPropagation(); scrollToEvent(evt.id); }} // Click specific pill to scroll
                          >
                             {/* Desktop/Tablet: Show Title */}
                             <div className="hidden md:block w-full text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-1 rounded truncate border-l-2 border-blue-500 hover:bg-blue-200 transition-colors">
                               {evt.title}
                             </div>
                             {/* Mobile: Show Dot */}
                             <div className="md:hidden w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                          </div>
                        ))}
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
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-between">
              Events List
              <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase">{filteredEvents.length} Total</span>
            </h3>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
              {['all', 'upcoming', 'past'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all duration-300 ${
                    selectedFilter === filter ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
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

                  return (
                    <motion.div 
                      key={event.id}
                      id={`event-${event.id}`} // Added ID for scrolling
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }} 
                      className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 group scroll-mt-24"
                    >
                      <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-slate-400 uppercase">
                            {event.type || 'Event'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                            isPast ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700'
                          }`}>
                            {isPast ? 'Completed' : 'Upcoming'}
                          </span>
                      </div>
                      
                      <h4 className="font-bold text-slate-800 text-base mb-1 group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </h4>
                      
                      {/* Formatted Date Range */}
                      <div className="flex items-center text-xs text-slate-500 font-medium mb-3">
                         <Clock size={12} className="mr-1"/> {renderDateRange(event)}
                      </div>

                      {/* Preserves formatting from admin input */}
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-10">
                   <p className="text-slate-400 text-sm font-medium">No events found.</p>
                </div>
              )}
            </div>

          </div>
        </motion.div>

      </div>
    </main>
  );
}
