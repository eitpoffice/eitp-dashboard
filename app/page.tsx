"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar'; 
import { useAdmin } from '@/context/AdminContext'; 
import { 
  ArrowRight, Calendar, MapPin, Users, TrendingUp, Quote, 
  Award, BookOpen, Briefcase, Rocket, ExternalLink
} from 'lucide-react';
import { 
  motion, AnimatePresence, useInView, useMotionValue, 
  useSpring, useTransform, useScroll, useMotionTemplate, animate, Variants 
} from 'framer-motion';

/* --- ANIMATION VARIANTS --- */
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

/* --- 1. 3D HOVER TILT CARD COMPONENT --- */
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

function TiltCard({ children, className = "", style = {}, ...rest }: TiltCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", ...style } as any}
      className={className}
      {...rest}
    >
      <div style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
}

/* --- 2. HIGH LEVEL STATS COUNTER --- */
function StatCounter({ value, priority = false }: { value: string; priority?: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-20px", once: false }); 
  const count = useMotionValue(0);
  const displayValue = useTransform(count, (latest) => Math.floor(latest));

  const numberMatch = value.match(/\d+/);
  const numericValue = numberMatch ? parseInt(numberMatch[0]) : 0;
  const suffix = value.replace(/\d/g, '');

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, numericValue, { 
        duration: priority ? 1 : 2.5, 
        ease: "easeOut" 
      });
      return () => controls.stop();
    } else {
      count.set(0);
    }
  }, [isInView, count, numericValue, priority]);

  return (
    <span ref={ref} className="inline-flex">
      <motion.span>{displayValue}</motion.span>
      <span>{suffix}</span>
    </span>
  );
}

