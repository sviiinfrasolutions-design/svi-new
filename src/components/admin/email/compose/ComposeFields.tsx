'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

interface ComposeFieldsProps {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  fromName: string;
  replyTo: string;
  adminEmail: string;
  forwardData?: any;
  replyData?: any;
  onToChange: (value: string) => void;
  onCcChange: (value: string) => void;
  onBccChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onFromNameChange: (value: string) => void;
  onReplyToChange: (value: string) => void;
}

export function ComposeFields({
  to,
  cc,
  bcc,
  subject,
  fromName,
  replyTo,
  adminEmail,
  forwardData,
  replyData,
  onToChange,
  onCcChange,
  onBccChange,
  onSubjectChange,
  onFromNameChange,
  onReplyToChange,
}: ComposeFieldsProps) {
  const [showCcField, setShowCcField] = useState(false);
  const [showBccField, setShowBccField] = useState(false);
  const [showSenderOptions, setShowSenderOptions] = useState(
    !!replyTo || (!!fromName && fromName !== 'SVI Infra')
  );

  // Auto-show CC/BCC when they have values (from reply/forward)
  const showCc = showCcField || !!cc;
  const showBcc = showBccField || !!bcc;

  // Synchronize internal visibility states with external prop updates (e.g. template loading, replies, forwards)
  useEffect(() => {
    if (replyTo || (fromName && fromName !== 'SVI Infra')) {
      setShowSenderOptions(true);
    }
  }, [replyTo, fromName]);

  return (
    <div>
      {/* To */}
      <div className="flex items-center border-b border-gray-100 px-6 dark:border-gray-800">
        <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
          To
        </label>
        <input
          type="text"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          placeholder="recipient@example.com"
          className="flex-1 bg-transparent py-3.5 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
        />
        <div className="ml-2 flex shrink-0 items-center gap-1.5">
          {!showCc && (
            <button
              type="button"
              onClick={() => setShowCcField(true)}
              className="rounded-md border border-blue-200/60 bg-blue-50/80 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-600 transition-all hover:border-blue-300 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400"
            >
              +CC
            </button>
          )}
          {!showBcc && (
            <button
              type="button"
              onClick={() => setShowBccField(true)}
              className="rounded-md border border-violet-200/60 bg-violet-50/80 px-2 py-0.5 text-[10px] font-bold tracking-wide text-violet-600 transition-all hover:border-violet-300 hover:bg-violet-100 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400"
            >
              +BCC
            </button>
          )}
          {!showSenderOptions && (
            <button
              type="button"
              onClick={() => setShowSenderOptions(true)}
              className="rounded-md border border-emerald-200/60 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-600 transition-all hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
            >
              +Sender
            </button>
          )}
        </div>
      </div>

      {/* CC Field Row */}
      <AnimatePresence>
        {showCc && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 20 }}
            className="overflow-hidden"
          >
            <div className="flex items-center border-b border-gray-100 px-6 dark:border-gray-800">
              <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                CC
              </label>
              <input
                id="cc-input"
                type="text"
                value={cc}
                onChange={(e) => onCcChange(e.target.value)}
                placeholder="cc@example.com"
                className="flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
              />
              <button
                type="button"
                onClick={() => {
                  onCcChange('');
                  setShowCcField(false);
                }}
                className="ml-2 text-gray-400 hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BCC Field Row */}
      <AnimatePresence>
        {showBcc && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 20 }}
            className="overflow-hidden"
          >
            <div className="flex items-center border-b border-gray-100 px-6 dark:border-gray-800">
              <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                BCC
              </label>
              <input
                id="bcc-input"
                type="text"
                value={bcc}
                onChange={(e) => onBccChange(e.target.value)}
                placeholder="bcc@example.com"
                className="flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
              />
              <button
                type="button"
                onClick={() => {
                  onBccChange('');
                  setShowBccField(false);
                }}
                className="ml-2 text-gray-400 hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sender Options Row */}
      <AnimatePresence>
        {showSenderOptions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 20 }}
            className="overflow-hidden"
          >
            {/* From Name */}
            <div className="flex items-center border-b border-gray-100 px-6 dark:border-gray-800">
              <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                From
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => onFromNameChange(e.target.value)}
                placeholder="Sender Name"
                className="w-40 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
              />
              <span className="flex-1 font-mono text-xs text-gray-400/70">
                {'<noreply@sviiinfrasolutions.com>'}
              </span>
              <button
                type="button"
                onClick={() => {
                  onReplyToChange('');
                  onFromNameChange('SVI Infra');
                  setShowSenderOptions(false);
                }}
                className="ml-2 text-gray-400 hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {/* Reply-To */}
            <div className="flex items-center border-b border-gray-100 px-6 dark:border-gray-800">
              <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Reply
              </label>
              <input
                type="text"
                value={replyTo}
                onChange={(e) => onReplyToChange(e.target.value)}
                placeholder={adminEmail || 'reply@example.com'}
                className="flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject */}
      <div className="flex items-center border-b border-gray-100 px-6 dark:border-gray-800">
        <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
          Subj
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Email subject..."
          className="flex-1 bg-transparent py-3.5 text-sm font-semibold text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
        />
      </div>
    </div>
  );
}
