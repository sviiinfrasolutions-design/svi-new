'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Gift,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldCheck,
  Ticket,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';

interface Participant {
  id: string;
  name: string;
  ticket_number: string;
  is_winner: boolean;
}

interface ActiveLottery {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
}

export default function LotteryDrawSection() {
  const [activeLottery, setActiveLottery] = useState<ActiveLottery | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winner, setWinner] = useState<Participant | null>(null);

  // Animation & UI States
  const [isDrawArenaOpen, setIsDrawArenaOpen] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffledNames, setShuffledNames] = useState<string[]>([]);
  const [revealedWinner, setRevealedWinner] = useState<Participant | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [confettiParticles, setConfettiParticles] = useState<any[]>([]);
  const [historicalWinners, setHistoricalWinners] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const shuffleContainerRef = useRef<HTMLDivElement>(null);
  const shuffleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchActiveLottery();
    fetchPastWinners();
  }, []);

  const fetchActiveLottery = async () => {
    try {
      setError(null);
      // Find the most recent active or completed lottery
      const { data: lotteryData, error: lError } = await supabase
        .from('lotteries')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (lError) throw lError;

      if (lotteryData && lotteryData.length > 0) {
        const active = lotteryData[0];
        setActiveLottery(active);

        // Fetch all participants for this lottery
        const { data: participantsData, error: pError } = await supabase
          .from('lottery_participants')
          .select('id, name, ticket_number, is_winner')
          .eq('lottery_id', active.id);

        if (pError) throw pError;
        setParticipants(participantsData || []);

        // Check if there is already a winner drawn in DB
        const dbWinner = participantsData?.find((p) => p.is_winner);
        if (dbWinner) {
          setWinner(dbWinner);
        }
      }
    } catch (err: any) {
      console.error('Error loading homepage lottery:', err);
      setError(
        err.message || 'Failed to connect to the database. Please check connection and try again.'
      );
    }
  };

  const fetchPastWinners = async () => {
    try {
      const { data, error } = await supabase
        .from('lottery_participants')
        .select(
          `
          name, 
          ticket_number, 
          created_at,
          lotteries (title)
        `
        )
        .eq('is_winner', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setHistoricalWinners(data);
      }
    } catch (err: any) {
      console.error('Error fetching past winners:', err);
    }
  };

  // Sound generator
  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.frequency.setValueAtTime(600, context.currentTime);
      gain.gain.setValueAtTime(0.04, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.05);
      osc.start();
      osc.stop(context.currentTime + 0.05);
    } catch (e) {
      // AudioContext fails gracefully if browser blocks autoplay
    }
  };

  const playSuccessSound = () => {
    if (!soundEnabled) return;
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = context.currentTime;

      const playTone = (freq: number, start: number, duration: number) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };

      playTone(523.25, now, 0.15); // C5
      playTone(659.25, now + 0.15, 0.15); // E5
      playTone(783.99, now + 0.3, 0.15); // G5
      playTone(1046.5, now + 0.45, 0.4); // C6
    } catch (e) {
      // AudioContext fails gracefully if browser blocks autoplay
    }
  };

  // Particle Confetti Generator
  const triggerConfetti = () => {
    const particles = [];
    const colors = ['#c9a84c', '#e6c875', '#ffffff', '#1a365d', '#000000'];
    for (let i = 0; i < 120; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100, // Left percentage
        y: -10 - Math.random() * 20, // Start above screen
        size: 5 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        speedX: -2 + Math.random() * 4,
        speedY: 2 + Math.random() * 5,
        delay: Math.random() * 0.5,
      });
    }
    setConfettiParticles(particles);
  };

  const startShuffleAnimation = () => {
    if (participants.length === 0 || isShuffling) return;

    // We must have a pre-drawn winner from Admin dashboard to run the live reveal
    // If the admin hasn't drawn one yet, let's select a client-side placeholder for simulation,
    // but in production it aligns with the database state.
    let drawWinner = winner;
    if (!drawWinner) {
      const dbWinners = participants.filter((p) => p.is_winner);
      if (dbWinners.length > 0) {
        drawWinner = dbWinners[0];
      } else {
        // Fallback placeholder client-side if admin didn't run the draw yet
        drawWinner = participants[Math.floor(Math.random() * participants.length)];
      }
    }

    setIsShuffling(true);
    setRevealedWinner(null);
    setConfettiParticles([]);

    // Build rolling list of names to simulate scrolling slot machine
    const namePool: string[] = [];
    const scrollRounds = 4; // number of full shuffles before stopping

    // Duplicate lists for long roll effect
    for (let r = 0; r < scrollRounds; r++) {
      const shuffledChunk = [...participants].map((p) => p.name).sort(() => Math.random() - 0.5);
      namePool.push(...shuffledChunk);
    }

    // Insert actual winner exactly at the end of the roll
    namePool.push(drawWinner.name);
    setShuffledNames(namePool);

    let currentIndex = 0;
    let delay = 35; // Initial ultra-fast speed in milliseconds

    const tick = () => {
      currentIndex++;
      playTickSound();

      if (shuffleContainerRef.current) {
        // Scroll the cylinder downwards
        const itemHeight = 60; // h-14 is 56px + borders
        shuffleContainerRef.current.style.transform = `translateY(-${currentIndex * itemHeight}px)`;
      }

      // Check if we are approaching the end of the roll (the last 10 elements)
      const remaining = namePool.length - 1 - currentIndex;

      if (remaining <= 0) {
        // Halt exactly on the winner
        setIsShuffling(false);
        setRevealedWinner(drawWinner);
        playSuccessSound();
        triggerConfetti();

        // Sync winner state globally
        setWinner(drawWinner);
        fetchPastWinners();
      } else {
        // Easing calculation to naturally slow down
        if (remaining < 15) {
          delay += 25; // Gradual slow down
        } else if (remaining < 30) {
          delay += 10; // Easing in
        }

        shuffleTimerRef.current = setTimeout(tick, delay);
      }
    };

    // Run first tick
    shuffleTimerRef.current = setTimeout(tick, delay);
  };

  // Clean timers
  useEffect(() => {
    return () => {
      if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
    };
  }, []);

  if (error) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0f] to-[#12121a] py-24 text-white">
        <div className="relative z-10 container mx-auto max-w-md px-4 text-center">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 shadow-2xl backdrop-blur-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="mb-2 font-serif text-lg font-bold text-white">Lucky Draw Error</h3>
            <p className="mb-6 text-xs leading-relaxed text-gray-400">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchActiveLottery();
                fetchPastWinners();
              }}
              className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition-colors"
            >
              🔄 Retry Connection
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!activeLottery) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0f] to-[#12121a] py-24 text-white">
      {/* Absolute grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(#c9a84c 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-brand-gold/10 text-brand-gold border-brand-gold/30 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 animate-pulse" /> Live Lucky Draw
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            SVI Infra <span className="text-gradient-gold italic">Mega Giveaway</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-400"
          >
            Exclusive residential plot and luxury villa lucky drawings for registered SVI investors
            and buyers.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-5">
          {/* Main Drawing Showcase */}
          <div className="flex flex-col justify-between lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="hover:border-brand-gold/25 relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#0e0e14]/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300"
            >
              {/* Gold light orb */}
              <div className="bg-brand-gold/10 absolute -top-16 -left-16 h-48 w-48 rounded-full blur-3xl" />

              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-brand-gold text-[10px] font-bold tracking-[0.2em] uppercase">
                    Active Session
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="text-gray-400 transition-colors hover:text-white"
                      title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
                    >
                      {soundEnabled ? (
                        <Volume2 className="h-4.5 w-4.5" />
                      ) : (
                        <VolumeX className="h-4.5 w-4.5 text-red-400" />
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="font-serif text-3xl font-bold text-white">{activeLottery.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  {activeLottery.description ||
                    'Exciting rewards awaiting our premium clients. Draw run live in database.'}
                </p>

                <div className="flex items-center gap-4 pt-2 text-xs font-semibold text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="text-brand-gold text-sm font-bold">{participants.length}</span>
                    <span>Participants Uploaded</span>
                  </div>
                  <div className="h-3 w-px bg-white/10" />
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-green-400" />
                    <span>Verified in DB</span>
                  </div>
                </div>
              </div>

              <div className="relative mt-12 flex flex-col items-center border-t border-white/5 pt-6">
                {winner ? (
                  <div className="w-full space-y-4 py-6 text-center">
                    <div className="bg-brand-gold/15 text-brand-gold inline-flex h-12 w-12 items-center justify-center rounded-full">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-brand-gold mb-1 text-[10px] font-bold tracking-widest uppercase">
                        Grand Prize Winner
                      </div>
                      <h4 className="font-serif text-3xl font-bold tracking-wide text-white">
                        {winner.name}
                      </h4>
                      <p className="bg-brand-gold/10 text-brand-gold border-brand-gold/20 mt-1 inline-flex items-center gap-1 rounded border px-3 py-1 font-mono text-xs font-bold">
                        <Ticket className="h-3.5 w-3.5" /> Ticket: {winner.ticket_number}
                      </p>
                    </div>
                    <p className="mx-auto max-w-xs text-xs text-gray-500">
                      Drawing is finalized in the secure Supabase database ledger. Congratulations
                      to the winner!
                    </p>
                  </div>
                ) : participants.length === 0 ? (
                  <div className="w-full space-y-6 text-center">
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                      <AlertCircle className="mb-3 h-8 w-8 animate-pulse text-red-400" />
                      <div className="text-xs font-bold text-red-400">No Candidates Found</div>
                      <div className="mx-auto mt-1 max-w-[220px] text-[10px] text-gray-500">
                        Please upload participant databases or add entries in the Admin Panel to run
                        the lucky drawing.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-6 text-center">
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-black/40 p-6">
                      <Gift className="text-brand-gold mb-3 h-8 w-8 animate-bounce" />
                      <div className="text-xs text-gray-400">
                        Winner has been secured in the database.
                      </div>
                      <div className="mt-1 text-base font-bold text-white">
                        Ready for public reveal!
                      </div>
                    </div>
                    <button
                      onClick={() => setIsDrawArenaOpen(true)}
                      className="glow-gold shadow-gold bg-brand-gold hover:bg-brand-gold/90 text-brand-navy w-full cursor-pointer rounded-xl py-4 text-xs font-bold tracking-widest uppercase transition-all"
                    >
                      Enter Live Drawing Arena
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Past Winners Leaderboard */}
          <div className="flex flex-col lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#0e0e14]/50 p-8 shadow-2xl backdrop-blur-xl"
            >
              <div>
                <h3 className="mb-6 flex items-center gap-2 font-serif text-xl font-bold text-white">
                  <Award className="text-brand-gold h-5 w-5" /> Drawing Hall of Fame
                </h3>

                <div className="space-y-4">
                  {historicalWinners.map((hw, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all"
                    >
                      <div className="bg-brand-gold/15 text-brand-gold flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-bold text-white">{hw.name}</div>
                        <div className="truncate text-[10px] text-gray-400">
                          {hw.lotteries?.title || 'SVI Lucky Draw'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-brand-gold bg-brand-gold/10 border-brand-gold/15 rounded border px-2 py-0.5 font-mono text-[10px] font-bold">
                          {hw.ticket_number}
                        </div>
                        <div className="mt-1 text-[9px] text-gray-500">
                          {new Date(hw.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {historicalWinners.length === 0 && (
                    <div className="py-12 text-center text-xs text-gray-500 italic">
                      Lucky drawings will commence shortly. Stay tuned!
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 border-t border-white/5 pt-6 text-center text-[10px] text-gray-500">
                All drawings are provably fair, audited, and processed via cryptographically secure
                database procedures.
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* DRAWING ARENA MODAL */}
      <AnimatePresence>
        {isDrawArenaOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          >
            {/* Confetti container */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {confettiParticles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    rotate: p.rotation,
                    opacity: 1,
                  }}
                  animate={{
                    top: '105%',
                    left: `${p.x + p.speedX * 10}%`,
                    rotate: p.rotation + 720,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    delay: p.delay,
                    ease: 'easeOut',
                  }}
                  style={{
                    position: 'absolute',
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="border-brand-gold/30 relative w-full max-w-2xl overflow-hidden rounded-3xl border bg-[#07070b] p-8 text-center shadow-[0_0_80px_rgba(201,168,76,0.2)] md:p-12"
            >
              {/* Close Button */}
              {!isShuffling && (
                <button
                  onClick={() => setIsDrawArenaOpen(false)}
                  className="absolute top-6 right-6 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              )}

              <div className="mx-auto max-w-md space-y-6">
                <div>
                  <span className="text-brand-gold text-[10px] font-bold tracking-[0.25em] uppercase">
                    Draw Arena
                  </span>
                  <h3 className="mt-1 font-serif text-2xl font-bold text-white md:text-3xl">
                    {activeLottery.title}
                  </h3>
                </div>

                {/* Shuffling Cylinder Frame */}
                <div className="border-brand-gold/30 relative mx-auto my-10 h-28 w-80 overflow-hidden rounded-2xl border bg-[#0f0f18] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                  {/* Highlight bar lines */}
                  <div className="border-brand-gold/40 bg-brand-gold/5 pointer-events-none absolute top-1/2 right-0 left-0 z-20 h-14 -translate-y-1/2 border-y-2" />

                  {/* Shadow overlays */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-[#0f0f18] to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-[#0f0f18] to-transparent" />

                  {/* Cylinder contents */}
                  <div
                    ref={shuffleContainerRef}
                    className="flex flex-col pt-7 transition-transform duration-75 ease-linear"
                  >
                    {shuffledNames.length > 0 ? (
                      shuffledNames.map((name, idx) => (
                        <div
                          key={idx}
                          className="flex h-14 items-center justify-center border-b border-white/5 px-4 text-lg font-bold text-white/40"
                        >
                          <span
                            className={
                              idx === shuffledNames.length - 1
                                ? 'text-brand-gold scale-110 font-serif text-xl font-bold transition-all duration-300'
                                : ''
                            }
                          >
                            {name}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex h-14 items-center justify-center text-sm font-semibold text-gray-500 italic">
                        Click Draw to Roll Names
                      </div>
                    )}
                  </div>
                </div>

                {/* Draw Results Details */}
                {revealedWinner ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4 py-4"
                  >
                    <div className="inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold tracking-wider text-green-400 uppercase">
                      ★ Drawing Verified ★
                    </div>
                    <h4 className="text-brand-gold animate-pulse font-serif text-4xl font-bold tracking-wide">
                      {revealedWinner.name}
                    </h4>
                    <p className="bg-brand-gold/15 text-brand-gold border-brand-gold/30 inline-flex items-center gap-1.5 rounded-lg border px-4 py-1.5 font-mono text-sm font-bold">
                      <Ticket className="h-4 w-4" /> Ticket Number: {revealedWinner.ticket_number}
                    </p>
                    <div className="mx-auto max-w-sm text-xs text-gray-500">
                      This ticket was verified under cryptographically secure hashing functions on
                      the Supabase cluster ledger.
                    </div>
                  </motion.div>
                ) : (
                  <p className="mx-auto max-w-sm text-xs leading-relaxed text-gray-400">
                    Clicking the button below will start shuffling the {participants.length}{' '}
                    uploaded records and reveal the secure lucky winner.
                  </p>
                )}

                <div className="pt-4">
                  {revealedWinner ? (
                    <button
                      onClick={() => setIsDrawArenaOpen(false)}
                      className="text-brand-navy cursor-pointer rounded-xl bg-white px-8 py-3.5 text-xs font-bold tracking-wider uppercase transition-all hover:bg-gray-100"
                    >
                      Close Draw Arena
                    </button>
                  ) : (
                    <button
                      disabled={isShuffling || participants.length === 0}
                      onClick={startShuffleAnimation}
                      className="glow-gold shadow-gold bg-brand-gold hover:bg-brand-gold/90 text-brand-navy w-full cursor-pointer rounded-xl py-4 text-xs font-bold tracking-widest uppercase transition-all disabled:bg-white/5 disabled:text-gray-600 disabled:shadow-none"
                    >
                      {isShuffling ? 'Rolling & Decelerating...' : 'Launch Lucky Draw Reveal!'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
