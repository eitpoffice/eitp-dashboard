"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '@/context/AdminContext';
import { LayoutDashboard, CheckSquare, Globe, LogOut, MessageSquare, Loader2 } from 'lucide-react';

export default function InternLayout({ children }) {
  const { currentIntern, logoutIntern, loading } = useAdmin();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait until AdminContext has finished loading the session from localStorage
    if (!loading) {
      if (!currentIntern) {
        router.push('/login/intern');
      } else {
        setIsReady(true);
      }
    }
  }, [loading, currentIntern, router]);

  // Handle the "Checking Session" state to prevent flicker or forced logout
  if (loading || !isReady) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-slate-500 font-medium text-sm animate-pulse">Authenticating Intern...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
           <h2 className="font-bold text-xl text-slate-900 tracking-tight">Intern Panel</h2>
           <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
             {currentIntern?.name || 'Verified Intern'}
           </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/intern" className="flex items-center px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium">
            <LayoutDashboard size={20} className="mr-3" /> Dashboard
          </Link>
          <Link href="/intern/tasks" className="flex items-center px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium">
            <CheckSquare size={20} className="mr-3" /> My Tasks
          </Link>
          
          <Link href="/intern/messages" className="flex items-center px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium">
            <MessageSquare size={20} className="mr-3" /> Student Queries
          </Link>

          <Link href="/intern/website" className="flex items-center px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium">
            <Globe size={20} className="mr-3" /> Edit Website
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => {
              logoutIntern();
              router.push('/login/intern');
            }} 
            className="flex items-center px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl w-full transition-colors"
          >
            <LogOut size={20} className="mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
