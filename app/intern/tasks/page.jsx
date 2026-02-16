"use client";
import { useState, useRef, useEffect, useMemo } from 'react';
import { useAdmin } from '@/context/AdminContext'; 
import { 
  ClipboardList, CheckCircle2, Clock, MessageSquare, Send, 
  Paperclip, X, Loader2, AlertCircle, Calendar, Search, Trash2
} from 'lucide-react';

/* --- Helper: File Pill --- */
const FilePill = ({ file, onRemove }) => (
  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg w-fit mb-2 text-xs font-bold border border-blue-100">
    <Paperclip size={12} />
    <span className="truncate max-w-[120px]">{file.name}</span>
    <button onClick={onRemove} className="hover:bg-blue-200 p-1 rounded-full"><X size={10} /></button>
  </div>
);

export default function InternTasks() {
  const { 
    tasks = [], currentIntern, updateTaskStatus, deleteTask,
    messages = [], sendUnifiedMessage, deleteUnifiedMessage, loading 
  } = useAdmin();

  const [activeTask, setActiveTask] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [chatMsg, setChatMsg] = useState("");
  const [chatFile, setChatFile] = useState(null);
  const chatEndRef = useRef(null);

  // --- FILTER TASKS ---
  const myTasks = useMemo(() => {
    // Robust Filter: Ensure IDs are strings for comparison
    let data = (tasks || []).filter(t => String(t.intern_id) === String(currentIntern?.id));
    
    // Sort Newest First
    data = [...data].reverse();

    // Filter by Tab
    if (activeTab !== 'All') {
      data = data.filter(t => t.status === activeTab);
    }

    // Search
    if (searchQuery) {
      data = data.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return data;
  }, [tasks, currentIntern, activeTab, searchQuery]);

  // --- FILTER CHAT ---
  const taskMessages = useMemo(() => {
    if (!activeTask) return [];
    return messages.filter(m => String(m.task_id) === String(activeTask.id) && m.type === 'task');
  }, [messages, activeTask]);

  useEffect(() => { if (activeTask) chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [taskMessages, activeTask]);

  // --- ACTIONS ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim() && !chatFile) return;
    try {
      await sendUnifiedMessage({
        sender_id: currentIntern.id, sender_name: currentIntern.name,
        recipient_id: 'all_admins', recipient_name: 'Admin Team',
        text: chatMsg, file: chatFile, type: 'task', task_id: activeTask.id
      });
      setChatMsg(""); setChatFile(null);
    } catch (err) { alert("Failed to send."); }
  };

  const updateStatus = async (status) => {
    if (confirm(`Mark task as ${status}?`)) {
      await updateTaskStatus(activeTask.id, status);
      setActiveTask(prev => ({ ...prev, status }));
      if (activeTab !== 'All') setActiveTab(status); // Auto-switch tab to follow task
    }
  };

  const handleDeleteTask = async () => {
    if(confirm("Are you sure you want to delete this task? This cannot be undone.")) {
      await deleteTask(activeTask.id);
      setActiveTask(null);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if(confirm("Delete this message?")) await deleteUnifiedMessage(msgId);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)]">
      
      {/* --- LEFT PANE: TASK LIST --- */}
      <div className={`flex flex-col gap-4 transition-all duration-300 ${activeTask ? 'w-1/3' : 'w-full'}`}>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
           <div className="flex justify-between items-center">
             <h2 className="font-bold text-slate-700">My Assignments</h2>
             <span className="text-xs font-bold text-slate-400 uppercase">{myTasks.length} Tasks</span>
           </div>
           
           {/* Search */}
           <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input type="text" placeholder="Search my tasks..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-100" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
           </div>

           {/* Tabs */}
           <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {['All', 'Pending', 'In Progress', 'Completed', 'Verified'].map(s => (
                <button key={s} onClick={() => setActiveTab(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${activeTab === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>{s}</button>
              ))}
           </div>
        </div>

        <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 overflow-y-auto p-3 space-y-3 custom-scrollbar">
           {myTasks.length > 0 ? myTasks.map(task => (
             <div key={task.id} onClick={() => setActiveTask(task)} className={`group p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${activeTask?.id === task.id ? 'bg-white border-blue-500 ring-1 ring-blue-500' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-slate-800 text-sm truncate">{task.title}</h4>
                   <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${task.status === 'Completed' ? 'bg-blue-50 text-blue-600 border-blue-200' : task.status === 'Verified' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{task.status}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                   <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded"><AlertCircle size={10}/> {task.priority}</span>
                   <span className="flex items-center gap-1"><Calendar size={10}/> {task.date}</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                   <div className={`h-full rounded-full ${task.status === 'Verified' ? 'w-full bg-green-500' : task.status === 'Completed' ? 'w-[90%] bg-blue-500' : task.status === 'In Progress' ? 'w-[50%] bg-yellow-500' : 'w-[5%] bg-slate-300'}`} />
                </div>
             </div>
           )) : <div className="text-center py-20 text-slate-400 opacity-50"><ClipboardList size={40} className="mx-auto mb-2"/><p className="text-xs">No tasks found</p></div>}
        </div>
      </div>

      {/* --- RIGHT PANE: DETAILS & CHAT --- */}
      {activeTask && (
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden animate-slide-in">
           
           {/* Header */}
           <div className="p-5 border-b bg-slate-50 flex justify-between items-start">
              <div>
                 <h2 className="font-bold text-lg text-slate-900">{activeTask.title}</h2>
                 <p className="text-xs text-slate-500 mt-1">{activeTask.description || "No description provided."}</p>
              </div>
              <div className="flex gap-2">
                 <button onClick={handleDeleteTask} className="p-1.5 text-red-400 hover:bg-red-50 rounded-full h-fit transition" title="Delete Task"><Trash2 size={16}/></button>
                 <button onClick={() => setActiveTask(null)} className="p-1.5 hover:bg-slate-200 rounded-full h-fit"><X size={16}/></button>
              </div>
           </div>

           {/* Chat Messages */}
           <div className="flex-1 bg-[#e5ddd5] p-4 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
              {taskMessages.length > 0 ? taskMessages.map((msg, i) => {
                 // --- ROBUST ID CHECK (String Conversion) ---
                 const isMe = String(msg.sender_id) === String(currentIntern.id);
                 
                 return (
                   // 1. Outer Wrapper: Full Width
                   <div key={i} className={`w-full flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                      
                      {/* 2. Inner Wrapper: Controls row reversal for delete button placement */}
                      <div className={`flex items-center gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : ''}`}>
                        
                        {/* 3. The Bubble */}
                        <div className={`p-3 rounded-2xl text-xs shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none'}`}>
                           {!isMe && <p className="text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-widest">{msg.sender_name}</p>}
                           {msg.file_url && <a href={msg.file_url} target="_blank" className={`flex items-center gap-2 p-2 rounded mb-1 font-bold ${isMe ? 'bg-white/20' : 'bg-black/5'}`}><Paperclip size={10}/> {msg.file_name}</a>}
                           <p className="whitespace-pre-wrap">{msg.text}</p>
                           <p className={`text-[8px] opacity-60 text-right mt-1 font-bold ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>{msg.time}</p>
                        </div>

                        {/* 4. Delete Message Button (Only for Me) */}
                        {isMe && (
                          <button 
                            onClick={() => handleDeleteMessage(msg.id)} 
                            className="opacity-0 group-hover:opacity-100 transition p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                            title="Delete Message"
                          >
                            <Trash2 size={12}/>
                          </button>
                        )}
                      </div>
                   </div>
                 )
              }) : <div className="flex-1 flex flex-col items-center justify-center opacity-40"><MessageSquare size={32} className="mb-2"/><p className="text-xs font-bold">Ask doubts or share progress</p></div>}
              <div ref={chatEndRef} />
           </div>

           {/* Action Buttons */}
           <div className="p-3 bg-slate-50 border-t flex justify-between items-center px-4">
              <span className="text-xs font-bold text-slate-500 uppercase">My Actions</span>
              <div className="flex gap-2">
                 {activeTask.status === 'Pending' && <button onClick={() => updateStatus('In Progress')} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded flex items-center gap-1 hover:bg-blue-700 transition"><Clock size={12}/> Start Task</button>}
                 {activeTask.status === 'In Progress' && <button onClick={() => updateStatus('Completed')} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded flex items-center gap-1 hover:bg-green-700 transition"><CheckCircle2 size={12}/> Submit</button>}
                 {activeTask.status === 'Completed' && <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1.5 rounded flex items-center gap-1"><Clock size={12}/> Awaiting Verification</span>}
                 {activeTask.status === 'Verified' && <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1.5 rounded flex items-center gap-1"><CheckCircle2 size={12}/> Verified</span>}
              </div>
           </div>

           {/* Chat Input */}
           <div className="p-3 bg-white border-t">
              {chatFile && <FilePill file={chatFile} onRemove={() => setChatFile(null)} />}
              <form onSubmit={handleSend} className="flex gap-2 items-center">
                 <label className="p-2 hover:bg-slate-100 rounded-full cursor-pointer text-slate-500"><Paperclip size={18} /><input type="file" className="hidden" onChange={e => setChatFile(e.target.files[0])} /></label>
                 <input type="text" placeholder="Type message..." className="flex-1 bg-slate-100 px-4 py-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all" value={chatMsg} onChange={e => setChatMsg(e.target.value)} />
                 <button disabled={!chatMsg.trim() && !chatFile} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"><Send size={16}/></button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
