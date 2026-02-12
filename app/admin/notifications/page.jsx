"use client";
import { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { Bell, Trash2, Send, AlertCircle, Info, CheckCircle2, Loader2 } from 'lucide-react';

export default function Notifications() {
  // FIX: Default 'notifications' to empty array []
  const { notifications = [], addNotification, deleteNotification } = useAdmin();
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info'); // 'info' or 'urgent'
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    await addNotification({
      subject,
      message,
      type,
      date: new Date().toLocaleString()
    });

    setSubject(''); setMessage(''); setType('info');
    setLoading(false);
    alert("Notification Sent!");
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
      
      {/* Compose Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
         <h2 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2"><Send className="text-blue-600"/> Broadcast Message</h2>
         <form onSubmit={handleSend} className="space-y-4">
           <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Subject</label>
             <input type="text" className="w-full p-3 border rounded-xl" value={subject} onChange={e => setSubject(e.target.value)} required placeholder="e.g. Exam Schedule Released" />
           </div>
           
           <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Type</label>
             <div className="flex gap-2">
               <button type="button" onClick={() => setType('info')} className={`flex-1 py-2 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition ${type === 'info' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                 <Info size={16}/> General
               </button>
               <button type="button" onClick={() => setType('urgent')} className={`flex-1 py-2 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition ${type === 'urgent' ? 'bg-red-50 border-red-500 text-red-700' : 'border-slate-200 text-slate-500'}`}>
                 <AlertCircle size={16}/> Urgent
               </button>
             </div>
           </div>

           <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Message</label>
             <textarea rows="4" className="w-full p-3 border rounded-xl" value={message} onChange={e => setMessage(e.target.value)} required placeholder="Details..."></textarea>
           </div>

           <button disabled={loading} className={`w-full py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition ${type === 'urgent' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
             {loading ? <Loader2 className="animate-spin"/> : 'Send Broadcast'}
           </button>
         </form>
      </div>

      {/* History List */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
         <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Sent History</h3>
            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-full">{(notifications || []).length} Total</span>
         </div>

         <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
           {/* FIX: Check length safely with (notifications || []) */}
           {(notifications || []).length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-xl">
                <Bell size={48} className="mb-2 opacity-20"/>
                <p className="text-sm">No messages sent yet.</p>
             </div>
           ) : (
             (notifications || []).map((note) => (
               <div key={note.id} className={`p-4 rounded-xl border flex gap-4 transition hover:shadow-md ${note.type === 'urgent' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                  <div className={`mt-1 min-w-[32px] h-8 rounded-full flex items-center justify-center ${note.type === 'urgent' ? 'bg-red-200 text-red-700' : 'bg-blue-200 text-blue-700'}`}>
                     {note.type === 'urgent' ? <AlertCircle size={18}/> : <Info size={18}/>}
                  </div>
                  
                  <div className="flex-1">
                     <div className="flex justify-between items-start">
                        <h4 className={`font-bold ${note.type === 'urgent' ? 'text-red-900' : 'text-blue-900'}`}>{note.subject}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{note.date}</span>
                     </div>
                     <p className={`text-sm mt-1 leading-relaxed ${note.type === 'urgent' ? 'text-red-800/80' : 'text-blue-800/80'}`}>{note.message}</p>
                  </div>

                  <button onClick={() => deleteNotification(note.id)} className="self-start p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition"><Trash2 size={16}/></button>
               </div>
             ))
           )}
         </div>
      </div>
    </div>
  );
}
