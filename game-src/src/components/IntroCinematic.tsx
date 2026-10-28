import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Fingerprint,
  Zap,
  CheckCircle2,
  Cpu,
  Wifi,
  Sparkles,
  ArrowRight,
  Crosshair,
  Activity,
  Terminal,
} from 'lucide-react';
import { sound } from '../audio/soundEffects';

interface IntroCinematicProps {
  onComplete: () => void;
  mode?: 'standard' | 'overclocked';
}

const BOOT_STEPS = [
  {
    phase: 'BIOMETRIC_HANDSHAKE',
    title: 'ESTABLISHING NEURAL LINK',
    desc: 'Calibrating pointer velocity and biometric human telemetry...',
    icon: Fingerprint,
    color: '#0284c7',
  },
  {
    phase: 'SECURITY_BYPASS',
    title: 'BYPASSING BOT DEFENSE GRIDS',
    desc: 'Injecting anti-spam Wi-Fi pulses across firewall nodes...',
    icon: Cpu,
    color: '#9333ea',
  },
  {
    phase: 'VERIFICATION_CONFIRMED',
    title: 'AUTHENTICATION OVERRIDE ENGAGED',
    desc: 'Consciousness verification positive. 100% Non-Artificial Intelligence.',
    icon: CheckCircle2,
    color: '#10b981',
  },
  {
    phase: 'ARENA_DEPLOYMENT',
    title: 'ARENA DROP INITIATED',
    desc: 'Systems online. Full trackpad precision active. Prepare to dodge hazards!',
    icon: Zap,
    color: '#f59e0b',
  },
];

export const IntroCinematic: React.FC<IntroCinematicProps> = ({ onComplete, mode = 'standard' }) => {
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    sound.playIntroCharge();

    // Progress timer through the boot sequence with smooth intervals
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.2;
      });
    }, 30);

    const s1 = setTimeout(() => {
      setStepIndex(1);
      sound.playLaserPing();
    }, 1000);

    const s2 = setTimeout(() => {
      setStepIndex(2);
      sound.playCatch();
    }, 2100);

    const s3 = setTimeout(() => {
      setStepIndex(3);
      sound.playPowerUp();
      setCountdown(3);
    }, 3100);

    const c2 = setTimeout(() => {
      setCountdown(2);
      sound.playTypeClack();
    }, 3700);

    const c1 = setTimeout(() => {
      setCountdown(1);
      sound.playTypeClack();
    }, 4300);

    const finish = setTimeout(() => {
      sound.playIntroLaunch();
      onComplete();
    }, 4900);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(s1);
      clearTimeout(s2);
      clearTimeout(s3);
      clearTimeout(c2);
      clearTimeout(c1);
      clearTimeout(finish);
    };
  }, [onComplete]);

  // Allow instant skip on keydown
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
        sound.playIntroLaunch();
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onComplete]);

  const currentStep = BOOT_STEPS[stepIndex] || BOOT_STEPS[0];
  const StepIcon = currentStep.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 text-zinc-900 select-none overflow-hidden font-mono"
    >
      {/* Background Animated Concentric Scanning Waves */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [0.8, 1.4, 2.2],
            opacity: [0.35, 0.15, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.8,
            ease: 'easeOut',
          }}
          className="w-96 h-96 rounded-full border border-sky-400/30"
        />
        <motion.div
          animate={{
            scale: [0.6, 1.2, 1.9],
            opacity: [0.4, 0.1, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.8,
            delay: 0.9,
            ease: 'easeOut',
          }}
          className="w-96 h-96 rounded-full border border-emerald-400/25"
        />
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
      </div>

      {/* Main Glass Intro Card */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xl bg-white border-2 border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        {/* Top Header Badge */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-extrabold tracking-widest text-zinc-800">
              BOOT SEQUENCE // PROVING CONSCIOUSNESS
            </span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-300 text-[10px] font-bold text-zinc-600">
            {mode === 'overclocked' ? '⚡ 5G OVERCLOCKED' : '🛡 STANDARD PROTOCOL'}
          </span>
        </div>

        {/* Central Holographic Verification Biometric Ring */}
        <div className="flex flex-col items-center justify-center py-2 relative">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Smooth Rotating Outer Arc */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-zinc-400"
            />
            {/* Smooth Reverse Inner Arc */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
              className="absolute inset-2 rounded-full border border-sky-400/60"
            />
            {/* Center Animated Icon with Spring Transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIndex}
                initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 1.4, opacity: 0, rotate: 20 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-16 h-16 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-lg border border-zinc-800"
              >
                <StepIcon className="w-8 h-8 text-emerald-400" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Smooth Step Title & Description */}
          <div className="text-center mt-4 space-y-1 max-w-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <h3 className="text-sm sm:text-base font-black text-zinc-950 tracking-wide uppercase">
                  {currentStep.title}
                </h3>
                <p className="text-[11px] text-zinc-600 leading-snug mt-0.5">
                  {currentStep.desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Step Progression Pips */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {BOOT_STEPS.map((step, idx) => {
            const isCompleted = stepIndex > idx;
            const isCurrent = stepIndex === idx;
            return (
              <div
                key={step.phase}
                className={`p-2 rounded-xl border text-center transition-all duration-300 ${
                  isCurrent
                    ? 'border-zinc-950 bg-zinc-100 shadow-sm scale-102'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-emerald-50 text-emerald-800'
                    : 'border-zinc-200 bg-white opacity-50'
                }`}
              >
                <div className="text-[9px] font-extrabold uppercase">
                  {isCompleted ? '✓ OK' : `0${idx + 1}`}
                </div>
                <div className="text-[10px] font-bold truncate text-zinc-900">
                  {step.phase.split('_')[0]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Smooth Linear Progress Gauge */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[10px] font-bold text-zinc-600">
            <span>SYNCHRONIZING TELEMETRY</span>
            <span className="font-mono text-zinc-950">{Math.min(100, Math.round(progress))}%</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-300 p-0.5">
            <motion.div
              className="h-full bg-zinc-950 rounded-full"
              style={{ width: `${Math.min(100, progress)}%` }}
              transition={{ ease: 'easeOut', duration: 0.1 }}
            />
          </div>
        </div>

        {/* Countdown / Skip Deployment Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
          <div className="flex items-center gap-2">
            {countdown !== null && (
              <motion.div
                key={countdown}
                initial={{ scale: 1.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="px-3 py-1 rounded-xl bg-emerald-500 text-zinc-950 font-black text-xs flex items-center gap-1 shadow-sm"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>ARENA DROP IN {countdown}s</span>
              </motion.div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => {
              sound.playIntroLaunch();
              onComplete();
            }}
            className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>LAUNCH NOW</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
