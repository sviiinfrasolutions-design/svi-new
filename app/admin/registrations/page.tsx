'use client';

import { Eye, FileText, RefreshCw, Search, Users, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/src/lib/supabase/client';
import { useRouter } from 'next/navigation';

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(201, 168, 76, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

interface Registration {
  id: string;
  name: string;
  last_name: string | null;
  email: string;
  phone: string;
  so_wo_do: string | null;
  preferred_date: string | null;
  aadhar_number: string | null;
  pan_number: string | null;
  photo_url: string | null;
  pan_card_file_url: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  advisor_name: string | null;
  project: string | null;
  property_size: string | null;
  property_type: string | null;
  plot_preference: string | null;
  payment_plan: string | null;
  payment_mode: string | null;
  scheme_amount: string | null;
  property_interest: string | null;
  message: string | null;
  created_at: string;
}

function DetailModal({ reg, onClose }: { reg: Registration; onClose: () => void }) {
  const field = (label: string, value: string | null | undefined) =>
    value ? (
      <div>
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{label}</p>
        <p className="text-sm text-gray-800 dark:text-gray-200">{value}</p>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:border-brand-gold/20 relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:bg-[#0e0e14]"
      >
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-white/8">
          <div>
            <h2 className="text-brand-navy font-serif text-lg font-semibold dark:text-white">
              {reg.name} {reg.last_name || ''}
            </h2>
            <p className="text-xs text-gray-500">{reg.email}</p>
          </div>
          <button
            onClick={onClose}
            className="hover:text-brand-gold cursor-pointer text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Personal Details */}
          <div>
            <h3 className="text-brand-gold mb-3 text-xs font-bold tracking-widest uppercase">
              Personal Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {field('First Name', reg.name)}
              {field('Last Name', reg.last_name)}
              {field('Mobile', reg.phone)}
              {field('Email', reg.email)}
              {field('S/O, W/O, D/O', reg.so_wo_do)}
              {field('Date of Birth', reg.preferred_date)}
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-brand-gold mb-3 text-xs font-bold tracking-widest uppercase">
              Documents
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {field('Aadhar Number', reg.aadhar_number)}
              {field('PAN Number', reg.pan_number)}
              {reg.photo_url && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Photo
                  </p>
                  <a
                    href={reg.photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-gold text-sm underline"
                  >
                    View Photo
                  </a>
                </div>
              )}
              {reg.pan_card_file_url && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    PAN Card
                  </p>
                  <a
                    href={reg.pan_card_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-gold text-sm underline"
                  >
                    View PAN Card
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-brand-gold mb-3 text-xs font-bold tracking-widest uppercase">
              Address
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {field('State', reg.state)}
              {field('City', reg.city)}
              {field('Address', reg.address)}
            </div>
          </div>

          {/* Property & Payment */}
          <div>
            <h3 className="text-brand-gold mb-3 text-xs font-bold tracking-widest uppercase">
              Property & Payment
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {field('Advisor', reg.advisor_name)}
              {field('Project', reg.project)}
              {field('Property Size', reg.property_size)}
              {field('Property Type', reg.property_type)}
              {field('Plot Preference', reg.plot_preference)}
              {field('Payment Plan', reg.payment_plan)}
              {field('Payment Mode', reg.payment_mode)}
              {field('Scheme Amount', reg.scheme_amount)}
            </div>
          </div>

          {/* Message */}
          {field('Message', reg.message)}

          {/* Timestamp */}
          <p className="border-t border-gray-100 pt-4 text-xs text-gray-400 dark:border-white/8">
            Submitted on{' '}
            {new Date(reg.created_at).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminRegistrations() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [total, setTotal] = useState(0);

  const fetchRegistrations = useCallback(async (tkn: string, q: string = '') => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '50' });
    if (q) params.set('search', q);

    const res = await fetch(`/api/admin/registrations?${params}`, {
      headers: { Authorization: `Bearer ${tkn}` },
    });
    if (res.ok) {
      const json = await res.json();
      setRegistrations(json.registrations);
      setTotal(json.total);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/admin');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.replace('/admin');
        return;
      }

      const tkn = session.access_token;
      setToken(tkn);
      fetchRegistrations(tkn);
    });
  }, [router, fetchRegistrations]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRegistrations(token, search);
  };

  return (
    <div className="relative w-full font-sans">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-navy-light/10 absolute top-0 right-0 h-[450px] w-[450px] rounded-full blur-[120px]" />
        <div className="bg-brand-gold/5 absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-brand-navy mb-2 font-serif text-4xl tracking-tight dark:text-white">
            Property{' '}
            <span
              className="text-gradient-gold animate-bg-pan inline-block italic"
              style={{
                backgroundSize: '200% 200%',
                backgroundImage:
                  'linear-gradient(135deg, #c9a84c, #f0d080, #b08f36, #dec070, #c9a84c)',
              }}
            >
              Registrations
            </span>
          </h1>
          <p className="text-xs tracking-wide text-gray-600 dark:text-gray-400">
            View and manage all property registration submissions.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="dark:border-brand-gold/15 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:bg-[#0e0e14]/65">
            <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />
            <div className="mb-3 flex items-center justify-between">
              <div className="bg-brand-gold/10 border-brand-gold/25 flex h-11 w-11 items-center justify-center rounded-lg border">
                <FileText className="text-brand-gold h-5 w-5" />
              </div>
            </div>
            <p className="text-brand-navy text-3xl font-bold tracking-tight dark:text-white">
              {total}
            </p>
            <p className="mt-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
              Total Registrations
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="text-brand-gold absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, aadhar, advisor or project..."
              className="focus:border-brand-gold focus:ring-brand-gold/15 w-full rounded-lg border border-gray-200 bg-white py-3 pr-10 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-[#0e0e14]/85 dark:text-white dark:placeholder-gray-600"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  fetchRegistrations(token);
                }}
                className="hover:text-brand-gold absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
          <button
            onClick={() => fetchRegistrations(token, search)}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#0e0e14]/85 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {/* Table */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

          {loading ? (
            <div className="flex items-center justify-center py-24 text-gray-500 dark:text-gray-400">
              <RefreshCw className="text-brand-gold mr-3 h-5 w-5 animate-spin" /> Loading
              registrations...
            </div>
          ) : registrations.length === 0 ? (
            <div className="py-24 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-700" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {search ? 'No matches found.' : 'No registrations yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="dark:border-brand-gold/15 border-b border-gray-200 bg-gray-50/50 dark:bg-white/2">
                    {['Name', 'Email', 'Phone', 'Project', 'Advisor', 'Date', 'Actions'].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-left text-[9px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg, i) => (
                    <motion.tr
                      key={reg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.4 }}
                      className="group border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-white/5 dark:hover:bg-[#111118]/60"
                    >
                      <td className="px-6 py-4.5">
                        <div className="font-semibold tracking-wide text-gray-900 dark:text-white">
                          {reg.name} {reg.last_name || ''}
                        </div>
                        {reg.so_wo_do && (
                          <div className="mt-0.5 text-xs text-gray-400">{reg.so_wo_do}</div>
                        )}
                      </td>
                      <td className="px-6 py-4.5 font-medium text-gray-700 dark:text-gray-300">
                        {reg.email}
                      </td>
                      <td className="px-6 py-4.5 text-gray-700 dark:text-gray-300">{reg.phone}</td>
                      <td className="px-6 py-4.5">
                        <span className="text-brand-gold/90 font-semibold">
                          {reg.project || reg.property_interest || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-gray-700 dark:text-gray-300">
                        {reg.advisor_name || '—'}
                      </td>
                      <td className="px-6 py-4.5 text-xs whitespace-nowrap text-gray-500">
                        {new Date(reg.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4.5">
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="border-brand-gold/20 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 flex cursor-pointer items-center gap-1.5 rounded border px-3 py-1.5 text-[9px] font-bold tracking-wider uppercase opacity-0 transition-all group-hover:opacity-100"
                        >
                          <Eye className="h-3 w-3" /> View
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedReg && <DetailModal reg={selectedReg} onClose={() => setSelectedReg(null)} />}
      </AnimatePresence>
    </div>
  );
}
