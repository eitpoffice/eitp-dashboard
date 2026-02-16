"use client";
import ChatTab from '@/components/ChatTab';

export default function InternChatPage() {
  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inbox</h1>
        <p className="text-slate-500 mt-1">Communicate with the Admin team and your peers securely.</p>
      </div>
      <ChatTab mode="intern" />
    </div>
  );
}
