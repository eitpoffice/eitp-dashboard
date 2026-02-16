"use client";
import ChatTab from '@/components/ChatTab';

export default function AdminChatPage() {
  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Team Chat</h1>
        <p className="text-slate-500 mt-1">Communicate directly with interns.</p>
      </div>
      <ChatTab mode="admin" />
    </div>
  );
}
