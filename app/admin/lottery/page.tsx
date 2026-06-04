'use client';

import { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Trash2,
  Play,
  RefreshCw,
  Plus,
  Search,
  Award,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Globe,
  Users,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Calendar,
  Timer,
  BellRing,
  XCircle,
  Edit2,
  Eye,
  Mail,
  Send,
  Zap,
  X,
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import { createLotteryCampaign } from '@/src/lib/lottery/campaignHelpers';
import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';
import { useLotteryData } from '@/src/components/admin/lottery/hooks/useLotteryData';
import { useParticipantManagement } from '@/src/components/admin/lottery/hooks/useParticipantManagement';
import { useScheduleDraw } from '@/src/components/admin/lottery/hooks/useScheduleDraw';
import { EditCampaignModal } from '@/src/components/admin/lottery/modals/EditCampaignModal';
import { ViewParticipantsModal } from '@/src/components/admin/lottery/modals/ViewParticipantsModal';
import { BulkEmailModal } from '@/src/components/admin/lottery/modals/BulkEmailModal';
import { DeleteConfirmModal } from '@/src/components/admin/lottery/modals/DeleteConfirmModal';

export default function AdminLotteryPage() {
  const { token } = useAdminSession();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create'>('dashboard');

  // ── Extracted Hooks ─────────────────────────────────────────────────────
  const {
    lotteries,
    activeLottery,
    activeParticipantsCount,
    activeWinners,
    lotteryVisible,
    visibilityLoading,
    visibilityPending,
    syncing,
    errorMessage,
    successMessage,
    fetchLotteries,
    toggleLotteryVisibility,
    handleSyncExisting,
    drawWinner,
    resetDraw,
    setErrorMessage,
    setSuccessMessage,
  } = useLotteryData();

  const {
    participants,
    dragOver,
    searchTerm,
    currentPage,
    itemsPerPage,
    entryMethod,
    manualName,
    manualPhone,
    manualEmail,
    manualTicket,
    setDragOver,
    setSearchTerm,
    setCurrentPage,
    setEntryMethod,
    setManualName,
    setManualPhone,
    setManualEmail,
    setManualTicket,
    setParticipants,
    handleFileUpload,
    handleManualAdd,
    removeParticipant,
    filteredParticipants,
    paginatedParticipants,
    totalPages,
    fileInputRef,
  } = useParticipantManagement();

  const {
    existingSchedule,
    scheduleLoading,
    scheduleInputIST,
    preNotifyMinutes,
    showCountdown,
    includeCountdownInEmail,
    scheduleSaving,
    setScheduleInputIST,
    setPreNotifyMinutes,
    setShowCountdown,
    setIncludeCountdownInEmail,
    fetchSchedule,
    handleSaveSchedule,
    handleCancelSchedule,
    getISTString,
    resetScheduleState,
  } = useScheduleDraw();

  // ── Wizard State ────────────────────────────────────────────────────────
  const [wizardStep, setWizardStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // ── Predetermined Winner Selection ──────────────────────────────────────
  const [drawMethod, setDrawMethod] = useState<'random' | 'manual'>('random');
  const [selectedPredeterminedWinners, setSelectedPredeterminedWinners] = useState<any[]>([]);
  const [dbParticipants, setDbParticipants] = useState<any[]>([]);
  const [dbParticipantsSearch, setDbParticipantsSearch] = useState('');
  const [dbParticipantsLoading, setDbParticipantsLoading] = useState(false);

  // ── Modal Triggers ──────────────────────────────────────────────────────
  const [editingLottery, setEditingLottery] = useState<any>(null);
  const [viewingLottery, setViewingLottery] = useState<any>(null);
  const [emailModalLottery, setEmailModalLottery] = useState<any>(null);
  const [deletingLotteryId, setDeletingLotteryId] = useState<string | null>(null);

  // ── Effects ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeLottery && token) {
      fetchSchedule(activeLottery.id, token);
    } else {
      resetScheduleState();
    }
  }, [activeLottery, token]);

  const fetchDbParticipants = async (searchQuery: string = '') => {
    if (!activeLottery) return;
    setDbParticipantsLoading(true);
    try {
      let query = supabase
        .from('lottery_participants')
        .select('id, name, ticket_number, phone, email')
        .eq('lottery_id', activeLottery.id);
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery.trim()}%,ticket_number.ilike.%${searchQuery.trim()}%`);
      }
      const { data, error } = await query.limit(10);
      if (error) throw error;
      setDbParticipants(data || []);
    } catch (err) {
      console.error('Error fetching participants for search:', err);
    } finally {
      setDbParticipantsLoading(false);
    }
  };

  useEffect(() => {
    if (!activeLottery || drawMethod !== 'manual') {
      setDbParticipants([]);
      return;
    }
    const timer = setTimeout(() => fetchDbParticipants(dbParticipantsSearch), 300);
    return () => clearTimeout(timer);
  }, [activeLottery, drawMethod, dbParticipantsSearch]);

  useEffect(() => {
    setSelectedPredeterminedWinners([]);
    setDbParticipantsSearch('');
  }, [activeLottery, drawMethod]);

  // ── Save Lottery to DB ──────────────────────────────────────────────────
  const saveLotteryToDB = async () => {
    if (!title.trim()) { setErrorMessage('Please enter a title for the lottery.'); return; }
    if (participants.length === 0) { setErrorMessage('Please upload a spreadsheet with participants first.'); return; }

    startTransition(async () => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);
        if (activeLottery) {
          const { error: deactivateError } = await supabase
            .from('lotteries').update({ status: 'inactive' }).eq('id', activeLottery.id);
          if (deactivateError) throw deactivateError;
        }
        const { data: newLottery, error: createError } = await supabase
          .from('lotteries').insert({ title: title.trim(), description: description.trim() || null, status: 'active' })
          .select().single();
        if (createError) throw createError;

        const participantsData = participants.map((p) => ({
          lottery_id: newLottery.id, name: p.name, phone: p.phone || null, email: p.email || null,
          ticket_number: p.ticketNumber, is_winner: false,
        }));
        const chunkSize = 100;
        for (let i = 0; i < participantsData.length; i += chunkSize) {
          const { error: insertError } = await supabase.from('lottery_participants').insert(participantsData.slice(i, i + chunkSize));
          if (insertError) throw insertError;
        }
        setTitle(''); setDescription(''); setParticipants([]); setWizardStep(1);
        setSuccessMessage('New active lottery created successfully! Live drawing is ready.');
        setActiveTab('dashboard');
        fetchLotteries();

        // Auto-create linked email campaign
        createLotteryCampaign(newLottery, token)
          .then((ok) => {
            if (!ok) {
              setErrorMessage('Lottery created, but linked email campaign failed. Use "Sync to EmailCenter" to retry.');
            }
          })
          .catch(() => {
            setErrorMessage('Lottery created, but linked email campaign failed. Use "Sync to EmailCenter" to retry.');
          });
      } catch (error: any) {
        console.error('Error saving lottery:', error);
        setErrorMessage(error.message || 'Failed to save the lottery draw.');
      }
    });
  };

  // ── Wizard Navigation ───────────────────────────────────────────────────
  const handleNextWizardStep = () => {
    if (wizardStep === 1 && !title.trim()) { setErrorMessage('Title is required to proceed.'); return; }
    setErrorMessage(null);
    setWizardStep((s) => Math.min(s + 1, 3));
  };
  const handlePrevWizardStep = () => setWizardStep((s) => Math.max(s - 1, 1));

  return (
    <>
      <div className="space-y-8 pb-12 text-slate-900 transition-colors duration-300 dark:text-slate-100">
        {/* ══ HEADER ═════════════════════════════════════════════════════ */ }
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end dark:border-white/5">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Command Center: <span className="text-brand-gold italic">Lottery</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
              Launch massive lucky draws, manage high-stakes prizes, and broadcast live winner reveals.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setActiveTab('dashboard')}
              className={`cursor-pointer rounded-xl border px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/30 shadow-[0_0_15px_rgba(201,168,76,0.1)]'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:border-white/5 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
              }`}>Dashboard</button>
            <button onClick={() => { setActiveTab('create'); setWizardStep(1); }}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                activeTab === 'create'
                  ? 'bg-brand-gold text-brand-navy border-brand-gold shadow-[0_0_20px_rgba(201,168,76,0.3)]'
                  : 'bg-brand-gold/10 text-brand-gold border-brand-gold/20 hover:bg-brand-gold/20'
              }`}><Plus className="h-4 w-4" /> New Lottery</button>
            <button onClick={() => token && handleSyncExisting(token)} disabled={syncing || !token}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-5 py-2.5 text-xs font-bold tracking-wider text-blue-700 uppercase transition-all duration-300 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20">
              {syncing ? <><RefreshCw className="h-4 w-4 animate-spin" /> Syncing...</> : <><RefreshCw className="h-4 w-4" /> Sync to EmailCenter</>}
            </button>
          </div>
        </div>

        {/* ══ MESSAGES ═══════════════════════════════════════════════════ */ }
        <AnimatePresence>
          {errorMessage && (
            <motion.div key="error-banner" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 shadow-lg backdrop-blur-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" /><span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="ml-auto text-red-400 hover:text-red-600 dark:hover:text-white">✕</button>
            </motion.div>
          )}
          {successMessage && (
            <motion.div key="success-banner" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center justify-between gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 shadow-lg backdrop-blur-sm dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
              <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><span>{successMessage}</span></div>
              {successMessage.toLowerCase().includes('created') && (
                <a href="/lottery" target="_blank" rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-100 px-4 py-2 text-xs font-bold tracking-wide text-green-800 transition-all hover:bg-green-200 dark:border-green-500/40 dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/30">Launch Arena ↗</a>
              )}
              <button onClick={() => setSuccessMessage(null)} className="ml-4 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-white">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ VISIBILITY CONTROL ════════════════════════════════════════ */ }
        <div className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-500 ${lotteryVisible ? 'border-brand-gold/40 to-brand-gold/5 bg-gradient-to-br from-white shadow-[0_0_30px_rgba(201,168,76,0.1)] dark:from-[#0e0e14]' : 'border-slate-200 bg-white dark:border-white/10 dark:bg-[#0e0e14]/50'}`}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors ${lotteryVisible ? 'bg-brand-gold/20 text-brand-gold' : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-gray-500'}`}>
                <Globe className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Public Live Broadcast</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                  {lotteryVisible ? 'The Lottery Arena is LIVE and broadcasting to all public visitors.' : 'The Arena is offline. Public visitors cannot see the drawing.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:shrink-0">
              <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase ${lotteryVisible ? 'border border-green-200 bg-green-50 text-green-600 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-400' : 'border border-slate-200 bg-slate-50 text-slate-500 dark:border-white/5 dark:bg-white/5 dark:text-gray-500'}`}>
                <span className={`h-2 w-2 rounded-full ${lotteryVisible ? 'animate-pulse bg-green-500 shadow-[0_0_10px_#4ade80] dark:bg-green-400' : 'bg-slate-400 dark:bg-gray-500'}`} />
                {visibilityLoading ? 'Checking...' : lotteryVisible ? 'Broadcasting Live' : 'Offline'}
              </span>
              <button onClick={() => toggleLotteryVisibility(!lotteryVisible)} disabled={visibilityLoading || visibilityPending}
                className={`focus-visible:ring-brand-gold relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 disabled:opacity-50 ${lotteryVisible ? 'border-brand-gold bg-brand-gold shadow-[0_0_15px_rgba(201,168,76,0.5)]' : 'border-slate-300 bg-slate-200 dark:border-white/10 dark:bg-white/5'}`}>
                <span className={`inline-block h-6 w-6 rounded-full shadow-md transition-all duration-300 ${lotteryVisible ? 'translate-x-8 bg-white dark:bg-[#0a0a0f]' : 'translate-x-1 bg-white dark:bg-gray-500'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ══ SCHEDULE DRAW PANEL ═══════════════════════════════════════ */ }
        {activeLottery && activeLottery.status === 'active' && activeWinners.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0e0e14]/60">
            <div className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-violet-500/10 blur-[80px]" />
            <div className="relative">
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Schedule Automated Draw</h3>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-gray-400">Set a date &amp; time and the system will run the draw, send reminders, and email all participants automatically.</p>
                </div>
                {existingSchedule && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold tracking-widest text-violet-600 uppercase dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500" /> Scheduled
                  </span>
                )}
              </div>

              {scheduleLoading ? (
                <div className="flex items-center justify-center py-8 text-sm text-slate-500 dark:text-gray-400">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading schedule...
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-gray-400">
                      Draw Date &amp; Time <span className="text-violet-500">(IST)</span>
                    </label>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {[{ label: '+30 min', mins: 30 }, { label: '+1 hr', mins: 60 }, { label: '+2 hrs', mins: 120 },
                        { label: '+6 hrs', mins: 360 }, { label: '+1 day', mins: 1440 }, { label: '+2 days', mins: 2880 }, { label: '+1 week', mins: 10080 },
                      ].map(({ label, mins }) => (
                        <button key={label} type="button" onClick={() => setScheduleInputIST(getISTString(new Date(Date.now() + mins * 60000)))}
                          className="cursor-pointer rounded-lg border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-700 transition-all hover:border-violet-500 hover:bg-violet-500 hover:text-white dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500 dark:hover:text-white">{label}</button>
                      ))}
                    </div>
                    <div className="relative">
                      <Timer className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
                      <input type="datetime-local" value={scheduleInputIST} onChange={(e) => setScheduleInputIST(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-11 text-sm text-slate-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-violet-500 dark:focus:ring-violet-500/20" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-gray-400">
                      <BellRing className="mr-1.5 inline h-3.5 w-3.5" /> Reminder Email — Minutes Before Draw
                    </label>
                    <select value={preNotifyMinutes} onChange={(e) => setPreNotifyMinutes(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-violet-500 dark:focus:ring-violet-500/20">
                      <option value={15}>15 minutes before</option><option value={30}>30 minutes before</option>
                      <option value={60}>1 hour before</option><option value={120}>2 hours before</option>
                      <option value={360}>6 hours before</option><option value={720}>12 hours before</option><option value={1440}>24 hours before</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-4">
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Show Countdown on Public Site</span>
                      <button type="button" onClick={() => setShowCountdown((v) => !v)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none ${showCountdown ? 'border-violet-500 bg-violet-500' : 'border-slate-300 bg-slate-200 dark:border-white/10 dark:bg-white/10'}`}>
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${showCountdown ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </label>
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Include Countdown in Reminder Email</span>
                      <button type="button" onClick={() => setIncludeCountdownInEmail((v) => !v)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none ${includeCountdownInEmail ? 'border-violet-500 bg-violet-500' : 'border-slate-300 bg-slate-200 dark:border-white/10 dark:bg-white/10'}`}>
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${includeCountdownInEmail ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                    <button onClick={() => activeLottery && token && handleSaveSchedule(activeLottery.id, token, setErrorMessage, setSuccessMessage)}
                      disabled={scheduleSaving || !scheduleInputIST}
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-violet-700 hover:shadow-violet-400/30 disabled:cursor-not-allowed disabled:opacity-50">
                      {scheduleSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                      {existingSchedule ? 'Update Schedule' : 'Schedule Draw'}
                    </button>
                    {existingSchedule && (
                      <button onClick={() => activeLottery && token && handleCancelSchedule(activeLottery.id, token, setErrorMessage, setSuccessMessage)} disabled={scheduleSaving}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20">
                        <XCircle className="h-4 w-4" /> Cancel Schedule
                      </button>
                    )}
                    {existingSchedule && (
                      <span className="text-xs text-slate-500 dark:text-gray-400">
                        Scheduled for{' '}<strong className="text-slate-700 dark:text-gray-300">
                          {new Date(existingSchedule.scheduled_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ DASHBOARD TAB ═════════════════════════════════════════════ */ }
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Active Lottery Section */}
            {activeLottery ? (
              <div className="border-brand-gold/30 relative rounded-3xl border bg-white p-8 shadow-[0_0_40px_rgba(201,168,76,0.15)] dark:bg-[#0a0a0f]">
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                  <div className="bg-brand-gold/10 absolute -top-32 -right-32 h-96 w-96 rounded-full blur-[100px]" />
                  <div className="bg-brand-gold/5 absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-[100px]" />
                </div>
                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
                      <span className="bg-brand-gold h-2 w-2 animate-pulse rounded-full" /> Ready for Draw
                    </div>
                    <h2 className="font-serif text-4xl font-bold text-slate-900 dark:text-white">{activeLottery.title}</h2>
                    <p className="max-w-2xl text-base text-slate-600 dark:text-gray-400">{activeLottery.description || 'No description provided.'}</p>

                    <div className="flex flex-wrap items-center gap-6 pt-2 text-sm font-medium text-slate-600 dark:text-gray-400">
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/5">
                        <div className="bg-brand-gold/20 text-brand-gold flex h-10 w-10 items-center justify-center rounded-xl"><Users className="h-5 w-5" /></div>
                        <div><div className="text-xl font-bold text-slate-900 dark:text-white">{activeParticipantsCount}</div><div className="text-[10px] tracking-wider text-slate-500 uppercase dark:text-gray-500">Participants</div></div>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-white"><Clock className="h-5 w-5" /></div>
                        <div><div className="text-xl font-bold text-slate-900 dark:text-white">{new Date(activeLottery.created_at).toLocaleDateString()}</div><div className="text-[10px] tracking-wider text-slate-500 uppercase dark:text-gray-500">Creation Date</div></div>
                      </div>
                    </div>

                    {/* Drawing Method */}
                    {activeWinners.length === 0 && (
                      <div className="mt-6 max-w-lg space-y-4 border-t border-slate-100 pt-6 dark:border-white/5">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-gray-500">Choose Drawing Method</label>
                          <div className="inline-flex w-full rounded-xl bg-slate-100 p-1 dark:bg-white/5">
                            <button type="button" onClick={() => setDrawMethod('random')}
                              className={`flex-1 cursor-pointer rounded-lg py-2.5 text-xs font-bold transition-all ${drawMethod === 'random' ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'}`}>Random Draw</button>
                            <button type="button" onClick={() => setDrawMethod('manual')}
                              className={`flex-1 cursor-pointer rounded-lg py-2.5 text-xs font-bold transition-all ${drawMethod === 'manual' ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'}`}>Predetermined Winner</button>
                          </div>
                        </div>
                        {drawMethod === 'manual' && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-gray-500">Search & Select Predetermined Winner</label>
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Search className="h-4 w-4 text-slate-400 dark:text-gray-500" /></div>
                              <input type="text" value={dbParticipantsSearch} onChange={(e) => setDbParticipantsSearch(e.target.value)}
                                placeholder="Search by name or ticket number..."
                                className="focus:border-brand-gold/50 focus:ring-brand-gold/50 w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm transition-all outline-none placeholder:text-slate-400 focus:ring-1 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                              {dbParticipantsLoading && <div className="absolute inset-y-0 right-0 flex items-center pr-3"><RefreshCw className="h-4 w-4 animate-spin text-slate-400" /></div>}
                            </div>
                            {dbParticipantsSearch.trim() && dbParticipants.length > 0 && (
                              <div className="relative">
                                <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-[#0c0c12]">
                                  {dbParticipants.map((participant) => (
                                    <button key={participant.id} type="button"
                                      onClick={() => { setSelectedPredeterminedWinners((prev) => { const exists = prev.find((w) => w.id === participant.id); return exists ? prev.filter((w) => w.id !== participant.id) : [...prev, participant]; }); setDbParticipantsSearch(''); }}
                                      className="flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                                      <div><div className="font-semibold text-slate-900 dark:text-white">{participant.name}</div><div className="text-xs text-slate-500 dark:text-gray-400">{participant.email || participant.phone || 'No contact info'}</div></div>
                                      <div className="border-brand-gold/30 text-brand-gold bg-brand-gold/5 rounded-md border px-2 py-0.5 font-mono text-xs font-bold">{participant.ticket_number}</div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            {dbParticipantsSearch.trim() && dbParticipants.length === 0 && !dbParticipantsLoading && (
                              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-white/10 dark:text-gray-500">No participants matched your search.</div>
                            )}
                            {selectedPredeterminedWinners.length > 0 && (
                              <div className="border-brand-gold/30 bg-brand-gold/5 space-y-2 rounded-xl border p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-brand-gold/20 text-brand-gold flex h-8 w-8 items-center justify-center rounded-lg"><Trophy className="h-4 w-4" /></div>
                                    <div className="text-xs text-slate-500 dark:text-gray-400">{selectedPredeterminedWinners.length} Selected Winner{selectedPredeterminedWinners.length > 1 ? 's' : ''}</div>
                                  </div>
                                  <button type="button" onClick={() => setSelectedPredeterminedWinners([])} className="cursor-pointer text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300"><XCircle className="h-5 w-5" /></button>
                                </div>
                                {selectedPredeterminedWinners.map((sw) => (
                                  <div key={sw.id} className="flex items-center justify-between pl-11">
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">{sw.name} <span className="font-mono text-xs font-semibold text-slate-400">({sw.ticket_number})</span></div>
                                    <button type="button" onClick={() => setSelectedPredeterminedWinners((prev) => prev.filter((w) => w.id !== sw.id))} className="cursor-pointer text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300"><XCircle className="h-4 w-4" /></button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-4 self-center lg:mt-16 lg:self-start">
                    {activeWinners.length > 0 ? (
                      <div className="border-brand-gold/30 flex flex-col items-center justify-center gap-4 rounded-3xl border bg-gradient-to-b from-slate-50 to-white p-8 shadow-2xl dark:from-[#1a1a24] dark:to-[#0a0a0f]">
                        <div className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold flex h-16 w-16 items-center justify-center rounded-full border shadow-[0_0_20px_rgba(201,168,76,0.3)]"><Trophy className="h-8 w-8" /></div>
                        <div className="text-center">
                          <div className="text-brand-gold mb-1 text-[10px] font-bold tracking-widest uppercase">{activeWinners.length === 1 ? 'Winner Declared' : `${activeWinners.length} Winners Declared`}</div>
                          {activeWinners.map((w, idx) => (
                            <div key={w.id}>
                              {activeWinners.length > 1 && <div className="mb-0.5 text-[9px] font-medium tracking-widest text-slate-400 uppercase dark:text-slate-500">Winner #{idx + 1}</div>}
                              <div className="font-serif text-2xl font-bold text-slate-900 dark:text-white">{w.name}</div>
                              <div className="mt-1 inline-block rounded bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-gray-300">{w.ticket_number}</div>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => resetDraw(activeLottery.id)} disabled={isPending}
                          className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-6 py-2.5 text-xs font-bold tracking-wider text-slate-600 uppercase transition-all hover:bg-slate-200 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white">
                          <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} /> Reset Draw
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => drawWinner(token!, activeLottery!.id, drawMethod === 'manual' ? selectedPredeterminedWinners.map((w) => w.id) : undefined)}
                        disabled={isPending || (drawMethod === 'manual' && selectedPredeterminedWinners.length === 0)}
                        className="group bg-brand-gold text-brand-navy relative flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl px-10 py-6 text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(201,168,76,0.6)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none">
                        <div className="absolute inset-0 flex h-full w-full [transform:skew(-12deg)_translateX(-100%)] justify-center group-hover:[transform:skew(-12deg)_translateX(100%)] group-hover:duration-1000"><div className="relative h-full w-8 bg-white/30" /></div>
                        <Play className="fill-brand-navy h-6 w-6" /> {drawMethod === 'manual' ? 'Execute Preset Draw' : 'Execute Live Draw'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-16 text-center dark:border-white/20 dark:bg-[#0e0e14]/30">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-gray-600"><Award className="h-10 w-10" /></div>
                <h3 className="mb-2 font-serif text-2xl font-bold text-slate-900 dark:text-white">No Active Campaigns</h3>
                <p className="mb-8 max-w-md text-sm text-slate-500 dark:text-gray-400">You don't have any active lotteries running. Start a new campaign to thrill your participants and award prizes.</p>
                <button onClick={() => { setActiveTab('create'); setWizardStep(1); }}
                  className="bg-brand-gold text-brand-navy flex cursor-pointer items-center gap-2 rounded-xl px-8 py-3.5 text-xs font-bold tracking-wider uppercase transition-transform hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(201,168,76,0.2)]"><Plus className="h-4 w-4" /> Start New Campaign</button>
              </div>
            )}

            {/* History Table */}
            <div className="space-y-6">
              <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Archive & History</h3>
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white backdrop-blur-md dark:border-white/10 dark:bg-[#0e0e14]/60">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-gray-300">
                    <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:border-white/10 dark:bg-black/40 dark:text-gray-400">
                      <tr><th className="px-8 py-5">Campaign Name</th><th className="px-8 py-5">Date</th><th className="px-8 py-5">Status</th><th className="px-8 py-5">Winner Details</th><th className="px-8 py-5 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {lotteries.map((l) => (
                        <tr key={l.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                          <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">{l.title}</td>
                          <td className="px-8 py-5 text-slate-500 dark:text-gray-400">{new Date(l.created_at).toLocaleDateString()}</td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                              l.status === 'active' ? 'border-green-200 bg-green-50 text-green-600 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400'
                                : l.status === 'completed' ? 'border-brand-gold/30 bg-brand-gold/10 text-brand-gold'
                                : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
                            }`}>{l.status}</span>
                          </td>
                          <td className="px-8 py-5">
                            {l.winner ? (
                              <div><div className="text-brand-gold flex items-center gap-2 font-bold"><Award className="h-4 w-4 shrink-0" /> {l.winner.name}</div><div className="mt-1 font-mono text-[10px] text-slate-500 dark:text-gray-500">Ticket: {l.winner.ticket_number}</div></div>
                            ) : <span className="text-xs text-slate-400 italic dark:text-gray-500">Pending Draw</span>}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button title="View Participants" onClick={() => setViewingLottery(l)}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-blue-400/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300">
                                <Eye className="h-3.5 w-3.5" /><span className="hidden sm:inline">View</span>
                              </button>
                              <button title="Edit Campaign" onClick={() => setEditingLottery(l)}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-violet-400/40 dark:hover:bg-violet-500/10 dark:hover:text-violet-300">
                                <Edit2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Edit</span>
                              </button>
                              <button title="Send Email to Participants" onClick={() => setEmailModalLottery(l)}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-amber-400/40 dark:hover:bg-amber-500/10 dark:hover:text-amber-300">
                                <Mail className="h-3.5 w-3.5" /><span className="hidden sm:inline">Email</span>
                              </button>
                              <button title="Re-open Draw" onClick={() => resetDraw(l.id)} disabled={isPending}
                                className="hover:border-brand-gold/40 hover:bg-brand-gold/10 hover:text-brand-gold inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-all dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                                <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">Re-open</span>
                              </button>
                              <button title="Delete Campaign" onClick={() => setDeletingLotteryId(l.id)}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 transition-all hover:border-red-400 hover:bg-red-500 hover:text-white dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white">
                                <Trash2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {lotteries.length === 0 && <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic dark:text-gray-500">No archived campaigns.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ CREATE TAB ════════════════════════════════════════════════ */ }
        {activeTab === 'create' && (
          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl backdrop-blur-xl md:p-12 dark:border-white/10 dark:bg-[#0e0e14]/80 dark:shadow-2xl">
            {/* Wizard Progress */}
            <div className="mb-12">
              <div className="relative flex items-center justify-between">
                <div className="absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2 bg-slate-200 dark:bg-white/10" />
                <div className="bg-brand-gold absolute top-1/2 left-0 h-0.5 -translate-y-1/2 transition-all duration-500" style={{ width: `${(wizardStep - 1) * 50}%` }} />
                {[1, 2, 3].map((step) => (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all duration-500 ${
                      wizardStep >= step ? 'border-brand-gold bg-brand-gold text-brand-navy shadow-[0_0_15px_rgba(201,168,76,0.4)]' : 'border-slate-200 bg-white text-slate-400 dark:border-white/20 dark:bg-[#0e0e14] dark:text-gray-500'
                    }`}>{wizardStep > step ? <CheckCircle2 className="h-6 w-6" /> : step}</div>
                    <span className={`text-[10px] font-bold tracking-widest uppercase ${wizardStep >= step ? 'text-brand-gold' : 'text-slate-400 dark:text-gray-500'}`}>
                      {step === 1 ? 'Details' : step === 2 ? 'Participants' : 'Launch'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {/* Step 1: Details */}
                {wizardStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="text-center">
                      <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">Campaign Details</h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">Give your lucky draw a grand title and exciting description.</p>
                    </div>
                    <div className="mx-auto max-w-2xl space-y-6">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                        <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400"><Zap className="text-brand-gold mr-1.5 inline h-3.5 w-3.5" /> Quick Campaign Presets</label>
                        <select onChange={(e) => { const val = e.target.value; if (!val) return; const presets: Record<string, { title: string; desc: string }> = { villa: { title: 'SVI Grand Villa Lucky Draw', desc: 'Win a premium villa in our exclusive residential community.' }, plot: { title: 'Premium Residential Plot Giveaway', desc: 'Win a fully developed residential plot.' }, apartment: { title: 'Luxury High-Rise Apartment Lucky Draw', desc: 'Exclusive token-based draw for a premium high-rise apartment.' }, commercial: { title: 'Commercial Space Premium Lottery', desc: 'Win a commercial office/shop space.' }, loyalty: { title: 'Investor Loyalty Reward Draw', desc: 'Exclusive draw for our loyal investors.' }, festival: { title: 'Festival Special Lucky Draw', desc: 'Festive season lucky draw for all registered customers.' } }; const p = presets[val]; if (p) { setTitle(p.title); setDescription(p.desc); } e.target.value = ''; }} defaultValue=""
                          className="focus:border-brand-gold/50 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-gray-300">
                          <option value="">— Select a preset to auto-fill fields —</option>
                          <option value="villa">SVI Grand Villa Lucky Draw</option><option value="plot">Premium Residential Plot Giveaway</option>
                          <option value="apartment">Luxury High-Rise Apartment Draw</option><option value="commercial">Commercial Space Premium Lottery</option>
                          <option value="loyalty">Investor Loyalty Reward Draw</option><option value="festival">Festival Special Lucky Draw</option>
                        </select>
                        <p className="mt-2 text-[10px] text-slate-400 dark:text-gray-500">Selecting a preset fills the title and description. You can then edit freely.</p>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-gray-300">Lottery Title <span className="text-brand-gold">*</span></label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Summer Villa Mega Giveaway"
                          className="focus:border-brand-gold/50 w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-lg font-bold text-slate-900 transition-all outline-none focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10" />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-gray-300">Description / Prizes</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the grand prize and rules..." rows={4}
                          className="focus:border-brand-gold/50 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-900 transition-all outline-none focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Participants */}
                {wizardStep === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="text-center">
                      <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">Load Participants</h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">Upload your customer spreadsheet or add entries manually.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                      <div className="lg:col-span-2">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
                          <div className="mb-6 flex gap-2 rounded-xl bg-slate-200 p-1 dark:bg-black/40">
                            <button type="button" onClick={() => setEntryMethod('upload')}
                              className={`flex-1 rounded-lg py-2.5 text-[10px] font-bold tracking-widest uppercase transition-all ${entryMethod === 'upload' ? 'text-brand-gold bg-white shadow-sm dark:bg-white/10' : 'text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white'}`}>Upload File</button>
                            <button type="button" onClick={() => setEntryMethod('manual')}
                              className={`flex-1 rounded-lg py-2.5 text-[10px] font-bold tracking-widest uppercase transition-all ${entryMethod === 'manual' ? 'text-brand-gold bg-white shadow-sm dark:bg-white/10' : 'text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white'}`}>Manual</button>
                          </div>
                          {entryMethod === 'upload' ? (
                            <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                              onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0], setErrorMessage, setSuccessMessage); }}
                              onClick={() => fileInputRef.current?.click()}
                              className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                                dragOver ? 'border-brand-gold bg-brand-gold/5' : 'border-slate-300 hover:border-slate-400 dark:border-white/20 dark:hover:border-white/40'
                              }`}>
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10">
                                <FileSpreadsheet className="h-7 w-7 text-slate-500 dark:text-gray-400" />
                              </div>
                              <p className="text-sm font-semibold text-slate-600 dark:text-gray-300">Drop your file here or click to browse</p>
                              <p className="text-[10px] text-slate-400 dark:text-gray-500">Supports .csv, .xlsx, .xls — Name, Phone, Email, Ticket# columns</p>
                              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], setErrorMessage, setSuccessMessage)} className="hidden" />
                            </div>
                          ) : (
                            <form onSubmit={(e) => { e.preventDefault(); handleManualAdd(setErrorMessage, setSuccessMessage); }} className="space-y-3">
                              <input type="text" placeholder="Full Name *" value={manualName} onChange={(e) => setManualName(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand-gold/50 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white" />
                              <input type="text" placeholder="Ticket Number (auto if left blank)" value={manualTicket} onChange={(e) => setManualTicket(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand-gold/50 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white" />
                              <input type="text" placeholder="Phone" value={manualPhone} onChange={(e) => setManualPhone(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand-gold/50 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white" />
                              <input type="text" placeholder="Email" value={manualEmail} onChange={(e) => setManualEmail(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand-gold/50 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white" />
                              <button type="submit" className="bg-brand-gold text-brand-navy w-full cursor-pointer rounded-xl py-2.5 text-xs font-bold tracking-wider uppercase transition-all hover:opacity-90">
                                <Plus className="mr-1.5 inline h-4 w-4" /> Add Participant
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                      <div className="lg:col-span-3">
                        {/* Participants Table */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                            <Search className="h-4 w-4 text-slate-400" />
                            <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Search loaded participants..."
                              className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder-gray-500" />
                            <span className="text-xs text-slate-500 dark:text-gray-400">{participants.length} entries</span>
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            {paginatedParticipants.length === 0 ? (
                              <div className="flex flex-col items-center gap-4 p-12 text-center">
                                <FileText className="h-10 w-10 text-slate-300 dark:text-gray-600" />
                                <div><p className="font-bold text-slate-600 dark:text-gray-300">No participants loaded</p><p className="text-xs text-slate-400 dark:text-gray-500">Upload a file or add manually to see the list.</p></div>
                              </div>
                            ) : (
                              <table className="w-full text-left text-xs">
                                <thead><tr className="border-b border-slate-100 text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:border-white/5 dark:text-gray-500">
                                  <th className="px-4 py-2.5">#</th><th className="px-4 py-2.5">Name</th><th className="px-4 py-2.5">Phone</th><th className="px-4 py-2.5">Email</th><th className="px-4 py-2.5">Ticket</th><th className="px-4 py-2.5 text-right">Action</th>
                                </tr></thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                  {paginatedParticipants.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5">
                                      <td className="px-4 py-3 text-slate-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{p.name}</td>
                                      <td className="px-4 py-3 text-slate-500 dark:text-gray-400">{p.phone || '—'}</td>
                                      <td className="px-4 py-3 text-slate-500 dark:text-gray-400">{p.email || '—'}</td>
                                      <td className="px-4 py-3 font-mono text-xs font-bold text-violet-700 dark:text-violet-400">{p.ticketNumber}</td>
                                      <td className="px-4 py-3 text-right">
                                        <button onClick={() => removeParticipant((currentPage - 1) * itemsPerPage + idx)} className="cursor-pointer text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                              <span className="text-xs text-slate-500 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                              <div className="flex gap-1">
                                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                                  className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-30 dark:border-white/10 dark:bg-black/40 dark:text-gray-300 dark:hover:bg-black/60">
                                  <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                                  className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-30 dark:border-white/10 dark:bg-black/40 dark:text-gray-300 dark:hover:bg-black/60">
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Review & Launch */}
                {wizardStep === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="text-center">
                      <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">Review & Launch</h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">Double-check the details before the big reveal.</p>
                    </div>
                    <div className="mx-auto max-w-2xl">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 dark:border-white/10 dark:bg-white/5">
                        <div className="mb-6 flex items-center gap-4">
                          <div className="bg-brand-gold/20 text-brand-gold flex h-14 w-14 items-center justify-center rounded-2xl"><Sparkles className="h-7 w-7" /></div>
                          <div><h4 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">{title}</h4><p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{description || 'No description'}</p></div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-200 pt-5 dark:border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"><Users className="h-5 w-5" /></div>
                            <div><div className="text-2xl font-bold text-slate-900 dark:text-white">{participants.length}</div><div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">Total Entries</div></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wizard Navigation Buttons */}
            <div className="mt-10 flex items-center justify-between">
              <button onClick={handlePrevWizardStep} disabled={wizardStep === 1}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-30 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-gray-500">
                  {[1, 2, 3].map((s) => (<span key={s} className={`h-1.5 w-1.5 rounded-full ${wizardStep >= s ? 'bg-brand-gold' : 'bg-slate-300 dark:bg-gray-600'}`} />))}
                </div>
                {wizardStep < 3 ? (
                  <button onClick={handleNextWizardStep}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-gold px-8 py-3 text-sm font-bold text-brand-navy transition-all hover:opacity-90">
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button onClick={saveLotteryToDB} disabled={isPending}
                    className="bg-brand-gold text-brand-navy inline-flex cursor-pointer items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold tracking-wider uppercase transition-all hover:opacity-90 disabled:opacity-50">
                    {isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Deploy Campaign
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ MODALS ═════════════════════════════════════════════════════ */ }
      <EditCampaignModal
        open={!!editingLottery}
        lottery={editingLottery}
        onClose={() => setEditingLottery(null)}
        onSaved={fetchLotteries}
        onError={setErrorMessage}
        onSuccess={setSuccessMessage}
      />

      <ViewParticipantsModal
        open={!!viewingLottery}
        lottery={viewingLottery}
        onClose={() => setViewingLottery(null)}
        onOpenEmail={(l) => { setViewingLottery(null); setEmailModalLottery(l); }}
      />

      <BulkEmailModal
        open={!!emailModalLottery}
        lottery={emailModalLottery}
        onClose={() => setEmailModalLottery(null)}
        token={token!}
        onSuccess={setSuccessMessage}
        onError={setErrorMessage}
      />

      <DeleteConfirmModal
        open={!!deletingLotteryId}
        lotteryId={deletingLotteryId}
        onClose={() => { setDeletingLotteryId(null); }}
        token={token!}
        onSuccess={setSuccessMessage}
        onError={setErrorMessage}
        onDeleted={fetchLotteries}
      />
    </>
  );
}
