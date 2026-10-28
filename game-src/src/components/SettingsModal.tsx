import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Volume2, VolumeX, Eye, Crosshair, Sparkles, Sliders, X, Check } from 'lucide-react';
import { GameSettings } from '../types';
import { sound } from '../audio/soundEffects';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSettings({ soundVolume: val });
    sound.volume = val;
    sound.playShoot();
  };

  const handleToggleSound = () => {
    const nextVal = !settings.soundEnabled;
    onUpdateSettings({ soundEnabled: nextVal });
    sound.enabled = nextVal;
    if (nextVal) {
      sound.playCatch();
    }
  };

  return (
    <AnimatePresence>
      <div
        id="settings-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          id="settings-modal-card"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white border-2 border-zinc-900 shadow-2xl rounded-xl p-6 text-zinc-900 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-zinc-900 text-white rounded-lg">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-zinc-950 uppercase">
                  GAME CONFIGURATION
                </h2>
                <p className="text-xs font-mono text-zinc-600">
                  Live adjustments • No restart required
                </p>
              </div>
            </div>
            <button
              id="settings-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-zinc-300 hover:border-zinc-900 hover:bg-zinc-100 transition-colors"
              title="Close Settings"
            >
              <X className="w-5 h-5 text-zinc-800" />
            </button>
          </div>

          <div className="space-y-6">
            {/* 1. Trackpad & Aiming Controls */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-700">
                <Crosshair className="w-4 h-4" />
                <span>Aim & Facing Mode</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id="aim-mode-trackpad"
                  onClick={() => {
                    onUpdateSettings({ aimMode: 'TRACKPAD_AIM' });
                    sound.playRotateClick();
                  }}
                  className={`p-3 text-left rounded-lg border-2 font-mono text-xs transition-all ${
                    settings.aimMode === 'TRACKPAD_AIM'
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                      : 'border-zinc-300 bg-zinc-50 hover:border-zinc-500 text-zinc-800'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between mb-1">
                    <span>TRACKPAD / POINTER</span>
                    {settings.aimMode === 'TRACKPAD_AIM' && <Check className="w-4 h-4" />}
                  </div>
                  <p className="text-[11px] opacity-80 leading-relaxed font-sans">
                    Aim and face wherever your trackpad or cursor moves.
                  </p>
                </button>

                <button
                  id="aim-mode-movement"
                  onClick={() => {
                    onUpdateSettings({ aimMode: 'MOVEMENT_DIRECTION' });
                    sound.playRotateClick();
                  }}
                  className={`p-3 text-left rounded-lg border-2 font-mono text-xs transition-all ${
                    settings.aimMode === 'MOVEMENT_DIRECTION'
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                      : 'border-zinc-300 bg-zinc-50 hover:border-zinc-500 text-zinc-800'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between mb-1">
                    <span>MOVEMENT (WASD)</span>
                    {settings.aimMode === 'MOVEMENT_DIRECTION' && <Check className="w-4 h-4" />}
                  </div>
                  <p className="text-[11px] opacity-80 leading-relaxed font-sans">
                    Face and aim towards your current walking direction.
                  </p>
                </button>
              </div>

              {/* Aim Rotation Smoothing */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-semibold text-zinc-700">Aim Easing & Smoothing</span>
                  <span className="font-bold text-zinc-900">
                    {Math.round(settings.aimSmoothing * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.05"
                  value={settings.aimSmoothing}
                  onChange={(e) => onUpdateSettings({ aimSmoothing: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-600">
                  <span>Snappy / Direct</span>
                  <span>Buttery Ease-in/out</span>
                </div>
              </div>
            </div>

            {/* 2. Visual & Assistance Options */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-700">
                <Eye className="w-4 h-4" />
                <span>Visuals & Guides</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:border-zinc-400 cursor-pointer transition-colors">
                  <span className="text-xs font-mono font-medium text-zinc-800">Aim Laser Line</span>
                  <input
                    type="checkbox"
                    checked={settings.showAimLaser}
                    onChange={(e) => onUpdateSettings({ showAimLaser: e.target.checked })}
                    className="w-4 h-4 accent-zinc-900 cursor-pointer rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:border-zinc-400 cursor-pointer transition-colors">
                  <span className="text-xs font-mono font-medium text-zinc-800">Aim Crosshair</span>
                  <input
                    type="checkbox"
                    checked={settings.showAimCrosshair}
                    onChange={(e) => onUpdateSettings({ showAimCrosshair: e.target.checked })}
                    className="w-4 h-4 accent-zinc-900 cursor-pointer rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:border-zinc-400 cursor-pointer transition-colors">
                  <span className="text-xs font-mono font-medium text-zinc-800">Motion Blur</span>
                  <input
                    type="checkbox"
                    checked={settings.motionBlur}
                    onChange={(e) => onUpdateSettings({ motionBlur: e.target.checked })}
                    className="w-4 h-4 accent-zinc-900 cursor-pointer rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:border-zinc-400 cursor-pointer transition-colors">
                  <span className="text-xs font-mono font-medium text-zinc-800">CRT Scanlines</span>
                  <input
                    type="checkbox"
                    checked={settings.scanlines}
                    onChange={(e) => onUpdateSettings({ scanlines: e.target.checked })}
                    className="w-4 h-4 accent-zinc-900 cursor-pointer rounded"
                  />
                </label>
              </div>

              {/* Screen Shake Selector */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-semibold text-zinc-700">Screen Shake Feedback</span>
                  <span className="font-bold text-zinc-900 uppercase">{settings.screenShake}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['none', 'low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => onUpdateSettings({ screenShake: level })}
                      className={`py-1 text-xs font-mono rounded border transition-colors uppercase ${
                        settings.screenShake === level
                          ? 'bg-zinc-900 border-zinc-900 text-white font-bold'
                          : 'bg-white border-zinc-300 hover:border-zinc-500 text-zinc-700'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Audio Configuration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-zinc-700">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <span>Audio & Feedback</span>
                </div>
                <button
                  onClick={handleToggleSound}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-colors flex items-center gap-1 ${
                    settings.soundEnabled
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-100 text-zinc-500 border-zinc-300'
                  }`}
                >
                  {settings.soundEnabled ? (
                    <>
                      <Volume2 className="w-3 h-3" /> ENABLED
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3 h-3" /> MUTED
                    </>
                  )}
                </button>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-semibold text-zinc-700">Master Volume</span>
                  <span className="font-bold text-zinc-900">
                    {Math.round(settings.soundVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={handleVolumeChange}
                  disabled={!settings.soundEnabled}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900 disabled:opacity-40"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-zinc-200 flex justify-end">
            <button
              id="settings-done-btn"
              onClick={() => {
                sound.playCatch();
                onClose();
              }}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md"
            >
              APPLY & RESUME
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
