"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar'; // Updated to absolute path
import { useAdmin } from '@/context/AdminContext'; // Updated to absolute path
import { 
  ArrowRight, Calendar, ChevronRight, Megaphone, MapPin, 
  Users, TrendingUp, Quote, Award, BookOpen, Briefcase, Rocket, Clock, CheckCircle2 
} from 'lucide-react';
import { motion } from 'framer-motion';

/* --- ANIMATION VARIANTS --- */
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 1.2, ease: "easeOut" } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function Home() {
  const { events = [], gallery = [] } = useAdmin();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- LOGIC UPDATES ---

  // 1. Sort Gallery: Most Recent First
  const sortedGallery = useMemo(() => {
    return [...gallery].sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
  }, [gallery]);

  // 2. Separate Events: Upcoming, Running, Completed
  const eventCategories = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const upcoming = [];
    const running = [];
    const completed = [];

    events.forEach(e => {
      const eDate = new Date(e.date);
      eDate.setHours(0, 0, 0, 0);
      const eTime = eDate.getTime();

      if (eTime === todayTime) running.push(e);
      else if (eTime > todayTime) upcoming.push(e);
      else completed.push(e);
    });

    const sortByDateDesc = (a, b) => new Date(b.date) - new Date(a.date);
    const sortByDateAsc = (a, b) => new Date(a.date) - new Date(b.date);
    
    return {
      running: running.sort(sortByDateDesc),
      upcoming: upcoming.sort(sortByDateAsc).slice(0, 3), 
      completed: completed.sort(sortByDateDesc).slice(0, 3)
    };
  }, [events]);

  // TICKER LOGIC
  const tickerContent = isMounted && events.length > 0 
    ? events.map(e => `🎉 ${e.title} (${e.date})`).join("    ✦    ") 
    : "Admissions Open for 2026 Batch    ✦    New AI Research Lab Inaugurated    ✦    Placement Drive starts Oct 15th";

  // Gallery Logic
  const displayImages = isMounted && sortedGallery.length > 0 ? [...sortedGallery, ...sortedGallery] : [
    { id: '1', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80', title: 'Innovation' },
    { id: '2', url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80', title: 'Campus' },
    { id: '3', url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80', title: 'Placements' },
  ];

  return (
    <main className="min-h-screen font-sans text-slate-900 bg-slate-50 overflow-x-hidden selection:bg-blue-600 selection:text-white pb-20">
      <Navbar />

      {/* --- 1. TICKER --- */}
      <div className="mt-20 bg-slate-900 text-white py-2 border-b border-slate-800 relative z-40">
        <div className="flex items-center">
          <div className="bg-yellow-500 text-slate-900 text-[10px] font-bold px-3 py-1 mx-4 rounded uppercase tracking-wider shadow-lg flex-shrink-0 animate-pulse">
            Upcoming Events 
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="whitespace-nowrap animate-marquee inline-block text-sm font-medium text-slate-300">
              <span className="mx-8">{tickerContent}</span>
              <span className="mx-8">{tickerContent}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. HERO SECTION --- */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            <Award size={14} /> RGUKT - AP
          </motion.div>
          
          <motion.h1 
            initial="hidden" animate="visible" variants={fadeInUp}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6 relative inline-block text-transparent bg-clip-text bg-slate-900"
            style={{
              backgroundImage: 'linear-gradient(110deg, #1e293b 45%, #ffffff 50%, #1e293b 55%)',
              backgroundSize: '250% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}
            animate={{ opacity: 1, y: 0, backgroundPosition: ["100% 0%", "-100% 0%"] }}
            transition={{ opacity: { duration: 0.6, ease: "easeOut" }, backgroundPosition: { repeat: Infinity, duration: 4, ease: "linear" } }}
          >
            Entrepreneurship Incubation <br />
            Training & Placements
          </motion.h1>
          
          <motion.p initial="hidden" animate="visible" variants={fadeInUp} className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10 font-medium">
            Bridging the gap between academic potential and industrial success. 
            We cultivate innovation through world-class training and real-time project exposure.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
            <Link href="/activities" className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-xl hover:-translate-y-1 flex items-center gap-2">
              Explore Programs <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition shadow-sm flex items-center gap-2">
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- 3. SCROLLING IMAGE STRIP --- */}
      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="py-8 bg-white border-y border-slate-200 overflow-hidden relative z-20">
        <div className="flex animate-scroll gap-6 px-6">
          {displayImages.map((img, idx) => (
            <div key={`${img.id}-${idx}`} className="relative w-80 h-64 flex-shrink-0 rounded-xl overflow-hidden shadow-md border border-slate-100 group cursor-pointer hover:border-blue-500 transition-colors duration-300">
              <img src={img.url} alt={img.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-bold text-lg">{img.title}</p>
                <div className="h-1 w-10 bg-yellow-400 mt-1 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* --- 4. DEAN'S MESSAGE --- */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp} className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-16 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-overlay filter blur-[100px] opacity-20"></div>
            <div className="w-56 h-56 md:w-64 md:h-64 flex-shrink-0 relative z-10">
              <div className="absolute inset-0 bg-yellow-500 rounded-2xl rotate-6"></div>
              <img src="/dean.jpeg" alt="Dr. Satyanarayana - Dean" className="w-full h-full object-cover rounded-2xl shadow-lg relative border-4 border-slate-800" />
            </div>
            <div className="flex-1 text-center md:text-left relative z-10">
              <Quote size={48} className="text-blue-400 mb-6 mx-auto md:mx-0 opacity-50" />
              <h2 className="text-3xl font-bold mb-6">Message from the Dean EITP</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-8 italic">
                "Our mission is to create an ecosystem where innovation thrives. We don't just produce graduates; we shape future leaders who are ready to tackle the challenges of the digital age with confidence and skill."
              </p>
              <div>
                <p className="text-2xl font-bold text-white">Shyam Peraka</p>
                <p className="text-blue-400 font-bold text-sm uppercase tracking-wide">Dean-EITP </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- 5. KEY PILLARS --- */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Incubation', icon: Rocket, text: 'Nurturing student startups from ideation to execution with mentorship and funding support.' },
              { title: 'Training', icon: BookOpen, text: 'Providing hands-on technical workshops on AI, ML, IoT, and Full Stack Development.' },
              { title: 'Placements', icon: Briefcase, text: 'Connecting talent with top-tier companies through rigorous placement drives.' },
            ].map((item, idx) => (
              <motion.div key={idx} variants={fadeInUp} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <item.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- 6. HIGHLIGHTS / STATS --- */}
      <div className="bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: 'Placement Goal', val: '100%', icon: TrendingUp, color: 'text-green-400' },
            { label: 'MoUs Signed', val: '15+', icon: MapPin, color: 'text-blue-400' },
            { label: 'Annual Events', val: '45+', icon: Calendar, color: 'text-yellow-400' },
            { label: 'Active Interns', val: '10', icon: Users, color: 'text-purple-400' },
          ].map((stat, idx) => (
            <motion.div key={idx} initial={{ scale: 0.5, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.2, duration: 0.8 }} className="flex flex-col items-center group cursor-default">
               <div className={`mb-4 ${stat.color} group-hover:scale-110 transition-transform duration-300`}><stat.icon size={36} /></div>
               <p className="text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">{stat.val}</p>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors duration-300">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- 7. CATEGORIZED EVENTS SECTION --- */}
      <section className="py-24 max-w-7xl mx-auto px-6 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900">Event Schedule</h2>
          <p className="text-slate-500 mt-2 font-medium">Stay synced with EITP cell activities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* RUNNING NOW */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] text-red-500 mb-6">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> Running Today
            </h3>
            {eventCategories.running.length > 0 ? eventCategories.running.map(e => (
               <EventItem key={e.id} event={e} status="running" />
            )) : <p className="text-slate-400 text-sm italic border-l-2 border-slate-100 pl-4">No events scheduled for today.</p>}
          </div>

          {/* UPCOMING */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] text-blue-600 mb-6">
              <Clock size={16} /> Upcoming
            </h3>
            {eventCategories.upcoming.length > 0 ? eventCategories.upcoming.map(e => (
               <EventItem key={e.id} event={e} status="upcoming" />
            )) : <p className="text-slate-400 text-sm italic border-l-2 border-slate-100 pl-4">Stay tuned for future events.</p>}
          </div>

          {/* COMPLETED */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-6">
              <CheckCircle2 size={16} /> Recently Completed
            </h3>
            {eventCategories.completed.length > 0 ? eventCategories.completed.map(e => (
               <EventItem key={e.id} event={e} status="completed" />
            )) : <p className="text-slate-400 text-sm italic border-l-2 border-slate-100 pl-4">No recent history.</p>}
          </div>

        </div>
      </section>

    </main>
  );
}

// Sub-component for Event list items
function EventItem({ event, status }) {
  const statusColors = {
    running: "border-red-500 bg-red-50/50 shadow-red-100",
    upcoming: "border-blue-500 bg-blue-50/30 shadow-blue-100",
    completed: "border-slate-200 bg-white shadow-slate-100"
  };

  return (
    <div className={`p-6 border-l-4 rounded-r-2xl shadow-sm transition-all hover:translate-x-1 hover:shadow-md ${statusColors[status]}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{event.date}</span>
        <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded border border-slate-100 uppercase tracking-tighter text-slate-600">{event.type}</span>
      </div>
      <h4 className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{event.title}</h4>
      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{event.description}</p>
    </div>
  );
}
