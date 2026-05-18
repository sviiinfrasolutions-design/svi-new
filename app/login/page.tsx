"use client";

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
    if (!identifier) { setError('Please enter your email first.'); return; }
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
    <div className="pt-24 pb-20 bg-brand-navy dark:bg-[#0C0C0C] min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' }}></div>
      
      <div className="container mx-auto px-4 relative z-10 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 border dark:border-gray-700 p-8 md:p-12 shadow-2xl w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-brand-navy dark:text-brand-gold rounded-full flex items-center justify-center mx-auto mb-6">
               <UserCircle2 size={32} />
            </div>
            <h1 className="text-3xl font-serif text-brand-navy dark:text-white mb-2">Client Portal</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Log in to view your property documents and payment schedules.</p>
          </div>

          {/* Tab switcher */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
            <button 
              onClick={() => { setLoginMethod('password'); setError(''); setOtpSent(false); }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-colors ${loginMethod === 'password' ? 'text-brand-navy dark:text-brand-gold border-b-2 border-brand-navy dark:border-brand-gold' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              Password
            </button>
            <button 
              onClick={() => { setLoginMethod('otp'); setError(''); setOtpSent(false); }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-colors ${loginMethod === 'otp' ? 'text-brand-navy dark:text-brand-gold border-b-2 border-brand-navy dark:border-brand-gold' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              OTP Login
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded px-4 py-3 text-sm mb-6"
            >
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {loginMethod === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-navy dark:text-gray-300">Registered Email</label>
                <input
                  type="email"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-navy dark:text-gray-300">Password</label>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-navy dark:bg-brand-gold text-white dark:text-brand-navy py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-gold hover:text-brand-navy dark:hover:bg-white transition-colors flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting
                  ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : <>Log In <ArrowRight size={16} /></>}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-navy dark:text-gray-300">Registered Email</label>
                <input
                  type="email"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="you@example.com"
                  disabled={otpSent}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-brand-gold transition-colors disabled:opacity-60"
                />
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSubmitting}
                  className="text-xs font-bold uppercase tracking-widest text-brand-gold border border-brand-gold py-3 px-4 w-full hover:bg-brand-gold hover:text-brand-navy transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 'Send OTP'}
                </button>
              ) : (
                <form onSubmit={handleOtpVerify} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-navy dark:text-gray-300">Enter OTP</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit code"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-brand-gold transition-colors text-center text-2xl tracking-[0.5em]"
                    />
                    <p className="text-xs text-gray-500 text-center">
                      Check your inbox at <span className="text-brand-gold">{identifier}</span>
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || otp.length < 6}
                    className="w-full bg-brand-navy dark:bg-brand-gold text-white dark:text-brand-navy py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-gold hover:text-brand-navy dark:hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting
                      ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : <>Verify & Login <ArrowRight size={16} /></>}
                  </button>
                  <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="w-full text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    ← Change email
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account? <Link href="/registration" className="text-brand-navy dark:text-brand-gold font-bold hover:text-brand-gold dark:hover:text-white transition-colors">Register here</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
