import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Zap,
  Cpu,
  Trophy,
  ArrowRight,
  Flame,
  Radio,
} from 'lucide-react';
import { sound } from '../audio/soundEffects';

interface BossDefeatCinematicProps {
  onComplete: () => void;
  bossScore?: number;
}

export const BossDefeatCinematic: React.FC<BossDefeatCinematicProps> = ({
  onComplete,
  bossScore = 5000,
}) => {
  const [phase, setPhase] = useState<'MELTDOWN' | 'OVERRIDE' | 'VICTORY_STAMP'>('MELTDOWN');
  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    sound.playBossCoreMeltdown();

    const t1 = setTimeout(() => {
      setPhase('OVERRIDE');
      sound.playBossDetonation();
    }, 1400);

    const t2 = setTimeout(() => {
      setPhase('VICTORY_STAMP');
      sound.playAccessGranted();
    }, 2500);

    const timerInterval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    const finishTimer = setTimeout(() => {
      onComplete();
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(finishTimer);
      clearInterval(timerInterval);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 text-zinc-900 select-none overflow-hidden font-mono"
    >
      {/* Expanding EMP Shockwave Rings in Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [0.5, 2.0, 3.2],
            opacity: [0.8, 0.3, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.6,
            ease: 'easeOut',
          }}
          className="w-72 h-72 rounded-full border-4 border-rose-500/50"
        />
        <motion.div
          animate={{
            scale: [0.3, 1.8, 2.8],
            opacity: [0.7, 0.2, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.6,
            delay: 0.4,
            ease: 'easeOut',
          }}
          className="w-72 h-72 rounded-full border-2 border-amber-400/40"
        />
        <motion.div
          animate={{
            scale: [0.2, 1.5, 2.5],
            opacity: [0.9, 0.1, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.6,
            delay: 0.8,
            ease: 'easeOut',
          }}
          className="w-72 h-72 rounded-full border border-emerald-400/60"
        />
      </div>

      {/* Main Glass Dramatic Overload Card */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg bg-white border-2 border-zinc-950 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center"
      >
        {/* Top Status Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[11px] font-black text-rose-600 tracking-wider">
              {phase === 'MELTDOWN' && '⚠ RECAPTCHA MONOLITH CRITICAL OVERLOAD ⚠'}
              {phase === 'OVERRIDE' && '⚡ SECURITY MATRIX PURGED ⚡'}
              {phase === 'VICTORY_STAMP' && '✓ ACCESS PERMITTED // HUMAN VERIFIED'}
            </span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold">
            +5,000 BOSS BONUS
          </span>
        </div>

        {/* Phase Dynamic Icon & Visual Focus */}
        <div className="flex flex-col items-center justify-center py-2 relative">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Spinning Circuit Rings */}
            <motion.div
              animate={{ rotate: phase === 'MELTDOWN' ? 720 : 180 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-zinc-400"
            />
            <motion.div
              animate={{ rotate: phase === 'MELTDOWN' ? -720 : -180 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              className="absolute inset-2 rounded-full border border-rose-400/60"
            />

            {/* Central Animated Badge */}
            <AnimatePresence mode="wait">
              {phase === 'MELTDOWN' && (
                <motion.div
                  key="meltdown"
                  initial={{ scale: 0.6, opacity: 0, rotate: -30 }}
                  animate={{ scale: [1, 1.15, 1], opacity: 1, rotate: 0 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-20 h-20 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xl border-2 border-rose-700"
                >
                  <Flame className="w-10 h-10 animate-bounce" />
                </motion.div>
              )}

              {phase === 'OVERRIDE' && (
                <motion.div
                  key="override"
                  initial={{ scale: 0.6, opacity: 0, rotate: 30 }}
                  animate={{ scale: 1.1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-20 h-20 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center shadow-xl border-2 border-amber-600"
                >
                  <Zap className="w-10 h-10 animate-pulse" />
                </motion.div>
              )}

              {phase === 'VICTORY_STAMP' && (
                <motion.div
                  key="stamp"
                  initial={{ scale: 0.2, opacity: 0, rotate: -60 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 260 }}
                  className="w-20 h-20 rounded-2xl bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-xl border-2 border-emerald-600"
                >
                  <CheckCircle2 className="w-11 h-11" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Phase Narrative Details */}
          <div className="mt-4 space-y-1 max-w-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {phase === 'MELTDOWN' && (
                  <>
                    <h3 className="text-base sm:text-lg font-black text-zinc-950">
                      MASTER FIREWALL SHATTERED!
                    </h3>
                    <p className="text-xs text-zinc-600 leading-snug">
                      The reCAPTCHA Monolith's rotating checkmark defense grid has collapsed under your Wi-Fi pulses.
                    </p>
                  </>
                )}

                {phase === 'OVERRIDE' && (
                  <>
                    <h3 className="text-base sm:text-lg font-black text-zinc-950">
                      DECOMPRESSING BOT TELEMETRY
                    </h3>
                    <p className="text-xs text-zinc-600 leading-snug">
                      Extracting cleared credentials, bonus battery packs, and finalizing authentication ranking...
                    </p>
                  </>
                )}

                {phase === 'VICTORY_STAMP' && (
                  <>
                    <h3 className="text-base sm:text-lg font-black text-emerald-700">
                      AUTHENTICATION CONFIRMED: HUMAN
                    </h3>
                    <p className="text-xs text-zinc-600 leading-snug">
                      All firewalls cleared. You have proven organic human intelligence across all sectors!
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Action / Skip Button */}
        <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-bold">
            PROCEEDING TO CERTIFICATE...
          </span>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onComplete}
            className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>VIEW REPORT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
