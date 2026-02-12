"use client";
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar'; 
import { useAdmin } from '@/context/AdminContext'; 
import { motion } from 'framer-motion';
import { Image as ImageIcon, Calendar, User } from 'lucide-react';

export default function GalleryPage() {
  const { gallery } = useAdmin();
  const [isMounted, setIsMounted] = useState(false);

  // Fix Hydration Mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Safety Check: Ensure gallery is an array
  // 2. Sorting Logic: Sort by Date descending (Latest first)
  const displayGallery = isMounted && Array.isArray(gallery) 
    ? [...gallery].sort((a, b) => {
        // Fallback to time 0 if date is missing so it goes to the bottom
        const dateA = new Date(a.date || 0); 
        const dateB = new Date(b.date || 0);
        return dateB - dateA; 
      }) 
    : [];

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />
      
      {/* Header Section */}
      <div className="pt-32 pb-12 text-center px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Campus Gallery
        </h1>
        <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
           Explore moments captured by our students and faculty during various events and activities.
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayGallery.length > 0 ? (
          displayGallery.map((img, idx) => (
            <motion.div 
              key={img.id || idx}
              layout // Smooth layout animation when filtering/sorting
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.5 }}
              className="group relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer bg-slate-200"
            >
              {/* Image */}
              <img 
                src={img.url} 
                alt={img.title || "Gallery Image"} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                loading="lazy"
              />
              
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                 
                 <h3 className="text-white font-bold text-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                   {img.title}
                 </h3>
                 
                 <div className="flex flex-col gap-1 mt-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                   {img.date && (
                     <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">
                        <Calendar size={14} />
                        <span>{new Date(img.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                     </div>
                   )}

                   <div className="flex items-center gap-2 text-slate-300 text-xs font-medium uppercase tracking-wider">
                      <User size={12} />
                      <span>By {img.uploader || 'Admin'}</span>
                   </div>
                 </div>

              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <ImageIcon size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Gallery is Empty</h3>
            <p className="text-slate-500 mt-2">Check back later for updates!</p>
          </div>
        )}
      </div>
    </main>
  );
}
