"use client";
import { useState, useRef, useEffect, useMemo } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { 
  Users, CheckCircle, Clock, Mail, 
  Bell, FileText, Download, ListChecks, MessageCircle, Send, ChevronDown, Paperclip, X, User, Trash2, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* --- HELPER COMPONENT: FILE ATTACHMENT PILL --- */
const FilePill = ({ file, onRemove }) => (
  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg w-fit mb-2 shadow-sm border border-blue-100">
    <Paperclip size={14} />
    <span className="text-xs font-bold truncate max-w-[200px]">{file.name}</span>
    <button onClick={onRemove} className="hover:bg-blue-200 p-1 rounded-full transition"><X size={12} /></button>
  </div>
);

export default function AdminDashboard() {
  const { 
    addNotification, 
    submissions = [], 
    markAsReviewed, 
    interns = [], 
    tasks = [],
    contactMessages = [],
    messages = [],
    sendUnifiedMessage,
    deleteUnifiedMessage,
    sendSubmissionComment,
    deleteSubmissionComment,
    currentIntern: admin // Admin session
  } = useAdmin();

  // --- HUB MODE STATE ---
  const [hubMode, setHubMode] = useState('submissions'); // 'submissions' or 'direct'
  const [searchQuery, setSearchQuery] = useState(''); // NEW: Search State

  // --- STATE FOR SUBMISSIONS CHAT ---
  const [activeSubId, setActiveSubId] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatFile, setChatFile] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const chatEndRef = useRef(null);

  // --- STATE FOR DIRECT CHAT WITH INTERNS ---
  const [activeInternId, setActiveInternId] = useState(null);
  const [dmMessage, setDmMessage] = useState('');
  const [dmFile, setDmFile] = useState(null);
  const dmEndRef = useRef(null);

  // --- READ MESSAGES (RED DOT) STATE ---
  const [readMessages, setReadMessages] = useState({});

  useEffect(() => {
    const storedRead = JSON.parse(localStorage.getItem('eitp_read_messages_admin')) || {};
    setReadMessages(storedRead);
  }, []);

  // --- LOGIC FOR STATS ---
  const resolvedCount = contactMessages.filter(m => m.status === 'resolved').length;
  const pendingCount = contactMessages.filter(m => m.status !== 'resolved').length;

  const activeSub = submissions.find(s => s.id === activeSubId);
  const activeIntern = interns.find(i => i.id === activeInternId);
  
  // --- FILTER DIRECT INBOX CHATS ---
  const activeDmChats = useMemo(() => {
    if (hubMode !== 'direct' || !activeInternId) return [];
    return messages.filter(m => {
      const isFromMe = String(m.sender_id) === String(admin?.id) || String(m.sender_name).includes('Admin');
      const isToMe = String(m.recipient_id) === String(admin?.id) || String(m.recipient_name).includes('Admin') || m.recipient_id === 'all_admins';
      const isFromTarget = String(m.sender_id) === String(activeInternId);
      const isToTarget = String(m.recipient_id) === String(activeInternId);
      return (m.type === 'direct_admin') && ((isFromMe && isToTarget) || (isFromTarget && isToMe));
    });
  }, [messages, hubMode, activeInternId, admin]);

  // --- NEW: FILTER & SORT LISTS ---
  const filteredSubmissions = useMemo(() => {
    // 1. Reverse to show newest first (assuming DB returns ascending)
    let data = [...submissions].reverse(); 
    // 2. Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(s => s.title.toLowerCase().includes(q) || s.intern_name.toLowerCase().includes(q));
    }
    return data;
  }, [submissions, searchQuery]);

  const filteredInterns = useMemo(() => {
    let data = [...interns];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(i => i.name.toLowerCase().includes(q));
    }
    return data;
  }, [interns, searchQuery]);

  // Auto-scrolls
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeSub, submissions]);
  useEffect(() => { dmEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeDmChats, hubMode]);

  // --- RED DOT LOGIC FOR SUBMISSIONS ---
  const hasUnreadInternMessage = (sub) => {
    if (!sub.comments || sub.comments.length === 0) return false;
    const lastComment = sub.comments[sub.comments.length - 1];
    if (lastComment.role !== 'intern') return false; // Hide if admin sent the last message
    return String(readMessages[`sub_${sub.id}`]) !== String(lastComment.id);
  };

  // --- RED DOT LOGIC FOR INBOX ---
  const hasUnreadDirectMsg = (internId) => {
    const thread = messages.filter(m => {
       const isFromMe = String(m.sender_id) === String(admin?.id) || String(m.sender_name).includes('Admin');
       const isToMe = String(m.recipient_id) === String(admin?.id) || String(m.recipient_name).includes('Admin') || m.recipient_id === 'all_admins';
       return (m.type === 'direct_admin') && ((isFromMe && String(m.recipient_id) === String(internId)) || (isToMe && String(m.sender_id) === String(internId)));
    });
    if (thread.length === 0) return false;
    const lastMsg = thread[thread.length - 1];
    
    const isMe = String(lastMsg.sender_id) === String(admin?.id) || String(lastMsg.sender_name).includes('Admin');
    if (isMe) return false; // No dot if Admin sent the last message
    
    return String(readMessages[`dm_${internId}`]) !== String(lastMsg.id);
  };

  // --- TAB HEADER RED DOT INDICATORS ---
  const hasAnyUnreadSubmissions = submissions.some(sub => hasUnreadInternMessage(sub));
  const hasAnyUnreadDirect = interns.some(intern => hasUnreadDirectMsg(intern.id));

  // --- MARK AS READ LOGIC ---
  useEffect(() => {
    if (hubMode === 'submissions' && activeSubId && activeSub?.comments?.length > 0) {
      const lastComment = activeSub.comments[activeSub.comments.length - 1];
      if (lastComment.role === 'intern' && String(readMessages[`sub_${activeSubId}`]) !== String(lastComment.id)) {
         const updated = { ...readMessages, [`sub_${activeSubId}`]: String(lastComment.id) };
         setReadMessages(updated);
         localStorage.setItem('eitp_read_messages_admin', JSON.stringify(updated));
      }
    } else if (hubMode === 'direct' && activeInternId && activeDmChats.length > 0) {
      const lastMsg = activeDmChats[activeDmChats.length - 1];
      const isMe = String(lastMsg.sender_id) === String(admin?.id) || String(lastMsg.sender_name).includes('Admin');
      if (!isMe && String(readMessages[`dm_${activeInternId}`]) !== String(lastMsg.id)) {
         const updated = { ...readMessages, [`dm_${activeInternId}`]: String(lastMsg.id) };
         setReadMessages(updated);
         localStorage.setItem('eitp_read_messages_admin', JSON.stringify(updated));
      }
    }
  }, [activeSubId, activeSub, activeDmChats, hubMode, activeInternId, admin, readMessages]);

  // --- HANDLERS ---
  const handleBroadcast = () => {
    const urgentMessage = "📢 ALERT: There will be a review on the works today. Please complete all tasks by today.";
    addNotification({ subject: "Urgent Review Alert", type: 'urgent', message: urgentMessage });
    alert("Broadcast sent successfully!");
  };

  const handleSubmissionChatSend = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() && !chatFile) return;
    try {
        await sendSubmissionComment(activeSubId, {
          sender: `Admin (${admin?.name || 'Team'})`,
          text: chatMessage,
          file: chatFile,
          role: 'admin'
        });
        setChatMessage(''); setChatFile(null);
    } catch (err) { alert("Message failed to send."); }
  };

  const handleDmSend = async (e) => {
    e.preventDefault();
    if (!dmMessage.trim() && !dmFile) return;
    try {
        await sendUnifiedMessage({
          sender_id: admin?.id || 'admin', sender_name: `Admin (${admin?.name || 'Team'})`,
          recipient_id: activeInternId, recipient_name: activeIntern.name,
          text: dmMessage, file: dmFile, type: 'direct_admin'
        });
        setDmMessage(''); setDmFile(null);
    } catch (err) { alert("DM failed to send."); }
  };

  const handleDeleteMessage = async (subId, commentIndex) => {
    if(confirm("Delete this message?")) await deleteSubmissionComment(subId, commentIndex);
  };
  
  const handleDeleteUnifiedMsg = async (id) => { 
    if(confirm("Delete this message?")) await deleteUnifiedMessage(id); 
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

        {/* --- QUICK ACTIONS & ALERTS ROW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-[-20px] right-[-20px] p-4 opacity-10 rotate-12 pointer-events-none"><Bell size={180} /></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md"><Bell className="text-yellow-400" size={24} /></div>
              <h3 className="font-bold text-2xl mb-2">Mass Broadcast</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-sm">Immediately notify all active interns about deadlines, unexpected holidays, or emergency meetings.</p>
              <button onClick={handleBroadcast} className="w-full md:w-auto px-8 py-3 bg-yellow-500 text-slate-900 font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition transform active:scale-95 shadow-lg shadow-yellow-500/20">Send Urgent Alert</button>
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Clock className="text-white" size={24} /></div>
              <h4 className="font-bold text-xl">System Tip</h4>
            </div>
            <p className="text-blue-100 text-base leading-relaxed">
              You have <span className="font-black text-white text-xl mx-1">{pendingCount}</span> student queries and potentially new submission messages waiting for a response. Replying to them promptly increases the EITP cell's efficiency rating.
            </p>
          </div>
        </div>

        {/* --- WHATSAPP-STYLE COMMUNICATION HUB --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden h-[600px]">
          
          {/* Top Selection Tabs */}
          <div className="p-3 border-b bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between font-bold text-slate-700">
             <div className="flex items-center gap-2 bg-slate-200/50 p-1 rounded-xl w-fit">
               <button onClick={() => { setHubMode('submissions'); setActiveInternId(null); setSearchQuery(''); }} className={`relative px-6 py-2 rounded-lg text-xs uppercase tracking-widest transition-all ${hubMode === 'submissions' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
                 Reports
                 {hasAnyUnreadSubmissions && <div className="absolute top-0 right-0 -mt-1 -mr-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]" />}
               </button>
               <button onClick={() => { setHubMode('direct'); setActiveSubId(null); setSearchQuery(''); }} className={`relative px-6 py-2 rounded-lg text-xs uppercase tracking-widest transition-all ${hubMode === 'direct' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
                 Inbox
                 {hasAnyUnreadDirect && <div className="absolute top-0 right-0 -mt-1 -mr-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]" />}
               </button>
             </div>
             <span className="text-[10px] font-black bg-white text-slate-600 px-4 py-2 rounded-full shadow-sm border border-slate-200 uppercase tracking-widest hidden md:block">
                EITP Secure Comm
             </span>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            
            {/* LEFT SIDEBAR (Contacts/Reports) */}
            <div className="w-1/3 border-r flex flex-col bg-slate-50/30">
              
              {/* NEW: SEARCH BAR */}
              <div className="px-4 pt-3 pb-1">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder={hubMode === 'submissions' ? "Search reports..." : "Search interns..."} 
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-400 transition-colors shadow-sm"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {hubMode === 'submissions' ? (
                  filteredSubmissions.length > 0 ? (
                    <>
                      {filteredSubmissions.slice(0, visibleCount).map((sub) => {
                        const isActive = activeSubId === sub.id;
                        return (
                          <div key={sub.id} onClick={() => setActiveSubId(sub.id)} className={`group relative p-4 rounded-xl cursor-pointer border transition-all ${isActive ? 'bg-blue-600 text-white shadow-md border-blue-600' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                            <div className="pr-4">
                              <p className={`font-bold truncate text-sm ${isActive ? 'text-white' : 'text-slate-900'}`}>{sub.title}</p>
                              <div className={`text-[10px] mt-1.5 flex flex-col gap-0.5 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                                <span className="font-bold uppercase tracking-wider">{sub.intern_name}</span>
                                <span>{sub.date}</span>
                              </div>
                            </div>
                            {hasUnreadInternMessage(sub) && !isActive && <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]" />}
                            <div className="absolute bottom-4 right-4">
                              {sub.status === 'Pending' ? <span className={`w-2 h-2 rounded-full block ${isActive ? 'bg-yellow-300' : 'bg-yellow-400'}`} title="Pending Review" /> : <CheckCircle size={14} className={isActive ? 'text-green-300' : 'text-green-500'} title="Reviewed" />}
                            </div>
                          </div>
                        );
                      })}
                      {filteredSubmissions.length > visibleCount && (
                        <button onClick={() => setVisibleCount(prev => prev + 5)} className="w-full mt-2 py-3 flex items-center justify-center gap-1 text-[11px] font-black text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors uppercase tracking-widest shadow-sm">View More <ChevronDown size={14} /></button>
                      )}
                    </>
                  ) : <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60"><FileText size={32} className="mb-2" /><p className="text-xs font-bold uppercase tracking-widest">No Submissions</p></div>
                ) : (
                  <>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1">Intern Directory</p>
                    {filteredInterns.map(intern => (
                      <div key={intern.id} onClick={() => setActiveInternId(intern.id)} className={`relative p-3 rounded-xl cursor-pointer border flex items-center gap-3 transition-all ${activeInternId === intern.id ? 'bg-blue-600 text-white shadow-md border-blue-600' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activeInternId === intern.id ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}><User size={18} /></div>
                         <div className="overflow-hidden"><p className={`font-bold truncate text-sm ${activeInternId === intern.id ? 'text-white' : 'text-slate-900'}`}>{intern.name}</p><p className={`text-[10px] uppercase font-bold truncate mt-0.5 ${activeInternId === intern.id ? 'text-blue-200' : 'text-slate-400'}`}>{intern.branch}</p></div>
                         {hasUnreadDirectMsg(intern.id) && activeInternId !== intern.id && <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* RIGHT PANE: WHATSAPP CHAT WINDOW */}
            <div className="flex-1 flex flex-col bg-[#e5ddd5] relative">
              {(activeSub || activeIntern) ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3 border-b bg-[#f0f2f5] flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-white text-slate-500 rounded-full flex items-center justify-center border shrink-0">{hubMode === 'submissions' ? <FileText size={18} /> : <User size={20}/>}</div>
                      <div className="truncate">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{hubMode === 'submissions' ? activeSub.title : activeIntern.name}</h4>
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">{hubMode === 'submissions' ? activeSub.intern_name : 'Online'}</p>
                      </div>
                    </div>
                    {hubMode === 'submissions' && (
                      <div className="flex items-center gap-2 shrink-0">
                        {activeSub.file_url && <a href={activeSub.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white border text-slate-700 text-[10px] font-black uppercase rounded-lg hover:bg-slate-50 transition"><Download size={12} /> File</a>}
                        {activeSub.status === 'Pending' ? <button onClick={() => markAsReviewed(activeSub.id)} className="px-3 py-1.5 text-[10px] font-black uppercase text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md">Mark Reviewed</button> : <span className="px-3 py-1.5 text-[10px] font-black uppercase text-green-700 bg-green-100 rounded-lg flex items-center gap-1"><CheckCircle size={12} /> Reviewed</span>}
                      </div>
                    )}
                  </div>

                  {/* Chat Bubbles */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
                    {hubMode === 'submissions' ? (
                       activeSub.comments?.length > 0 ? (
                         activeSub.comments.map((msg, i) => {
                           const isMe = msg.role === 'admin';
                           return (
                             <div key={i} className={`w-full flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-center gap-2 w-fit max-w-[85%] ${isMe ? 'flex-row-reverse' : ''}`}>
                                  <div className={`p-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}>
                                     {!isMe && <p className="text-[10px] font-black text-blue-600 mb-1 uppercase tracking-widest">{msg.sender}</p>}
                                     {msg.fileName && <a href={msg.file_url || "#"} className="flex items-center gap-2 p-2 bg-black/10 rounded-lg text-xs font-bold mb-2 w-fit hover:bg-black/20 transition"><Paperclip size={12}/> {msg.fileName}</a>}
                                     <p className="whitespace-pre-wrap">{msg.text}</p>
                                     <p className={`text-[8px] mt-1 opacity-60 uppercase font-bold ${isMe ? 'text-right' : 'text-left'}`}>{msg.time}</p>
                                  </div>
                                  {isMe && (
                                    <button onClick={() => handleDeleteMessage(activeSub.id, i)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                                      <Trash2 size={12}/>
                                    </button>
                                  )}
                                </div>
                             </div>
                           )
                         })
                       ) : (
                         <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                            <MessageCircle size={40} className="mb-3" />
                            <p className="text-sm font-bold bg-white px-4 py-2 rounded-full shadow-sm">Send a message to start.</p>
                         </div>
                       )
                    ) : (
                       activeDmChats.length > 0 ? (
                         activeDmChats.map((msg, i) => {
                           const isMe = String(msg.recipient_id) === String(activeInternId);
                           return (
                             <div key={msg.id || i} className={`w-full flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-center gap-2 w-fit max-w-[85%] ${isMe ? 'flex-row-reverse' : ''}`}>
                                  <div className={`p-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}>
                                     {!isMe && <p className="text-[10px] font-black text-blue-600 mb-1 uppercase tracking-widest">{msg.sender_name}</p>}
                                     {msg.file_url && <a href={msg.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-black/10 rounded-lg text-xs font-bold mb-2 w-fit hover:bg-black/20 transition-all"><Paperclip size={12}/> {msg.file_name}</a>}
                                     <p className="whitespace-pre-wrap">{msg.text}</p>
                                     <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-center mt-1 opacity-60 text-[9px] font-bold gap-1`}>
                                        <span>{msg.time}</span>
                                     </div>
                                  </div>
                                  {isMe && (
                                     <button onClick={() => handleDeleteUnifiedMsg(msg.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                                        <Trash2 size={12}/>
                                     </button>
                                  )}
                                </div>
                             </div>
                           );
                         })
                       ) : (
                         <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                            <MessageCircle size={40} className="mb-3" />
                            <p className="text-sm font-bold bg-white px-4 py-2 rounded-full shadow-sm">Send a message to start.</p>
                         </div>
                       )
                    )}
                    <div ref={hubMode === 'submissions' ? chatEndRef : dmEndRef} />
                  </div>

                  {/* Input Form */}
                  <div className="p-3 bg-slate-50 border-t">
                    {hubMode === 'submissions' ? (chatFile && <FilePill file={chatFile} onRemove={() => setChatFile(null)} />) : (dmFile && <FilePill file={dmFile} onRemove={() => setDmFile(null)} />)}
                    <form onSubmit={hubMode === 'submissions' ? handleSubmissionChatSend : handleDmSend} className="flex flex-row items-center gap-2">
                      <label className="p-2 text-slate-500 hover:text-blue-600 cursor-pointer shrink-0">
                         <Paperclip size={20} /><input type="file" className="hidden" onChange={e => hubMode === 'submissions' ? setChatFile(e.target.files[0]) : setDmFile(e.target.files[0])} />
                      </label>
                      <input type="text" placeholder="Type a message..." className="flex-1 bg-white border px-4 py-2.5 rounded-lg outline-none text-xs shadow-sm" value={hubMode === 'submissions' ? chatMessage : dmMessage} onChange={e => hubMode === 'submissions' ? setChatMessage(e.target.value) : setDmMessage(e.target.value)} />
                      <button type="submit" disabled={(hubMode === 'submissions' && !chatMessage.trim() && !chatFile) || (hubMode === 'direct' && !dmMessage.trim() && !dmFile)} className="p-2.5 bg-blue-600 disabled:opacity-50 text-white rounded-lg shadow-sm hover:opacity-90 shrink-0"><Send size={14}/></button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 text-slate-400 p-10 text-center">
                  <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4"><MessageCircle size={40} className="opacity-40" /></div>
                  <h3 className="font-bold text-slate-900 mb-1">EITP Secure Chat</h3>
                  <p className="text-xs max-w-[250px]">Select a report or intern from the left sidebar to start messaging securely.</p>
                </div>
              )}
            </div>
            
          </div>
        </div>

      </div>
    </main>
  );
}
