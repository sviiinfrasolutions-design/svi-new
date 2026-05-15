import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Phone, Mail, MessageSquare } from 'lucide-react';

export default function Registration() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/thank-you');
    }, 1500);
  };

  return (
    <div className="pt-32 pb-24 bg-brand-bg min-h-screen">
      <div className="container mx-auto px-4">
        
        <div className="max-w-5xl mx-auto bg-white shadow-2xl flex flex-col md:flex-row border border-gray-200">
          
          {/* Left panel */}
          <div className="md:w-5/12 bg-brand-navy p-12 lg:p-16 text-white flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' }}></div>
             
             <div className="relative z-10 block">
               <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold mb-4">Invest With Us</h4>
               <h2 className="text-4xl font-serif mb-6 leading-tight">Register<br/>Interest</h2>
               <p className="text-gray-300 mb-10 leading-relaxed text-sm">
                 Take the first step towards your dream property. Fill out the form and our property agents will get back to you with exclusive options.
               </p>
               
               <ul className="space-y-6">
                 <li className="flex items-center gap-4 text-sm font-medium tracking-wide">
                   <div className="w-6 h-6 border border-brand-gold flex items-center justify-center text-brand-gold text-xs">✓</div>
                   Early bird pricing
                 </li>
                 <li className="flex items-center gap-4 text-sm font-medium tracking-wide">
                   <div className="w-6 h-6 border border-brand-gold flex items-center justify-center text-brand-gold text-xs">✓</div>
                   Priority site visits
                 </li>
                 <li className="flex items-center gap-4 text-sm font-medium tracking-wide">
                   <div className="w-6 h-6 border border-brand-gold flex items-center justify-center text-brand-gold text-xs">✓</div>
                   Exclusive project updates
                 </li>
               </ul>
             </div>
             
             <div className="relative z-10 mt-16 pt-8 border-t border-white/10">
               <p className="text-sm text-gray-300 italic font-serif">
                 "Investing with SVI Infra was the best decision for my family's future."
               </p>
               <p className="text-[10px] uppercase tracking-widest font-bold mt-4 text-brand-gold">- Recent Buyer</p>
             </div>
          </div>
          
          {/* Right panel (Form) */}
          <div className="md:w-7/12 p-12 lg:p-16">
            <h3 className="text-2xl font-serif text-brand-navy mb-8">Your Details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-gold">
                    <User size={16} />
                  </div>
                  <input 
                    type="text" 
                    required 
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-brand-gold focus:ring-0 outline-none transition-colors text-sm bg-gray-50/50"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-gold">
                      <Mail size={16} />
                    </div>
                    <input 
                      type="email" 
                      required 
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-brand-gold focus:ring-0 outline-none transition-colors text-sm bg-gray-50/50"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-gold">
                      <Phone size={16} />
                    </div>
                    <input 
                      type="tel" 
                      required 
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-brand-gold focus:ring-0 outline-none transition-colors text-sm bg-gray-50/50"
                      placeholder="+91 xxxxx xxxxx"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Property Interest</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-gold">
                    <Building2 size={16} />
                  </div>
                  <select 
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-brand-gold focus:ring-0 outline-none transition-colors text-sm bg-gray-50/50 appearance-none rounded-none"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="residential_3bhk">Residential 3BHK</option>
                    <option value="residential_4bhk">Residential 4BHK</option>
                    <option value="residential_plot">Residential Plot</option>
                    <option value="commercial">Commercial Property</option>
                    <option value="investment">Investment / General Inquiry</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Additional Message</label>
                <div className="relative">
                  <div className="absolute top-4 left-4 pointer-events-none text-brand-gold">
                    <MessageSquare size={16} />
                  </div>
                  <textarea 
                    rows={4}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-brand-gold focus:ring-0 outline-none transition-colors text-sm bg-gray-50/50 resize-none"
                    placeholder="Tell us about your requirements..."
                  ></textarea>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-brand-navy hover:bg-brand-gold text-brand-gold hover:text-brand-navy font-bold uppercase text-xs tracking-widest py-4 transition-colors flex items-center justify-center gap-2 border border-brand-navy disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin"></div>
                  ) : (
                    'Submit Registration'
                  )}
                </button>
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-center text-gray-400 mt-6">
                By submitting, you agree to our terms and privacy policy.
              </p>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
