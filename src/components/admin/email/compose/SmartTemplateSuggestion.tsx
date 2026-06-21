'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Loader2, Check, RefreshCw } from 'lucide-react';
import { useAIEmail } from '../hooks/useAIEmail';

interface SmartTemplateSuggestionProps {
  open: boolean;
  templateId: string | null;
  variables: string[];
  recipientEmail?: string;
  onClose: () => void;
  onApply: (suggestions: Record<string, string>) => void;
}

type Confidence = 'high' | 'medium' | 'low';

const CONFIDENCE_COLORS: Record<Confidence, { bg: string; text: string; dot: string }> = {
  high: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  medium: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  low: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
};

export function SmartTemplateSuggestion({
  open,
  templateId,
  variables,
  recipientEmail,
  onClose,
  onApply,
}: SmartTemplateSuggestionProps) {
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [confidence, setConfidence] = useState<Record<string, Confidence>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const { populateTemplate, loading } = useAIEmail();

  const handleFetchSuggestions = async () => {
    if (loading || !variables.length) return;

    const result = await populateTemplate({
      templateId: templateId || undefined,
      variables,
      recipientEmail,
    });

    if (result) {
      setSuggestions(result.suggestions || {});
      setConfidence((result.confidence || {}) as Record<string, Confidence>);
      // Auto-select high confidence suggestions
      const autoSelect: Record<string, boolean> = {};
      Object.entries(result.confidence || {}).forEach(([key, val]) => {
        autoSelect[key] = val === 'high';
      });
      setSelected(autoSelect);
    }
  };

  const handleToggle = (key: string) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApply = () => {
    const toApply: Record<string, string> = {};
    Object.entries(selected).forEach(([key, isSelected]) => {
      if (isSelected && suggestions[key]) {
        toApply[key] = suggestions[key];
      }
    });
    onApply(toApply);
    handleClose();
  };

  const handleClose = () => {
    setSuggestions({});
    setConfidence({});
    setSelected({});
    onClose();
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="dark:bg-brand-dark-surface border-brand-gold/20 bg-brand-gold/[0.03] overflow-hidden rounded-xl border shadow-lg"
      >
        {/* Header */}
        <div className="border-brand-gold/10 dark:border-brand-gold/15 flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="bg-brand-gold/10 flex h-6 w-6 items-center justify-center rounded-lg">
              <Sparkles className="text-brand-gold h-3.5 w-3.5" />
            </div>
            <span className="text-brand-navy text-xs font-semibold dark:text-gray-200">
              Smart Fill
            </span>
            {Object.keys(suggestions).length > 0 && (
              <span className="text-brand-gold font-mono text-[10px]">
                {selectedCount}/{Object.keys(suggestions).length} selected
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="hover:bg-brand-gold/10 hover:text-brand-gold rounded-lg p-1.5 text-gray-400 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {Object.keys(suggestions).length === 0 ? (
            <div className="text-center">
              {!recipientEmail ? (
                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                  Enter a recipient email for better suggestions, or click Smart Fill to generate
                  suggestions from available context.
                </p>
              ) : (
                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                  AI will look up recipient data and suggest values for {variables.length} template
                  variables.
                </p>
              )}
              <button
                onClick={handleFetchSuggestions}
                disabled={loading}
                className="bg-brand-gold text-brand-navy inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Smart Fill
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {variables.map((key) => {
                const suggestion = suggestions[key];
                const conf = confidence[key] || 'low';
                const colors = CONFIDENCE_COLORS[conf];
                const isSelected = !!selected[key];

                return (
                  <div
                    key={key}
                    className={`flex items-center gap-3 rounded-lg border p-2.5 transition-all ${
                      isSelected
                        ? 'border-brand-gold/30 bg-brand-gold/[0.05] dark:border-brand-gold/20 dark:bg-brand-gold/[0.03]'
                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                    }`}
                  >
                    <button
                      onClick={() => handleToggle(key)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                        isSelected
                          ? 'border-brand-gold bg-brand-gold text-brand-navy'
                          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${colors.bg} ${colors.text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                          {conf}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-gray-700 dark:text-gray-300">
                        {suggestion || '(no suggestion)'}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleFetchSuggestions}
                  disabled={loading}
                  className="text-brand-gold flex items-center gap-1.5 text-xs hover:opacity-80 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>

                <button
                  onClick={handleApply}
                  disabled={selectedCount === 0}
                  className="bg-brand-gold text-brand-navy flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Check className="h-3 w-3" />
                  Apply {selectedCount > 0 ? `(${selectedCount})` : ''}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
