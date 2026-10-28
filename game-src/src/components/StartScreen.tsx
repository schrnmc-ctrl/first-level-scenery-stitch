import React, { useState } from 'react';
import {
  Shield,
  Play,
  Zap,
  Radio,
  Tv,
  Volume2,
  VolumeX,
  Wind,
  CheckCircle2,
  Terminal,
  Activity,
  Cpu,
  Target,
  Sparkles,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../audio/soundEffects';

interface StartScreenProps {
  onStartGame: (mode: 'standard' | 'overclocked') => void;
  onPracticeCaptcha: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  scanlines: boolean;
  onToggleScanlines: () => void;
  motionBlur: boolean;
  onToggleMotionBlur: () => void;
  onOpenSettings?: () => void;
  onReplayIntro?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onPracticeCaptcha,
  soundEnabled,
  onToggleSound,
  scanlines,
  onToggleScanlines,
  motionBlur,
  onToggleMotionBlur,
  onOpenSettings,
  onReplayIntro,
}) => {
  const [selectedMode, setSelectedMode] = useState<'standard' | 'overclocked'>('standard');
  const [activeTab, setActiveTab] = useState<'hook' | 'controls' | 'captchas'>('hook');

  const handleLaunch = () => {
    sound.playPowerUp();
    onStartGame(selectedMode);
  };

  return (
    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-zinc-900 z-30 font-mono select-none overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-2xl bg-white border border-zinc-200 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden text-zinc-900"
      >
        {/* Subtle geometric dot grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-70 pointer-events-none" />

        {/* Top Terminal Status Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-zinc-700 tracking-wider">
              PROTOCOL // BIO-AUTHENTICATION v4.2
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                className="px-2.5 py-1 rounded-lg border border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Play Game Startup Intro Cinematic"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span className="text-[10px]">INTRO</span>
              </button>
            )}

            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="px-2.5 py-1 rounded-lg border border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Configure Aim, Sound, Easing & Visuals"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px]">OPTIONS</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleSound}
              className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900 font-bold'
                  : 'bg-white border-zinc-200 text-zinc-400'
              }`}
              title="Toggle Audio Feedback"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{soundEnabled ? 'AUDIO ON' : 'MUTED'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleMotionBlur}
              className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                motionBlur
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900 font-bold'
                  : 'bg-white border-zinc-200 text-zinc-400'
              }`}
              title="Toggle Smooth Motion Blur Trails"
            >
              <Wind className="w-3.5 h-3.5" />
              <span className="text-[10px]">BLUR {motionBlur ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Hero Title & Story Hook */}
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-[11px] font-bold text-zinc-800">
            <Package className="w-3.5 h-3.5 text-zinc-900" />
            <span>PACKAGE DELIVERY #9400-1182 IS 2 BLOCKS AWAY</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-mono leading-tight">
            I AM NOT A ROBOT:
            <span className="block text-zinc-600 text-lg sm:text-2xl font-bold mt-0.5">
              THE RECAPTCHA SURVIVAL ESCAPE
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 font-mono leading-relaxed pt-1">
            Your package is out for delivery. The driver requires one final identity verification—but the verification server has collapsed into a sentient firewall maze of spam-bots, glitch traffic, and endless CAPTCHA security gates.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="relative z-10 flex gap-2 border-b border-zinc-200 pb-2">
          {[
            { id: 'hook', label: '1. THE HOOK' },
            { id: 'controls', label: '2. CONTROLS' },
            { id: 'captchas', label: '3. VERIFICATIONS' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-zinc-950 text-white shadow-md'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="relative z-10 min-h-[110px]">
          {activeTab === 'hook' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-xs">
                  <Shield className="w-3.5 h-3.5" />
                  <span>STEP IN ZONES</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-snug">
                  Enter floor verification brackets to trigger quick human checks and recharge battery.
                </p>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-xs">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>BATTERY JUICE</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-snug">
                  Firing pulses and taking hits drains power. Keep battery above 0% to survive.
                </p>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-xs">
                  <Target className="w-3.5 h-3.5" />
                  <span>CORE BOSS</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-snug">
                  Overcome the spinning checkmark shield and destroy the reCAPTCHA monolith.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'controls' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono"
            >
              <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                <span className="text-[10px] text-zinc-500 font-bold block uppercase">MOVE</span>
                <strong className="text-xs text-zinc-950 font-bold">W, A, S, D / ARROWS</strong>
              </div>
              <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                <span className="text-[10px] text-zinc-500 font-bold block uppercase">AIM & SHOOT</span>
                <strong className="text-xs text-zinc-950 font-bold">MOUSE / LEFT CLICK</strong>
              </div>
              <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                <span className="text-[10px] text-zinc-500 font-bold block uppercase">EMP PULSE</span>
                <strong className="text-xs text-zinc-950 font-bold">SPACE / RIGHT CLICK</strong>
              </div>
              <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                <span className="text-[10px] text-zinc-500 font-bold block uppercase">MOBILE</span>
                <strong className="text-xs text-zinc-950 font-bold">TOUCHPAD BUTTONS</strong>
              </div>
            </motion.div>
          )}

          {activeTab === 'captchas' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-950">
                  14 Mini-Game Verification Challenges
                </h4>
                <p className="text-[11px] text-zinc-600">
                  Bus grid select, sliced images, circuit routing, laser deflector, cookie catcher, traffic runner, typing test, and rotation puzzles.
                </p>
              </div>

              <button
                type="button"
                onClick={onPracticeCaptcha}
                className="px-3 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-950 text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>PRACTICE</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Mode Selector */}
        <div className="relative z-10 space-y-2 pt-1">
          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block">
            SELECT RUN DIFFICULTY
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedMode('standard')}
              className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                selectedMode === 'standard'
                  ? 'border-zinc-950 bg-zinc-50 shadow-md'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 mt-0.5 ${
                  selectedMode === 'standard' ? 'text-zinc-950' : 'text-zinc-300'
                }`}
              />
              <div>
                <span className="text-xs font-bold text-zinc-950 block">STANDARD RUN</span>
                <span className="text-[10px] text-zinc-500">
                  Balanced spawn rates, standard 5G antenna, +18% battery rewards.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode('overclocked')}
              className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                selectedMode === 'overclocked'
                  ? 'border-zinc-950 bg-zinc-50 shadow-md'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              <Zap
                className={`w-4 h-4 mt-0.5 ${
                  selectedMode === 'overclocked' ? 'text-zinc-950 fill-current' : 'text-zinc-300'
                }`}
              />
              <div>
                <span className="text-xs font-bold text-zinc-950 block">OVERCLOCKED 5G</span>
                <span className="text-[10px] text-zinc-500">
                  High player speed, LVL 3 Wi-Fi triple-spread, high hazard intensity.
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Launch Primary Action Button */}
        <div className="relative z-10 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleLaunch}
            className="w-full py-4 px-6 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl font-mono font-extrabold text-sm sm:text-base tracking-wider shadow-xl flex items-center justify-center gap-3 cursor-pointer transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>START AUTHENTICATION RUN</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
