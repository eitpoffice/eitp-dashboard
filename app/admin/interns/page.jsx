"use client";
import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext'; // Ensure this path is correct
import { UserPlus, Search, Trash2, User, Loader2, BookOpen } from 'lucide-react';

export default function Interns() {
  const { interns = [], addIntern, removeIntern } = useAdmin();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Updated state to match your table structure
  const [newIntern, setNewIntern] = useState({ 
    name: '', 
    email: '', 
    branch: 'CSE', 
    year: 'E4' 
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addIntern(newIntern);
      setNewIntern({ name: '', email: '', branch: 'CSE', year: 'E4' }); // Reset form
      alert("Intern Registered Successfully!");
    } catch (error) {
      alert(`Error: ${error.message || "Failed to add intern"}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic (Removed i.id check since id is now a number, kept name and email)
  const filteredInterns = (interns || []).filter(i => 
     (i.name && i.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
     (i.email && i.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      
      {/* --- ADD INTERN FORM --- */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 h-fit">
         <h2 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
           <UserPlus className="text-blue-600"/> Register Intern
         </h2>
         <form onSubmit={handleAdd} className="space-y-4">
           
           {/* Name */}
           <div>
             <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
             <input 
               type="text" 
               placeholder="e.g. Rahul Kumar" 
               className="w-full p-3 border rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none" 
               value={newIntern.name} 
               onChange={e => setNewIntern({...newIntern, name: e.target.value})} 
               required 
             />
           </div>

           {/* Email */}
           <div>
             <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
             <input 
               type="email" 
               placeholder="name@rgukt.ac.in" 
               className="w-full p-3 border rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none" 
               value={newIntern.email} 
               onChange={e => setNewIntern({...newIntern, email: e.target.value})} 
               required 
             />
           </div>

           {/* Branch & Year Row */}
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-bold text-slate-400 uppercase ml-1">Branch</label>
               <select 
                 className="w-full p-3 border rounded-xl bg-white mt-1 focus:ring-2 focus:ring-blue-500 outline-none" 
                 value={newIntern.branch} 
                 onChange={e => setNewIntern({...newIntern, branch: e.target.value})}
               >
                 <option value="CSE">CSE</option>
                 <option value="ECE">ECE</option>
                 <option value="MECH">MECH</option>
                 <option value="CIVIL">CIVIL</option>
                 <option value="MME">MME</option>
                 <option value="CHEM">CHEM</option>
               </select>
             </div>
             <div>
               <label className="text-xs font-bold text-slate-400 uppercase ml-1">Year</label>
               <select 
                 className="w-full p-3 border rounded-xl bg-white mt-1 focus:ring-2 focus:ring-blue-500 outline-none" 
                 value={newIntern.year} 
                 onChange={e => setNewIntern({...newIntern, year: e.target.value})}
               >
                 <option value="E1">E1</option>
                 <option value="E2">E2</option>
                 <option value="E3">E3</option>
                 <option value="E4">E4</option>
               </select>
             </div>
           </div>

           <button disabled={loading} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-slate-200 mt-4">
             {loading ? <Loader2 className="animate-spin"/> : 'Register Intern'}
           </button>
         </form>
      </div>

      {/* --- LIST VIEW --- */}
      <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
         <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-900">Intern Directory <span className="text-slate-400 text-sm ml-2">({filteredInterns.length})</span></h3>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search name or email..." 
                 className="pl-10 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-64" 
                 value={searchTerm} 
                 onChange={e => setSearchTerm(e.target.value)} 
               />
            </div>
         </div>

         <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
           {filteredInterns.map(intern => (
             <div key={intern.id} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center hover:bg-slate-50 transition group">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                   {intern.name ? intern.name.charAt(0).toUpperCase() : <User size={20}/>}
                 </div>
                 <div>
                   <p className="font-bold text-slate-900">{intern.name}</p>
                   <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                     <span className="font-medium text-slate-700">{intern.email}</span>
                     <span>•</span>
                     <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-semibold">{intern.year} - {intern.branch}</span>
                   </div>
                 </div>
               </div>
               <button 
                 onClick={() => { if(confirm(`Remove ${intern.name}?`)) removeIntern(intern.id) }} 
                 className="p-2 text-slate-300 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"
                 title="Remove Intern"
               >
                  <Trash2 size={20}/>
               </button>
             </div>
           ))}
           
           {filteredInterns.length === 0 && (
             <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User size={30} className="text-slate-300"/>
                </div>
                <p className="text-slate-400 font-medium">No interns found.</p>
             </div>
           )}
         </div>
      </div>
    </div>
  );
}
