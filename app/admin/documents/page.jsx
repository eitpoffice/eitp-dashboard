"use client";
import { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { FolderOpen, FileText, User, Trash2, Upload, Loader2 } from 'lucide-react';

export default function AdminDocuments() {
  // FIX: Default 'documents' and 'interns' to empty arrays []
  const { documents = [], addDocument, deleteDocument, interns = [] } = useAdmin();
  
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !assignedTo) return;
    setLoading(true);
    
    // FIX: Check if interns exist before searching
    const internName = (interns || []).find(i => i.id === assignedTo)?.name || "All Interns";

    await addDocument({
      title,
      assignedTo,
      assignedName: internName,
      file: file, // Raw File
      size: (file.size / 1024).toFixed(1) + ' KB'
    });

    setTitle(''); setAssignedTo(''); setFile(null);
    setLoading(false);
    alert("Document sent!");
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Upload Form */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-fit">
        <h2 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2"><FolderOpen className="text-indigo-600"/> Send Document</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Document Title</label>
            <input type="text" className="w-full p-3 border rounded-xl" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Offer Letter" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Recipient</label>
            <select className="w-full p-3 border rounded-xl bg-white" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required>
              <option value="">Select Intern...</option>
              {/* FIX: Check if interns exist before mapping */}
              {(interns || []).map(i => <option key={i.id} value={i.id}>{i.name} ({i.id})</option>)}
            </select>
          </div>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 relative">
             <input type="file" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
             <Upload className="mx-auto text-slate-400 mb-2"/>
             <p className="text-sm font-bold text-slate-600">{file ? file.name : "Choose PDF / Doc"}</p>
          </div>
          <button disabled={loading} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition flex justify-center">
            {loading ? <Loader2 className="animate-spin"/> : 'Send Document'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg mb-6">Sent Documents Log</h3>
        <div className="space-y-3">
          {/* FIX: Check if documents exist before mapping */}
          {(documents || []).map(doc => (
            <div key={doc.id} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between hover:border-indigo-200 transition bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center"><FileText size={20} /></div>
                <div>
                  <h4 className="font-bold text-slate-900">{doc.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                     <span className="flex items-center gap-1"><User size={12}/> {doc.assigned_name}</span>
                     <span>• {doc.size}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => deleteDocument(doc.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
            </div>
          ))}
          {(!documents || documents.length === 0) && <div className="text-center py-10 text-slate-400">No documents sent.</div>}
        </div>
      </div>
    </div>
  );
}
