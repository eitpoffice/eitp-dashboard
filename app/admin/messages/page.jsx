"use client";
import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Mail, Trash2, User, Clock, Inbox, Loader2, Send, X, AtSign, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessageInbox() {
  const { contactMessages = [], deleteMessage, resolveMessage, sendReplyEmail, currentIntern, loading } = useAdmin();
  const [filter, setFilter] = useState('all');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const filtered = contactMessages.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'unread') return m.status !== 'resolved';
    return m.status === filter;
  });

  const handleSendReply = async () => {
    if (!replyText || !replyingTo) return;
    setSending(true);
    try {
      // 1. Send the external email via EmailJS
      await sendReplyEmail(replyingTo.email, replyingTo.student_id, replyText);
      
      // 2. Mark as resolved in Supabase
      const resolver = currentIntern?.name || "Administrator";
      await resolveMessage(replyingTo.id, resolver);
      
      alert("✅ Reply sent and query marked as resolved!");
      setReplyingTo(null);
      setReplyText("");
    } catch (err) {
      console.error(err);
      alert("Email failed to send. Check your EmailJS configuration.");
    } finally { 
      setSending(false); 
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Permanently delete this message?")) {
      await deleteMessage(id);
    }
  };

  if (loading) return (
    <div className="h-[60vh] w-full flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Inbox className="text-blue-600" /> Student Queries
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage incoming help requests from the public portal.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          {['all', 'unread', 'resolved'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* --- MESSAGE LIST --- */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((msg) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={msg.id} 
              className={`p-6 rounded-[2rem] border-2 transition-all ${msg.status === 'resolved' ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-white border-slate-100 shadow-sm hover:border-blue-100'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${msg.status === 'resolved' ? 'bg-slate-200 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                    <User size={24}/>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 flex items-center gap-2">
                      {msg.student_id} 
                      <span className="text-slate-300 font-light">|</span> 
                      <span className="text-blue-600 text-xs font-bold">{msg.email}</span>
                    </h3>
                    {msg.status === 'resolved' ? (
                      <div className="flex items-center gap-1 text-[10px] text-green-600 font-black uppercase tracking-tighter mt-1">
                        <CheckCircle2 size={12} /> Resolved by {msg.resolved_by}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-yellow-600 font-black uppercase tracking-tighter mt-1">
                        <Clock size={12} /> Pending Response
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {msg.status !== 'resolved' && (
                    <button 
                      onClick={() => setReplyingTo(msg)} 
                      className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                    >
                      <Send size={18}/>
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(msg.id)} 
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
              <div className="mt-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-slate-600 text-sm italic font-medium leading-relaxed">"{msg.message}"</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <Inbox size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">No messages found in this category</p>
          </div>
        )}
      </div>

      {/* --- REPLY MODAL --- */}
      <AnimatePresence>
        {replyingTo && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[3rem] p-10 w-full max-w-xl shadow-2xl border border-white/20"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-black text-2xl text-slate-900 tracking-tighter uppercase italic">Send Response</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Replying to: {replyingTo.email}</p>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"><X size={20}/></button>
              </div>

              <textarea 
                className="w-full border-2 border-slate-100 bg-slate-50 p-6 rounded-[2rem] h-52 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700" 
                value={replyText} 
                onChange={e => setReplyText(e.target.value)} 
                placeholder="Compose your professional response here..." 
              />

              <div className="flex gap-4 mt-8">
                <button 
                  onClick={handleSendReply} 
                  disabled={sending || !replyText.trim()} 
                  className="flex-1 bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="animate-spin"/> : <><Send size={20}/> SEND EMAIL & RESOLVE</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
