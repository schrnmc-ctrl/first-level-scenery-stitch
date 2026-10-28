import React from 'react';
import { Player, GameStats } from '../types';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface GameOverModalProps {
  player: Player;
  stats?: GameStats;
  onRetry: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ player, stats, onRetry }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 font-mono select-none">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm bg-white border border-zinc-200 rounded-3xl shadow-2xl p-6 text-zinc-900 space-y-5"
      >
        <div className="text-center space-y-2">
          <div className="w-11 h-11 mx-auto rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-md">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block">
            AUTHENTICATION TERMINATED
          </span>
          <h2 className="text-xl font-extrabold text-zinc-950">
            BATTERY DEPLETED
          </h2>
        </div>

        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 space-y-3 text-center">
          <p className="text-xs text-zinc-600">
            Device power reached 0%. Step into verification zones to recharge power during your run.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-200 text-center">
            <div className="bg-white p-2.5 rounded-xl border border-zinc-300 shadow-2xs">
              <span className="text-[9px] text-zinc-500 uppercase font-extrabold block">SCORE</span>
              <strong className="text-sm text-zinc-950 font-bold">{player.score}</strong>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-zinc-300 shadow-2xs">
              <span className="text-[9px] text-zinc-500 uppercase font-extrabold block">STREAK</span>
              <strong className="text-sm text-zinc-950 font-bold">{player.streak}x</strong>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-zinc-300 shadow-2xs">
              <span className="text-[9px] text-zinc-500 uppercase font-extrabold block">CAPTCHAS</span>
              <strong className="text-sm text-zinc-950 font-bold">
                {stats ? stats.captchasSolved : 0}
              </strong>
            </div>
          </div>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          className="w-full py-3.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RETRY AUTHENTICATION</span>
        </motion.button>
      </motion.div>
    </div>
  );
};
