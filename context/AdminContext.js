"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';
const makeUrlsSafe = (dataArray) => {
  if (!Array.isArray(dataArray)) return dataArray;
  
  return dataArray.map(item => {
    let newItem = { ...item };
    
    // Scan every field in the database row
    Object.keys(newItem).forEach(key => {
      // 1. Fix standard string URLs (like url, logo_url, file_url)
      if (typeof newItem[key] === 'string' && newItem[key].includes('supabase.co')) {
        newItem[key] = newItem[key].replace(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/g, '/api/supabase');
      } 
      // 2. Fix nested URLs inside JSON arrays (like Submission comments)
      else if (Array.isArray(newItem[key])) {
        newItem[key] = newItem[key].map(subItem => {
          if (typeof subItem === 'object' && subItem !== null) {
            let newSub = { ...subItem };
            Object.keys(newSub).forEach(subKey => {
              if (typeof newSub[subKey] === 'string' && newSub[subKey].includes('supabase.co')) {
                newSub[subKey] = newSub[subKey].replace(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/g, '/api/supabase');
              }
            });
            return newSub;
          }
          return subItem;
        });
      }
    });
    
    return newItem;
  });
};
// --------------------------------------

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
  const [tasks, setTasks] = useState([]); // This array needs manual updates to be snappy
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [mous, setMous] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [customTicker, setCustomTicker] = useState([]);
  
  // NEW: State for Unified Messaging (Admins, Interns, and Tasks)
  const [directMessages, setDirectMessages] = useState([]); 
  const [messages, setMessages] = useState([]); 
  
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

  // --- NEW: REAL-TIME CHAT NOTIFICATIONS EFFECT (Silent) ---
  useEffect(() => {
    if (typeof window !== 'undefined' && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      
      // Only show visual browser notification if sender is NOT the current logged-in user
      if (currentIntern && String(lastMsg.sender_id) !== String(currentIntern.id)) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`EITP: Message from ${lastMsg.sender_name}`, {
            body: lastMsg.text || "Sent a file",
            icon: "/favicon.ico" 
          });
        }
      }
    }
  }, [messages, currentIntern]);

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
      fetchTable('contact_messages', setContactMessages),
      fetchTable('direct_messages', setDirectMessages),
      fetchTable('messages', setMessages), 
      fetchTicker() 
    ]);
    setLoading(false);
  };

  const fetchTable = async (tableName, setState) => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data) {
      // THE GLOBAL FIX: Clean all URLs before setting the state
      const safeData = makeUrlsSafe(data);
      setState(safeData);
    }
    if (error) console.error(`Error fetching ${tableName}:`, error.message);
  };

  const fetchTicker = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'ticker_msg')
      .order('created_at', { ascending: false });
    
    if (data) setCustomTicker(data);
    if (error && error.code !== 'PGRST116') console.error("Ticker fetch error:", error.message);
  };

  // --- 3. HELPER: FILE UPLOAD ---
  const uploadFile = async (file, folder) => {
    if (!file) return null;

    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').replace(/_{2,}/g, '_');
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
    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    const { data: admin } = await supabase.from('admins').select('*').eq('email', cleanEmail).eq('password', cleanPass).single();
    if (admin) {
      const user = { ...admin, role: 'admin' };
      setCurrentIntern(user);
      localStorage.setItem('eitp_user', JSON.stringify(user));
      return user;
    }

    const { data: intern } = await supabase.from('interns').select('*').eq('email', cleanEmail).eq('password', cleanPass).single();
    if (intern) {
      const user = { ...intern, role: 'intern' };
      setCurrentIntern(user);
      localStorage.setItem('eitp_user', JSON.stringify(user));
      return user;
    }
    return null;
  };

  const logoutIntern = () => {
    setCurrentIntern(null);
    localStorage.removeItem('eitp_user');
  };

  // --- 5. DATA ACTIONS ---
  const updateTicker = async (newText) => {
    const { error } = await supabase.from('settings').insert([{ key: 'ticker_msg', value: newText }]);
    if (error) throw error;
  };

  const deleteTicker = async (id) => {
    const { error } = await supabase.from('settings').delete().eq('id', id);
    if (error) throw error;
  };

  const addIntern = async (i) => {
    const { error } = await supabase.from('interns').insert([{ 
      name: i.name, email: i.email, branch: i.branch, year: i.year, status: 'Active', password: i.password || '123' 
    }]);
    if (error) throw error;
  };

  const removeIntern = async (id) => {
    const { error } = await supabase.from('interns').delete().eq('id', id);
    if (error) throw error;
  };

  // *** FIXED TASK FUNCTIONS (IMMEDIATE UI UPDATES) ***
  const addTask = async (t) => {
    // 1. Insert and SELECT the returned data
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...t, status: 'Pending', comments: [] }])
      .select(); // Critical for getting the ID back
    
    if (error) throw error;

    // 2. Immediately update local state so it appears on screen
    if (data) {
      setTasks(prev => [...prev, ...data]);
    }
  };

  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateTaskStatus = async (id, status) => {
    const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
    if (!error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    }
  };
  // *** END FIXED TASK FUNCTIONS ***

  const addEvent = async (e) => await supabase.from('events').upsert([e]);
  const deleteEvent = async (id) => await supabase.from('events').delete().eq('id', id);

  const addImage = async (i) => {
    const filesToUpload = i.files && i.files.length > 0 ? i.files : [i.file];
    const uploadPromises = filesToUpload.map(file => uploadFile(file, 'gallery'));
    const urls = await Promise.all(uploadPromises);
    const validUrls = urls.filter(url => url !== null).join(',');

    if (!validUrls) return;

    const { error } = await supabase.from('gallery').insert([{ 
      title: i.title, url: validUrls, uploader: i.uploader, date: i.date 
    }]);

    if (error) throw error;
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
  
  const submitWork = async (w) => {
    const url = await uploadFile(w.file, 'submissions');
    if (!url) throw new Error("File upload failed");
    
    const { error } = await supabase.from('submissions').insert([{ 
      intern_name: w.intern_name, title: w.title, file_name: w.file_name, file_url: url, 
      status: 'Pending', date: new Date().toLocaleDateString(), comments: [] 
    }]);

    if (error) throw error;
  };

  const deleteSubmission = async (id) => {
    const { error } = await supabase.from('submissions').delete().eq('id', id);
    if (error) throw error;
  };

  const sendSubmissionComment = async (submissionId, commentData) => {
    let fileUrl = null;
    if (commentData.file) {
      fileUrl = await uploadFile(commentData.file, 'chat_attachments');
    }

    const { data: currentSub } = await supabase.from('submissions').select('comments').eq('id', submissionId).single();
    const existingComments = Array.isArray(currentSub?.comments) ? currentSub.comments : [];

    const newComment = {
      sender: commentData.sender,
      text: commentData.text,
      role: commentData.role,
      fileName: commentData.fileName || (commentData.file ? commentData.file.name : null),
      file_url: fileUrl,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: Date.now()
    };

    const { error } = await supabase.from('submissions').update({ comments: [...existingComments, newComment] }).eq('id', submissionId);
    if (error) throw error;
  };

  const deleteSubmissionComment = async (submissionId, commentIndex) => {
    const { data: currentSub, error: fetchError } = await supabase.from('submissions').select('comments').eq('id', submissionId).single();
    if (fetchError) throw fetchError;

    const existingComments = Array.isArray(currentSub?.comments) ? currentSub.comments : [];
    const updatedComments = existingComments.filter((_, index) => index !== commentIndex);

    const { error: updateError } = await supabase.from('submissions').update({ comments: updatedComments }).eq('id', submissionId);
    if (updateError) throw updateError;
  };

  // --- NEW: REVOLUTIONIZED UNIFIED MESSAGING LOGIC ---
  const sendUnifiedMessage = async ({ sender_id, sender_name, recipient_id, recipient_name, text, file, type, task_id = null }) => {
    let fileUrl = null;
    if (file) {
      fileUrl = await uploadFile(file, 'chat_attachments');
    }

    const { data, error } = await supabase.from('messages').insert([{
      sender_id,
      sender_name,
      recipient_id: String(recipient_id), 
      recipient_name,
      text,
      type, // 'task', 'direct_admin', or 'intern_to_intern'
      task_id,
      file_url: fileUrl,
      file_name: file ? file.name : null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]).select(); // Select to get data back for UI

    if (error) throw error;
    
    // Immediate UI Update
    if (data) setMessages(prev => [...prev, ...data]);
  };

  const deleteUnifiedMessage = async (id) => {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (!error) setMessages(prev => prev.filter(m => m.id !== id));
  };

  const sendDirectMessage = async (arg1, arg2) => {
    let payload = {};
    let fileToUpload = null;

    if (typeof arg1 === 'string' || typeof arg1 === 'number') {
      payload = { intern_id: arg1, ...arg2 };
      fileToUpload = arg2.file;
    } else {
      payload = { ...arg1 };
      fileToUpload = arg1.file;
    }

    let fileUrl = null;
    if (fileToUpload) {
      fileUrl = await uploadFile(fileToUpload, 'dm_attachments');
      if (!fileUrl) throw new Error("File upload failed");
    }

    const { error } = await supabase.from('direct_messages').insert([{
      intern_id: payload.intern_id || null,
      intern_name: payload.intern_name || null,
      sender: payload.sender,
      text: payload.text,
      role: payload.role,
      file_name: payload.fileName || (fileToUpload ? fileToUpload.name : null),
      file_url: fileUrl,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    if (error) throw error;
  };

  const deleteDirectMessage = async (id) => {
    const { error } = await supabase.from('direct_messages').delete().eq('id', id);
    if (error) throw error;
  };

  const addDocument = async (doc) => {
    const url = await uploadFile(doc.file, 'documents');
    await supabase.from('documents').upsert([{ ...doc, file_url: url, file: null }]);
  };
  const deleteDocument = async (id) => await supabase.from('documents').delete().eq('id', id);

  const addMou = async (formData) => {
    const logoUrl = await uploadFile(formData.logoFile, 'logos');
    const photoUrl = await uploadFile(formData.photoFile, 'photos');
    const docUrl = await uploadFile(formData.docFile, 'docs');
    
    await supabase.from('mous').upsert([{ 
      partner: formData.partner, scope: formData.scope, date: formData.date, duration: formData.duration,
      status: formData.status, description: formData.description, logo_url: logoUrl, photo_url: photoUrl, doc_url: docUrl 
    }]);
  };
  const deleteMou = async (id) => await supabase.from('mous').delete().eq('id', id);

  return (
    <AdminContext.Provider value={{ 
      admins, interns, tasks, events, gallery, notifications, submissions, mous, documents, contactMessages, currentIntern, loading, customTicker,
      directMessages, 
      messages, 
      sendUnifiedMessage, 
      deleteUnifiedMessage, 
      loginIntern, logoutIntern, addIntern, removeIntern, addTask, deleteTask, updateTaskStatus,
      addEvent, deleteEvent, addImage, deleteImage, 
      sendContactMessage, deleteMessage, resolveMessage, sendReplyEmail,
      addNotification, deleteNotification, markAsReviewed, submitWork, sendSubmissionComment,
      deleteSubmission, deleteSubmissionComment,
      sendDirectMessage, deleteDirectMessage, 
      addDocument, deleteDocument, addMou, deleteMou, updateTicker, deleteTicker
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() { return useContext(AdminContext); }
