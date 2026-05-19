'use client';

import { motion } from 'motion/react';
import { UserCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';

export default function Login() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });
      if (authError) throw authError;
      router.push('/payment'); // redirect to client portal after login
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    setError('');
    if (!identifier) {
      setError('Please enter your email first.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ email: identifier });
      if (otpError) throw otpError;
      setOtpSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: identifier,
        token: otp,
        type: 'email',
      });
      if (verifyError) throw verifyError;
      router.push('/payment');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OTP verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-brand-navy relative flex min-h-screen items-center justify-center overflow-hidden pt-24 pb-20 dark:bg-[#0C0C0C]">
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
          backgroundSize: '40px 40px',
        }}
      ></div>

      <div className="relative z-10 container mx-auto flex justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md border bg-white p-8 shadow-2xl md:p-12 dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="mb-8 text-center">
            <div className="text-brand-navy dark:text-brand-gold mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
              <UserCircle2 size={32} />
            </div>
            <h1 className="text-brand-navy mb-2 font-serif text-3xl dark:text-white">
              Client Portal
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Log in to view your property documents and payment schedules.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="mb-8 flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setLoginMethod('password');
                setError('');
                setOtpSent(false);
              }}
              className={`flex-1 pb-3 text-xs font-bold tracking-widest uppercase transition-colors ${loginMethod === 'password' ? 'text-brand-navy dark:text-brand-gold border-brand-navy dark:border-brand-gold border-b-2' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              Password
            </button>
            <button
              onClick={() => {
                setLoginMethod('otp');
                setError('');
                setOtpSent(false);
              }}
              className={`flex-1 pb-3 text-xs font-bold tracking-widest uppercase transition-colors ${loginMethod === 'otp' ? 'text-brand-navy dark:text-brand-gold border-brand-navy dark:border-brand-gold border-b-2' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              OTP Login
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 flex items-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
            >
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {loginMethod === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-brand-navy text-[10px] font-bold tracking-widest uppercase dark:text-gray-300">
                  Registered Email
                </label>
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="focus:border-brand-gold w-full border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-brand-navy text-[10px] font-bold tracking-widest uppercase dark:text-gray-300">
                    Password
                  </label>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="focus:border-brand-gold w-full border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy hover:bg-brand-gold hover:text-brand-navy mt-4 flex w-full items-center justify-center gap-2 py-4 text-sm font-bold tracking-widest text-white uppercase transition-colors dark:hover:bg-white"
              >
                {isSubmitting ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    Log In <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-brand-navy text-[10px] font-bold tracking-widest uppercase dark:text-gray-300">
                  Registered Email
                </label>
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com"
                  disabled={otpSent}
                  className="focus:border-brand-gold w-full border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:outline-none disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSubmitting}
                  className="text-brand-gold border-brand-gold hover:bg-brand-gold hover:text-brand-navy flex w-full items-center justify-center gap-2 border px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    'Send OTP'
                  )}
                </button>
              ) : (
                <form onSubmit={handleOtpVerify} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-brand-navy text-[10px] font-bold tracking-widest uppercase dark:text-gray-300">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit code"
                      className="focus:border-brand-gold w-full border border-gray-200 bg-gray-50 px-4 py-3 text-center text-2xl tracking-[0.5em] text-gray-900 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                    <p className="text-center text-xs text-gray-500">
                      Check your inbox at <span className="text-brand-gold">{identifier}</span>
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || otp.length < 6}
                    className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy hover:bg-brand-gold hover:text-brand-navy flex w-full items-center justify-center gap-2 py-4 text-sm font-bold tracking-widest text-white uppercase transition-colors disabled:opacity-60 dark:hover:bg-white"
                  >
                    {isSubmitting ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <>
                        Verify & Login <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className="w-full text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    ← Change email
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/registration"
              className="text-brand-navy dark:text-brand-gold hover:text-brand-gold font-bold transition-colors dark:hover:text-white"
            >
              Register here
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
