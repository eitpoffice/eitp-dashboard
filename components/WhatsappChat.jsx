"use client";
import { useState, useMemo, useEffect, useRef } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { User, Users, MessageCircle, Send, Paperclip, CheckCircle, Trash2, Search } from 'lucide-react';

export default function WhatsAppChat({ mode }) { // mode = 'intern' or 'admin'
  const { 
    currentIntern, interns, messages, sendMessage, deleteUnifiedMessage 
  } = useAdmin();

  const [activeContact, setActiveContact] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [search, setSearch] = useState('');
  const chatEndRef = useRef(null);

  // 1. Filter Contacts based on Mode
  const contacts = useMemo(() => {
    let list = [];
    if (mode === 'intern') {
      list = [{ id: 'all_admins', name: 'Admin Team', type: 'direct_admin', isGroup: true }, ...interns.filter(i => i.id !== currentIntern?.id)];
    } else {
      list = interns; // Admins see all interns
    }
    return list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [interns, currentIntern, search, mode]);

  // 2. Filter Active Chat Messages (WhatsApp logic)
  const activeChats = useMemo(() => {
    if (!activeContact) return [];
    return messages.filter(m => {
      const isMe = String(m.sender_id) === String(currentIntern?.id);
      const isToMe = String(m.recipient_id) === String(currentIntern?.id) || m.recipient_id === 'all_admins';
      const isFromTarget = String(m.sender_id) === String(activeContact.id);
      const isToTarget = String(m.recipient_id) === String(activeContact.id);

      if (activeContact.id === 'all_admins') {
        return (isMe && m.recipient_id === 'all_admins') || (isToMe && m.type === 'direct_admin' && !isMe);
      }
      return (isMe && isToTarget) || (isFromTarget && isToMe);
    });
  }, [messages, activeContact, currentIntern]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeChats]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    await sendMessage({
      sender_id: currentIntern.id,
      sender_name: currentIntern.name,
      recipient_id: activeContact.id,
      recipient_name: activeContact.name,
      text: msgText,
      type: activeContact.id === 'all_admins' ? 'direct_admin' : (mode === 'admin' ? 'direct_admin' : 'intern_to_intern')
    });
    setMsgText('');
  };

  return (
    <div className="flex h-[600px] bg-white rounded-3xl shadow-xl overflow-hidden border">
      {/* SIDEBAR */}
      <div className="w-80 border-r flex flex-col bg-slate-50">
        <div className="p-4 bg-white border-b space-y-3">
          <h2 className="font-black text-xl text-slate-800">Chats</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input type="text" placeholder="Search contacts..." className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-xs outline-none" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {contacts.map(c => (
            <div key={c.id} onClick={() => setActiveContact(c)} className={`p-3 rounded-2xl cursor-pointer flex items-center gap-3 transition-all ${activeContact?.id === c.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white'}`}>
               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeContact?.id === c.id ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>{c.isGroup ? <Users size={20}/> : <User size={20}/>}</div>
               <div className="overflow-hidden">
                 <p className="font-bold text-sm truncate">{c.name}</p>
                 <p className={`text-[10px] truncate ${activeContact?.id === c.id ? 'text-blue-100' : 'text-slate-400'}`}>{c.branch || 'Official Channel'}</p>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col bg-[#e5ddd5]">
        {activeContact ? (
          <>
            <div className="p-4 bg-[#f0f2f5] border-b flex items-center gap-3 shadow-sm">
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border shadow-sm"><User size={20} className="text-blue-600"/></div>
               <div className="font-bold text-slate-800">{activeContact.name}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {activeChats.map((msg, i) => {
                const isMe = String(msg.sender_id) === String(currentIntern?.id);
                return (
                  <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-2xl text-sm shadow-sm max-w-[75%] ${isMe ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}>
                      {!isMe && <p className="text-[10px] font-black text-blue-600 mb-1 uppercase">{msg.sender_name}</p>}
                      <p>{msg.text}</p>
                      <div className="flex justify-end mt-1 opacity-50 text-[9px] font-bold">
                        {msg.time} {isMe && <CheckCircle size={10} className="ml-1 text-blue-500" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-3 bg-[#f0f2f5] flex items-center gap-3">
              <input type="text" placeholder="Type a message..." className="flex-1 bg-white border-none px-4 py-3 rounded-xl outline-none text-sm shadow-sm" value={msgText} onChange={e => setMsgText(e.target.value)} />
              <button type="submit" className="p-3 bg-[#00a884] text-white rounded-full shadow-md"><Send size={18}/></button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <MessageCircle size={60} className="opacity-10 mb-4" />
            <p className="font-bold">WhatsApp for EITP</p>
            <p className="text-sm opacity-60">Select a contact to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
