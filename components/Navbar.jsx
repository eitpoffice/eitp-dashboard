"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Users, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Vision', href: '/vision' },
    { name: 'MoUs', href: '/mous' },
    { name: 'Activities', href: '/activities' },
    { name: 'Calendar', href: '/calendar' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <motion.nav 
      // Slow Slide-Down Animation on Load
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 py-2' 
          : 'bg-transparent border-b border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* --- LOGO SECTION --- */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
            {/* UPDATED: Replaced placeholder div with the image */}
            <img 
              src="sample.png" // Ensure image.png is in your /public folder
              alt="EITP Logo" 
              className="w-10 h-10 rounded-xl shadow-lg transition-transform duration-500 group-hover:rotate-12"
            />
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                EITP Portal
              </h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">RGUKT - AP</p>
            </div>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name}
                  href={link.href} 
                  className={`relative px-4 py-2 text-sm font-bold rounded-lg transition-all duration-500 ${
                    isActive 
                      ? 'text-blue-600 bg-blue-50/50' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50/50'
                  }`}
                >
                  {link.name}
                  {/* Subtle Underline for Active Link */}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full mx-3"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* --- LOGIN ACTIONS --- */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link 
              href="/login/intern" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-5 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm flex items-center gap-2"
            >
              <Users size={16} className="text-blue-500" /> Intern
            </Link>
            <Link 
              href="/login/admin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-5 py-2 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Monitor size={16} /> Admin
            </Link>
          </div>

          {/* --- MOBILE MENU BUTTON --- */}
          <div className="lg:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition duration-300"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE DROPDOWN --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-xl overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={`block px-4 py-3 text-base font-bold rounded-xl transition duration-300 ${
                    pathname === link.href 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="border-t border-slate-100 my-4 pt-4 grid grid-cols-2 gap-4">
                <Link 
                  href="/login/intern" 
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition"
                >
                  <Users size={16} /> Intern
                </Link>
                <Link 
                  href="/login/admin" 
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition"
                >
                  <Monitor size={16} /> Admin
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
