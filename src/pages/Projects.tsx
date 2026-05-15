import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';

export default function Projects() {
  return (
    <div className="pt-24 min-h-screen flex flex-col bg-brand-bg">
      {/* Header */}
      <section className="bg-brand-bg py-24 text-center border-b border-gray-200">
        <div className="container mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-brand-navy mb-6"
          >
            Current Projects
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-px bg-brand-gold mx-auto"
          ></motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="flex-grow flex items-center justify-center py-20 relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #1a2744 0, #1a2744 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' }}></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-16 max-w-2xl mx-auto shadow-sm border border-gray-200"
          >
            <div className="w-20 h-20 border border-brand-gold text-brand-navy flex items-center justify-center mx-auto mb-8 relative">
              <Construction size={32} />
              <div className="absolute inset-0 bg-brand-navy scale-0 group-hover:scale-100 transition-transform -z-10 origin-bottom-right opacity-5"></div>
            </div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-4">Under Development</h4>
            <h2 className="text-3xl font-serif text-brand-navy mb-6">Coming Soon</h2>
            <p className="text-gray-600 text-lg mb-10 leading-relaxed">
              We are currently working on exciting new residential and commercial projects in prime locations. Check back soon for detailed layouts, pricing, and availability.
            </p>
            <Link to="/registration" className="bg-brand-navy hover:bg-brand-gold text-brand-gold hover:text-brand-navy font-bold uppercase text-xs tracking-widest px-8 py-4 transition-colors flex items-center justify-center gap-2 border border-brand-navy inline-flex w-full sm:w-auto">
              Get Notified First
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