export default function Home() {
  const { events = [], gallery = [], customTicker = [] } = useAdmin();
  const [isMounted, setIsMounted] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'running' | 'upcoming' | 'completed'>('running');

  const { scrollYProgress } = useScroll();

  const globalX = useMotionValue(0);
  const globalY = useMotionValue(0);
  const spotlightBg = useMotionTemplate`radial-gradient(500px circle at ${globalX}px ${globalY}px, rgba(59, 130, 246, 0.15), transparent 80%)`;

  useEffect(() => {
    setIsMounted(true);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      globalX.set(e.clientX);
      globalY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [globalX, globalY]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return ""; 
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  const displayImages = useMemo(() => {
    if (!isMounted || !gallery.length) return [];
    const allPhotos: any[] = [];
    gallery.forEach((entry: any) => {
      const urls = entry.url ? entry.url.split(',') : [];
      urls.forEach((url: string) => {
        allPhotos.push({
          ...entry,
          singleUrl: url.trim(),
          displayDate: formatDate(entry.date)
        });
      });
    });
    return allPhotos
      .sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime())
      .slice(0, 5);
  }, [gallery, isMounted]);

  const eventCategories = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    const upcoming: any[] = []; 
    const running: any[] = []; 
    const completed: any[] = [];

    events.forEach((e: any) => {
      const eDate = new Date(e.date);
      eDate.setHours(0, 0, 0, 0);
      const eTime = eDate.getTime();
      
      if(isNaN(eTime)) return;

      if (eTime === todayTime) running.push(e);
      else if (eTime > todayTime) upcoming.push(e);
      else completed.push(e);
    });

    const sortByDateDesc = (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime();
    return {
      running: running.sort(sortByDateDesc),
      upcoming: upcoming.sort(sortByDateDesc), 
      completed: completed.sort(sortByDateDesc)
    };
  }, [events]);

  const tickerItems = useMemo(() => {
    let items: string[] = [];
    if (eventCategories.running.length > 0) {
      eventCategories.running.forEach((e: any) => items.push(`ONGOING: ${e.title} (${formatDate(e.date)})`));
    }
    if (Array.isArray(customTicker)) {
      customTicker.forEach((t: any) => { if (t.value?.trim()) items.push(t.value); });
    }
    return items;
  }, [eventCategories.running, customTicker]);

  useEffect(() => {
    if (tickerItems.length <= 1) return;
    const timer = setInterval(() => {
        setTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 6100); 
    return () => clearInterval(timer);
  }, [tickerItems.length]);

  return (
    <main className="min-h-screen font-sans text-slate-900 bg-slate-50 overflow-x-hidden selection:bg-blue-600 selection:text-white pb-20">
      
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 via-cyan-400 to-yellow-400 origin-left z-[100]" 
        style={{ scaleX: scrollYProgress }} 
      />
      
      <motion.div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
        style={{ background: spotlightBg }}
      />

      <Navbar />

      {isMounted && tickerItems.length > 0 && (
        <div className="mt-20 bg-slate-900 text-white py-3 border-b border-slate-800 relative z-40 h-12 flex items-center overflow-hidden">
          <div className="relative z-50 bg-slate-900 px-4 h-full flex items-center shadow-[20px_0_25px_rgba(15,23,42,1)]">
            <div className="bg-yellow-500 text-slate-900 text-[10px] font-black px-3 py-1 rounded uppercase tracking-wider animate-pulse">Updates</div>
          </div>
          <div className="flex-1 relative h-full flex items-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div 
                key={`ticker-${tickerIndex}`} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }} 
                transition={{ duration: 0.5 }} 
                className="absolute whitespace-nowrap text-sm font-bold text-slate-100 flex items-center gap-3 pl-4"
              >
                <span className="text-blue-500 text-xl font-black">✦</span> {tickerItems[tickerIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className={`relative pb-16 overflow-hidden ${(isMounted && tickerItems.length > 0) ? 'pt-20' : 'pt-32'}`}>
        <div className="absolute inset-0 z-0 opacity-40">
            <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            <Award size={14} /> RGUKT - AP
          </motion.div>
          
          {/* --- FIX IS HERE: Wrapped H1 in a div for entrance animation --- */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6 relative inline-block text-transparent bg-clip-text bg-slate-900"
              style={{
                backgroundImage: 'linear-gradient(110deg, #1e293b 45%, #64748b 50%, #1e293b 55%)',
                backgroundSize: '250% 100%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
              animate={{ backgroundPosition: ["100% 0%", "-100% 0%"] }}
              transition={{ backgroundPosition: { repeat: Infinity, duration: 4, ease: "linear" } }}
            >
              Entrepreneurship Incubation <br />
              Training & Placements
            </motion.h1>
          </motion.div>
          
          <motion.p initial="hidden" animate="visible" variants={fadeInUp} className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10 font-medium">
            Bridging the gap between academic potential and industrial success. We cultivate innovation through world-class training and real-time projects.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
            <Link href="/activities" className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-xl flex items-center gap-2">
              Explore Programs <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SCROLLING IMAGE STRIP */}
      {isMounted && (
        <section className="pb-16 bg-white border-b border-slate-200 overflow-hidden relative z-20">
          <div className="flex animate-scroll gap-6 px-6">
            {[...displayImages, ...displayImages].map((img, idx) => (
              <div key={idx} className="relative w-80 h-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border border-slate-100 group bg-slate-50">
                <img src={img.singleUrl} alt={img.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 text-left">
                  <p className="text-yellow-400 font-black text-lg uppercase tracking-tighter mb-2">{img.title}</p>
                  <div className="flex items-center gap-2 text-cyan-400 font-black text-[10px] uppercase tracking-[0.2em] border-l-2 border-yellow-400 pl-3">
                    <span>RGUKT - AP</span>
                    <span className="w-1 h-1 rounded-full bg-white/30"></span>
                    <span>{img.displayDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* DEAN'S MESSAGE */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: false, amount: 0.3 }}
            variants={fadeInUp} 
            className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-16 shadow-2xl flex flex-col md:flex-row items-center gap-12"
          >
            <div className="w-56 h-56 md:w-64 md:h-64 flex-shrink-0 relative z-10">
              <img src="/dean.jpeg" alt="Dean" className="w-full h-full object-cover rounded-2xl border-4 border-slate-800" />
            </div>
            <div className="flex-1 text-center md:text-left relative z-10">
              <Quote size={48} className="text-blue-400 mb-6 opacity-50 mx-auto md:mx-0" />
              <h2 className="text-3xl font-bold mb-6 italic leading-relaxed">"Our mission is to create an ecosystem where innovation thrives. We shape future leaders ready for the digital age."</h2>
              <div>
                <p className="text-2xl font-bold text-white">Shyam Peraka</p>
                <p className="text-blue-400 font-bold text-sm uppercase tracking-wide">Dean-EITP </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* KEY PILLARS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: false, amount: 0.2 }} 
            variants={staggerContainer} 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { title: 'Incubation', icon: Rocket, text: 'Nurturing student startups from ideation to execution with mentorship and funding support.' },
              { title: 'Training', icon: BookOpen, text: 'Providing hands-on technical workshops on AI, ML, IoT, and Full Stack Development.' },
              { title: 'Placements', icon: Briefcase, text: 'Connecting talent with top-tier companies through rigorous placement drives.' },
            ].map((item, idx) => (
              <TiltCard key={idx} variants={fadeInUp} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6"><item.icon size={28} /></div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.text}</p>
              </TiltCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATS SECTION */}
      <div className="bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: 'Placement Goal', val: '100%', icon: TrendingUp, color: 'text-green-400', priority: true },
            { label: 'MoUs Signed', val: '15+', icon: MapPin, color: 'text-blue-400', priority: false },
            { label: 'Annual Events', val: '45+', icon: Calendar, color: 'text-yellow-400', priority: false },
            { label: 'Active Interns', val: '10', icon: Users, color: 'text-purple-400', priority: false },
          ].map((stat, idx) => (
            <motion.div 
              key={idx} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: false, amount: 0.5 }}
              variants={fadeInUp}
              className="flex flex-col items-center"
            >
               <div className={`mb-4 ${stat.color}`}><stat.icon size={36} /></div>
               <p className="text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                 {isMounted ? <StatCounter value={stat.val} priority={stat.priority} /> : stat.val}
               </p>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* EVENT SCHEDULE */}
      <section className="py-24 max-w-5xl mx-auto px-6 bg-white">
        <div className="text-center mb-16">
          <motion.h2 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: false }} 
            variants={fadeInUp} 
            className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-8"
          >
            Event Schedule
          </motion.h2>
          
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: false }} 
            variants={fadeInUp} 
            className="flex justify-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit mx-auto border border-slate-200"
          >
            {['running', 'upcoming', 'completed'].map((tab: any) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 md:px-10 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 z-10 ${
                  activeTab === tab 
                  ? 'bg-slate-900 text-yellow-400 shadow-lg scale-105' 
                  : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTabPill" className="absolute inset-0 bg-slate-900 rounded-xl -z-10 shadow-lg" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
              </button>
            ))}
          </motion.div>
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              {eventCategories[activeTab].length > 0 ? (
                eventCategories[activeTab].map((e: any) => (
                  <motion.div 
                    key={e.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  >
                    <TiltCard className="group relative w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-2xl transition-shadow duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-8 border-l-slate-900 hover:border-l-blue-600 overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-bl-[3rem] -z-10 group-hover:bg-blue-50 transition-colors" />
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="bg-slate-900 text-yellow-400 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]">
                             {activeTab}
                          </span>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{formatDate(e.date)}</span>
                          <span className="hidden md:inline-block text-[9px] font-black uppercase text-blue-600 tracking-widest bg-blue-50 px-3 py-1 rounded-full">{e.type}</span>
                        </div>
                        
                        <h4 className="font-black text-slate-900 text-xl md:text-3xl uppercase tracking-tighter leading-none group-hover:text-blue-600 transition-colors">
                          {e.title}
                        </h4>
                        <p className="text-xs md:text-sm text-slate-500 mt-3 leading-relaxed max-w-2xl line-clamp-2">
                          {e.description || "Discover industrial excellence and technical mastery in this exclusive EITP session."}
                        </p>
                      </div>
                      
                      <div className="w-full md:w-auto">
                        <Link href="/activities" className="w-full md:w-auto bg-slate-900 text-white font-black px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg uppercase text-[10px] tracking-widest">
                          Details <ExternalLink size={14} />
                        </Link>
                      </div>
                    </TiltCard>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-[2rem]">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No {activeTab} events found</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
