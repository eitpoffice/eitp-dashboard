"use client";
import { useAdmin } from '@/context/AdminContext';
import { 
  Users, CheckCircle, Clock, Mail, 
  Bell, FileText, Download, ListChecks 
} from 'lucide-react';

export default function AdminDashboard() {
  const { 
    addNotification, 
    submissions = [], 
    markAsReviewed, 
    interns = [], 
    tasks = [],
    contactMessages = [] 
  } = useAdmin();

  // --- LOGIC FOR STATS ---
  const resolvedCount = contactMessages.filter(m => m.status === 'resolved').length;
  const pendingCount = contactMessages.filter(m => m.status !== 'resolved').length;

  // --- HANDLERS ---
  const handleBroadcast = () => {
    const urgentMessage = "📢 ALERT: There will be a review on the works today. Please complete all tasks by today.";
    addNotification({ 
      subject: "Urgent Review Alert", 
      type: 'urgent', 
      message: urgentMessage 
    });
    alert("Broadcast sent successfully!");
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back. Here is the latest EITP activity status.</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Academic Year</p>
            <p className="text-sm font-bold text-slate-900">2025 - 2026</p>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Interns', val: interns.length, icon: Users, color: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-600' },
            { label: 'Active Tasks', val: tasks.filter(t => t.status !== 'Completed').length, icon: ListChecks, color: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-600' },
            { label: 'Resolved Queries', val: resolvedCount, icon: CheckCircle, color: 'bg-green-600', light: 'bg-green-50', text: 'text-green-600' },
            { label: 'Pending Queries', val: pendingCount, icon: Mail, color: 'bg-red-500', light: 'bg-red-50', text: 'text-red-500' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1. RECENT SUBMISSIONS LIST */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <FileText className="text-blue-600" size={22} /> Recent Submissions
              </h3>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase">
                {submissions.length} Total
              </span>
            </div>
            
            <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {submissions.length > 0 ? (
                submissions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all group">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-blue-500 shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate pr-2">{sub.title || "Untitled Submission"}</p>
                        <p className="text-[11px] text-slate-500 truncate font-medium">
                          By <span className="text-blue-600 font-bold uppercase">{sub.intern_name}</span> • {sub.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {sub.file_url && (
                        <a 
                          href={sub.file_url} 
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View File"
                        >
                          <Download size={18} />
                        </a>
                      )}

                      {sub.status === 'Pending' ? (
                        <button 
                          onClick={() => markAsReviewed(sub.id)}
                          className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 rounded-lg border border-green-100 flex items-center gap-1">
                          <CheckCircle size={12} /> Approved
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <FileText size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium">No work submitted for review yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. BROADCAST & QUICK ACTIONS */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-[-20px] right-[-20px] p-4 opacity-10 rotate-12">
                <Bell size={180} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                  <Bell className="text-yellow-400" size={24} />
                </div>
                <h3 className="font-bold text-2xl mb-2">Mass Broadcast</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Immediately notify all active interns about deadlines, unexpected holidays, or emergency meetings.
                </p>
                <button 
                  onClick={handleBroadcast}
                  className="w-full py-4 bg-yellow-500 text-slate-900 font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition transform active:scale-95 shadow-lg shadow-yellow-500/20"
                >
                  Send Urgent Alert
                </button>
              </div>
            </div>

            {/* Quick Helper Tip */}
            <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock className="text-white" size={20} />
                </div>
                <h4 className="font-bold">System Tip</h4>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed">
                You have <b>{pendingCount}</b> student queries waiting for a response. Replying to them promptly increases the EITP cell's efficiency rating.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
