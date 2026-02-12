"use client";
import { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { Globe, Plus, Trash2, Calendar, Loader2, X } from 'lucide-react';

export default function WebsiteEditor() {
  // FIX: Default 'events' to empty array to prevent crash
  const { events = [], addEvent, deleteEvent, loading: globalLoading } = useAdmin();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', description: '', type: 'Workshop' });
  const [loading, setLoading] = useState(false);

  // FIX: Make this async for Supabase
  const handlePublish = async () => {
    if(!newEvent.title) return;
    
    setLoading(true);
    try {
      await addEvent(newEvent); // Calls the Supabase logic in Context
      setIsModalOpen(false);
      setNewEvent({ title: '', date: '', description: '', type: 'Workshop' });
      alert("Event Published to Public Website!");
    } catch (err) {
      alert("Error publishing event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Globe size={24} className="text-blue-500" /> Website Manager
          </h1>
          <p className="text-slate-500 text-sm">Update the events displayed on the public landing page.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus size={18} /> Publish New Event
        </button>
      </div>

      {/* FIX: Show loading spinner if global data is fetching */}
      {globalLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* FIX: Safety check for events.map */}
          {(events || []).map((event) => (
            <div key={event.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative group hover:border-blue-300 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Calendar size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-wider">{event.type}</span>
                  <h3 className="font-bold text-slate-900 mt-2 line-clamp-1">{event.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{event.date}</p>
                </div>
              </div>
              
              <button 
                onClick={() => { if(confirm("Remove this event from public site?")) deleteEvent(event.id); }}
                className="absolute top-4 right-4 p-2 bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {events.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
              No public events currently listed.
            </div>
          )}
        </div>
      )}

      {/* Publish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Create Public Event</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Title</label>
                <input className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Event Name" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date</label>
                  <input type="date" className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Type</label>
                  <select className="w-full border border-slate-200 p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                    <option>Workshop</option><option>Seminar</option><option>Hackathon</option><option>Webinar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Short Description</label>
                <textarea className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" rows="3" placeholder="Details about the event..." value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">Cancel</button>
              <button 
                onClick={handlePublish} 
                disabled={loading}
                className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 disabled:bg-slate-400"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Publish Live"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
