'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Loader2, Check, RotateCcw, ChevronDown } from 'lucide-react';
import { useAIEmail } from '../hooks/useAIEmail';

interface AIImprovePanelProps {
  open: boolean;
  html: string;
  onClose: () => void;
  onApply: (improvedHtml: string) => void;
}

const INSTRUCTIONS = [
  { label: 'General Improvement', value: '' },
  { label: 'Fix Grammar', value: 'Fix grammar and spelling errors only' },
  { label: 'Make More Formal', value: 'Make the tone more formal and professional' },
  { label: 'Make More Concise', value: 'Make the email more concise and to the point' },
  { label: 'Make Friendlier', value: 'Make the tone warmer and friendlier' },
] as const;

export function AIImprovePanel({ open, html, onClose, onApply }: AIImprovePanelProps) {
  const [instruction, setInstruction] = useState('');
  const [improvedHtml, setImprovedHtml] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { improveContent, loading, cancel } = useAIEmail();

  const handleImprove = async () => {
    if (loading) return;
    setImprovedHtml('');

    const result = await improveContent({
      html,
      instruction: instruction || undefined,
      onChunk: (text) => setImprovedHtml(text),
    });

    if (result) setImprovedHtml(result);
  };

  const handleApply = () => {
    if (!improvedHtml) return;
    onApply(improvedHtml);
    handleClose();
  };

  const handleClose = () => {
    if (loading) cancel();
    setImprovedHtml('');
    setInstruction('');
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="dark:bg-brand-dark-surface border-brand-gold/20 bg-brand-gold/[0.03] overflow-hidden rounded-xl border shadow-lg"
      >
        {/* Header */}
        <div className="border-brand-gold/10 dark:border-brand-gold/15 flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="bg-brand-gold/10 flex h-6 w-6 items-center justify-center rounded-lg">
              <Sparkles className="text-brand-gold h-3.5 w-3.5" />
            </div>
            <span className="text-brand-navy text-xs font-semibold dark:text-gray-200">
              AI Improve
            </span>
          </div>
          <button
            onClick={handleClose}
            className="hover:bg-brand-gold/10 hover:text-brand-gold rounded-lg p-1.5 text-gray-400 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="hover:bg-brand-gold/5 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {INSTRUCTIONS.find((i) => i.value === instruction)?.label || 'General Improvement'}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showDropdown && (
              <div className="dark:bg-brand-dark-surface absolute bottom-full left-0 z-10 mb-1 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700">
                {INSTRUCTIONS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setInstruction(item.value);
                      setShowDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                      instruction === item.value
                        ? 'bg-brand-gold/10 text-brand-gold'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleImprove}
            disabled={loading}
            className="bg-brand-gold text-brand-navy flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Improving...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Improve
              </>
            )}
          </button>
        </div>

        {/* Improved content preview */}
        {improvedHtml && (
          <div className="border-brand-gold/10 dark:border-brand-gold/15 border-t">
            <div className="scrollbar-gold max-h-[200px] overflow-y-auto p-4">
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: improvedHtml }}
              />
            </div>

            <div className="border-brand-gold/10 dark:border-brand-gold/15 flex items-center justify-end gap-2 border-t px-4 py-3">
              <button
                onClick={handleImprove}
                disabled={loading}
                className="hover:bg-brand-gold/5 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                <RotateCcw className="h-3 w-3" />
                Regenerate
              </button>
              <button
                onClick={handleApply}
                disabled={loading}
                className="bg-brand-gold text-brand-navy flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Check className="h-3 w-3" />
                Apply
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
