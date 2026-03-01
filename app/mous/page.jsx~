"use client";
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAdmin } from '../../context/AdminContext';
import { Search, Filter, FileText, Calendar, Clock, Briefcase, Building2, Image as ImageIcon } from 'lucide-react';

export default function MoUs() {
  const { mous } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const filteredMoUs = mous.filter(mou => {
    const matchesSearch = mou.partner.toLowerCase().includes(searchTerm.toLowerCase()) || mou.scope.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || mou.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />
      <div className="bg-slate-900 text-white pt-32 pb-24 relative overflow-hidden text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 relative z-10">MoUs & Collaborations</h1>
        <p className="text-xl text-slate-300 relative z-10">Strategic partnerships with industry leaders.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-4 flex gap-4">
          <input type="text" placeholder="Search..." className="flex-1 p-3 border rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <select className="p-3 border rounded-lg bg-white" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option><option>Active</option><option>Under Review</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMoUs.map((mou) => (
          <div key={mou.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-slate-100 transition-all flex flex-col hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
              
              {/* LOGO HANDLING WITH FALLBACK */}
              <div className="relative">
                {mou.logo ? (
                  <img 
                    src={mou.logo.url} 
                    alt={mou.partner} 
                    className="w-16 h-16 rounded-xl border border-slate-100 bg-white p-1 object-contain shadow-sm" 
                    onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                  />
                ) : null}
                
                {/* Fallback Icon (Shows if logo is missing OR broken) */}
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-sm ${mou.logoColor || 'bg-blue-100 text-blue-600'} ${mou.logo ? 'hidden' : 'flex'}`}>
                  <Building2 size={32} />
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-slate-50 text-slate-600 border-slate-200">{mou.status}</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">{mou.partner}</h3>
            <p className="text-slate-500 text-sm mb-4 line-clamp-3">{mou.description}</p>

            {/* PHOTO HANDLING */}
            {mou.signingPhoto && (
              <div className="mb-6 relative h-32 rounded-lg overflow-hidden border border-slate-200 group">
                <img src={mou.signingPhoto.url} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt="Event" onError={(e) => e.target.style.display='none'} />
              </div>
            )}

            <div className="space-y-3 mb-6 pt-6 border-t border-slate-50 mt-auto text-sm text-slate-600">
              <div className="flex items-center"><Briefcase size={16} className="mr-3 text-slate-400"/> <span className="font-bold mr-2 text-slate-900">Scope:</span> {mou.scope}</div>
              <div className="flex items-center"><Calendar size={16} className="mr-3 text-slate-400"/> <span className="font-bold mr-2 text-slate-900">Date:</span> {mou.date}</div>
              <div className="flex items-center"><Clock size={16} className="mr-3 text-slate-400"/> <span className="font-bold mr-2 text-slate-900">Duration:</span> {mou.duration}</div>
            </div>

            {mou.document ? (
              <a href={mou.document.url} download={mou.document.name} className="w-full py-3 flex items-center justify-center gap-2 border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-900 hover:text-white transition-colors">
                <FileText size={18} /> Download Doc
              </a>
            ) : (
              <button disabled className="w-full py-3 flex items-center justify-center gap-2 border border-slate-100 bg-slate-50 rounded-lg text-slate-400 font-bold cursor-not-allowed">
                <FileText size={18} /> No Document
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
