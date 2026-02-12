"use client";
import { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { 
  ClipboardList, Plus, Trash2, Calendar, User, 
  MessageSquare, Send, CheckCircle2, Clock, X, Loader2 
} from 'lucide-react';

export default function TaskManager() {
  // FIX: Default 'tasks' and 'interns' to empty arrays []
  const { tasks = [], addTask, deleteTask, updateTaskStatus, interns = [] } = useAdmin();
  
  const [activeTab, setActiveTab] = useState('All');
  const [showForm, setShowForm] = useState(false);
  
  // New Task Form State
  const [newTask, setNewTask] = useState({ 
    title: '', 
    assigned_to: '', // Stores Intern Name
    date: '', 
    priority: 'Medium',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  // Filter Logic
  const filteredTasks = (tasks || []).filter(t => activeTab === 'All' || t.status === activeTab);

  const handleAddTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    await addTask(newTask);
    setNewTask({ title: '', assigned_to: '', date: '', priority: 'Medium', description: '' });
    setShowForm(false);
    setLoading(false);
    alert("Task Assigned!");
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-6">
      
      {/* Header & Controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
         <div className="flex gap-2">
            {['All', 'Pending', 'In Progress', 'Completed'].map(status => (
              <button 
                key={status}
                onClick={() => setActiveTab(status)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === status ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                {status}
              </button>
            ))}
         </div>
         <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg">
            <Plus size={18}/> New Task
         </button>
      </div>

      {/* Task Board */}
      <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative">
         {/* FIX: Check length safely with (tasks || []) */}
         {(tasks || []).length > 0 ? (
           <div className="h-full overflow-y-auto p-4 space-y-3 custom-scrollbar">
             {filteredTasks.map((task) => (
               <div key={task.id} className="group relative p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition shadow-sm hover:shadow-md flex flex-col gap-3">
                  
                  {/* Task Header */}
                  <div className="flex justify-between items-start">
                     <div>
                        <h4 className="font-bold text-slate-800 text-lg">{task.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                           <span className="flex items-center gap-1"><User size={12}/> {task.assigned_to}</span>
                           <span className="flex items-center gap-1"><Calendar size={12}/> Due: {task.date}</span>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                             task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                             task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                             'bg-green-50 text-green-600 border-green-100'
                           }`}>{task.priority}</span>
                        </div>
                     </div>
                     <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-300 hover:text-red-500 transition hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                  </div>

                  {/* Description */}
                  {task.description && <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{task.description}</p>}

                  {/* Status Control */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
                     <span className={`text-xs font-bold px-2 py-1 rounded ${
                        task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                     }`}>{task.status}</span>
                     
                     <div className="flex gap-2">
                        {task.status !== 'In Progress' && task.status !== 'Completed' && (
                          <button onClick={() => updateTaskStatus(task.id, 'In Progress')} className="text-xs font-bold text-blue-600 hover:underline">Start</button>
                        )}
                        {task.status !== 'Completed' && (
                          <button onClick={() => updateTaskStatus(task.id, 'Completed')} className="text-xs font-bold text-green-600 hover:underline">Complete</button>
                        )}
                     </div>
                  </div>
               </div>
             ))}
             {filteredTasks.length === 0 && <div className="text-center py-20 text-slate-400">No tasks in this category.</div>}
           </div>
         ) : (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
              <ClipboardList size={48} className="mb-4 opacity-20"/>
              <p>No tasks assigned yet.</p>
           </div>
         )}
      </div>

      {/* Slide-over Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end">
           <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col animate-slide-in">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="font-bold text-xl">Assign New Task</h2>
                 <button onClick={() => setShowForm(false)}><X className="text-slate-400 hover:text-slate-800"/></button>
              </div>
              
              <form onSubmit={handleAddTask} className="space-y-4 flex-1 overflow-y-auto">
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                   <input type="text" className="w-full p-3 border rounded-xl" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                 </div>
                 
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Assign To</label>
                   <select className="w-full p-3 border rounded-xl bg-white" value={newTask.assigned_to} onChange={e => setNewTask({...newTask, assigned_to: e.target.value})} required>
                      <option value="">Select Intern...</option>
                      {/* FIX: Safely map interns */}
                      {(interns || []).map(i => <option key={i.id} value={i.name}>{i.name} ({i.id})</option>)}
                   </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Due Date</label>
                      <input type="date" className="w-full p-3 border rounded-xl" value={newTask.date} onChange={e => setNewTask({...newTask, date: e.target.value})} required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Priority</label>
                      <select className="w-full p-3 border rounded-xl bg-white" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                         <option>Low</option><option>Medium</option><option>High</option>
                      </select>
                    </div>
                 </div>

                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                   <textarea rows="4" className="w-full p-3 border rounded-xl" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}></textarea>
                 </div>

                 <button disabled={loading} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl mt-auto">
                    {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Assign Task'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
