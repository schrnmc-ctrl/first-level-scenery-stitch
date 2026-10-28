import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Target } from 'lucide-react';

interface VirtualControlsProps {
  onDirectionPress: (dir: string, isDown: boolean) => void;
  onShootPress: (isDown: boolean) => void;
  onShockwavePress?: () => void;
  onShockwave?: () => void;
  shockwaveCooldown?: number;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onDirectionPress,
  onShootPress,
  onShockwavePress,
  onShockwave,
  shockwaveCooldown = 0,
}) => {
  const triggerShockwave = onShockwavePress || onShockwave || (() => {});

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between pointer-events-auto select-none font-mono">
      {/* D-Pad on Left: Clean Minimalist Shapes */}
      <div className="relative w-28 h-28 bg-white rounded-2xl border border-zinc-300 p-1 flex items-center justify-center shadow-md">
        {/* Up */}
        <button
          type="button"
          onPointerDown={() => onDirectionPress('ArrowUp', true)}
          onPointerUp={() => onDirectionPress('ArrowUp', false)}
          onPointerLeave={() => onDirectionPress('ArrowUp', false)}
          className="absolute top-1 w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-950 active:text-white text-zinc-900 border border-zinc-300 flex items-center justify-center transition-all cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        {/* Down */}
        <button
          type="button"
          onPointerDown={() => onDirectionPress('ArrowDown', true)}
          onPointerUp={() => onDirectionPress('ArrowDown', false)}
          onPointerLeave={() => onDirectionPress('ArrowDown', false)}
          className="absolute bottom-1 w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-950 active:text-white text-zinc-900 border border-zinc-300 flex items-center justify-center transition-all cursor-pointer"
        >
          <ArrowDown className="w-4 h-4" />
        </button>

        {/* Left */}
        <button
          type="button"
          onPointerDown={() => onDirectionPress('ArrowLeft', true)}
          onPointerUp={() => onDirectionPress('ArrowLeft', false)}
          onPointerLeave={() => onDirectionPress('ArrowLeft', false)}
          className="absolute left-1 w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-950 active:text-white text-zinc-900 border border-zinc-300 flex items-center justify-center transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Right */}
        <button
          type="button"
          onPointerDown={() => onDirectionPress('ArrowRight', true)}
          onPointerUp={() => onDirectionPress('ArrowRight', false)}
          onPointerLeave={() => onDirectionPress('ArrowRight', false)}
          className="absolute right-1 w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-950 active:text-white text-zinc-900 border border-zinc-300 flex items-center justify-center transition-all cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="w-3.5 h-3.5 rounded-full bg-zinc-300" />
      </div>

      {/* Center Desktop Key Guide */}
      <div className="hidden md:flex items-center gap-3 text-[11px] text-zinc-600 bg-white px-4 py-2 rounded-xl border border-zinc-300 shadow-sm font-bold">
        <span>MOVE: <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-300 text-zinc-950">WASD</kbd></span>
        <span>•</span>
        <span>SHOOT: <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-300 text-zinc-950">CLICK</kbd></span>
        <span>•</span>
        <span>PULSE: <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-300 text-zinc-950">SPACE</kbd></span>
      </div>

      {/* Action Buttons on Right */}
      <div className="flex items-center gap-2.5">
        {/* Shockwave Pulse Button */}
        <button
          type="button"
          onClick={triggerShockwave}
          disabled={shockwaveCooldown > 0}
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-sm ${
            shockwaveCooldown <= 0
              ? 'bg-zinc-950 hover:bg-zinc-800 text-white border border-zinc-800'
              : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span className="text-[8px] mt-0.5">PULSE</span>
        </button>

        {/* Primary Wi-Fi Pulse Shoot Button */}
        <button
          type="button"
          onPointerDown={() => onShootPress(true)}
          onPointerUp={() => onShootPress(false)}
          onPointerLeave={() => onShootPress(false)}
          className="w-14 h-14 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white flex flex-col items-center justify-center font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <Target className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 font-extrabold">FIRE</span>
        </button>
      </div>
    </div>
  );
};
