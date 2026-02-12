"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, ClipboardList, Bell, LogOut, 
  FileText, Image, Handshake, FolderOpen, MessageSquare 
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  
  // 1. Change state to handle the 'checking' phase
  const [status, setStatus] = useState('loading'); // 'loading', 'authenticated', 'unauthenticated'

  useEffect(() => {
    // 2. Check for token immediately on mount
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      setStatus('unauthenticated');
      router.push('/login/admin');
    } else {
      setStatus('authenticated');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setStatus('unauthenticated');
    router.push('/login/admin');
  };

  // 3. Guard: If still checking, show a clean loading screen
  // This prevents the 'flicker' or unwanted redirect during refresh
  if (status === 'loading') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium text-sm animate-pulse">Verifying Admin Session...</p>
      </div>
    );
  }

  // 4. If unauthenticated, keep returning null (router.push is handling the redirect)
  if (status === 'unauthenticated') return null;

  return (
    <div className="flex h-screen bg-slate-50">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
         <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-slate-900 font-bold">A</div>
            <span className="text-xl font-bold tracking-tight">EITP Admin</span>
         </div>

         <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-4 mt-4">Overview</div>
             
             <Link href="/admin" className="flex items-center px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-yellow-400 font-medium shadow-sm border border-slate-700/50 transition-all">
               <LayoutDashboard size={20} className="mr-3" /> Dashboard
             </Link>

             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-4 mt-6">Management</div>

             <Link href="/admin/interns" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all">
               <Users size={20} className="mr-3" /> Interns
             </Link>

             <Link href="/admin/tasks" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all">
               <ClipboardList size={20} className="mr-3" /> Task Board
             </Link>

             <Link href="/admin/messages" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all">
               <MessageSquare size={20} className="mr-3" /> Student Queries
             </Link>

             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-4 mt-6">Content & Public</div>

             <Link href="/admin/events" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all">
                <FileText size={20} className="mr-3" /> Events & News
             </Link>

             <Link href="/admin/mous" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all">
                <Handshake size={20} className="mr-3" /> MoUs & Partners
             </Link>

             <Link href="/admin/gallery" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all">
                <Image size={20} className="mr-3" /> Gallery Manager
             </Link>

             <Link href="/admin/documents" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all">
                <FolderOpen size={20} className="mr-3" /> Documents
             </Link>

             <Link href="/admin/notifications" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all">
                <Bell size={20} className="mr-3" /> Broadcasts
             </Link>
         </nav>

         <div className="p-4 border-t border-slate-800">
           <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-950/30 rounded-xl transition-colors font-medium">
             <LogOut size={20} className="mr-3" /> Logout
           </button>
         </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col overflow-hidden h-screen">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0 z-10">
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             <h2 className="text-slate-500 text-sm font-bold uppercase tracking-wide">Academic Year 2025-2026</h2>
           </div>
           <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-700">Administrator</span>
              <div className="w-10 h-10 bg-slate-900 rounded-full text-white flex items-center justify-center font-bold shadow-md cursor-default">DA</div>
           </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
