import React from 'react';
import { Player, StageId } from '../types';
import {
  Battery,
  Wifi,
  Zap,
  Volume2,
  VolumeX,
  ChevronRight,
  Square,
  Circle,
  Shield,
  Pause,
  Play,
  Sliders,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PhoneHUDProps {
  player: Player;
  stage: StageId;
  stageTimer: number;
  soundEnabled: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onTriggerShockwave: () => void;
}

export const PhoneHUD: React.FC<PhoneHUDProps> = ({
  player,
  stage,
  soundEnabled,
  isPaused,
  onTogglePause,
  onOpenSettings,
  onToggleSound,
  onTriggerShockwave,
}) => {
  const batteryPct = Math.max(0, Math.min(100, Math.round(player.battery)));
  const shockwaveReady = player.shockwaveCooldown <= 0 && player.battery >= 5;

  const stagesList: { id: StageId; label: string }[] = [
    { id: 'STAGE_1_CROSSWALK', label: '01. Crosswalk' },
    { id: 'STAGE_2_SPAM_GRID', label: '02. Grid' },
    { id: 'STAGE_3_DISTORTION', label: '03. Firewall' },
    { id: 'STAGE_BOSS', label: '04. Core' },
  ];

  const currentStageIndex = stagesList.findIndex((s) => s.id === stage);

  const batteryColor =
    batteryPct > 50
      ? 'bg-emerald-600'
      : batteryPct > 25
      ? 'bg-amber-500'
      : 'bg-red-600 animate-pulse';

  return (
    <header className="w-full bg-white/95 border-b border-zinc-200 text-zinc-900 px-4 sm:px-8 py-3.5 z-20 select-none shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Status Marker & Pause/Options */}
        <div className="flex items-center gap-3 sm:gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white shrink-0 shadow-sm"
          >
            <Shield className="w-4 h-4" />
          </motion.div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
              SECURITY STATUS
            </span>
            <span className="text-xs font-mono font-extrabold text-zinc-950">
              {stage === 'STAGE_BOSS' ? 'CORE GATEWAY // BOSS' : 'HUMAN AUTHENTICATION'}
            </span>
          </div>

          {/* Pause / Resume Button */}
          <motion.button
            id="hud-pause-toggle-btn"
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            onClick={onTogglePause}
            className={`ml-1 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
              isPaused
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300'
            }`}
            title="Pause Game [Esc / P]"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </motion.button>

          {/* Options / Settings Quick Access Button */}
          <motion.button
            id="hud-settings-btn"
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            onClick={onOpenSettings}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Live Game Options"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">OPTIONS</span>
          </motion.button>
        </div>

        {/* Center: Stage Progression & High-Contrast Score */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 bg-zinc-100 px-3.5 py-1.5 rounded-xl border border-zinc-300 shadow-xs">
            {stagesList.map((st, idx) => {
              const isActive = idx === currentStageIndex;
              const isPassed = idx < currentStageIndex;
              return (
                <React.Fragment key={st.id}>
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                      isActive
                        ? 'bg-zinc-950 text-white shadow-sm'
                        : isPassed
                        ? 'bg-zinc-200 text-zinc-800'
                        : 'text-zinc-400'
                    }`}
                  >
                    {isPassed ? (
                      <span className="text-[10px] font-black">✓</span>
                    ) : isActive ? (
                      <Circle className="w-2 h-2 fill-current" />
                    ) : (
                      <Square className="w-1.5 h-1.5" />
                    )}
                    <span>{st.label}</span>
                  </div>
                  {idx < stagesList.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex items-center gap-3 font-mono">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">SCORE</span>
              <span className="text-sm font-black text-zinc-950">{player.score.toLocaleString()}</span>
            </div>

            <AnimatePresence mode="popLayout">
              {player.streak > 0 && (
                <motion.div
                  key={player.streak}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="px-2.5 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-white font-extrabold shadow-sm"
                >
                  {player.streak}x
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: High-Clarity Vital Meters */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Wi-Fi Signal Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-300 shadow-xs">
            <Wifi className="w-3.5 h-3.5 text-zinc-700" />
            <div className="flex items-end gap-0.5 h-3">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`w-1 rounded-xs transition-colors ${
                    bar <= player.wifiLevel ? 'bg-zinc-950' : 'bg-zinc-300'
                  }`}
                  style={{ height: `${bar * 25}%` }}
                />
              ))}
            </div>
            <span className="text-[11px] font-mono font-extrabold text-zinc-950 ml-0.5">
              5G L{player.wifiLevel}
            </span>
          </div>

          {/* High-Clarity Battery Bar with Dynamic Color */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-300 shadow-xs">
            <Battery className="w-4 h-4 text-zinc-700" />
            <div className="w-22 bg-zinc-200 h-2.5 rounded-full overflow-hidden p-0.5 border border-zinc-300">
              <motion.div
                className={`h-full rounded-full transition-all duration-200 ${batteryColor}`}
                style={{ width: `${batteryPct}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-extrabold text-zinc-950 min-w-[34px]">
              {batteryPct}%
            </span>
          </div>

          {/* Shockwave EMP Button with Ease-In-Out Hover */}
          <motion.button
            type="button"
            whileHover={shockwaveReady ? { scale: 1.04 } : undefined}
            whileTap={shockwaveReady ? { scale: 0.96 } : undefined}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            onClick={onTriggerShockwave}
            disabled={!shockwaveReady}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              shockwaveReady
                ? 'bg-zinc-950 text-white hover:bg-zinc-800'
                : 'bg-zinc-200 text-zinc-400 border border-zinc-300 cursor-not-allowed'
            }`}
            title="Press Space or Right Click for Shockwave Pulse"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>PULSE</span>
            {!shockwaveReady && player.shockwaveCooldown > 0 && (
              <span className="text-[10px] text-zinc-500">
                ({player.shockwaveCooldown.toFixed(1)}s)
              </span>
            )}
          </motion.button>

          {/* Audio Feedback Toggle */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border border-zinc-300 transition-colors cursor-pointer shadow-xs"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
};
