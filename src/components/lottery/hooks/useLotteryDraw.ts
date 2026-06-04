'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import confetti from 'canvas-confetti';

export interface Participant {
  id: string;
  name: string;
  ticket_number: string;
  is_winner: boolean;
}

export interface ActiveLottery {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
}

export interface UseLotteryDrawReturn {
  activeLottery: ActiveLottery | null;
  participants: Participant[];
  winners: Participant[];
  revealedWinners: Participant[];
  isDrawArenaOpen: boolean;
  isShuffling: boolean;
  shuffledNames: string[];
  currentRevealIndex: number;
  drawWinnerCount: number;
  activeWinnerIndex: number;
  winnerSwipeDir: number;
  soundEnabled: boolean;
  historicalWinners: any[];
  visibleCount: number;
  error: string | null;
  scheduledAt: Date | null;
  countdownStr: string | null;
  shuffleContainerRef: React.RefObject<HTMLDivElement | null>;

  setIsDrawArenaOpen: (v: boolean) => void;
  setSoundEnabled: (v: boolean) => void;
  setVisibleCount: (v: number | ((prev: number) => number)) => void;
  setActiveWinnerIndex: (v: number | ((prev: number) => number)) => void;
  setWinnerSwipeDir: (v: number) => void;

  handleCarouselNavigate: (idx: number, dir: number) => void;
  startShuffleAnimation: () => void;
  fetchHallOfFame: () => Promise<void>;
  fetchActiveLottery: () => Promise<void>;
}

