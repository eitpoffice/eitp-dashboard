"use client";
import { useState, useRef, useEffect, useMemo } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { 
  Plus, Calendar, User, MessageSquare, Send, CheckCircle2, 
  X, Loader2, Paperclip, AlertCircle, Search, ClipboardList, Trash2
} from 'lucide-react';

/* --- Helper: File Attachment Pill --- */
const FilePill = ({ file, onRemove }) => (
  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg w-fit mb-2 text-xs font-bold border border-blue-100">
    <Paperclip size={12} />
    <span className="truncate max-w-[120px]">{file.name}</span>
    <button onClick={onRemove} className="hover:bg-blue-200 p-1 rounded-full"><X size={10} /></button>
  </div>
);

export default function AdminTasks() {
  const { 
    tasks = [], addTask, updateTaskStatus, deleteTask, interns = [],
    messages = [], sendUnifiedMessage, deleteUnifiedMessage, currentIntern: admin
  } = useAdmin();

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Chat State
  const [chatMsg, setChatMsg] = useState('');
  const [chatFile, setChatFile] = useState(null);
  const chatEndRef = useRef(null);

  // New Task Form
  const [newTask, setNewTask] = useState({ title: '', assigned_to: '', date: '', priority: 'Medium', description: '' });
  const [loading, setLoading] = useState(false);

  // --- FILTER & SEARCH ---
  const filteredTasks = useMemo(() => {
    let data = [...tasks].reverse(); // Newest first
    
    // Filter by Tab
    if (activeTab !== 'All') data = data.filter(t => t.status === activeTab);
    
    // Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.assigned_to.toLowerCase().includes(q)
      );
    }
    return data;
  }, [tasks, activeTab, searchQuery]);

  // --- CHAT MESSAGES ---
  const taskMessages = useMemo(() => {
    if (!selectedTask) return [];
    return messages.filter(m => String(m.task_id) === String(selectedTask.id) && m.type === 'task');
  }, [messages, selectedTask]);

  useEffect(() => { if (selectedTask) chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [taskMessages, selectedTask]);

  // --- ACTIONS ---
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.assigned_to) return alert("Select an intern.");
    setLoading(true);
    
    try {
      const intern = interns.find(i => i.name === newTask.assigned_to);
      await addTask({ ...newTask, intern_id: intern?.id || null, status: 'Pending' });
      setNewTask({ title: '', assigned_to: '', date: '', priority: 'Medium', description: '' });
      setShowForm(false);
      alert("Task assigned successfully!");
    } catch (err) { 
      alert("Error: " + err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim() && !chatFile) return;
    try {
      await sendUnifiedMessage({
        sender_id: admin.id, sender_name: 'Admin',
        recipient_id: selectedTask.intern_id, recipient_name: selectedTask.assigned_to,
        text: chatMsg, file: chatFile, type: 'task', task_id: selectedTask.id
      });
      setChatMsg(''); setChatFile(null);
    } catch (err) { alert("Failed to send."); }
  };

  const changeStatus = async (status) => {
    if(confirm(`Change status to ${status}?`)) {
      await updateTaskStatus(selectedTask.id, status);
      setSelectedTask(prev => ({ ...prev, status }));
      
      // Auto-notify intern in chat
      const msg = status === 'Verified' ? "✅ Task Verified & Closed." : "⚠️ Revision Requested.";
      await sendUnifiedMessage({
        sender_id: admin.id, sender_name: 'Admin',
        recipient_id: selectedTask.intern_id, recipient_name: selectedTask.assigned_to,
        text: msg, type: 'task', task_id: selectedTask.id
      });
    }
  };

  const handleDeleteTask = async () => {
    if(confirm("Are you sure you want to delete this task? This cannot be undone.")) {
      await deleteTask(selectedTask.id);
      setSelectedTask(null);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if(confirm("Delete this message?")) await deleteUnifiedMessage(msgId);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)]">
      {/* LEFT: LIST */}
      <div className={`flex flex-col gap-4 transition-all duration-300 ${selectedTask ? 'w-1/3' : 'w-full'}`}>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
           <div className="flex justify-between items-center">
              <h2 className="font-bold text-slate-700">Project Board</h2>
              <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-blue-700"><Plus size={14}/> New Task</button>
           </div>
           <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input type="text" placeholder="Search tasks..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-100" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
           </div>
           <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {['All', 'Pending', 'In Progress', 'Completed', 'Verified'].map(s => (
                <button key={s} onClick={() => setActiveTab(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${activeTab === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>{s}</button>
              ))}
           </div>
        </div>

        <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 overflow-y-auto p-3 space-y-3 custom-scrollbar">
           {filteredTasks.length > 0 ? filteredTasks.map(task => (
             <div key={task.id} onClick={() => setSelectedTask(task)} className={`group p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedTask?.id === task.id ? 'bg-white border-blue-500 ring-1 ring-blue-500' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-slate-800 text-sm truncate">{task.title}</h4>
                   <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${task.status === 'Verified' ? 'bg-green-50 text-green-600 border-green-200' : task.status === 'Completed' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{task.status}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                   <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded"><User size={10}/> {task.assigned_to}</span>
                   <span className="flex items-center gap-1"><Calendar size={10}/> {task.date}</span>
                </div>
             </div>
           )) : <div className="text-center py-20 text-slate-400 opacity-50"><ClipboardList size={40} className="mx-auto mb-2"/><p className="text-xs">No tasks found</p></div>}
        </div>
      </div>

      {/* RIGHT: DETAILS */}
      {selectedTask && (
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden animate-slide-in">
           
           {/* Header */}
           <div className="p-5 border-b bg-slate-50 flex justify-between items-start">
              <div>
                 <h2 className="font-bold text-lg text-slate-900">{selectedTask.title}</h2>
                 <p className="text-xs text-slate-500 mt-1">{selectedTask.description || "No description."}</p>
                 <div className="flex gap-2 mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedTask.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{selectedTask.priority} Priority</span>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button onClick={handleDeleteTask} className="p-1.5 text-red-400 hover:bg-red-50 rounded-full h-fit transition" title="Delete Task"><Trash2 size={16}/></button>
                 <button onClick={() => setSelectedTask(null)} className="p-1.5 hover:bg-slate-200 rounded-full h-fit"><X size={16}/></button>
              </div>
           </div>

           {/* Chat Area */}
           <div className="flex-1 bg-[#e5ddd5] p-4 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
              {taskMessages.length > 0 ? taskMessages.map((msg, i) => {
                 // --- ROBUST ID CHECK (Strings vs Numbers) ---
                 // If Admin is sender, it's Me.
                 const isMe = String(msg.sender_id) === String(admin.id);
                 
                 return (
                   <div key={i} className={`w-full flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-center gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className={`p-3 rounded-2xl text-xs shadow-sm ${isMe ? 'bg-[#dcf8c6] text-slate-900 rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none'}`}>
                           {!isMe && <p className="text-[9px] font-bold text-blue-600 mb-1 uppercase tracking-widest">{msg.sender_name}</p>}
                           {msg.file_url && <a href={msg.file_url} target="_blank" className="flex items-center gap-2 p-2 bg-black/5 rounded mb-1 font-bold hover:bg-black/10"><Paperclip size={10}/> {msg.file_name}</a>}
                           <p className="whitespace-pre-wrap">{msg.text}</p>
                           <p className="text-[8px] opacity-50 text-right mt-1 font-bold">{msg.time}</p>
                        </div>
                        
                        {/* Delete Button (Only for Admin's own messages) */}
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
                 );
              }) : <div className="flex-1 flex flex-col items-center justify-center opacity-40"><MessageSquare size={32} className="mb-2"/><p className="text-xs font-bold">Start the discussion</p></div>}
              <div ref={chatEndRef} />
           </div>

           {selectedTask.status !== 'Verified' && (
             <div className="p-3 bg-yellow-50 border-t border-yellow-100 flex justify-between items-center">
                <span className="text-xs font-bold text-yellow-800 uppercase">Review Actions</span>
                <div className="flex gap-2">
                   <button onClick={() => changeStatus('In Progress')} className="px-3 py-1.5 bg-white border border-yellow-300 text-yellow-700 text-xs font-bold rounded hover:bg-yellow-100">Request Revision</button>
                   <button onClick={() => changeStatus('Verified')} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 flex items-center gap-1"><CheckCircle2 size={12}/> Verify</button>
                </div>
             </div>
           )}

           <div className="p-3 bg-white border-t">
              {chatFile && <FilePill file={chatFile} onRemove={() => setChatFile(null)} />}
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                 <label className="p-2 hover:bg-slate-100 rounded-full cursor-pointer text-slate-500"><Paperclip size={18} /><input type="file" className="hidden" onChange={e => setChatFile(e.target.files[0])} /></label>
                 <input type="text" placeholder="Type message..." className="flex-1 bg-slate-100 px-4 py-2 rounded-lg text-xs outline-none" value={chatMsg} onChange={e => setChatMsg(e.target.value)} />
                 <button disabled={!chatMsg.trim() && !chatFile} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"><Send size={16}/></button>
              </form>
           </div>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-scale-up">
              <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg">Assign Task</h3><button onClick={() => setShowForm(false)}><X size={20} className="text-slate-400 hover:text-slate-900"/></button></div>
              <form onSubmit={handleAddTask} className="space-y-3">
                 <input type="text" placeholder="Task Title" className="w-full p-2 border rounded-lg text-sm" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                 <select className="w-full p-2 border rounded-lg text-sm bg-white" value={newTask.assigned_to} onChange={e => setNewTask({...newTask, assigned_to: e.target.value})} required>
                    <option value="">Select Intern...</option>{interns.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
                 </select>
                 <div className="flex gap-2"><input type="date" className="w-1/2 p-2 border rounded-lg text-sm" value={newTask.date} onChange={e => setNewTask({...newTask, date: e.target.value})} required /><select className="w-1/2 p-2 border rounded-lg text-sm bg-white" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></div>
                 <textarea rows="3" placeholder="Description..." className="w-full p-2 border rounded-lg text-sm" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}></textarea>
                 <button disabled={loading} className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold">{loading ? <Loader2 className="animate-spin mx-auto"/> : 'Assign'}</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
