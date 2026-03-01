"use client";
import { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '@/components/Navbar'; 
import { useAdmin } from '@/context/AdminContext'; 
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Maximize2, X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function GalleryPage() {
  const { gallery = [] } = useAdmin();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [numCols, setNumCols] = useState(1); // Default to 1 for mobile
  
  const scrollInterval = useRef(null);
  const idleTimer = useRef(null);

  useEffect(() => {
    setIsMounted(true);

    // Responsive Column Logic
    const updateCols = () => {
      if (window.innerWidth >= 1280) setNumCols(4);      // XL screens
      else if (window.innerWidth >= 1024) setNumCols(3); // LG screens
      else if (window.innerWidth >= 640) setNumCols(2);  // Tablet
      else setNumCols(1);                                // Mobile
    };
    
    updateCols(); // Set initial columns
    window.addEventListener('resize', updateCols);

    // Auto-scroll Logic
    const handleUserInteraction = () => {
      stopAutoScroll();
      resetIdleTimer();
    };

    const inputEvents = ['mousemove', 'mousedown', 'wheel', 'touchstart', 'keydown'];
    inputEvents.forEach(event => window.addEventListener(event, handleUserInteraction));
    resetIdleTimer();

    return () => {
      window.removeEventListener('resize', updateCols);
      inputEvents.forEach(event => window.removeEventListener(event, handleUserInteraction));
      stopAutoScroll();
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [selectedImg]);

  const resetIdleTimer = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(startAutoScroll, 3000);
  };

  const startAutoScroll = () => {
    if (scrollInterval.current || selectedImg) return; 
    scrollInterval.current = setInterval(() => {
      window.scrollBy({ top: 1, behavior: 'auto' });
      if ((window.innerHeight + window.pageYOffset) >= document.documentElement.scrollHeight - 2) {
        stopAutoScroll();
      }
    }, 35); 
  };

  const stopAutoScroll = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "2026";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  // --- DATA PROCESSING: Flatten & Sort by Time ---
  const flatGallery = useMemo(() => {
    if (!isMounted) return [];
    const allPhotos = [];

    // Default Intro Image
    allPhotos.push({
      title: "Dean EITP",
      displayUrl: "dean1.jpeg",
      uniqueId: "default-image-001",
      dateMs: Date.now() + 100000, // Forces default to stay at the very top
      formattedDate: formatDate(new Date().toISOString()), 
    });

    if (Array.isArray(gallery)) {
      gallery.forEach((entry) => {
        const urls = entry.url ? entry.url.split(',') : [];
        const entryDateMs = new Date(entry.date || 0).getTime();
        
        urls.forEach((url, idx) => {
          allPhotos.push({
            ...entry,
            displayUrl: url.trim(),
            uniqueId: `${entry.id}-${idx}`,
            dateMs: entryDateMs,
            formattedDate: formatDate(entry.date)
          });
        });
      });
    }
    
    // Sort strictly by Time Basis (Newest first)
    return allPhotos.sort((a, b) => b.dateMs - a.dateMs);
  }, [gallery, isMounted]);

  // --- MASONRY LEFT-TO-RIGHT DISTRIBUTION LOGIC ---
  const columnizedGallery = useMemo(() => {
    // Create an array of empty arrays (one for each column)
    const cols = Array.from({ length: numCols }, () => []);
    
    // Distribute images left-to-right across the columns sequentially
    flatGallery.forEach((item, index) => {
      cols[index % numCols].push(item);
    });
    
    return cols;
  }, [flatGallery, numCols]);

  const activeIndex = flatGallery.findIndex(img => img.displayUrl === selectedImg);
  const nextPhoto = (e) => {
    e?.stopPropagation();
    setSelectedImg(flatGallery[(activeIndex + 1) % flatGallery.length].displayUrl);
  };
  const prevPhoto = (e) => {
    e?.stopPropagation();
    setSelectedImg(flatGallery[(activeIndex - 1 + flatGallery.length) % flatGallery.length].displayUrl);
  };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-[#050505] font-sans selection:bg-yellow-400 selection:text-black">
      <Navbar />
      
      {/* --- TRUE LEFT-TO-RIGHT MASONRY LAYOUT --- */}
      {/* We use flex layout to render the sequential columns we built in JS */}
      <div className="pt-24 px-4 flex gap-4 pb-20 items-start w-full mx-auto max-w-[2000px]">
        {columnizedGallery.length > 0 ? (
          columnizedGallery.map((column, colIdx) => (
            <div key={`col-${colIdx}`} className="flex flex-col gap-4 flex-1 w-full min-w-0">
              
              {column.map((item) => (
                <motion.div 
                  key={item.uniqueId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  onClick={() => {
                    stopAutoScroll();
                    setSelectedImg(item.displayUrl);
                  }}
                  className="relative group w-full bg-black border border-white/10 rounded-xl overflow-hidden cursor-pointer shadow-lg"
                >
                  {/* h-auto + w-full = No Cropping, Perfect Fit */}
                  <img 
                    src={item.displayUrl} 
                    className="w-full h-auto block transition-transform duration-700 group-hover:scale-105" 
                    alt={item.title} 
                  />
                  
                  {/* ELEGANT HOVER OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5 z-10">
                     <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                       <h3 className="text-white font-black uppercase text-sm md:text-base tracking-tight mb-2">
                         {item.title}
                       </h3>
                       <div className="flex justify-between items-center border-t border-white/20 pt-2">
                          <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                            <Clock size={10} />
                            <span>{item.formattedDate}</span>
                          </div>
                          <div className="bg-white/10 p-1.5 rounded text-white backdrop-blur-sm group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                            <Maximize2 size={12} strokeWidth={2.5} />
                          </div>
                       </div>
                     </div>
                  </div>
                </motion.div>
              ))}
              
            </div>
          ))
        ) : (
          <div className="w-full py-40 text-center">
             <ImageIcon size={64} className="mx-auto text-white/5 mb-4" />
             <p className="text-white/10 font-black uppercase tracking-[1em]">Canvas Empty</p>
          </div>
        )}
      </div>

      {/* --- LIGHTBOX MODAL --- */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-0"
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedImg(null)} 
              className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-red-500 text-white/50 hover:text-white rounded-full transition-all z-[110]"
            >
              <X size={28} />
            </button>
            
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              
              <motion.img 
                key={selectedImg}
                src={selectedImg} 
                className="max-w-full max-h-[85vh] object-contain shadow-2xl" 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              />

              {/* Navigation */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:px-12 pointer-events-none">
                <button onClick={prevPhoto} className="pointer-events-auto text-white/20 hover:text-yellow-400 hover:scale-110 transition-all">
                  <ChevronLeft className="w-16 h-16 md:w-20 md:h-20" strokeWidth={1} />
                </button>
                <button onClick={nextPhoto} className="pointer-events-auto text-white/20 hover:text-yellow-400 hover:scale-110 transition-all">
                  <ChevronRight className="w-16 h-16 md:w-20 md:h-20" strokeWidth={1} />
                </button>
              </div>

              {/* Title Context */}
              <div className="absolute bottom-6 md:bottom-10 text-center px-6">
                <h2 className="text-white text-xl md:text-3xl font-black uppercase tracking-widest drop-shadow-lg">
                    {flatGallery[activeIndex]?.title}
                </h2>
                <div className="flex items-center justify-center gap-3 mt-3 opacity-80">
                   <div className="h-[1px] w-8 bg-yellow-400" />
                   <p className="text-yellow-400 font-bold text-[10px] md:text-xs uppercase tracking-[0.4em]">
                       {flatGallery[activeIndex]?.formattedDate} <span className="text-white/30 mx-2">|</span> RGUKT-AP
                   </p>
                   <div className="h-[1px] w-8 bg-yellow-400" />
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
