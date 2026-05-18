"use client";

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import { motion, AnimatePresence } from 'motion/react';
import type { UserProfile } from '@/src/lib/supabase/types';
import {
  Users, Plus, Trash2, LogOut, Search, X, CheckCircle2,
  AlertCircle, Phone, Mail, Building2, FileText, Eye, EyeOff,
  Shield, RefreshCw, ChevronDown
} from 'lucide-react';

const GRID_STYLE = {
  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(201, 168, 76, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const PROPERTY_LABELS: Record<string, string> = {
  residential_3bhk: '3BHK Residential',
  residential_4bhk: '4BHK Residential',
  residential_plot: 'Residential Plot',
  commercial: 'Commercial Property',
  investment: 'Investment / General',
};

function Badge({ role }: { role: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.15em] font-bold px-2.5 py-1 rounded-full ${
      role === 'admin'
        ? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/25'
        : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10'
    }`}>
      {role === 'admin' ? <Shield className="w-2.5 h-2.5 text-brand-gold" /> : <Users className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400 transition-colors duration-300" />}
      {role}
    </span>
  );
}

// ── Create User Modal ────────────────────────────────────────────────────────
interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

function CreateUserModal({ onClose, onSuccess, token }: CreateUserModalProps) {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', phone: '',
    property_interest: '', notes: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.full_name) {
      setError('Name, email and password are required.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create user');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 transition-all font-sans";
  const labelCls = "text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-1.5 block transition-colors duration-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-[#0e0e14] border border-gray-200 dark:border-brand-gold/20 rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden transition-colors duration-300"
      >
        {/* Subtle gold line on top of the modal */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-brand-gold" />
            </div>
            <h2 className="font-serif font-semibold text-brand-navy dark:text-white text-lg tracking-tight transition-colors duration-300">Create Client User</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-brand-gold transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3 py-2.5 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Full Name *</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} required
                placeholder="Rajesh Kumar" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gold" />
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  placeholder="client@example.com"
                  className={`${inputCls} pl-9`} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Password *</label>
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={handleChange} required
                  placeholder="Min 8 chars" className={`${inputCls} pr-10`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-gold cursor-pointer">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelCls}>Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gold" />
                <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                  placeholder="+91 98000 00000" className={`${inputCls} pl-9`} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Property Interest</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gold" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                <select name="property_interest" value={form.property_interest} onChange={handleChange}
                  className={`${inputCls} pl-9 pr-8 appearance-none rounded-none`}>
                  <option value="">Select option</option>
                  <option value="residential_3bhk">3BHK Residential</option>
                  <option value="residential_4bhk">4BHK Residential</option>
                  <option value="residential_plot">Residential Plot</option>
                  <option value="commercial">Commercial Property</option>
                  <option value="investment">Investment / General</option>
                </select>
              </div>
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Notes (Internal)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-3.5 h-3.5 text-brand-gold" />
                <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
                  placeholder="Internal notes about this client..."
                  className={`${inputCls} pl-9 resize-none`} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-all cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-all shadow-lg glow-gold disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer">
              {loading ? <span className="w-4 h-4 border-2 border-brand-navy/45 border-t-brand-navy rounded-full animate-spin" /> : <>
                <Plus className="w-4 h-4" /> Create User
              </>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Delete Confirm ───────────────────────────────────────────────────────────
interface DeleteConfirmProps {
  user: UserProfile;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}

function DeleteConfirm({ user, onConfirm, onClose, loading }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-[#0e0e14] border border-gray-200 dark:border-brand-gold/20 rounded-2xl p-6 shadow-2xl w-full max-w-sm text-center relative overflow-hidden transition-colors duration-300"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500/50" />
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-400" />
        </div>
        <h3 className="font-serif text-brand-navy dark:text-white text-lg tracking-tight mb-2 transition-colors duration-300">Delete User?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-sans transition-colors duration-300">
          This will permanently delete <span className="text-brand-navy dark:text-white font-medium">{user.full_name}</span> and all associated data. This action is irreversible.
        </p>
        <div className="flex gap-3 font-sans">
          <button onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-widest py-3 rounded-lg transition-all cursor-pointer">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [adminName, setAdminName] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async (tkn: string) => {
    const res = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${tkn}` },
    });
    if (res.ok) {
      const json = await res.json();
      setUsers(json.users);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/admin'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') { router.replace('/admin'); return; }

      setToken(session.access_token);
      setAdminName(profile?.full_name || session.user.email || 'Admin');
      fetchUsers(session.access_token);
    });
  }, [router, fetchUsers]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/admin');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error);
      }
      setUsers(u => u.filter(x => x.id !== deleteTarget.id));
      showToast('success', `${deleteTarget.full_name} has been deleted.`);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  const clientCount = users.filter(u => u.role === 'client').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0C0C0C] flex flex-col font-sans relative overflow-x-hidden transition-colors duration-300">
      
      {/* Background ambient lighting effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-brand-navy-light/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-gold/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
      </div>

      {/* Topbar */}
      <header className="relative z-30 border-b border-gray-200 dark:border-brand-gold/15 bg-white/80 dark:bg-[#0d0d14]/75 backdrop-blur-xl sticky top-0 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-brand-gold" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-brand-navy dark:text-white text-base tracking-tight transition-colors duration-300">SVI Infra</span>
              <span className="text-[9px] uppercase tracking-widest text-brand-gold font-bold px-2 py-0.5 bg-brand-gold/15 rounded border border-brand-gold/25">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block tracking-wide transition-colors duration-300">
              Welcome back, <span className="text-brand-navy dark:text-white font-bold transition-colors duration-300">{adminName}</span>
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3.5 py-2 rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-10">

        {/* Header section with page-mount animation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-serif text-brand-navy dark:text-white tracking-tight mb-2 transition-colors duration-300">
              System <span className="text-gradient-gold italic animate-bg-pan inline-block" style={{ backgroundSize: '200% 200%', backgroundImage: 'linear-gradient(135deg, #c9a84c, #f0d080, #b08f36, #dec070, #c9a84c)' }}>Dashboard</span>
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 tracking-wide transition-colors duration-300">
              Manage authorized client accounts and monitor administrative access permissions.
            </p>
          </div>
        </div>

        {/* Stats Row with explicitly styled cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            {
              label: 'Total Accounts',
              value: users.length,
              icon: Users,
              bgCls: 'bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl border border-gray-200 dark:border-brand-gold/15 relative overflow-hidden transition-colors duration-300',
              iconBg: 'bg-brand-gold/10 border border-brand-gold/25',
              iconColor: 'text-brand-gold',
              showLine: true
            },
            {
              label: 'Client Profiles',
              value: clientCount,
              icon: Building2,
              bgCls: 'bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 hover:border-brand-gold/15 transition-colors relative overflow-hidden',
              iconBg: 'bg-white/5 border border-white/10',
              iconColor: 'text-gray-300',
              showLine: false
            },
            {
              label: 'Administrators',
              value: users.length - clientCount,
              icon: Shield,
              bgCls: 'bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 hover:border-brand-gold/15 transition-colors relative overflow-hidden',
              iconBg: 'bg-white/5 border border-white/10',
              iconColor: 'text-gray-300',
              showLine: false
            }
          ].map(({ label, value, icon: Icon, bgCls, iconBg, iconColor, showLine }) => (
            <div key={label} className={`${bgCls} rounded-xl p-5 shadow-lg`}>
              {showLine && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />
              )}
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-lg ${iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-brand-navy dark:text-white tracking-tight transition-colors duration-300">{value}</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 font-sans">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="w-full bg-white dark:bg-[#0e0e14]/85 border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-10 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-gold cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button onClick={() => { setLoading(true); fetchUsers(token); }}
            className="flex items-center gap-2 bg-white dark:bg-[#0e0e14]/85 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-lg transition-all cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-lg transition-all shadow-lg glow-gold cursor-pointer">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        {/* Users Table glassmorphic container */}
        <div className="bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 rounded-xl overflow-hidden relative shadow-2xl transition-colors duration-300">
          {/* Subtle gold line on top */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />

          {loading ? (
            <div className="flex items-center justify-center py-24 text-gray-500 dark:text-gray-400 font-sans transition-colors duration-300">
              <RefreshCw className="w-5 h-5 animate-spin mr-3 text-brand-gold" /> Loading client database...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 font-sans">
              <Users className="w-12 h-12 text-gray-400 dark:text-gray-700 mx-auto mb-4 transition-colors duration-300" />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors duration-300">{search ? 'No matches found.' : 'No users created yet. Add one!'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-brand-gold/15 bg-gray-50/50 dark:bg-white/2 transition-colors duration-300">
                    {['Name & Notes', 'Email Address', 'Phone Number', 'Property Interest', 'Access Role', 'Created Date', 'Actions'].map(h => (
                      <th key={h} className="text-left text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 px-6 py-4 transition-colors duration-300">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.4 }}
                      className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#111118]/60 transition-colors group"
                    >
                      <td className="px-6 py-4.5">
                        <div className="font-semibold text-gray-900 dark:text-white tracking-wide transition-colors duration-300">{u.full_name}</div>
                        {u.notes ? (
                          <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate" title={u.notes}>{u.notes}</div>
                        ) : (
                          <div className="text-xs text-gray-400 dark:text-gray-600 italic mt-1 transition-colors duration-300">No notes added</div>
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-gray-700 dark:text-gray-300 font-medium transition-colors duration-300">{u.email}</td>
                      <td className="px-6 py-4.5 text-gray-700 dark:text-gray-300 transition-colors duration-300">{u.phone || <span className="text-gray-400 dark:text-gray-600">—</span>}</td>
                      <td className="px-6 py-4.5 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                        {u.property_interest ? (
                          <span className="font-semibold text-brand-gold/90">{PROPERTY_LABELS[u.property_interest] || u.property_interest}</span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600 transition-colors duration-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5"><Badge role={u.role} /></td>
                      <td className="px-6 py-4.5 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4.5">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded transition-all cursor-pointer animate-hero-fade-in"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <CreateUserModal
            token={token}
            onClose={() => setShowCreate(false)}
            onSuccess={() => {
              fetchUsers(token);
              showToast('success', 'User created successfully!');
            }}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm
            user={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-semibold shadow-2xl border font-sans ${
              toast.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/95 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/95 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300'
            }`}
          >
            {toast.type === 'success'
              ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              : <AlertCircle className="w-4 h-4 text-red-400" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
