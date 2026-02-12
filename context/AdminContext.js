"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  // --- 1. STATE DEFINITIONS ---
  const [currentIntern, setCurrentIntern] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('eitp_user');
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });

  const [admins, setAdmins] = useState([]);
  const [interns, setInterns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [mous, setMous] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 2. INITIALIZATION & REAL-TIME SYNC ---
  useEffect(() => {
    emailjs.init("WDzmjAq6UIBFXe6Ou"); 
    fetchAllData();

    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchAllData(); 
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchTable('admins', setAdmins),
      fetchTable('interns', setInterns),
      fetchTable('tasks', setTasks),
      fetchTable('events', setEvents),
      fetchTable('gallery', setGallery),
      fetchTable('notifications', setNotifications),
      fetchTable('submissions', setSubmissions),
      fetchTable('mous', setMous),
      fetchTable('documents', setDocuments),
      fetchTable('contact_messages', setContactMessages)
    ]);
    setLoading(false);
  };

  const fetchTable = async (tableName, setState) => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setState(data);
    if (error) console.error(`Error fetching ${tableName}:`, error.message);
  };

  // --- 3. HELPER: FILE UPLOAD (Sanitized) ---
  const uploadFile = async (file, folder) => {
    if (!file) return null;

    const cleanName = file.name
      .replace(/[^a-zA-Z0-9.]/g, '_')
      .replace(/_{2,}/g, '_');
    
    const fileName = `${Date.now()}_${cleanName}`;

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(`${folder}/${fileName}`, file);

    if (error) {
      console.error("Upload failed:", error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(`${folder}/${fileName}`);
    
    return publicUrl;
  };

  // --- 4. AUTH ACTIONS ---
  const loginIntern = async (email, password) => {
    const { data } = await supabase.from('interns').select('*').eq('email', email).eq('password', password).single();
    if (data) {
      setCurrentIntern(data);
      localStorage.setItem('eitp_user', JSON.stringify(data));
      return true;
    }
    return false;
  };

  const logoutIntern = () => {
    setCurrentIntern(null);
    localStorage.removeItem('eitp_user');
  };

  // --- 5. DATA ACTIONS ---

  const addIntern = async (i) => {
    const { error } = await supabase.from('interns').insert([{ 
      name: i.name,
      email: i.email,
      branch: i.branch,
      year: i.year,
      status: 'Active', 
      password: '123' 
    }]);
    if (error) throw error;
  };

  const removeIntern = async (id) => {
    const { error } = await supabase.from('interns').delete().eq('id', id);
    if (error) throw error;
  };

  const addTask = async (t) => await supabase.from('tasks').insert([{ ...t, status: 'Pending', comments: [] }]);
  const deleteTask = async (id) => await supabase.from('tasks').delete().eq('id', id);
  const updateTaskStatus = async (id, status) => await supabase.from('tasks').update({ status }).eq('id', id);

  const addEvent = async (e) => await supabase.from('events').insert([e]);
  const deleteEvent = async (id) => await supabase.from('events').delete().eq('id', id);

  const addImage = async (i) => {
    const url = await uploadFile(i.file, 'gallery');
    if (!url) return;
    await supabase.from('gallery').insert([{ 
      title: i.title, 
      url: url, 
      uploader: i.uploader,
      date: i.date 
    }]);
  };
  const deleteImage = async (id) => await supabase.from('gallery').delete().eq('id', id);

  const sendContactMessage = async (msgData) => await supabase.from('contact_messages').insert([msgData]);
  const deleteMessage = async (id) => await supabase.from('contact_messages').delete().eq('id', id);
  const resolveMessage = async (id, resolverName) => {
    await supabase.from('contact_messages').update({ status: 'resolved', resolved_by: resolverName }).eq('id', id);
  };

  const sendReplyEmail = async (targetEmail, studentId, replyText) => {
    const params = { to_email: targetEmail, student_id: studentId, message: replyText, reply_to: 'eitp@rgukt.ac.in' };
    return emailjs.send('service_blcq9rx', 'template_8see8ss', params);
  };

  const addNotification = async (n) => await supabase.from('notifications').insert([{ ...n, date: new Date().toLocaleString() }]);
  const deleteNotification = async (id) => await supabase.from('notifications').delete().eq('id', id);

  const markAsReviewed = async (id) => await supabase.from('submissions').update({ status: 'Reviewed' }).eq('id', id);
  
  // REFINED SUBMISSION LOGIC
  const submitWork = async (w) => {
    const url = await uploadFile(w.file, 'submissions');
    if (!url) throw new Error("File upload failed");
    
    const { error } = await supabase.from('submissions').insert([{ 
      intern_name: w.intern_name,
      title: w.title,
      file_name: w.file_name,
      file_url: url, 
      status: 'Pending', 
      date: new Date().toLocaleDateString(),
      comments: [] 
    }]);

    if (error) throw error;
  };

  const sendSubmissionComment = async (submissionId, commentData) => {
    const { data: currentSub } = await supabase
      .from('submissions')
      .select('comments')
      .eq('id', submissionId)
      .single();

    const existingComments = Array.isArray(currentSub?.comments) ? currentSub.comments : [];

    const { error } = await supabase
      .from('submissions')
      .update({ 
        comments: [...existingComments, {
          ...commentData,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          id: Date.now()
        }] 
      })
      .eq('id', submissionId);

    if (error) throw error;
  };

  const addDocument = async (doc) => {
    const url = await uploadFile(doc.file, 'documents');
    await supabase.from('documents').insert([{ ...doc, file_url: url, file: null }]);
  };
  const deleteDocument = async (id) => await supabase.from('documents').delete().eq('id', id);

  const addMou = async (formData) => {
    const logoUrl = await uploadFile(formData.logoFile, 'logos');
    const photoUrl = await uploadFile(formData.photoFile, 'photos');
    const docUrl = await uploadFile(formData.docFile, 'docs');
    
    await supabase.from('mous').insert([{ 
      partner: formData.partner,
      scope: formData.scope,
      date: formData.date,
      duration: formData.duration,
      status: formData.status,
      description: formData.description,
      logo_url: logoUrl, 
      photo_url: photoUrl, 
      doc_url: docUrl 
    }]);
  };
  const deleteMou = async (id) => await supabase.from('mous').delete().eq('id', id);

  return (
    <AdminContext.Provider value={{ 
      admins, interns, tasks, events, gallery, notifications, submissions, mous, documents, contactMessages, currentIntern, loading,
      loginIntern, logoutIntern, addIntern, removeIntern, addTask, deleteTask, updateTaskStatus,
      addEvent, deleteEvent, addImage, deleteImage, 
      sendContactMessage, deleteMessage, resolveMessage, sendReplyEmail,
      addNotification, deleteNotification, markAsReviewed, submitWork, sendSubmissionComment,
      addDocument, deleteDocument, addMou, deleteMou
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() { return useContext(AdminContext); }
