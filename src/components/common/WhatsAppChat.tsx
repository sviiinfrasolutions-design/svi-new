'use client';

import { MessageCircle, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const WHATSAPP_NUMBER = '917300007643';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hi! I am interested in SVI Infra Solutions properties. Can you help me?'
);

export default function WhatsAppChat() {
  const [hasAppeared, setHasAppeared] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isVisible = hasAppeared;
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => setHasAppeared(true), 2000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = useCallback(() => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`, '_blank');
    setIsOpen(false);
  }, []);

  return (
    <div
      className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
      }}
    >
      {isOpen && (
        <div className="animate-in max-w-xs rounded-lg border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div>
                <p className="text-brand-navy text-sm font-semibold dark:text-gray-100">
                  SVI Infra Solutions
                </p>
                <p className="text-xs text-green-500">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Close chat"
            >
              <X size={14} />
            </button>
          </div>
          <div className="mb-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Hi! How can we help you? Chat with us on WhatsApp for instant support.
            </p>
          </div>
          <button
            onClick={handleClick}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600"
          >
            <MessageCircle size={16} />
            Start Chat
          </button>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all hover:bg-green-600 hover:shadow-xl"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
}
