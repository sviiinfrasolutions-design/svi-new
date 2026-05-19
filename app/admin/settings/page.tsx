'use client';

import { Bell, Building2, Globe, Paintbrush, Shield, User } from 'lucide-react';

import { motion } from 'motion/react';
import { useState } from 'react';

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
    <div className="mx-auto w-full max-w-6xl font-sans">
      <div className="mb-8">
        <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
          Portal <span className="text-brand-gold italic">Settings</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account preferences and system configuration.
        </p>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Settings Navigation */}
        <aside className="w-full shrink-0 md:w-64">
          <nav className="flex flex-row gap-2 overflow-x-auto pb-4 md:flex-col md:pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-gold text-brand-navy font-bold shadow-md'
                    : 'font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
                }`}
              >
                <tab.icon
                  className={`h-4.5 w-4.5 ${activeTab === tab.id ? 'text-brand-navy' : 'text-gray-500 dark:text-gray-500'}`}
                />
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
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl md:p-8 dark:border-white/8 dark:bg-[#0e0e14]/65"
          >
            {/* Top gold line */}
            <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-1 font-serif text-xl font-bold text-gray-900 dark:text-white">
                    Profile Information
                  </h2>
                  <p className="text-sm text-gray-500">Update your personal details and avatar.</p>
                </div>
                <div className="max-w-lg space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold tracking-widest text-gray-500 uppercase">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Admin User"
                      className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-900 transition-all outline-none focus:ring-1 dark:border-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold tracking-widest text-gray-500 uppercase">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="admin@sviinfra.com"
                      disabled
                      className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-500 dark:border-gray-800 dark:bg-white/5"
                    />
                  </div>
                  <button className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy mt-4 cursor-pointer rounded-lg px-6 py-3 text-xs font-bold tracking-widest uppercase shadow-md transition-all">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab !== 'profile' && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Globe className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-700" />
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  Coming Soon
                </h3>
                <p className="max-w-sm text-sm text-gray-500">
                  This settings module is currently under development. Additional configuration
                  options will be available in future updates.
                </p>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
