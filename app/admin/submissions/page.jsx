"use client";
import { useState, useRef, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { 
  CheckCircle, Clock, MessageSquare, Send, FileText, 
  ExternalLink, User, Calendar, Loader2, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSubmissions() {
  const { submissions = [], markAsReviewed, sendSubmissionComment, loading } = useAdmin();
  const [activeSubId, setActiveSubId] = useState(null);
  const [reply, setReply] = useState('');
  const [processing, setProcessing] = useState(false);
  const chatEndRef = useRef(null);

  // Sort submissions: Show newest at the top of the sidebar
  const sortedSubmissions = [...submissions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSubId, submissions]);

  const activeSub = submissions.find(s => s.id === activeSubId);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !activeSubId) return;

    setProcessing(true);
    try {
      await sendSubmissionComment(activeSubId, {
        sender: "Admin",
        text: reply,
        role: "admin"
      });
      setReply('');
    } catch (err) {
      console.error(err);
      alert("Failed to save message to database.");
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkReviewed = async (id) => {
    if (confirm("Mark this task as completed? This will update the intern's dashboard.")) {
      await markAsReviewed(id);
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40}/>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Submissions...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic">
            <ShieldCheck className="text-blue-600" /> SUBMISSION REVIEW
          </h1>
          <p className="text-slate-500 font-medium text-sm">Reviewing {submissions.length} reports from EITP Interns</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* --- LEFT: SUBMISSION LIST --- */}
        <div className="w-1/3 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b bg-slate-50/50">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">
              Recent Activity
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {sortedSubmissions.map((sub) => (
              <motion.div 
                layoutId={sub.id}
                key={sub.id}
                onClick={() => setActiveSubId(sub.id)}
                className={`p-5 rounded-[1.5rem] cursor-pointer transition-all border-2 ${
                  activeSubId === sub.id 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100' 
                  : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/30'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                    activeSubId === sub.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {sub.status || 'Pending'}
                  </span>
                  <span className={`text-[10px] font-bold ${activeSubId === sub.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    {sub.date}
                  </span>
                </div>
                <p className="font-black text-sm mb-2">{sub.title}</p>
                <div className={`flex items-center gap-2 ${activeSubId === sub.id ? 'text-blue-100' : 'text-slate-500'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${activeSubId === sub.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                    {sub.intern_name?.charAt(0)}
                  </div>
                  <span className="text-xs font-bold">{sub.intern_name}</span>
                </div>
              </motion.div>
            ))}
            {submissions.length === 0 && (
              <div className="text-center py-20">
                <FileText className="mx-auto text-slate-200 mb-2" size={40} />
                <p className="text-slate-400 text-sm font-bold">No submissions yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT: CHAT & DETAILS --- */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
          {activeSub ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tighter">{activeSub.title}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Report by {activeSub.intern_name}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a 
                    href={activeSub.file_url} 
                    target="_blank" 
                    className="p-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                    title="Open Document"
                  >
                    <ExternalLink size={20} />
                  </a>
                  {activeSub.status !== 'Reviewed' && (
                    <button 
                      onClick={() => handleMarkReviewed(activeSub.id)}
                      className="px-6 py-3 bg-green-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-95"
                    >
                      Approve Report
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-50/20 custom-scrollbar">
                <AnimatePresence>
                  {(activeSub.comments || []).length > 0 ? (
                    activeSub.comments.map((msg, i) => (
                      <motion.div 
                        key={msg.id || i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${msg.role === 'admin' ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${
                          msg.role === 'admin' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                        }`}>
                          <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                          <div className={`flex items-center gap-2 mt-2 font-black text-[9px] uppercase tracking-tighter ${
                            msg.role === 'admin' ? 'text-blue-200' : 'text-slate-400'
                          }`}>
                            <span>{msg.sender}</span>
                            <span>•</span>
                            <span>{msg.time}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                      <MessageSquare size={48} className="opacity-10 mb-2" />
                      <p className="text-sm font-bold uppercase tracking-widest">No conversation yet</p>
                    </div>
                  )}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendReply} className="p-6 bg-white border-t flex gap-4">
                <input 
                  type="text" 
                  placeholder="Ask for changes or provide feedback..."
                  className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  disabled={processing}
                />
                <button 
                  disabled={processing || !reply.trim()}
                  className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl disabled:opacity-50 active:scale-95 flex items-center justify-center min-w-[64px]"
                >
                  {processing ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
               <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mb-6">
                  <MessageSquare size={40} className="text-slate-200" />
               </div>
               <h3 className="font-black text-xl text-slate-900 tracking-tighter uppercase italic">Select a report</h3>
               <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Feedback history will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
