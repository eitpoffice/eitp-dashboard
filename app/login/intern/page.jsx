"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../../context/AdminContext'; // Ensure path is correct
import { LogIn, User, Lock, Loader2 } from 'lucide-react';

export default function InternLogin() {
  const router = useRouter();
  
  // FIX 1: Add loginIntern here
  const { loginIntern } = useAdmin(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // FIX 2: Make this function async
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // FIX 3: Add await here
      const success = await loginIntern(email, password);
      
      if (success) {
        router.push('/intern'); 
      } else {
        alert("Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <LogIn className="text-white" size={30} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Intern Login</h1>
          <p className="text-slate-500">Access your EITP Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="intern@clg.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
