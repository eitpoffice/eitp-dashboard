"use client";
import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Mail, Trash2, User, Clock, Inbox, Loader2, Send, X, AtSign, CheckCircle2 } from 'lucide-react';

export default function MessageInbox() {
  const { contactMessages = [], deleteMessage, resolveMessage, sendReplyEmail, currentIntern, loading } = useAdmin();
  const [filter, setFilter] = useState('all');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const filtered = contactMessages.filter(m => filter === 'all' ? true : m.status === filter);

  const handleSendReply = async () => {
    if (!replyText || !replyingTo) return;
    setSending(true);
    try {
      await sendReplyEmail(replyingTo.email, replyingTo.student_id, replyText);
      const resolver = currentIntern?.name || "Administrator";
      await resolveMessage(replyingTo.id, resolver);
      alert("Reply sent and marked as resolved!");
      setReplyingTo(null);
      setReplyText("");
    } catch (err) {
      alert("Email failed. Check your config.");
    } finally { setSending(false); }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Inbox className="text-blue-600" /> Student Queries</h1>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['all', 'unread', 'resolved'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((msg) => (
          <div key={msg.id} className={`p-6 rounded-2xl border transition ${msg.status === 'resolved' ? 'bg-slate-50 opacity-75' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><User size={20}/></div>
                <div>
                  <h3 className="font-bold">{msg.student_id} <span className="text-slate-300 mx-2">|</span> <span className="text-blue-600 text-xs">{msg.email}</span></h3>
                  {msg.status === 'resolved' && <p className="text-[10px] text-green-600 font-bold uppercase">Resolved by {msg.resolved_by}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                {msg.status !== 'resolved' && <button onClick={() => setReplyingTo(msg)} className="p-2 bg-blue-600 text-white rounded-lg"><Send size={18}/></button>}
                <button onClick={() => deleteMessage(msg.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
              </div>
            </div>
            <p className="mt-4 text-slate-600 text-sm italic">"{msg.message}"</p>
          </div>
        ))}
      </div>

      {replyingTo && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl">
            <h3 className="font-bold text-2xl mb-6">Send Reply</h3>
            <textarea className="w-full border border-slate-200 p-5 rounded-3xl h-44 outline-none focus:ring-2 focus:ring-blue-500" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type response..." />
            <button onClick={handleSendReply} disabled={sending} className="w-full mt-6 bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
              {sending ? <Loader2 className="animate-spin"/> : <><Send size={18}/> Send & Mark Resolved</>}
            </button>
            <button onClick={() => setReplyingTo(null)} className="w-full mt-2 text-slate-400 text-xs font-bold uppercase">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
