/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameRenderer } from './game/GameRenderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './game/constants';
import { sound } from './audio/soundEffects';
import { PhoneHUD } from './components/PhoneHUD';
import { StartScreen } from './components/StartScreen';
import { IntroCinematic } from './components/IntroCinematic';
import { BossDefeatCinematic } from './components/BossDefeatCinematic';
import { CaptchaModal } from './components/CaptchaModal';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { VirtualControls } from './components/VirtualControls';
import { PauseModal } from './components/PauseModal';
import { SettingsModal } from './components/SettingsModal';
import { GameSettings, GameState } from './types';
import { CampaignScreens } from './components/CampaignScreens';
import { CAMPAIGN_STAGES, applyUpgrade } from './game/campaign';
import { CONFIG, type ScreenId } from './game/screenConfig';
import {
  Shield,
  Zap,
  Info,
  Tv,
  HelpCircle,
  Activity,
  Wind,
  Pause,
  Play,
  Sliders,
  Crosshair,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateRandomCaptcha } from './game/captchaGenerator';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  const [settings, setSettings] = useState<GameSettings>({
    aimMode: 'TRACKPAD_AIM',
    aimSmoothing: 0.3,
    soundVolume: 0.8,
    soundEnabled: true,
    scanlines: false,
    motionBlur: true,
    screenShake: 'medium',
    showAimLaser: true,
    showAimCrosshair: true,
  });

  const [fpsCount, setFpsCount] = useState<number>(120);
  const [showIntroCinematic, setShowIntroCinematic] = useState<boolean>(false);
  const [showStoryModal, setShowStoryModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [activeCaptcha, setActiveCaptcha] = useState<any>(null);
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [playerState, setPlayerState] = useState<any>(null);
  const [stageId, setStageId] = useState<any>('STAGE_1_CROSSWALK');
  const [captchasSolved, setCaptchasSolved] = useState<number>(0);
  const [gameStats, setGameStats] = useState<any>(null);
  const [campaignScreen, setCampaignScreen] = useState<ScreenId | null>('title');
  const [campaignLevel, setCampaignLevel] = useState(1);
  const [fading, setFading] = useState(false);

  // Fade to black, swap screen, fade back in.
  const transition = useCallback((change: () => void) => {
    setFading(true);
    window.setTimeout(() => { change(); setFading(false); }, CONFIG.timing.fade);
  }, []);

  const startLevel = useCallback((level: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (level === 1) engine.resetGame();
    engine.startCampaignStage(CAMPAIGN_STAGES[level - 1]);
    setCampaignScreen(null);
    setGameState('PLAYING');
  }, []);

  const handleCampaignAction = useCallback((action?: string) => {
    if (fading) return;
    if (campaignScreen === 'title') transition(() => setCampaignScreen('story'));
    else if (campaignScreen === 'story') transition(() => { setCampaignLevel(1); setCampaignScreen('map'); });
    else if (campaignScreen === 'map') transition(() => startLevel(campaignLevel));
    else if (campaignScreen === 'upgrades' && action) {
      if (engineRef.current) applyUpgrade(engineRef.current.player, action);
      transition(() => { setCampaignLevel(l => l + 1); setCampaignScreen('map'); });
    } else if (campaignScreen === 'victory') transition(() => {
      engineRef.current?.resetGame();
      if (engineRef.current) engineRef.current.gameState = 'MENU';
      setGameState('MENU'); setCampaignLevel(1); setCampaignScreen('title');
    });
  }, [campaignScreen, campaignLevel, fading, transition, startLevel]);

  // A finished level leads to upgrades (Levels 1-2) or the ending (Level 3).
  useEffect(() => {
    if (gameState !== 'LEVEL_COMPLETE' || campaignScreen) return;
    const engine = engineRef.current;
    if (engine) engine.gameState = 'MENU';
    transition(() => setCampaignScreen(campaignLevel >= CAMPAIGN_STAGES.length ? 'victory' : 'upgrades'));
  }, [gameState, campaignScreen, campaignLevel, transition]);

  // Initialize Game Engine on mount
  useEffect(() => {
    const engine = new GameEngine();
    engineRef.current = engine;
    engine.updateSettings(settings);

    setPlayerState(engine.player);
    setStageId(engine.stage);
    setGameState(engine.gameState);
    setGameStats(engine.getGameStats());

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) {
        rendererRef.current = new GameRenderer(ctx);
      }
    }

    let lastTime = performance.now();
    let animFrameId: number;
    let frameCounter = 0;
    let fpsTimer = performance.now();
    let lastHudSync = 0;

    const gameLoop = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      const dt = Math.min(0.04, rawDt);
      lastTime = now;

      frameCounter++;
      if (now - fpsTimer >= 500) {
        const measuredFps = Math.round((frameCounter * 1000) / (now - fpsTimer));
        setFpsCount(measuredFps);
        frameCounter = 0;
        fpsTimer = now;
      }

      // Only advance physics and spawning when actively playing
      if (engine.gameState === 'PLAYING') {
        engine.update(dt);
      }

      if (now - lastHudSync > 40 || engine.gameState !== 'PLAYING' || engine.activeCaptcha) {
        setPlayerState({ ...engine.player });
        setStageId(engine.stage);
        setGameState(engine.gameState);
        setActiveCaptcha(engine.activeCaptcha);
        setCaptchasSolved(engine.solvedCaptchasCount);
        setGameStats(engine.getGameStats());
        lastHudSync = now;
      }

      if (rendererRef.current && canvas) {
        rendererRef.current.stage = engine.stage;
        rendererRef.current.render(
          now / 1000,
          engine.player,
          engine.enemies,
          engine.boss,
          engine.projectiles,
          engine.particles,
          engine.powerUps,
          engine.shockwaves,
          engine.captchaZones,
          engine.settings.scanlines,
          engine.glitchIntensity,
          engine.settings.motionBlur,
          engine.mousePos,
          engine.settings,
          engine.camera
        );
      }

      animFrameId = requestAnimationFrame(gameLoop);
    };

    animFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  // Update engine settings whenever state changes
  const handleUpdateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (engineRef.current) {
        engineRef.current.updateSettings(updated);
      }
      return updated;
    });
  }, []);

  // Trackpad and Pointer Coordinate Mapping with Camera Synchronization
  const updatePointerCoordinates = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const targetX = (clientX - rect.left) * scaleX;
    const targetY = (clientY - rect.top) * scaleY;

    engine.screenMousePos.x = Math.max(0, Math.min(CANVAS_WIDTH, targetX));
    engine.screenMousePos.y = Math.max(0, Math.min(CANVAS_HEIGHT, targetY));
    engine.mousePos.x = engine.screenMousePos.x + engine.camera.x;
    engine.mousePos.y = engine.screenMousePos.y + engine.camera.y;
  }, []);

  // Global Keyboard Event Listeners for Pause, Shockwave, and Movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable ||
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const engine = engineRef.current;
      if (!engine) return;

      // Pause toggle: Escape or KeyP
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (showSettingsModal) {
          setShowSettingsModal(false);
          return;
        }
        if (showStoryModal) {
          setShowStoryModal(false);
          return;
        }
        if (engine.gameState === 'PLAYING') {
          engine.pause();
          setGameState('PAUSED');
          sound.playRotateClick();
        } else if (engine.gameState === 'PAUSED') {
          engine.resume();
          setGameState('PLAYING');
          sound.playCatch();
        }
        return;
      }

      // Live Options toggle: KeyO
      if (e.code === 'KeyO') {
        setShowSettingsModal((prev) => !prev);
        sound.playCatch();
        return;
      }

      engine.keys[e.code] = true;

      // Space, KeyE, or KeyQ triggers the EMP Shockwave
      if (e.code === 'Space' || e.code === 'KeyE' || e.code === 'KeyQ') {
        if (engine.gameState === 'PLAYING') {
          engine.triggerShockwave();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable ||
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const engine = engineRef.current;
      if (!engine) return;
      engine.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showSettingsModal, showStoryModal]);

  // Pointer Handlers for Canvas & Trackpad Aiming
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    updatePointerCoordinates(e.clientX, e.clientY);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    if (!engine) return;

    updatePointerCoordinates(e.clientX, e.clientY);

    if (e.button === 2) {
      e.preventDefault();
      engine.triggerShockwave();
    } else {
      engine.isMouseDown = true;
      if (engine.gameState === 'PLAYING') {
        engine.tryShoot();
      }
    }
  };

  const handlePointerUp = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.isMouseDown = false;
  };

  const handleStartGame = (mode: 'standard' | 'overclocked' = 'standard') => {
    if (engineRef.current) {
      engineRef.current.resetGame();
      if (mode === 'overclocked') {
        engineRef.current.player.speed = 360;
        engineRef.current.player.wifiLevel = 3;
      }
      sound.playPowerUp();
    }
    setGameState('PLAYING');
  };

  const handlePracticeCaptcha = () => {
    const practiceChallenge = generateRandomCaptcha('GRID_SELECT');
    if (engineRef.current) {
      engineRef.current.activeCaptcha = practiceChallenge;
      setActiveCaptcha(practiceChallenge);
    }
  };

  const handleToggleSound = () => {
    handleUpdateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const handleDirectionPress = (dir: string, isDown: boolean) => {
    if (engineRef.current) {
      engineRef.current.keys[dir] = isDown;
    }
  };

  const handleShootPress = (isDown: boolean) => {
    if (engineRef.current) {
      engineRef.current.isMouseDown = isDown;
      if (isDown && engineRef.current.gameState === 'PLAYING') {
        engineRef.current.tryShoot();
      }
    }
  };

  const handleShockwave = () => {
    if (engineRef.current && engineRef.current.gameState === 'PLAYING') {
      engineRef.current.triggerShockwave();
    }
  };

  const handleTogglePause = () => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.gameState === 'PLAYING') {
      engine.pause();
      setGameState('PAUSED');
      sound.playRotateClick();
    } else if (engine.gameState === 'PAUSED') {
      engine.resume();
      setGameState('PLAYING');
      sound.playCatch();
    }
  };

  const handleCaptchaVerify = (success: boolean) => {
    if (engineRef.current) {
      engineRef.current.submitCaptchaResult(success);
    }
    setActiveCaptcha(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-zinc-900 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Phone HUD */}
      {playerState && (
        <PhoneHUD
          player={playerState}
          stage={stageId}
          stageTimer={0}
          soundEnabled={settings.soundEnabled}
          isPaused={gameState === 'PAUSED'}
          onTogglePause={handleTogglePause}
          onOpenSettings={() => setShowSettingsModal(true)}
          onToggleSound={handleToggleSound}
          onTriggerShockwave={handleShockwave}
        />
      )}

      {/* Main Canvas Container Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 relative">
        <div className="relative w-full max-w-6xl rounded-3xl overflow-hidden border-2 border-zinc-300 shadow-2xl bg-white">
          {/* Top Canvas Quick Status & Toolbar */}
          <div className="absolute top-3 left-4 z-10 flex items-center gap-2 pointer-events-auto">
            <span className="px-3 py-1 rounded-xl bg-white/90 border border-zinc-300 text-[11px] font-mono text-zinc-800 font-bold flex items-center gap-1.5 shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ONLINE
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/90 border border-zinc-300 text-[11px] font-mono text-zinc-600 font-bold flex items-center gap-1 shadow-sm backdrop-blur-sm">
              <Activity className="w-3.5 h-3.5 text-zinc-600" />
              <span>{fpsCount} FPS</span>
            </span>
            {gameState === 'PLAYING' && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                type="button"
                onClick={() => engineRef.current?.triggerInteractiveCaptcha()}
                className="px-3 py-1 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-mono font-bold border border-zinc-800 shadow-md flex items-center gap-1 cursor-pointer"
                title="Trigger Instant CAPTCHA Challenge (+18% Battery + Speed Boost)"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>TEST CAPTCHA</span>
              </motion.button>
            )}
          </div>

          <div className="absolute top-3 right-4 z-10 flex items-center gap-2 pointer-events-auto">
            {/* Live Options Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="px-3 py-1 rounded-xl bg-white/90 hover:bg-zinc-100 text-[11px] font-mono font-bold text-zinc-800 border border-zinc-300 flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
              title="Edit Options Live (Aim Mode, Volume, Trails, Scanlines)"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>OPTIONS [O]</span>
            </motion.button>

            {/* Quick Aim Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              type="button"
              onClick={() =>
                handleUpdateSettings({
                  aimMode: settings.aimMode === 'TRACKPAD_AIM' ? 'MOVEMENT_DIRECTION' : 'TRACKPAD_AIM',
                })
              }
              className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm ${
                settings.aimMode === 'TRACKPAD_AIM'
                  ? 'bg-zinc-950 text-white border border-zinc-950'
                  : 'bg-white/90 text-zinc-700 border border-zinc-300'
              }`}
              title="Toggle Trackpad Facing Aim vs Movement Direction"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>AIM: {settings.aimMode === 'TRACKPAD_AIM' ? 'TRACKPAD' : 'WASD'}</span>
            </motion.button>

            {/* Guide Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              type="button"
              onClick={() => setShowStoryModal(true)}
              className="px-3 py-1 rounded-xl bg-white/90 hover:bg-zinc-100 text-[11px] font-mono text-zinc-700 hover:text-zinc-950 border border-zinc-300 flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>GUIDE</span>
            </motion.button>
          </div>

          {/* HTML5 Game Canvas */}
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-auto aspect-[8/5] block cursor-crosshair touch-none"
          />

          {/* Startup Intro Cinematic Sequence */}
          <AnimatePresence>
            {showIntroCinematic && (
              <IntroCinematic
                onComplete={() => setShowIntroCinematic(false)}
                soundEnabled={settings.soundEnabled}
              />
            )}
          </AnimatePresence>

          {/* Start Screen with Hook & Mode Selection */}
          {false && (
            <StartScreen
              onStartGame={handleStartGame}
              onPracticeCaptcha={handlePracticeCaptcha}
              soundEnabled={settings.soundEnabled}
              onToggleSound={handleToggleSound}
              scanlines={settings.scanlines}
              onToggleScanlines={() => handleUpdateSettings({ scanlines: !settings.scanlines })}
              motionBlur={settings.motionBlur}
              onToggleMotionBlur={() => handleUpdateSettings({ motionBlur: !settings.motionBlur })}
              onOpenSettings={() => setShowSettingsModal(true)}
              onReplayIntro={() => setShowIntroCinematic(true)}
            />
          )}

          {/* Boss Defeat Overload Cinematic */}
          <AnimatePresence>
            {gameState === 'BOSS_DEFEAT_CINEMATIC' && (
              <BossDefeatCinematic
                onComplete={() => {
                  // Campaign boss win finishes Level 3 and opens the victory screen.
                  engineRef.current?.triggerVictory();
                  setGameState(engineRef.current?.gameState ?? 'VICTORY');
                }}
              />
            )}
          </AnimatePresence>

          {/* Pause Modal Screen */}
          <AnimatePresence>
            {gameState === 'PAUSED' && playerState && (
              <PauseModal
                isOpen={gameState === 'PAUSED'}
                player={playerState}
                stage={stageId}
                totalTime={engineRef.current?.totalPlayTime || 0}
                onResume={handleTogglePause}
                onOpenSettings={() => setShowSettingsModal(true)}
                onRestart={() => handleStartGame('standard')}
                onMainMenu={() => {
                  if (engineRef.current) {
                    engineRef.current.gameState = 'MENU';
                    setGameState('MENU');
                  }
                }}
              />
            )}
          </AnimatePresence>

          {/* Live Settings & Options Modal (Accessible on the fly without restarting) */}
          <AnimatePresence>
            {showSettingsModal && (
              <SettingsModal
                isOpen={showSettingsModal}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onClose={() => setShowSettingsModal(false)}
              />
            )}
          </AnimatePresence>

          {/* System & Gameplay Guide Modal */}
          <AnimatePresence>
            {showStoryModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                <motion.div
                  initial={{ scale: 0.92, opacity: 0, y: 16 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.94, opacity: 0, y: 16 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-lg w-full bg-white border-2 border-zinc-900 rounded-3xl p-6 shadow-2xl space-y-4 text-left font-mono text-xs text-zinc-900"
                >
                  <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3">
                    <h3 className="text-sm font-black text-zinc-950 flex items-center gap-2">
                      <Info className="w-4 h-4 text-zinc-800" />
                      <span>AUTHENTICATION RUN GUIDE</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowStoryModal(false)}
                      className="text-[11px] text-zinc-700 hover:text-zinc-950 px-2.5 py-1 bg-zinc-100 rounded-lg cursor-pointer border border-zinc-300 font-bold"
                    >
                      CLOSE [ESC]
                    </button>
                  </div>

                  <div className="space-y-3 text-zinc-700 leading-relaxed max-h-72 overflow-y-auto pr-2">
                    <p>
                      <strong className="text-zinc-950">Trackpad Aiming:</strong> Move your pointer or trackpad to face any angle. Wi-Fi pulses will fire directly in the direction of your crosshair.
                    </p>
                    <p>
                      <strong className="text-zinc-950">Live Configuration:</strong> Press <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded border font-bold">O</kbd> anytime to tweak aim smoothing, master volume, motion blur, and visual guides without restarting your current run.
                    </p>
                    <p>
                      <strong className="text-zinc-950">Pause System:</strong> Press <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded border font-bold">ESC</kbd> or <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded border font-bold">P</kbd> or tap Pause on the HUD to freeze all bots and battery drain.
                    </p>
                    <p>
                      <strong className="text-zinc-950">Power Management:</strong> Firing pulses and taking damage consume battery. Collect battery packs or solve floor CAPTCHAs to recharge juice.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowStoryModal(false)}
                    className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold text-xs hover:bg-zinc-800 cursor-pointer shadow-md transition-colors"
                  >
                    RETURN TO GAME
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Interactive In-Game CAPTCHA Modal */}
          <AnimatePresence>
            {activeCaptcha && (
              <CaptchaModal
                challenge={activeCaptcha}
                onVerify={handleCaptchaVerify}
              />
            )}
          </AnimatePresence>

          {/* Victory Modal */}
          <AnimatePresence>
            {gameState === 'VICTORY' && playerState && gameStats && (
              <VictoryModal
                player={playerState}
                stats={gameStats}
                onPlayAgain={() => handleStartGame('standard')}
                onContinueEndless={() => {
                  engineRef.current?.startEndlessMode();
                  setGameState('PLAYING');
                }}
              />
            )}
          </AnimatePresence>

          {/* Game Over Modal */}
          <AnimatePresence>
            {gameState === 'GAME_OVER' && playerState && (
              <GameOverModal
                player={playerState}
                stats={gameStats}
                onRetry={() => startLevel(campaignLevel)}
              />
            )}
          </AnimatePresence>
        </div>

        {campaignScreen && (
          <CampaignScreens screen={campaignScreen} level={campaignLevel} score={playerState?.score ?? 0} onAction={handleCampaignAction} />
        )}
        <div className="campaign-fade" style={{ opacity: fading ? 1 : 0, transitionDuration: `${CONFIG.timing.fade}ms` }} />

        {/* Mobile / Touch Virtual Controls */}
        <VirtualControls
          onDirectionPress={handleDirectionPress}
          onShootPress={handleShootPress}
          onShockwavePress={handleShockwave}
        />
      </main>
    </div>
  );
}
