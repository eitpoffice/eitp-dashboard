"use client";
import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Image as ImageIcon, Trash2, Plus, Loader2, X, Upload, Calendar } from 'lucide-react';

export default function AdminGallery() {
  const { gallery, addImage, deleteImage, loading, currentIntern } = useAdmin();
  
  // Modal & Upload States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form States
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Handle File Selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Handle Bulk Upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      // Loop through all selected files and upload them one by one
      // We use Promise.all to do this efficiently
      await Promise.all(selectedFiles.map(file => 
        addImage({ 
          title: title, 
          date: date || new Date().toISOString().split('T')[0], // Use selected date or today
          file: file, 
          uploader: currentIntern?.name || 'Administrator' 
        })
      ));

      // Reset and Close
      setIsModalOpen(false);
      setTitle('');
      setDate('');
      setSelectedFiles([]);
      alert("All images uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Some images failed to upload. Check console.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 h-screen">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40}/>
      <p className="text-slate-500 font-medium">Loading Gallery...</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ImageIcon className="text-blue-600" /> Gallery Manager
          </h1>
          <p className="text-slate-500 mt-1">Manage images displayed on the public website.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> Add Images
        </button>
      </div>

      {/* --- GALLERY GRID --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gallery.map((img) => (
          <div key={img.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 aspect-square hover:shadow-md transition-all">
            <img 
              src={img.url} 
              alt={img.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4">
              <p className="text-white text-sm font-bold mb-1 text-center line-clamp-2">{img.title}</p>
              {img.date && <p className="text-slate-300 text-xs mb-4">{img.date}</p>}
              
              <button 
                onClick={() => { if(confirm("Delete this image?")) deleteImage(img.id) }} 
                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition transform hover:scale-110 shadow-lg"
                title="Delete Image"
              >
                <Trash2 size={20}/>
              </button>
            </div>
          </div>
        ))}
        
        {gallery.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <ImageIcon size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400 font-medium">No images found. Upload some!</p>
          </div>
        )}
      </div>

      {/* --- UPLOAD MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Upload Images</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition"
              >
                <X size={24} className="text-slate-500"/>
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              
              {/* 1. Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Event / Caption</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Annual Tech Fest 2025"
                  className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              {/* 2. Date Input (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Date (Optional)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date" 
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition font-medium text-slate-600"
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
              </div>

              {/* 3. Multi-File Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Select Images</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/30 transition cursor-pointer relative group">
                  <input 
                    type="file" 
                    required 
                    multiple // Allow multiple files
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                  />
                  <div className="pointer-events-none">
                    <Upload className="mx-auto text-slate-300 group-hover:text-blue-500 transition mb-3" size={32} />
                    <p className="text-sm text-slate-500 font-medium">
                      {selectedFiles.length > 0 
                        ? <span className="text-blue-600 font-bold">{selectedFiles.length} files selected</span> 
                        : "Click to select multiple images"
                      }
                    </p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP supported</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                disabled={uploading || selectedFiles.length === 0} 
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition shadow-lg shadow-slate-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" /> Uploading {selectedFiles.length} images...
                  </>
                ) : (
                  <>
                    <Upload size={20} /> Upload All
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
