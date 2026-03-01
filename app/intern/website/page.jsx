"use client";
import { useState, useEffect } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { Globe, Plus, Trash2, Calendar, Loader2, X, Megaphone, Save, Edit3, List } from 'lucide-react';

export default function WebsiteEditor() {
  const { 
    events = [], 
    addEvent, 
    deleteEvent, 
    loading: globalLoading,
    customTicker = [], 
    updateTicker, 
    deleteTicker 
  } = useAdmin();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // NEW: Initial state includes start_date and deadline
  const initialEventState = { title: '', date: '', start_date: '', deadline: '', description: '', type: 'Workshop' };
  const [newEvent, setNewEvent] = useState(initialEventState);
  
  const [customType, setCustomType] = useState("");
  const [loading, setLoading] = useState(false);

  const [tickerInput, setTickerInput] = useState("");
  const [tickerLoading, setTickerLoading] = useState(false);

  const handleAddTicker = async () => {
    if (!tickerInput.trim()) return alert("Ticker cannot be empty");
    setTickerLoading(true);
    try {
      await updateTicker(tickerInput); 
      setTickerInput("");
      alert("Announcement Added!");
    } catch (err) {
      alert("Failed to add ticker.");
    } finally {
      setTickerLoading(false);
    }
  };

  const handlePublish = async () => {
    if(!newEvent.title) return alert("Title is required!");
    setLoading(true);
    
    // FORMATTING: Ensure empty strings are sent as NULL to the database
    const finalEventData = { 
      ...newEvent, 
      type: newEvent.type === "Custom" ? customType : newEvent.type,
      start_date: newEvent.start_date || null,
      deadline: newEvent.deadline || null,
      // Fallback: secretly save start_date to the old date column to prevent errors
      date: newEvent.start_date || newEvent.date || null 
    };

    try {
      await addEvent(finalEventData); 
      setIsModalOpen(false);
      setNewEvent(initialEventState);
      setCustomType("");
      alert("Event Published!");
    } catch (err) {
      alert("Error publishing event. Make sure your database columns are updated.");
    } finally {
      setLoading(false);
    }
  };

  // HELPER: Format date range for the Admin List View
  const renderDateRange = (event) => {
    const startStr = event.start_date || event.date;
    const endStr = event.deadline || event.start_date || event.date;
    
    if (!startStr) return "No Date Set";
    
    const startObj = new Date(startStr);
    const endObj = new Date(endStr);
    
    const formatOpts = { month: 'short', day: 'numeric', year: 'numeric' };
    let result = startObj.toLocaleDateString('default', formatOpts);
    
    if (endStr && endStr !== startStr) {
      result += ` - ${endObj.toLocaleDateString('default', formatOpts)}`;
    }
    
    return result;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Globe size={24} className="text-blue-500" /> Website Manager
          </h1>
          <p className="text-slate-500 text-sm">Manage homepage events and scrolling announcements.</p>
        </div>
        <button 
          onClick={() => {
            setNewEvent(initialEventState);
            setIsModalOpen(true);
          }} 
          className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> New Event
        </button>
      </div>

      {/* TICKER LIST MANAGEMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h2 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <Megaphone className="text-yellow-500" size={20}/> New Ticker
          </h2>
          <textarea 
            placeholder="Type announcement here..." 
            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 transition font-medium mb-4" 
            rows="3"
            value={tickerInput} 
            onChange={e => setTickerInput(e.target.value)} 
          />
          <button 
            onClick={handleAddTicker}
            disabled={tickerLoading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
          >
            {tickerLoading ? <Loader2 className="animate-spin" size={18}/> : <><Plus size={18}/> Add to Ticker</>}
          </button>
        </div>

        {/* List Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <List className="text-blue-500" size={20}/> Active Scrolling Messages
          </h2>
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {Array.isArray(customTicker) && customTicker.length > 0 ? customTicker.map((t) => (
              <div key={t.id} className="p-4 border border-slate-100 rounded-xl flex justify-between items-center group hover:bg-slate-50 transition-all">
                <p className="text-sm font-medium text-slate-700 flex-1 pr-4">{t.value}</p>
                <button 
                  onClick={() => { if(confirm("Delete this ticker message?")) deleteTicker(t.id); }}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )) : (
              <div className="py-10 text-center text-slate-400 italic text-sm">No custom ticker messages active.</div>
            )}
          </div>
        </div>
      </div>

      {/* Events Grid Section */}
      <div className="bg-slate-100/50 p-1 rounded-xl"></div>
      <h2 className="font-bold text-xl text-slate-900 px-2">Published Events</h2>
      
      {globalLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(events || []).map((event) => (
            <div key={event.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative group hover:border-blue-300 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                  <Calendar size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-wider">{event.type}</span>
                  <h3 className="font-bold text-slate-900 mt-2 line-clamp-1">{event.title}</h3>
                  {/* NEW: Displaying the formatted date range */}
                  <p className="text-xs font-bold text-blue-500 mt-1 uppercase tracking-wider">{renderDateRange(event)}</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => { setNewEvent(event); setIsModalOpen(true); }} className="p-2 bg-blue-50 text-blue-400 hover:text-blue-600 rounded-lg"><Edit3 size={18} /></button>
                <button onClick={() => { if(confirm("Remove this event?")) deleteEvent(event.id); }} className="p-2 bg-red-50 text-red-400 hover:text-red-600 rounded-lg"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL SECTION UPDATED */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl text-slate-900">{newEvent.id ? 'Edit Event' : 'Create Event'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <div className="space-y-5">
              {/* Row 1: Title */}
              <input 
                className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
                placeholder="Event Name" 
                value={newEvent.title} 
                onChange={e => setNewEvent({...newEvent, title: e.target.value})} 
              />
              
              {/* Row 2: Type */}
              <div className="grid grid-cols-2 gap-4">
                <select 
                  className="w-full border border-slate-200 p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
                  value={newEvent.type} 
                  onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                >
                  <option>Workshop</option><option>Seminar</option><option>Hackathon</option><option>Webinar</option><option>Custom</option>
                </select>
                {newEvent.type === "Custom" ? (
                  <input className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Custom Type" value={customType} onChange={e => setCustomType(e.target.value)} />
                ) : <div />}
              </div>

              {/* Row 3: New Date System */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700" 
                    value={newEvent.start_date || newEvent.date || ''} 
                    onChange={e => setNewEvent({...newEvent, start_date: e.target.value, date: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block">End Date (Optional)</label>
                  <input 
                    type="date" 
                    className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700" 
                    value={newEvent.deadline || ''} 
                    onChange={e => setNewEvent({...newEvent, deadline: e.target.value})} 
                  />
                </div>
              </div>

              {/* Row 4: Description */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Description</label>
                <textarea 
                  className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
                  rows="4" 
                  placeholder="Enter event details. Press enter to create new paragraphs." 
                  value={newEvent.description} 
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">Cancel</button>
              <button onClick={handlePublish} disabled={loading} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : (newEvent.id ? "Save Changes" : "Publish Live")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
