'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Building2, Bell, Shield, Paintbrush, Globe } from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile Settings', icon: User },
  { id: 'company', label: 'Company Info', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Paintbrush },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="max-w-6xl mx-auto w-full font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-brand-navy dark:text-white tracking-tight mb-2">
          Portal <span className="text-brand-gold italic">Settings</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account preferences and system configuration.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-brand-gold text-brand-navy font-bold shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 font-medium'
                }`}
              >
                <tab.icon className={`w-4.5 h-4.5 ${activeTab === tab.id ? 'text-brand-navy' : 'text-gray-500 dark:text-gray-500'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Content */}
        <main className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden"
          >
            {/* Top gold line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white mb-1">Profile Information</h2>
                  <p className="text-sm text-gray-500">Update your personal details and avatar.</p>
                </div>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1.5 block">Full Name</label>
                    <input type="text" defaultValue="Admin User" className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1.5 block">Email Address</label>
                    <input type="email" defaultValue="admin@sviinfra.com" disabled className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed" />
                  </div>
                  <button className="mt-4 bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-lg shadow-md transition-all cursor-pointer">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab !== 'profile' && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Globe className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Coming Soon</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  This settings module is currently under development. Additional configuration options will be available in future updates.
                </p>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}