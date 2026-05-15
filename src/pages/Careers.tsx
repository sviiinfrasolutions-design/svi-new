import React from 'react';
import { motion } from 'motion/react';
import { DollarSign, Laptop, Star, Send, Briefcase, Users, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Careers() {
  return (
    <div className="pt-24 pb-20">
      {/* Page Header */}
      <section className="bg-brand-bg dark:bg-gray-800 py-24 text-center border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-brand-navy dark:text-gray-100 mb-6"
          >
            Careers at SVI Infra Solutions
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-px bg-brand-gold mx-auto"
          ></motion.div>
        </div>
      </section>

      {/* Freelancing Opportunity */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-6">Join Our Team</h4>
            <h2 className="text-3xl font-serif text-brand-navy dark:text-gray-100 mb-8">Freelance Real Estate Consultant</h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-6 text-lg leading-relaxed">
              <p>
                Are you passionate about real estate? Do you want the flexibility to work from anywhere while earning industry-leading commissions? Join SVI Infra Solutions as a Freelance Partner and build your own success story.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-50 dark:bg-gray-800 p-10 text-center border border-gray-100 dark:border-gray-700 hover:border-brand-gold transition-colors"
            >
              <div className="w-16 h-16 mx-auto bg-brand-gold/10 text-brand-gold flex items-center justify-center mb-6 rounded-full">
                <Laptop size={28} />
              </div>
              <h3 className="text-xl font-serif text-brand-navy dark:text-gray-100 mb-4">100% Remote</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Work from anywhere, anytime. Be your own boss and manage your own schedule.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 dark:bg-gray-800 p-10 text-center border border-gray-100 dark:border-gray-700 hover:border-brand-gold transition-colors"
            >
              <div className="w-16 h-16 mx-auto bg-brand-gold/10 text-brand-gold flex items-center justify-center mb-6 rounded-full">
                <DollarSign size={28} />
              </div>
              <h3 className="text-xl font-serif text-brand-navy dark:text-gray-100 mb-4">Up to 12% Commission</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Earn highly attractive commissions on every successful closing. Unlimited earning potential.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 dark:bg-gray-800 p-10 text-center border border-gray-100 dark:border-gray-700 hover:border-brand-gold transition-colors"
            >
              <div className="w-16 h-16 mx-auto bg-brand-gold/10 text-brand-gold flex items-center justify-center mb-6 rounded-full">
                <Star size={28} />
              </div>
              <h3 className="text-xl font-serif text-brand-navy dark:text-gray-100 mb-4">Full Support</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Get marketing materials, project details, and dedicated support from our expert team.</p>
            </motion.div>
          </div>

          <div className="text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-brand-navy dark:bg-brand-gold text-white dark:text-brand-navy px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-brand-gold dark:hover:bg-white hover:text-white transition-colors"
            >
              Apply Now <Send size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Sales & Promotion */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-6">Sales & Promotion</h4>
            <h2 className="text-3xl font-serif text-brand-navy dark:text-gray-100 mb-8">Onsite Opportunities</h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-6 text-lg leading-relaxed">
              <p>
                We are expanding our Sales & Promotion team. Join us onsite and take your career to the next level with competitive salaries, great growth opportunities, and an inspiring work environment.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 p-10 text-center border border-gray-100 dark:border-gray-700 hover:border-brand-gold transition-colors"
            >
              <div className="w-16 h-16 mx-auto bg-brand-gold/10 text-brand-gold flex items-center justify-center mb-6 rounded-full">
                <Briefcase size={28} />
              </div>
              <h3 className="text-xl font-serif text-brand-navy dark:text-gray-100 mb-4">Business Development Manager (BDM)</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">Onsite</p>
              <p className="text-lg font-bold text-brand-gold">Up to 40k INR</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 p-10 text-center border border-gray-100 dark:border-gray-700 hover:border-brand-gold transition-colors"
            >
              <div className="w-16 h-16 mx-auto bg-brand-gold/10 text-brand-gold flex items-center justify-center mb-6 rounded-full">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-serif text-brand-navy dark:text-gray-100 mb-4">Business Development Executive (BDE)</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">Onsite</p>
              <p className="text-lg font-bold text-brand-gold">Up to 30k INR</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 p-10 text-center border border-gray-100 dark:border-gray-700 hover:border-brand-gold transition-colors"
            >
              <div className="w-16 h-16 mx-auto bg-brand-gold/10 text-brand-gold flex items-center justify-center mb-6 rounded-full">
                <Target size={28} />
              </div>
              <h3 className="text-xl font-serif text-brand-navy dark:text-gray-100 mb-4">Team Lead (TL)</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">Onsite</p>
              <p className="text-lg font-bold text-brand-gold">Up to 60k INR</p>
            </motion.div>
          </div>

          <div className="text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-brand-navy dark:bg-brand-gold text-white dark:text-brand-navy px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-brand-gold dark:hover:bg-white hover:text-white transition-colors"
            >
              Apply Now <Send size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
