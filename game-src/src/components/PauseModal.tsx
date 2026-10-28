import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Home, Sliders, Battery, Wifi, Shield, Flame, Crosshair } from 'lucide-react';
import { Player, StageId } from '../types';
import { STAGE_CONFIGS } from '../game/constants';
import { sound } from '../audio/soundEffects';

interface PauseModalProps {
  isOpen: boolean;
  player: Player;
  stage: StageId;
  totalTime: number;
  onResume: () => void;
  onOpenSettings: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  player,
  stage,
  totalTime,
  onResume,
  onOpenSettings,
  onRestart,
  onMainMenu,
}) => {
  if (!isOpen) return null;

  const stageConfig = STAGE_CONFIGS[stage];
  const minutes = Math.floor(totalTime / 60);
  const seconds = Math.floor(totalTime % 60);
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <AnimatePresence>
      <div
        id="pause-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          id="pause-modal-card"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white border-2 border-zinc-900 shadow-2xl rounded-2xl p-6 text-zinc-900 space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-1 border-b-2 border-zinc-900 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 text-white rounded-full text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
              <span>GAME PAUSED</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-950">
              TACTICAL BREAK
            </h2>
            <p className="text-xs font-mono text-zinc-600">
              All delivery signals and bot movements are frozen
            </p>
          </div>

          {/* Real-time Status Card */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs font-mono border-b border-zinc-200 pb-2">
              <span className="text-zinc-600">CURRENT STAGE</span>
              <span className="font-bold text-zinc-900">{stageConfig.title}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2 bg-white rounded-lg border border-zinc-200">
                <div className="text-[10px] text-zinc-500 flex items-center justify-center gap-1">
                  <Battery className="w-3 h-3" /> BATTERY
                </div>
                <div className="font-black text-sm text-zinc-900">
                  {Math.round(player.battery)}%
                </div>
              </div>

              <div className="p-2 bg-white rounded-lg border border-zinc-200">
                <div className="text-[10px] text-zinc-500 flex items-center justify-center gap-1">
                  <Wifi className="w-3 h-3" /> WI-FI LVL
                </div>
                <div className="font-black text-sm text-zinc-900">
                  {player.wifiLevel} / 4
                </div>
              </div>

              <div className="p-2 bg-white rounded-lg border border-zinc-200">
                <div className="text-[10px] text-zinc-500 flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3" /> STREAK
                </div>
                <div className="font-black text-sm text-zinc-900">
                  {player.streak}x
                </div>
              </div>
            </div>

            <div className="flex justify-between text-xs font-mono text-zinc-600 pt-1">
              <span>SCORE: <strong className="text-zinc-900">{player.score.toLocaleString()}</strong></span>
              <span>ELAPSED: <strong className="text-zinc-900">{timeFormatted}</strong></span>
            </div>
          </div>

          {/* Primary Action Buttons with Ease-In-Out Hover */}
          <div className="space-y-2.5 font-mono text-xs">
            <motion.button
              id="pause-resume-btn"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              onClick={() => {
                sound.playCatch();
                onResume();
              }}
              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg tracking-wider uppercase transition-colors"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>RESUME GAME (ESC / P)</span>
            </motion.button>

            <motion.button
              id="pause-options-btn"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              onClick={() => {
                sound.playCatch();
                onOpenSettings();
              }}
              className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 rounded-xl font-bold flex items-center justify-center gap-2 tracking-wider uppercase transition-colors"
            >
              <Sliders className="w-4 h-4" />
              <span>EDIT OPTIONS (AIM / SOUND / BLUR)</span>
            </motion.button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <motion.button
                id="pause-restart-btn"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                onClick={() => {
                  if (window.confirm('Restart current game session?')) {
                    sound.playRotateClick();
                    onRestart();
                  }
                }}
                className="py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESTART</span>
              </motion.button>

              <motion.button
                id="pause-menu-btn"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                onClick={() => {
                  if (window.confirm('Return to main menu?')) {
                    sound.playRotateClick();
                    onMainMenu();
                  }
                }}
                className="py-2.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>MAIN MENU</span>
              </motion.button>
            </div>
          </div>

          {/* Trackpad Quick Hint */}
          <div className="text-center text-[11px] font-mono text-zinc-500 bg-zinc-100/70 p-2.5 rounded-lg border border-zinc-200">
            💡 <strong>Trackpad Aim:</strong> Move your pointer over the game to rotate & face. Shoot with Click or Space!
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
