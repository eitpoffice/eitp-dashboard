"use client";
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAdmin } from '../../context/AdminContext';
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
  const { events } = useAdmin();
  
  // 1. Add isMounted state
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState('all'); 

  // 2. Set isMounted to true ONLY on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper to get days in month
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  // Navigation
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // --- SAFE RENDER LOGIC ---
  // If not mounted, use a stable default (or return null) to match Server
  // We'll calculate 'today' but only use it for styling if isMounted is true
  const today = new Date(); 

  // Filter Events Logic
  const filteredEvents = events.filter(event => {
    if (!isMounted) return true; // Show all by default on server
    const eventDate = new Date(event.date);
    if (selectedFilter === 'upcoming') return eventDate >= today;
    if (selectedFilter === 'past') return eventDate < today;
    return true;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calendar Grid Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  // Helper: Get events for a specific day
  const getEventsForDay = (day) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateString);
  };

  // 3. Prevent Hydration Mismatch for specific UI parts
  if (!isMounted) return null; // Or render a loading skeleton

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
                {emptyDays.map(i => <div key={`empty-${i}`} className="h-20 md:h-32 bg-slate-50/50 rounded-xl"></div>)}
                
                {daysArray.map(day => {
                  const dayEvents = getEventsForDay(day);
                  // Only check "isToday" if mounted to prevent mismatch
                  const isToday = isMounted && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  
                  return (
                    <div 
                      key={day} 
                      className={`h-20 md:h-32 rounded-xl border flex flex-col items-start justify-start p-2 transition-all duration-300 relative group overflow-hidden
                        ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md'}
                      `}
                    >
                      <span className={`text-sm font-bold mb-1 ${isToday ? 'text-blue-600 bg-blue-100 w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-700'}`}>
                        {day}
                      </span>
                      
                      {/* --- EVENT NAME DISPLAY --- */}
                      <div className="w-full flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                        {dayEvents.map((evt, idx) => (
                          <div key={idx} title={evt.title}>
                             {/* Desktop/Tablet: Show Title */}
                             <div className="hidden md:block w-full text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-1 rounded truncate border-l-2 border-blue-500">
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
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }} 
                    className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">{new Date(event.date).getFullYear()}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                          new Date(event.date) < today ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700'
                        }`}>
                          {new Date(event.date) < today ? 'Completed' : 'Upcoming'}
                        </span>
                    </div>
                    
                    <h4 className="font-bold text-slate-800 text-base mb-1 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h4>
                    
                    <div className="flex items-center text-xs text-slate-500 font-medium mb-3">
                       <Clock size={12} className="mr-1"/> {event.date}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </motion.div>
                ))
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
