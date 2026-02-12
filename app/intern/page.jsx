"use client";
import { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext'; 
import { Upload, FileText, Image as ImageIcon, Camera, Bell, X, Trash2, Loader2, MessageCircle, Send, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InternDashboard() {
  const { 
    submitWork, submissions = [], currentIntern, 
    notifications = [], 
    gallery = [], addImage, deleteImage, sendSubmissionComment 
  } = useAdmin();
  
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [galleryImgs, setGalleryImgs] = useState([]); 
  const [galleryTitle, setGalleryTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const [chatMessage, setChatMessage] = useState('');
  const [activeSubId, setActiveSubId] = useState(null);
  const chatEndRef = useRef(null);

  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    const dismissedIds = JSON.parse(localStorage.getItem('eitp_dismissed_alerts')) || [];
    const active = (notifications || []).filter(n => !dismissedIds.includes(n.id));
    setVisibleNotifications(active);
  }, [notifications]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSubId, submissions]);

  const handleDismiss = (id) => {
    const dismissedIds = JSON.parse(localStorage.getItem('eitp_dismissed_alerts')) || [];
    if (!dismissedIds.includes(id)) {
      const updatedDismissed = [...dismissedIds, id];
      localStorage.setItem('eitp_dismissed_alerts', JSON.stringify(updatedDismissed));
    }
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
  };

  const internName = currentIntern ? currentIntern.name : "Guest Intern";
  // FILTER: Ensures we only see our own work
  const mySubmissions = submissions.filter(s => s.intern_name === internName);
  const activeSub = submissions.find(s => s.id === activeSubId);

  // --- HANDLERS ---
  
  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle || selectedFiles.length === 0) return;
    
    setUploading(true);
    try {
        // BULK UPLOAD: Await each one to ensure DB consistency
        for (const file of selectedFiles) {
          await submitWork({ 
            intern_name: internName, 
            title: taskTitle, 
            file_name: file.name, 
            file: file
          });
        }
        setTaskTitle(''); 
        setSelectedFiles([]); 
        alert("Reports Submitted Successfully!");
    } catch (err) {
        console.error(err);
        alert("Upload failed. Check your connection.");
    } finally {
        setUploading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    e.preventDefault();
    if(!galleryTitle || galleryImgs.length === 0) return;

    setUploading(true);
    try {
        for (const img of galleryImgs) {
          await addImage({ 
            title: galleryTitle, 
            file: img, 
            uploader: internName,
            date: new Date().toISOString().split('T')[0]
          });
        }
        setGalleryTitle(''); 
        setGalleryImgs([]); 
        alert("Gallery updated!");
    } catch (err) {
        alert("Gallery upload failed.");
    } finally {
        setUploading(false);
    }
  };

  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeSubId) return;

    try {
        await sendSubmissionComment(activeSubId, {
          sender: internName,
          text: chatMessage,
          role: 'intern' // Required for CSS alignment
        });
        setChatMessage('');
    } catch (err) {
        alert("Message failed to send.");
    }
  };

  const handleDeleteImage = async (id) => {
    if(confirm("Are you sure you want to delete this image?")) {
      await deleteImage(id);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Alerts Section */}
        <div className="space-y-4">
           <AnimatePresence>
              {visibleNotifications.map((note) => (
                <motion.div 
                  key={note.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-xl border-l-4 shadow-sm flex items-start gap-4 ${
                    note.type === 'urgent' ? 'bg-red-50 border-red-500 text-red-900' : 'bg-yellow-50 border-yellow-500 text-yellow-900'
                  }`}
                >
                   <div className={`p-2 rounded-full ${note.type === 'urgent' ? 'bg-red-200' : 'bg-yellow-200'}`}>
                      <Bell size={18} />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start">
                         <h4 className="font-bold text-sm uppercase tracking-wider mb-1">{note.type === 'urgent' ? 'Urgent Broadcast' : 'Announcement'}</h4>
                         <span className="text-[10px] opacity-60 font-mono">{note.date}</span>
                      </div>
                      <p className="font-bold text-lg leading-snug mb-1">{note.subject}</p>
                      {note.message && <p className="text-sm opacity-90 leading-relaxed whitespace-pre-wrap border-t border-black/10 pt-2 mt-2">{note.message}</p>}
                   </div>
                   <button onClick={() => handleDismiss(note.id)} className="p-1 hover:bg-black/10 rounded-full transition"><X size={16} /></button>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {/* Dashboard Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Intern Dashboard</h1>
          <p className="text-slate-500">Welcome back, <span className="font-bold text-blue-600">{internName}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Submission Form */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-fit">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Upload className="text-blue-600" /> Submit Weekly Report</h3>
            <form onSubmit={handleWorkSubmit} className="space-y-4">
              <input type="text" placeholder="Task Title" className="w-full px-4 py-3 rounded-xl bg-slate-50 border outline-none" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer relative hover:bg-slate-50 transition">
                <input type="file" multiple onChange={e => setSelectedFiles(Array.from(e.target.files))} className="absolute inset-0 opacity-0 cursor-pointer z-10" required />
                <p className="text-sm text-slate-500 font-bold">{selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : "Select Documents (PDF/ZIP)"}</p>
              </div>
              <button disabled={uploading} type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                {uploading ? <Loader2 className="animate-spin" /> : "Submit Reports"}
              </button>
            </form>
          </div>

          {/* Feedback Hub */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden h-[450px]">
             <div className="p-4 border-b bg-slate-50/50 flex items-center gap-2 font-bold text-slate-700">
                <MessageCircle size={18} className="text-blue-600"/> Feedback Hub
             </div>
             
             <div className="flex flex-1 overflow-hidden">
                <div className="w-1/3 border-r overflow-y-auto p-2 bg-slate-50/30">
                   {mySubmissions.map(sub => (
                      <div 
                        key={sub.id} 
                        onClick={() => setActiveSubId(sub.id)}
                        className={`p-3 mb-2 rounded-xl cursor-pointer text-xs border transition-all ${activeSubId === sub.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white border-slate-100 hover:bg-slate-100'}`}
                      >
                         <p className="font-bold truncate">{sub.title}</p>
                         <p className={`text-[9px] mt-1 ${activeSubId === sub.id ? 'text-blue-100' : 'text-slate-400'}`}>{sub.date}</p>
                      </div>
                   ))}
                </div>

                <div className="flex-1 flex flex-col bg-white">
                   {activeSub ? (
                      <>
                        <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                           {(activeSub.comments || []).map((msg, i) => (
                              <div key={i} className={`flex flex-col ${msg.role === 'intern' ? 'items-end' : 'items-start'}`}>
                                 <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'intern' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                                    <p>{msg.text}</p>
                                    <p className={`text-[8px] mt-1 opacity-60 uppercase font-bold`}>{msg.time}</p>
                                 </div>
                              </div>
                           ))}
                           <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleChatSend} className="p-3 border-t flex gap-2">
                           <input type="text" placeholder="Reply to admin..." className="flex-1 bg-slate-50 p-2 rounded-lg outline-none text-xs" value={chatMessage} onChange={e => setChatMessage(e.target.value)} />
                           <button className="p-2 bg-blue-600 text-white rounded-lg"><Send size={14}/></button>
                        </form>
                      </>
                   ) : (
                      <div className="flex-1 flex items-center justify-center text-slate-400 text-xs italic p-4 text-center">
                         Select a submission to view admin feedback.
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="space-y-6">
           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
             <ImageIcon className="absolute right-0 top-0 text-white opacity-10 w-64 h-64 -mr-10 -mt-10 pointer-events-none" />
             <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-1">
                   <h2 className="text-2xl font-bold mb-2">Campus Gallery</h2>
                   <p className="text-blue-100 text-sm">Share multiple moments from your department.</p>
                </div>
                <form onSubmit={handleGalleryUpload} className="md:col-span-2 flex flex-col md:flex-row gap-4">
                   <input type="text" placeholder="Event Caption..." className="flex-1 px-4 py-3 rounded-xl text-slate-900 outline-none shadow-md" value={galleryTitle} onChange={e => setGalleryTitle(e.target.value)} required />
                   <div className="relative bg-white text-blue-600 rounded-xl px-4 py-3 cursor-pointer hover:bg-blue-50 transition text-center min-w-[160px] shadow-md flex items-center justify-center gap-2 group">
                      <input type="file" multiple accept="image/*" onChange={e => setGalleryImgs(Array.from(e.target.files))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" required />
                      <Camera size={18} className="group-hover:scale-110 transition-transform"/>
                      <span className="text-sm font-bold truncate block max-w-[100px]">{galleryImgs.length > 0 ? `${galleryImgs.length} Selected` : "Choose Photos"}</span>
                   </div>
                   <button disabled={uploading} type="submit" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition">
                      {uploading ? <Loader2 className="animate-spin" /> : "Upload All"}
                   </button>
                </form>
             </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {gallery.map(img => (
               <div key={img.id} className="group relative rounded-xl overflow-hidden aspect-square shadow-sm border border-slate-200 bg-white">
                  <img src={img.url} alt={img.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3">
                     <p className="text-white text-xs font-bold truncate">{img.title}</p>
                     <p className="text-slate-300 text-[10px]">By {img.uploader}</p>
                  </div>
                  {img.uploader === internName && (
                    <button onClick={() => handleDeleteImage(img.id)} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition z-20"><Trash2 size={14} /></button>
                  )}
               </div>
             ))}
           </div>
        </div>
      </div>
    </main>
  );
}
