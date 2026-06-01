'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Filter,
  Inbox,
  Loader2,
  Mail,
  RefreshCw,
  Reply,
  Forward,
  Search,
  Star,
  User,
  X,
  FileText,
  Code2,
  Users,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { SentEmail, EmailDetail, ForwardData, ReplyData } from './types';
import {
  formatTime,
  getToken,
  buildForwardHtml,
  buildReplyHtml,
  buildCopyText,
  buildCopyHtml,
} from './helpers';
import { EmailListSkeleton } from './Skeletons';

/* ─── Constants ─── */
const PAGE_SIZE = 50;

type SortField = 'date' | 'subject' | 'recipient' | 'status';
type SortDir = 'asc' | 'desc';
type DatePreset = 'all' | 'today' | '7d' | '30d' | '90d';

interface SortOption {
  field: SortField;
  label: string;
  icon: React.ElementType;
}

const SORT_OPTIONS: SortOption[] = [
  { field: 'date', label: 'Date', icon: Calendar },
  { field: 'subject', label: 'Subject', icon: Mail },
  { field: 'recipient', label: 'Recipient', icon: User },
  { field: 'status', label: 'Status', icon: Zap },
];

const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'all', label: 'All time' },
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
];

const STATUS_FILTER_OPTIONS = [
  { value: 'delivered', color: 'bg-emerald-500' },
  { value: 'opened', color: 'bg-violet-500' },
  { value: 'clicked', color: 'bg-indigo-500' },
  { value: 'bounced', color: 'bg-red-500' },
  { value: 'failed', color: 'bg-red-500' },
  { value: 'complained', color: 'bg-amber-500' },
  { value: 'sent', color: 'bg-blue-500' },
];

/* ─── Animation variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 26 } },
};

/* ─── Props ─── */
interface SentTabProps {
  onForward?: (data: ForwardData) => void;
  onReply?: (data: ReplyData) => void;
}

