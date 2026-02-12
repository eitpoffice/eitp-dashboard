"use client";
import { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { Calendar, Trash2, Plus, Loader2 } from 'lucide-react';

export default function AdminEvents() {
  // FIX: Default 'events' to empty array [] if it is undefined to prevent crash
  const { events = [], addEvent, deleteEvent } = useAdmin();
  
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'Workshop', description: '' });
  const [loading, setLoading] = useState(false);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    await addEvent(newEvent);
    setNewEvent({ title: '', date: '', type: 'Workshop', description: '' });
    setLoading(false);
    alert("Event Published!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {/* Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
         <h2 className="font-bold text-xl text-slate-900 mb-4 flex items-center gap-2"><Calendar className="text-blue-600"/> Add Event</h2>
         <form onSubmit={handleAddEvent} className="space-y-4">
           <input type="text" placeholder="Event Title" className="w-full p-3 border rounded-xl" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required />
           <div className="flex gap-4">
             <input type="date" className="flex-1 p-3 border rounded-xl" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} required />
             <select className="flex-1 p-3 border rounded-xl bg-white" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
               <option>Workshop</option><option>Seminar</option><option>Hackathon</option><option>Placement</option>
             </select>
           </div>
           <textarea placeholder="Description" rows="2" className="w-full p-3 border rounded-xl" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} required></textarea>
           <button disabled={loading} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition">
             {loading ? <Loader2 className="animate-spin"/> : <><Plus size={18}/> Publish Event</>}
           </button>
         </form>
      </div>

      {/* List */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
         <h3 className="font-bold text-lg mb-4">Upcoming Schedule</h3>
         <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
           
           {/* FIX: Check if events exist before mapping */}
           {(events || []).map(e => (
             <div key={e.id} className="p-3 border rounded-xl flex justify-between items-center hover:bg-slate-50">
               <div><p className="font-bold text-slate-900">{e.title}</p><p className="text-xs text-slate-500">{e.date} • {e.type}</p></div>
               <button onClick={() => deleteEvent(e.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
             </div>
           ))}
           
           {(!events || events.length === 0) && <p className="text-slate-400 text-center text-sm">No events found.</p>}
         </div>
      </div>
    </div>
  );
}
