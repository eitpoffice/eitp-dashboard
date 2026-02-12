"use client";
import { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext'; 
import { MessageSquare, Clock, CheckCircle, Send, Loader2 } from 'lucide-react';

export default function MyTasks() {
  // FIX: Default tasks and currentIntern to prevent undefined errors
  const { tasks = [], currentIntern, updateTaskStatus, addComment, loading } = useAdmin();
  const [activeTask, setActiveTask] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);

  // Filter tasks for THIS intern only
  // Using 'assigned_to' to match the Supabase SQL schema
  const myTasks = (tasks || []).filter(t => t.assigned_to === currentIntern?.name);

  const handleSendComment = async () => {
    if (!commentText || !activeTask) return;
    setSending(true);
    
    // In production, we push a new comment object into the jsonb array
    const newComment = { 
      user: currentIntern.name, 
      text: commentText, 
      time: new Date().toLocaleTimeString() 
    };

    // Note: addComment in AdminContext should be updated to handle Supabase JSONB
    await addComment(activeTask.id, newComment);
    
    setCommentText("");
    setSending(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
      {/* Task List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-xl font-bold text-slate-900">My Assignments</h1>
        </div>
        
        <div className="overflow-y-auto p-4 space-y-3 flex-1 custom-scrollbar">
          {myTasks.length > 0 ? myTasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => setActiveTask(task)} 
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeTask?.id === task.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-100 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex justify-between mb-2">
                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase border ${
                  task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                }`}>{task.priority}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                  task.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{task.status}</span>
              </div>
              <h3 className="font-bold text-slate-900">{task.title}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Clock size={12}/> Due: {task.date}
              </p>
            </div>
          )) : (
            <div className="text-center p-8 text-slate-400">No tasks assigned to you yet.</div>
          )}
        </div>
      </div>

      {/* Task Details & Chat */}
      {activeTask ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">{activeTask.title}</h2>
            
            {/* Status Updater */}
            <div className="flex gap-2 mt-4">
              {['Pending', 'In Progress', 'Completed'].map(status => (
                <button 
                  key={status}
                  onClick={() => updateTaskStatus(activeTask.id, status)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                    activeTask.status === status 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                      : 'text-slate-500 border-slate-200 hover:border-slate-400 bg-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50 custom-scrollbar">
            {/* FIX: Use optional chaining and default empty array for comments */}
            {(activeTask.comments || []).length > 0 ? (activeTask.comments.map((c, i) => (
              <div key={i} className={`flex flex-col ${c.user === currentIntern?.name ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] shadow-sm ${
                  c.user === currentIntern?.name 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-bold opacity-70">{c.user === currentIntern?.name ? 'You' : c.user}</p>
                    <p className="text-[9px] opacity-50">{c.time}</p>
                  </div>
                  <p className="leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))) : (
              <div className="text-center text-slate-300 text-xs py-10 italic">No updates sent yet. Send a message to the Admin below.</div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Type update to admin..."
            />
            <button 
              onClick={handleSendComment} 
              disabled={sending}
              className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
          <MessageSquare size={48} className="mb-2 opacity-20" />
          <p className="font-medium">Select a task to view details and chat</p>
        </div>
      )}
    </div>
  );
}
