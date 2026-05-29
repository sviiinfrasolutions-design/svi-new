'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onValidate: (isValid: boolean) => void;
  error?: string;
}

function generateChallenge() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { a, b, answer: a + b };
}

export default function Captcha({ onValidate, error }: CaptchaProps) {
  const [challenge, setChallenge] = useState(generateChallenge);
  const [input, setInput] = useState('');

  const refresh = useCallback(() => {
    setChallenge(generateChallenge());
    setInput('');
    onValidate(false);
  }, [onValidate]);

  useEffect(() => {
    const isValid = input !== '' && parseInt(input, 10) === challenge.answer;
    onValidate(isValid);
  }, [input, challenge.answer, onValidate]);

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
        Verification *
      </label>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold select-none dark:border-gray-700 dark:bg-gray-900">
          <span>{challenge.a}</span>
          <span className="text-gray-400">+</span>
          <span>{challenge.b}</span>
          <span className="text-gray-400">=</span>
          <span className="text-gray-400">?</span>
        </div>
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`w-24 border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${
            error
              ? 'border-red-500 focus:border-red-500'
              : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'
          }`}
          placeholder="?"
          required
        />
        <button
          type="button"
          onClick={refresh}
          className="hover:border-brand-gold hover:text-brand-gold flex h-10 w-10 items-center justify-center rounded border border-gray-200 text-gray-400 transition-colors dark:border-gray-700"
          aria-label="Refresh captcha"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
