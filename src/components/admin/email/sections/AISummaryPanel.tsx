'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Loader2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAIEmail } from '../hooks/useAIEmail';
import { toast } from 'sonner';

interface Summary {
  keyPoints: string[];
  actionItems: string[];
  deadlines: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
}

interface AISummaryPanelProps {
  open: boolean;
  emails: Array<{
    from?: string;
    subject?: string;
    html?: string;
    text?: string;
    created_at?: string;
  }>;
  onClose: () => void;
}

const SENTIMENT_CONFIG = {
  positive: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    label: 'Positive',
  },
  neutral: {
    bg: 'bg-gray-50 dark:bg-gray-500/10',
    text: 'text-gray-700 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-500/30',
    label: 'Neutral',
  },
  negative: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-500/30',
    label: 'Negative',
  },
  urgent: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-500/30',
    label: 'Urgent',
  },
};

export function AISummaryPanel({ open, emails, onClose }: AISummaryPanelProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { summarizeThread, loading } = useAIEmail();

  useEffect(() => {
    if (open && !summary && !loading) {
      handleSummarize();
    }
  }, [open]);

  const handleSummarize = async () => {
    setSummary(null);
    const result = await summarizeThread({ emails });
    if (result) setSummary(result);
  };

  const handleCopy = () => {
    if (!summary) return;
    const text = [
      'Summary',
      '───────',
      '',
      'Key Points:',
      ...summary.keyPoints.map((p) => `• ${p}`),
      '',
      'Action Items:',
      ...summary.actionItems.map((a) => `• ${a}`),
      '',
      ...(summary.deadlines.length > 0
        ? ['Deadlines:', ...summary.deadlines.map((d) => `• ${d}`), '']
        : []),
      `Sentiment: ${summary.sentiment}`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    toast.success('Summary copied to clipboard');
  };

  const handleClose = () => {
    setSummary(null);
    setCollapsed({});
    onClose();
  };

  const toggleSection = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!open) return null;

  const sentimentConfig = summary ? SENTIMENT_CONFIG[summary.sentiment] : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="bg-brand-gold/10 flex h-6 w-6 items-center justify-center rounded-lg">
              <Sparkles className="text-brand-gold h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              AI Summary
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {summary && (
              <button
                onClick={handleCopy}
                className="hover:bg-brand-gold/10 hover:text-brand-gold flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            )}
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="scrollbar-gold flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="text-brand-gold mb-3 h-6 w-6 animate-spin" />
              <p className="text-sm text-gray-500">Analyzing email thread...</p>
              <p className="mt-1 text-xs text-gray-400">
                Extracting key points, action items, and sentiment
              </p>
            </div>
          ) : summary ? (
            <div className="space-y-4">
              {/* Sentiment Badge */}
              {sentimentConfig && (
                <div
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${sentimentConfig.bg} ${sentimentConfig.border}`}
                >
                  <span className={`text-xs font-semibold ${sentimentConfig.text}`}>
                    Overall Sentiment: {sentimentConfig.label}
                  </span>
                </div>
              )}

              {/* Key Points */}
              {summary.keyPoints.length > 0 && (
                <Section
                  icon={Target}
                  title="Key Points"
                  count={summary.keyPoints.length}
                  collapsed={!!collapsed['keyPoints']}
                  onToggle={() => toggleSection('keyPoints')}
                  accent="gold"
                >
                  <ul className="space-y-2">
                    {summary.keyPoints.map((point, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="bg-brand-gold mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Action Items */}
              {summary.actionItems.length > 0 && (
                <Section
                  icon={CheckCircle2}
                  title="Action Items"
                  count={summary.actionItems.length}
                  collapsed={!!collapsed['actionItems']}
                  onToggle={() => toggleSection('actionItems')}
                  accent="navy"
                >
                  <ul className="space-y-2">
                    {summary.actionItems.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="bg-brand-navy mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full dark:bg-gray-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Deadlines */}
              {summary.deadlines.length > 0 && (
                <Section
                  icon={Clock}
                  title="Deadlines"
                  count={summary.deadlines.length}
                  collapsed={!!collapsed['deadlines']}
                  onToggle={() => toggleSection('deadlines')}
                  accent="amber"
                >
                  <ul className="space-y-2">
                    {summary.deadlines.map((deadline, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        {deadline}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* No content */}
              {summary.keyPoints.length === 0 &&
                summary.actionItems.length === 0 &&
                summary.deadlines.length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-500">
                    No significant points found in this thread.
                  </p>
                )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="mb-3 h-6 w-6 text-gray-300" />
              <p className="text-sm text-gray-500">Failed to generate summary</p>
              <button
                onClick={handleSummarize}
                className="text-brand-gold mt-2 text-xs hover:opacity-80"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Collapsible Section ─────────────────────────────────────

function Section({
  icon: Icon,
  title,
  count,
  collapsed,
  onToggle,
  accent,
  children,
}: {
  icon: any;
  title: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
  accent: string;
  children: React.ReactNode;
}) {
  const accentClasses: Record<string, { bg: string; text: string }> = {
    gold: { bg: 'bg-brand-gold/10', text: 'text-brand-gold' },
    navy: {
      bg: 'bg-brand-navy/10 dark:bg-gray-500/10',
      text: 'text-brand-navy dark:text-gray-400',
    },
    amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  };
  const colors = accentClasses[accent] || accentClasses.gold;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/20">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-2.5">
          <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${colors.bg}`}>
            <Icon className={`h-3.5 w-3.5 ${colors.text}`} />
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</span>
          <span className="font-mono text-[10px] text-gray-400">({count})</span>
        </div>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {!collapsed && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