export function useLotteryDraw(): UseLotteryDrawReturn {
  const [activeLottery, setActiveLottery] = useState<ActiveLottery | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Participant[]>([]);

  // Animation & UI States
  const [isDrawArenaOpen, setIsDrawArenaOpen] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffledNames, setShuffledNames] = useState<string[]>([]);
  const [revealedWinners, setRevealedWinners] = useState<Participant[]>([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
  const [drawWinnerCount, setDrawWinnerCount] = useState(0);
  const [activeWinnerIndex, setActiveWinnerIndex] = useState(0);
  const [winnerSwipeDir, setWinnerSwipeDir] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [historicalWinners, setHistoricalWinners] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [error, setError] = useState<string | null>(null);

  // Countdown state
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [countdownStr, setCountdownStr] = useState<string | null>(null);

  const shuffleContainerRef = useRef<HTMLDivElement>(null);
  const shuffleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const revealTimerRef = useRef<NodeJS.Timeout | null>(null);
  const carouselTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchActiveLottery();
    fetchHallOfFame();
    fetchScheduleCountdown();
    const pollInterval = setInterval(fetchScheduleCountdown, 30_000);
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (!scheduledAt) {
      setCountdownStr(null);
      return;
    }
    const tick = () => {
      const diff = scheduledAt.getTime() - Date.now();
      if (diff <= 0) {
        setCountdownStr(null);
        setScheduledAt(null);
        return;
      }
      const totalSec = Math.floor(diff / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      const pad = (n: number) => String(n).padStart(2, '0');
      setCountdownStr(h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`);
    };
    tick();
    countdownIntervalRef.current = setInterval(tick, 1_000);
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [scheduledAt]);

  // Auto-rotate winners carousel
  useEffect(() => {
    if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    if (winners.length <= 1) return;

    carouselTimerRef.current = setInterval(() => {
      setWinnerSwipeDir(1);
      setActiveWinnerIndex((prev) => (prev + 1) % winners.length);
      triggerMiniConfetti();
    }, 3500);

    return () => {
      if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    };
  }, [winners.length]);

  useEffect(() => {
    return () => {
      if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    };
  }, []);

  const fetchScheduleCountdown = async () => {
    try {
      const res = await fetch('/api/lottery/schedule');
      const json = await res.json();
      if (json.scheduled?.scheduled_at) {
        setScheduledAt(new Date(json.scheduled.scheduled_at));
      } else {
        setScheduledAt(null);
      }
    } catch {
      // ignore
    }
  };

  const fetchActiveLottery = async () => {
    try {
      setError(null);
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

        const { data: participantsData, error: pError } = await supabase
          .from('lottery_participants')
          .select('id, name, ticket_number, is_winner')
          .eq('lottery_id', active.id);

        if (pError) throw pError;
        setParticipants(participantsData || []);

        const dbWinners = participantsData?.filter((p) => p.is_winner) || [];
        if (dbWinners.length > 0) {
          setWinners(dbWinners);
        }
      }
    } catch (err: any) {
      console.error('Error loading homepage lottery:', err);
      setError(
        err.message || 'Failed to connect to the database. Please check connection and try again.'
      );
    }
  };

  const fetchHallOfFame = async () => {
    try {
      const { data: lotteryData } = await supabase
        .from('lotteries')
        .select('id, title')
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (!lotteryData || lotteryData.length === 0) return;

      const { data, error } = await supabase
        .from('lottery_participants')
        .select('name, ticket_number, is_winner, created_at')
        .eq('lottery_id', lotteryData[0].id)
        .order('is_winner', { ascending: false })
        .order('created_at', { ascending: true });

      if (!error && data) {
        setHistoricalWinners(data);
      }
    } catch (err: any) {
      console.error('Error fetching hall of fame:', err);
    }
  };

  // ── Sound Effects ──────────────────────────────────────────────────────
  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.frequency.setValueAtTime(600 + Math.random() * 200, context.currentTime);
      gain.gain.setValueAtTime(0.02, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.05);
      osc.start();
      osc.stop(context.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  const playRevealSound = () => {
    if (!soundEnabled) return;
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = context.currentTime;
      const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine') => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };

      playTone(392, now, 0.3, 'sine');
      playTone(523.25, now + 0.15, 0.3, 'sine');
      playTone(659.25, now + 0.3, 0.3, 'sine');
      playTone(783.99, now + 0.45, 0.5, 'sine');
      playTone(1046.5, now + 0.6, 1.0, 'sine');
    } catch (e) {
      console.warn('Reveal sound failed:', e);
    }
  };

  const playFanfareSound = () => {
    if (!soundEnabled) return;
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = context.currentTime;
      const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine') => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };

      playTone(523.25, now, 0.4, 'sine');
      playTone(659.25, now + 0.2, 0.4, 'sine');
      playTone(783.99, now + 0.4, 0.4, 'sine');
      playTone(1046.5, now + 0.6, 1.2, 'sine');
      playTone(783.99, now + 1.0, 0.3, 'sine');
      playTone(1046.5, now + 1.3, 1.5, 'sine');
    } catch (e) {
      console.warn('Fanfare sound failed:', e);
    }
  };

  // ── Confetti Effects ───────────────────────────────────────────────────
  const triggerWinnerConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 100,
      startVelocity: 35,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#D4AF37', '#F3E5AB', '#FFFFFF', '#C0C0C0', '#FFD700'],
      zIndex: 200,
    });

    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        startVelocity: 40,
        origin: { x: 0, y: 0.6 },
        colors: ['#D4AF37', '#F3E5AB', '#FFD700'],
        zIndex: 200,
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        startVelocity: 40,
        origin: { x: 1, y: 0.6 },
        colors: ['#D4AF37', '#F3E5AB', '#FFD700'],
        zIndex: 200,
      });
    }, 150);
  }, []);

  const triggerMiniConfetti = useCallback(() => {
    confetti({
      particleCount: 30,
      spread: 70,
      startVelocity: 25,
      origin: { x: 0.5, y: 0.45 },
      colors: ['#D4AF37', '#F3E5AB', '#FFD700', '#FFFFFF'],
      zIndex: 200,
    });
    setTimeout(() => {
      confetti({
        particleCount: 15,
        angle: 60,
        spread: 40,
        startVelocity: 20,
        origin: { x: 0.1, y: 0.5 },
        colors: ['#D4AF37', '#FFD700'],
        zIndex: 200,
      });
      confetti({
        particleCount: 15,
        angle: 120,
        spread: 40,
        startVelocity: 20,
        origin: { x: 0.9, y: 0.5 },
        colors: ['#D4AF37', '#FFD700'],
        zIndex: 200,
      });
    }, 100);
  }, []);

  const triggerGrandFinale = useCallback(() => {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 80, zIndex: 200 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#D4AF37', '#F3E5AB', '#FFFFFF', '#C0C0C0', '#E5E4E2', '#FFD700'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#D4AF37', '#F3E5AB', '#FFFFFF', '#C0C0C0', '#E5E4E2', '#FFD700'],
      });
    }, 200);

    confetti({
      particleCount: 200,
      spread: 140,
      startVelocity: 40,
      origin: { y: 0.5 },
      colors: ['#D4AF37', '#F3E5AB', '#FFFFFF', '#C0C0C0', '#FFD700'],
      zIndex: 200,
    });
  }, []);

  // ── Sequential Winner Reveal ───────────────────────────────────────────
  const revealWinnersSequentially = useCallback(
    (drawWinners: Participant[]) => {
      setCurrentRevealIndex(-1);
      setRevealedWinners([]);

      let idx = 0;
      const revealNext = () => {
        if (idx >= drawWinners.length) {
          playFanfareSound();
          triggerGrandFinale();
          setWinners(drawWinners);
          fetchHallOfFame();
          return;
        }

        setCurrentRevealIndex(idx);
        setRevealedWinners((prev) => [...prev, drawWinners[idx]]);
        playRevealSound();
        triggerWinnerConfetti();
        idx++;

        revealTimerRef.current = setTimeout(revealNext, idx >= drawWinners.length ? 800 : 1800);
      };

      revealTimerRef.current = setTimeout(revealNext, 400);
    },
    [playRevealSound, playFanfareSound, triggerWinnerConfetti, triggerGrandFinale, fetchHallOfFame]
  );

  // ── Shuffle Animation ──────────────────────────────────────────────────
  const startShuffleAnimation = () => {
    if (participants.length === 0 || isShuffling) return;

    let drawWinners = winners.length > 0 ? winners : participants.filter((p) => p.is_winner);
    if (drawWinners.length === 0) {
      drawWinners = [participants[Math.floor(Math.random() * participants.length)]];
    }

    setIsShuffling(true);
    setRevealedWinners([]);
    setCurrentRevealIndex(-1);

    const namePool: string[] = [];
    const scrollRounds = 4;

    for (let r = 0; r < scrollRounds; r++) {
      const shuffledChunk = [...participants].map((p) => p.name).sort(() => Math.random() - 0.5);
      namePool.push(...shuffledChunk);
    }

    drawWinners.forEach((w) => namePool.push(w.name));
    setShuffledNames(namePool);
    setDrawWinnerCount(drawWinners.length);

    let currentIndex = 0;
    let delay = 40;
    const totalNames = namePool.length;

    const tick = () => {
      currentIndex++;
      playTickSound();

      if (shuffleContainerRef.current) {
        const itemHeight = 80;
        shuffleContainerRef.current.style.transform = `translateY(-${currentIndex * itemHeight}px)`;
      }

      const remaining = totalNames - 1 - currentIndex;

      if (remaining <= 0) {
        setIsShuffling(false);
        revealWinnersSequentially(drawWinners);
      } else {
        const namesFromEnd = remaining;
        if (namesFromEnd <= drawWinners.length + 2) {
          delay += 50;
        } else if (namesFromEnd < 10) {
          delay += 40;
        } else if (namesFromEnd < 25) {
          delay += 20;
        }
        shuffleTimerRef.current = setTimeout(tick, delay);
      }
    };

    shuffleTimerRef.current = setTimeout(tick, delay);
  };

  const handleCarouselNavigate = useCallback((idx: number, dir: number) => {
    setWinnerSwipeDir(dir);
    setActiveWinnerIndex(idx);
    // Restart auto-rotation timer
    if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    if (winners.length > 1) {
      carouselTimerRef.current = setInterval(() => {
        setWinnerSwipeDir(1);
        setActiveWinnerIndex((prev) => (prev + 1) % winners.length);
        triggerMiniConfetti();
      }, 3500);
    }
  }, [winners.length, triggerMiniConfetti]);

  return {
    activeLottery,
    participants,
    winners,
    revealedWinners,
    isDrawArenaOpen,
    isShuffling,
    shuffledNames,
    currentRevealIndex,
    drawWinnerCount,
    activeWinnerIndex,
    winnerSwipeDir,
    soundEnabled,
    historicalWinners,
    visibleCount,
    error,
    scheduledAt,
    countdownStr,
    shuffleContainerRef,

    setIsDrawArenaOpen,
    setSoundEnabled,
    setVisibleCount,
    setActiveWinnerIndex,
    setWinnerSwipeDir,

    handleCarouselNavigate,
    startShuffleAnimation,
    fetchHallOfFame,
    fetchActiveLottery,
  };
}
