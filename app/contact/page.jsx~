"use client";
import { useState } from 'react';
import Navbar from '@/components/Navbar'; // Absolute path
import { useAdmin } from '@/context/AdminContext'; // Absolute path
import { Mail, Phone, MapPin, Send, Loader2, User, AtSign } from 'lucide-react';

export default function Contact() {
  const { sendContactMessage } = useAdmin();
  
  // State for form fields
  const [formData, setFormData] = useState({
    studentId: '',
    email: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Map local state to the database columns
      await sendContactMessage({
        student_id: formData.studentId,
        email: formData.email,
        message: formData.message
      });
      
      setSubmitted(true);
      setFormData({ studentId: '', email: '', message: '' });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      alert("Failed to send message. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* --- LEFT: CONTACT INFO --- */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Get in <span className="text-blue-600">Touch</span>
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed max-w-md">
                Have questions about internships, training programs, or placements? 
                Our team is here to help you navigate your professional journey.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start group">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Mail size={24} />
                </div>
                <div className="ml-5">
                  <h3 className="font-bold text-slate-900 text-lg">Email Us</h3>
                  <p className="text-slate-500 font-medium">eitp@rgukt.ac.in</p>
                </div>
              </div>
              
              <div className="flex items-start group">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Phone size={24} />
                </div>
                <div className="ml-5">
                  <h3 className="font-bold text-slate-900 text-lg">Call Support</h3>
                  <p className="text-slate-500 font-medium">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <MapPin size={24} />
                </div>
                <div className="ml-5">
                  <h3 className="font-bold text-slate-900 text-lg">Visit Office</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Room 101, Administrative Block,<br/>RGUKT AP Head Office.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT: CONTACT FORM --- */}
          <div className="relative">
            {/* Background Decoration */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10"></div>
            
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
              {submitted ? (
                <div className="py-12 text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h2>
                  <p className="text-slate-500">We will respond to your provided email address shortly.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-8 text-blue-600 font-bold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                        Student ID
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          required
                          type="text" 
                          value={formData.studentId}
                          onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50" 
                          placeholder="R123456" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          required
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50" 
                          placeholder="name@gmail.com" 
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                      Your Message
                    </label>
                    <textarea 
                      required
                      rows="4" 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50 resize-none" 
                      placeholder="How can we help you today?"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-3 disabled:bg-slate-400 active:scale-[0.98]"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