/* ─── Helpers ─── */
function getInitials(email: string): string {
  const name = email.split('@')[0] || '';
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(email: string): string {
  const colors = [
    'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  ];
  let hash = 0;
  for (const ch of email) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return colors[Math.abs(hash) % colors.length];
}

function StatusDot({ status }: { status: string }) {
  const s = status?.toLowerCase() || 'sent';
  const color = STATUS_FILTER_OPTIONS.find((o) => o.value === s)?.color || 'bg-blue-500';
  return <div className={`h-2 w-2 rounded-full ${color}`} />;
}

function getStatusLabel(status: string): string {
  const s = status?.toLowerCase() || 'sent';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ─── Component ─── */
export function SentTab({ onForward, onReply }: SentTabProps) {
  /* ─── Data state ─── */
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EmailDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  /* ─── Search ─── */
  const [search, setSearch] = useState('');

  /* ─── Sort state ─── */
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  /* ─── Filter state ─── */
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [fromFilter, setFromFilter] = useState('');

  /* ─── Star ─── */
  const [starred, setStarred] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('svi-starred-emails');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  /* ─── Copy / Detail ─── */
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const copyMenuRef = useRef<HTMLDivElement>(null);

  /* ─── Close dropdowns on outside click ─── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (copyMenuRef.current && !copyMenuRef.current.contains(target)) setCopyMenuOpen(false);
      if (sortRef.current && !sortRef.current.contains(target)) setSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(target)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ─── Fetch emails ─── */
  const fetchEmails = useCallback(async (offset = 0) => {
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/email?limit=${PAGE_SIZE}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      const newEmails = data.emails || [];
      if (offset === 0) setEmails(newEmails);
      else setEmails((prev) => [...prev, ...newEmails]);
      setHasMore(newEmails.length === PAGE_SIZE);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);
  useEffect(() => {
    localStorage.setItem('svi-starred-emails', JSON.stringify([...starred]));
  }, [starred]);

  /* ─── Detail fetch ─── */
  const fetchDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/email?action=email&id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load email');
      setSelected(data.email);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoadingDetail(false);
    }
  };

  /* ─── Star toggle ─── */
  const toggleStar = (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ─── Copy helpers ─── */
  const copyText = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
    setCopyMenuOpen(false);
    toast.success('Copied to clipboard');
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    toast.success('Email ID copied');
  };

  /* ─── Forward / Reply ─── */
  const handleForward = () => {
    if (!selected || !onForward) return;
    onForward({
      subject: `Fwd: ${selected.subject}`,
      html: buildForwardHtml(selected),
      originalFrom: selected.from,
      originalTo: selected.to || [],
      originalDate: selected.created_at,
      originalSubject: selected.subject,
    });
  };

  const handleReply = () => {
    if (!selected || !onReply) return;
    onReply({
      to: selected.from,
      subject: `Re: ${selected.subject}`,
      html: buildReplyHtml(selected),
      originalFrom: selected.from,
      originalDate: selected.created_at,
      originalSubject: selected.subject,
      cc: selected.cc,
    });
  };

  /* ─── Sort handler ─── */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'date' ? 'desc' : 'asc');
    }
    setSortOpen(false);
  };

  /* ─── Filter handlers ─── */
  const toggleStatus = (s: string) => {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter(new Set());
    setDatePreset('all');
    setFromFilter('');
    setShowStarredOnly(false);
    setSortField('date');
    setSortDir('desc');
  };

  /* ─── Derived values ─── */
  const hasSortChanged = sortField !== 'date' || sortDir !== 'desc';

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter.size > 0) count += statusFilter.size;
    if (datePreset !== 'all') count++;
    if (fromFilter.trim()) count++;
    if (showStarredOnly) count++;
    return count;
  }, [statusFilter, datePreset, fromFilter, showStarredOnly]);

  const hasActiveFilters = activeFilterCount > 0 || search.trim().length > 0 || hasSortChanged;

  const dateCutoff = useMemo(() => {
    if (datePreset === 'all') return null;
    const now = new Date();
    switch (datePreset) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case '7d':
        return new Date(now.getTime() - 7 * 86400000);
      case '30d':
        return new Date(now.getTime() - 30 * 86400000);
      case '90d':
        return new Date(now.getTime() - 90 * 86400000);
      default:
        return null;
    }
  }, [datePreset]);

  /* ─── Processed list: filter → sort ─── */
  const processed = useMemo(() => {
    let list = [...emails];

    // Search (subject, from, to)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.subject?.toLowerCase().includes(q) ||
          e.from?.toLowerCase().includes(q) ||
          e.to?.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    // Star filter
    if (showStarredOnly) list = list.filter((e) => starred.has(e.id));

    // Status filter (multi)
    if (statusFilter.size > 0) {
      list = list.filter((e) => statusFilter.has(e.last_event?.toLowerCase() || ''));
    }

    // Date range
    if (dateCutoff) {
      list = list.filter((e) => new Date(e.created_at) >= dateCutoff);
    }

    // From filter
    if (fromFilter.trim()) {
      const f = fromFilter.toLowerCase();
      list = list.filter((e) => e.from?.toLowerCase().includes(f));
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'date':
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'subject':
          cmp = (a.subject || '').localeCompare(b.subject || '');
          break;
        case 'recipient':
          cmp = (a.to?.[0] || '').localeCompare(b.to?.[0] || '');
          break;
        case 'status':
          cmp = (a.last_event || '').localeCompare(b.last_event || '');
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [
    emails,
    search,
    showStarredOnly,
    starred,
    statusFilter,
    dateCutoff,
    fromFilter,
    sortField,
    sortDir,
  ]);

  const sortLabel = useMemo(() => {
    const opt = SORT_OPTIONS.find((o) => o.field === sortField);
    return `${opt?.label || 'Date'} ${sortDir === 'asc' ? '↑' : '↓'}`;
  }, [sortField, sortDir]);

  /* ─── Render ─── */
  return (
    <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm lg:grid-cols-5 dark:border-gray-700/60 dark:bg-[#0e0e14]">
      {/* ─── Email List ─── */}
      <div
        className={`${selected ? 'lg:col-span-2' : 'lg:col-span-5'} flex flex-col transition-all duration-300`}
      >
        {/* ═══ Row 1: Search + toolbar ═══ */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          {/* Search */}
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus-gold w-full rounded-lg border border-gray-200 bg-gray-50/80 py-2 pr-8 pl-9 text-xs text-gray-900 placeholder-gray-400 outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Filter button */}
            <div ref={filterRef} className="relative">
              <button
                onClick={() => {
                  setFilterOpen(!filterOpen);
                  setSortOpen(false);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  activeFilterCount > 0
                    ? 'text-brand-gold bg-brand-gold/5'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Filter</span>
                {activeFilterCount > 0 && (
                  <span className="bg-brand-gold flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Filter dropdown */}
              <AnimatePresence>
                {filterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    className="absolute top-full right-0 z-50 mt-1.5 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-[#0e0e14]"
                  >
                    {/* Status multi-select */}
                    <div className="mb-3">
                      <p className="mb-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                        Status
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {STATUS_FILTER_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => toggleStatus(opt.value)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                              statusFilter.has(opt.value)
                                ? 'bg-brand-gold/10 text-brand-gold ring-brand-gold/30 ring-1'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className={`h-1.5 w-1.5 rounded-full ${opt.color}`} />
                            {getStatusLabel(opt.value)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date range */}
                    <div className="mb-3">
                      <p className="mb-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                        Date Range
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {DATE_PRESETS.map((p) => (
                          <button
                            key={p.key}
                            onClick={() => setDatePreset(p.key)}
                            className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                              datePreset === p.key
                                ? 'bg-brand-gold/10 text-brand-gold ring-brand-gold/30 ring-1'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* From address */}
                    <div className="mb-3">
                      <p className="mb-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                        From
                      </p>
                      <div className="relative">
                        <User className="pointer-events-none absolute top-1/2 left-2.5 h-3 w-3 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="sender@example.com"
                          value={fromFilter}
                          onChange={(e) => setFromFilter(e.target.value)}
                          className="focus:border-brand-gold/40 w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-8 text-[11px] text-gray-700 placeholder-gray-400 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:placeholder-gray-500"
                        />
                      </div>
                    </div>

                    {/* Clear all in panel */}
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="w-full rounded-lg py-1.5 text-[10px] font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        Clear all filters
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sort button */}
            <div ref={sortRef} className="relative">
              <button
                onClick={() => {
                  setSortOpen(!sortOpen);
                  setFilterOpen(false);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  hasSortChanged
                    ? 'text-brand-gold bg-brand-gold/5'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5'
                }`}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{sortLabel}</span>
              </button>

              {/* Sort dropdown */}
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    className="absolute top-full right-0 z-50 mt-1.5 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-[#0e0e14]"
                  >
                    {SORT_OPTIONS.map((opt) => {
                      const active = sortField === opt.field;
                      return (
                        <button
                          key={opt.field}
                          onClick={() => handleSort(opt.field)}
                          className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs transition-colors ${
                            active
                              ? 'bg-brand-gold/5 text-brand-gold'
                              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.02]'
                          }`}
                        >
                          <opt.icon className="h-3.5 w-3.5 shrink-0" />
                          {opt.label}
                          {active && (
                            <span className="ml-auto text-[10px]">
                              {sortDir === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Star toggle */}
            <button
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                showStarredOnly
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5'
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${showStarredOnly ? 'fill-amber-400' : ''}`} />
              <span className="hidden sm:inline">{showStarredOnly ? 'Starred' : 'Star'}</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => fetchEmails(0)}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-white/5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* ═══ Row 2: Active filter chips ═══ */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-b border-gray-100 dark:border-gray-800"
            >
              <div className="flex flex-wrap items-center gap-1.5 px-4 py-2">
                <span className="mr-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  Active:
                </span>

                {/* Search chip */}
                {search.trim() && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    <Search className="h-2.5 w-2.5" />
                    &quot;{search.trim()}&quot;
                    <button onClick={() => setSearch('')} className="ml-0.5 hover:text-red-500">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}

                {/* Status chips */}
                {Array.from(statusFilter).map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${STATUS_FILTER_OPTIONS.find((o) => o.value === s)?.color || 'bg-gray-400'}`}
                    />
                    {getStatusLabel(s)}
                    <button onClick={() => toggleStatus(s)} className="ml-0.5 hover:text-red-500">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}

                {/* Date chip */}
                {datePreset !== 'all' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    <Clock className="h-2.5 w-2.5" />
                    {DATE_PRESETS.find((p) => p.key === datePreset)?.label}
                    <button
                      onClick={() => setDatePreset('all')}
                      className="ml-0.5 hover:text-red-500"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}

                {/* From chip */}
                {fromFilter.trim() && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    <User className="h-2.5 w-2.5" />
                    {fromFilter.trim()}
                    <button onClick={() => setFromFilter('')} className="ml-0.5 hover:text-red-500">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}

                {/* Starred chip */}
                {showStarredOnly && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                    <Star className="h-2.5 w-2.5 fill-amber-400" />
                    Starred
                    <button
                      onClick={() => setShowStarredOnly(false)}
                      className="ml-0.5 hover:text-red-500"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}

                {/* Sort chip */}
                {hasSortChanged && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <ArrowUpDown className="h-2.5 w-2.5" />
                    {sortLabel}
                    <button
                      onClick={() => {
                        setSortField('date');
                        setSortDir('desc');
                      }}
                      className="ml-0.5 hover:text-red-500"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}

                {/* Clear all */}
                <button
                  onClick={clearAllFilters}
                  className="ml-1 text-[10px] font-semibold text-red-500 transition-colors hover:text-red-600"
                >
                  Clear all
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ Row 3: Results count ═══ */}
        {!loading && !error && (
          <div className="flex items-center justify-between border-b border-gray-50 px-4 py-1.5 dark:border-gray-800/50">
            <span className="font-mono text-[10px] text-gray-400">
              {processed.length === emails.length
                ? `${emails.length} email${emails.length !== 1 ? 's' : ''}`
                : `${processed.length} of ${emails.length} email${emails.length !== 1 ? 's' : ''}`}
            </span>
            {hasActiveFilters && (
              <span className="text-brand-gold text-[10px] font-medium">Filtered</span>
            )}
          </div>
        )}

        {/* ═══ Email List ═══ */}
        <div
          className="scrollbar-gold flex-1 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 280px)' }}
        >
          {loading ? (
            <EmailListSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertTriangle className="mb-3 h-7 w-7 text-red-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{error}</p>
              <button
                onClick={() => fetchEmails(0)}
                className="text-brand-gold mt-3 text-xs underline"
              >
                Retry
              </button>
            </div>
          ) : processed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Inbox className="mb-3 h-7 w-7 text-gray-300 dark:text-gray-700" />
              <p className="text-sm text-gray-500">
                {hasActiveFilters
                  ? 'No emails match your filters'
                  : showStarredOnly
                    ? 'No starred emails'
                    : 'No sent emails found'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-brand-gold mt-2 text-xs underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-gray-100 dark:divide-gray-800"
            >
              {processed.map((email) => {
                const isCurrent = selected?.id === email.id;
                const isStarred = starred.has(email.id);
                const firstTo = email.to?.[0] || '';
                return (
                  <motion.div variants={itemVariants} key={email.id}>
                    <button
                      onClick={() => fetchDetail(email.id)}
                      className={`group relative flex w-full items-start gap-3.5 px-5 py-4 text-left transition-all ${
                        isCurrent
                          ? 'bg-brand-gold/[0.04] dark:bg-brand-gold/[0.03]'
                          : 'hover:bg-gray-50/80 dark:hover:bg-white/[0.015]'
                      }`}
                    >
                      {isCurrent && (
                        <div className="bg-brand-gold absolute top-0 bottom-0 left-0 w-[3px] rounded-r-full" />
                      )}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${getAvatarColor(firstTo)}`}
                      >
                        {getInitials(firstTo)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <StatusDot status={email.last_event} />
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {email.subject || '(no subject)'}
                          </p>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-500">
                          To: {email.to?.join(', ')}
                        </p>
                        <div className="mt-1.5 flex items-center gap-3">
                          <span className="font-mono text-[10px] text-gray-400">
                            {formatTime(email.created_at)}
                          </span>
                          <span className="text-[10px] font-medium text-gray-400 capitalize">
                            {getStatusLabel(email.last_event)}
                          </span>
                        </div>
                      </div>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => toggleStar(email.id, e)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') toggleStar(email.id, e);
                        }}
                        className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${isStarred ? 'fill-amber-400 text-amber-400 opacity-100' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                      </span>
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Load more */}
          {hasMore && !search && activeFilterCount === 0 && !showStarredOnly && !loading && (
            <div className="border-t border-gray-100 p-4 text-center dark:border-gray-800">
              <button
                onClick={() => fetchEmails(emails.length)}
                disabled={loadingMore}
                className="text-brand-gold inline-flex items-center gap-2 text-xs font-medium underline transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {loadingMore ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                Load more
              </button>
              <span className="ml-3 font-mono text-[10px] text-gray-400">
                Showing {processed.length} emails
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Reading Pane ─── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="flex flex-col border-l border-gray-100 lg:col-span-3 dark:border-gray-800"
          >
            <div className="from-brand-gold/60 via-brand-gold to-brand-gold/60 h-[2px] w-full bg-gradient-to-r" />
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Mail className="text-brand-gold h-3.5 w-3.5" />
                <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Email Detail
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex flex-1 items-center justify-center py-20">
                <Loader2 className="text-brand-gold h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="scrollbar-gold flex-1 overflow-y-auto">
                <div className="p-6">
                  <h2 className="font-serif text-xl leading-snug font-bold text-gray-900 dark:text-white">
                    {selected.subject}
                  </h2>

                  <div className="mt-5 space-y-2.5">
                    {[
                      { label: 'From', value: selected.from },
                      { label: 'To', value: selected.to?.join(', ') },
                      selected.cc?.length ? { label: 'CC', value: selected.cc.join(', ') } : null,
                      selected.bcc?.length
                        ? { label: 'BCC', value: selected.bcc.join(', ') }
                        : null,
                    ]
                      .filter(Boolean)
                      .map((row) => (
                        <div key={row!.label} className="flex items-start gap-4">
                          <span className="w-10 shrink-0 text-right font-mono text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                            {row!.label}
                          </span>
                          <span className="min-w-0 flex-1 text-sm break-all text-gray-700 dark:text-gray-300">
                            {row!.value}
                          </span>
                        </div>
                      ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-wide text-gray-600 capitalize dark:bg-gray-800 dark:text-gray-400">
                      <StatusDot status={selected.last_event} />
                      {selected.last_event || 'sent'}
                    </span>
                    <span className="font-mono text-[10px] text-gray-400">
                      {new Date(selected.created_at).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => copyId(selected.id)}
                      className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {copiedId === selected.id ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      {selected.id.slice(0, 12)}...
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleReply}
                      className="flex items-center gap-1.5 rounded-lg border border-blue-200/60 bg-blue-50/80 px-3.5 py-2 text-xs font-medium text-blue-600 transition-all hover:border-blue-300 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/15"
                    >
                      <Reply className="h-3.5 w-3.5" /> Reply
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleForward}
                      className="flex items-center gap-1.5 rounded-lg border border-violet-200/60 bg-violet-50/80 px-3.5 py-2 text-xs font-medium text-violet-600 transition-all hover:border-violet-300 hover:bg-violet-100 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/15"
                    >
                      <Forward className="h-3.5 w-3.5" /> Forward
                    </motion.button>

                    {/* Copy dropdown */}
                    <div ref={copyMenuRef} className="relative">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setCopyMenuOpen(!copyMenuOpen)}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200/60 bg-gray-50/80 px-3.5 py-2 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-700/80"
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${copyMenuOpen ? 'rotate-180' : ''}`}
                        />
                      </motion.button>
                      <AnimatePresence>
                        {copyMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.96 }}
                            className="absolute top-full left-0 z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-[#0e0e14]"
                          >
                            {[
                              {
                                key: 'text',
                                icon: FileText,
                                label: 'Copy as Text',
                                action: () => copyText(buildCopyText(selected), 'text'),
                              },
                              {
                                key: 'html',
                                icon: Code2,
                                label: 'Copy as HTML',
                                action: () => copyText(buildCopyHtml(selected), 'html'),
                              },
                              {
                                key: 'subject',
                                icon: Mail,
                                label: 'Copy Subject',
                                action: () => copyText(selected.subject, 'subject'),
                              },
                              {
                                key: 'recipients',
                                icon: Users,
                                label: 'Copy Recipients',
                                action: () => {
                                  const all = [
                                    ...(selected.to || []),
                                    ...(selected.cc || []),
                                    ...(selected.bcc || []),
                                  ];
                                  copyText(all.join(', '), 'recipients');
                                },
                              },
                            ].map((item) => (
                              <button
                                key={item.key}
                                onClick={item.action}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                              >
                                <item.icon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {copiedType === item.key ? 'Copied!' : item.label}
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Star */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => toggleStar(selected.id, e)}
                      className={`ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${starred.has(selected.id) ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 'text-gray-400 hover:bg-gray-50 hover:text-amber-500 dark:hover:bg-white/5'}`}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${starred.has(selected.id) ? 'fill-amber-400' : ''}`}
                      />
                    </motion.button>
                  </div>

                  {/* Body */}
                  {selected.html && (
                    <div className="mt-6">
                      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/20">
                        <div
                          className="email-preview-wrapper"
                          dangerouslySetInnerHTML={{
                            __html:
                              `<style>.email-preview-wrapper div[style*="background-color: #f9f9f9"],.email-preview-wrapper div[style*="background-color: #f9f9f9"] *,.email-preview-wrapper div[style*="background-color:#f9f9f9"],.email-preview-wrapper div[style*="background-color:#f9f9f9"] *,.email-preview-wrapper div[style*="background:#f9f9f9"],.email-preview-wrapper div[style*="background:#f9f9f9"] * { color: #333333 !important; }</style>` +
                              selected.html,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
