import React, { useEffect, useState } from 'react';
import { GameStats, Player } from '../types';
import { Check, RotateCcw, Infinity as InfinityIcon, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface VictoryModalProps {
  player: Player;
  stats: GameStats;
  onPlayAgain: () => void;
  onContinueEndless: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  player,
  stats,
  onPlayAgain,
  onContinueEndless,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const target = stats.totalScore;
    const stepTime = 20;
    const totalSteps = 30;
    const stepValue = Math.ceil(target / totalSteps);

    const timer = setInterval(() => {
      start += stepValue;
      if (start >= target) {
        setAnimatedScore(target);
        clearInterval(timer);
      } else {
        setAnimatedScore(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [stats.totalScore]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 font-mono select-none">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-2xl p-6 text-zinc-900 space-y-5"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-lg">
            <Check className="w-6 h-6" />
          </div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block">
            HUMAN CONFIRMED // ACCESS GRANTED
          </span>
          <h2 className="text-2xl font-extrabold text-zinc-950">
            PACKAGE DELIVERED!
          </h2>
          <p className="text-xs text-zinc-600 font-bold">
            Rank {stats.rank} • {stats.rankTitle}
          </p>
        </div>

        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-white p-2.5 rounded-xl border border-zinc-300 shadow-2xs">
              <span className="text-[9px] text-zinc-500 uppercase font-extrabold block">SCORE</span>
              <strong className="text-sm text-zinc-950 font-bold">{animatedScore}</strong>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-zinc-300 shadow-2xs">
              <span className="text-[9px] text-zinc-500 uppercase font-extrabold block">CAPTCHAS</span>
              <strong className="text-sm text-zinc-950 font-bold">{stats.captchasSolved}</strong>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-zinc-300 shadow-2xs">
              <span className="text-[9px] text-zinc-500 uppercase font-extrabold block">PEAK STREAK</span>
              <strong className="text-sm text-zinc-950 font-bold">{stats.peakStreak}x</strong>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-zinc-300 shadow-2xs">
              <span className="text-[9px] text-zinc-500 uppercase font-extrabold block">TIME</span>
              <strong className="text-sm text-zinc-950 font-bold">{formatTime(stats.timeSurvived)}</strong>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinueEndless}
            className="flex-1 py-3.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <InfinityIcon className="w-4 h-4" />
            <span>ENDLESS OVERCLOCK</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPlayAgain}
            className="py-3.5 px-5 bg-zinc-200 hover:bg-zinc-300 text-zinc-950 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>MAIN MENU</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
