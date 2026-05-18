"use client";

import { motion } from 'motion/react';
import { MessageSquareWarning, FileText, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export default function Grievance() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 dark:bg-[#0C0C0C] min-h-screen">
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-brand-navy text-brand-gold rounded-full flex items-center justify-center mx-auto mb-6">
             <MessageSquareWarning size={32} />
          </div>
          <h1 className="text-4xl font-serif text-brand-navy dark:text-white mb-4">Raise a Grievance</h1>
          <p className="text-gray-600 dark:text-gray-400">
            We are committed to resolving your issues promptly. Please provide details of your grievance or support request below.
          </p>
        </motion.div>

        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 p-12 text-center shadow-xl border border-gray-200 dark:border-gray-700"
          >
             <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
               <FileText size={40} />
             </div>
             <h2 className="text-2xl font-serif text-brand-navy dark:text-white mb-4">Ticket Submitted Successfully</h2>
             <p className="text-gray-600 dark:text-gray-400 mb-8">
               Your grievance has been registered with Ticket ID: <strong className="text-brand-navy dark:text-white">#SVI-{Math.floor(1000 + Math.random() * 9000)}</strong>. Our support team will get back to you within 24-48 business hours.
             </p>
             <button onClick={() => setSubmitted(false)} className="text-brand-gold font-bold uppercase tracking-widest text-xs border-b border-brand-gold pb-1 hover:text-brand-navy dark:hover:text-white transition-colors">
               Submit Another Request
             </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 p-8 md:p-12 shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-300">Client Name</label>
                  <input type="text" required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-brand-gold transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-300">Registered Phone</label>
                  <input type="tel" required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-brand-gold transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-300">Project Name</label>
                  <input type="text" required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-brand-gold transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-300">Category</label>
                  <select required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-brand-gold transition-colors appearance-none">
                    <option value="">Select Category</option>
                    <option value="payment">Payment &amp; Accounts</option>
                    <option value="construction">Construction Updates</option>
                    <option value="documents">Documentation / Registry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-300">Grievance Description</label>
                <textarea required rows={5} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-brand-gold transition-colors resize-none" placeholder="Please describe your issue in detail..."></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-brand-navy dark:bg-brand-gold text-white dark:text-brand-navy py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-gold hover:text-brand-navy dark:hover:bg-white transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>Submit Request <Send size={16} /></>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </section>
    </div>
  );
}
