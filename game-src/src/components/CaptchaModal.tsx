import React, { useState, useEffect, useRef } from 'react';
import { CaptchaChallenge, CaptchaType, CircuitTile } from '../types';
import {
  ShieldCheck,
  Clock,
  RefreshCw,
  AlertTriangle,
  RotateCw,
  RotateCcw,
  Zap,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  HelpCircle,
  Award,
  Send,
  Keyboard,
  Check,
  MousePointerClick,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Maximize2,
  Wand2,
  Layers,
  FastForward,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../audio/soundEffects';

interface CaptchaModalProps {
  challenge: CaptchaChallenge;
  onVerify: (success: boolean) => void;
}

const CAPTCHA_HINTS: Record<CaptchaType, string> = {
  TRAFFIC_RUNNER:
    '💡 HINT: Wait for an opening in the traffic! Lane 1 travels right, Lane 2 travels left. Tap [W] or [↑ SPRINT] to dash forward across all lanes to the finish line.',
  CATCH_THE_COOKIES:
    '💡 HINT: Move your basket left and right with the mouse or arrow keys to catch 5 cookies 🍪. Avoid glitch bugs ✕!',
  CIRCUIT_CONNECT:
    '💡 HINT: Tap each circuit tile to rotate it 90°. Align all wire tracks so energy flows seamlessly from Power In to the Battery terminal.',
  LASER_DEFLECTOR:
    '💡 HINT: Drag the angle slider to tilt the central reflective mirror (around 45°). Reflect the laser beam straight into the target 🎯 sensor.',
  COLOR_STROOP_TEST:
    '💡 HINT: Cognitive reflex check! Identify the actual INK color of the letters. Ignore what the word spells out!',
  TYPING_CHALLENGE:
    '💡 HINT: Type the verification phrase in the box, or click the quick-tap word chips / Auto-Complete button to authenticate!',
  EMOJI_EQUATION:
    '💡 HINT: Look at the top equations to deduce each emoji’s numeric value, then calculate the final sum and select the matching number.',
  WHACK_A_BOT:
    '💡 HINT: Click or tap glitching spam bots 🤖 the instant they pop up from the server port slots until you reach 5 hits.',
  MEMORY_SEQUENCE:
    '💡 HINT: Watch the sequence of light pulses and tones, then click them in the exact same order. Use the Replay button if you missed it!',
  PATTERN_DRAW:
    '💡 HINT: Follow the glowing white indicator! Click the designated security nodes in order (Step 1 ➔ Step 2...) to form the pattern arch.',
  GRID_SELECT:
    '💡 HINT: Click all square tiles containing the requested target object (e.g. Bus, Traffic Light, Bicycle), then tap Verify Humanity.',
  SLICED_IMAGE:
    '💡 HINT: Click all squares containing parts of the target object (e.g. Bus Roof, Windows, Body, Wheels), then tap Verify Humanity.',
  SLIDER_PUZZLE:
    '💡 HINT: Drag the slider knob until the KEY piece lines up inside the dashed target SLOT.',
  ROTATION_PUZZLE:
    '💡 HINT: Tap Rotate +90° until the icon is upright (0° vertical orientation), then tap Verify Humanity.',
};

export const CaptchaModal: React.FC<CaptchaModalProps> = ({ challenge, onVerify }) => {
  const [selectedGridIds, setSelectedGridIds] = useState<number[]>([]);
  const [selectedSlicedIds, setSelectedSlicedIds] = useState<number[]>([]);
  const [sliderPos, setSliderPos] = useState<number>(challenge.sliderPuzzle?.currentPosition || 5);
  const [currentAngle, setCurrentAngle] = useState<number>(challenge.rotationPuzzle?.currentAngle || 90);

  // Pattern Draw
  const [drawnPattern, setDrawnPattern] = useState<number[]>([]);

  // Memory Sequence
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activeMemoryLight, setActiveMemoryLight] = useState<number | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState<boolean>(false);

  // Whack-A-Bot
  const [whackHits, setWhackHits] = useState<number>(0);
  const [activeBotHoles, setActiveBotHoles] = useState<number[]>([0, 4]);

  // Circuit Connect
  const [circuitTiles, setCircuitTiles] = useState<CircuitTile[]>(
    challenge.circuitConnect?.tiles || [
      { id: 0, type: 'corner', currentRotation: 90, correctRotations: [0] },
      { id: 1, type: 'straight', currentRotation: 90, correctRotations: [0, 180] },
      { id: 2, type: 'corner', currentRotation: 180, correctRotations: [270] },
      { id: 3, type: 'straight', currentRotation: 0, correctRotations: [90, 270] },
    ]
  );

  // Catch Cookies
  const [cookiesCaught, setCookiesCaught] = useState<number>(0);
  const catchCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Laser Deflector
  const [laserMirrorAngle, setLaserMirrorAngle] = useState<number>(
    challenge.laserDeflector?.currentAngle || 15
  );

  // Typing Challenge
  const [typedInput, setTypedInput] = useState<string>('');
  const typingInputRef = useRef<HTMLInputElement | null>(null);

  // Emoji Equation
  const [selectedEmojiAnswer, setSelectedEmojiAnswer] = useState<number | null>(null);

  // Hints & Celebration State
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const isSolvedRef = useRef<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(challenge.timeRemaining);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dedicated Canvas Ref for Traffic Runner
  const trafficCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trigger smooth success animation and then callback safely
  const triggerSuccess = (delay: number = 550) => {
    if (isSolvedRef.current) return;
    isSolvedRef.current = true;
    setIsSolved(true);
    sound.playCaptchaSuccess();
    setTimeout(() => {
      onVerify(true);
    }, delay);
  };

  // Play chime on mount
  useEffect(() => {
    sound.playSecurityChime();
  }, []);

  // Overall Countdown Timer
  useEffect(() => {
    if (isSolved) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!isSolvedRef.current) {
            onVerify(false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onVerify, isSolved]);

  // Focus typing input on mount if Typing Challenge
  useEffect(() => {
    if (challenge.type === 'TYPING_CHALLENGE') {
      const focusTimer = setTimeout(() => {
        if (typingInputRef.current) {
          typingInputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(focusTimer);
    }
  }, [challenge.type]);

  // High-FPS Smooth Traffic Runner Canvas Loop
  useEffect(() => {
    if (challenge.type !== 'TRAFFIC_RUNNER' || isSolved) return;

    const canvas = trafficCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Smooth player coordinates with continuous spring/lerp easing
    const laneYPositions = [148, 106, 64, 20]; // 0: Start, 1: Lane 1, 2: Lane 2, 3: Finish
    let currentLane = 0;
    let targetX = w / 2;
    let targetY = laneYPositions[0];
    let currentX = w / 2;
    let currentY = laneYPositions[0];
    let hopAnim = 0; // 0 to 1 for vertical squish/hop bounce
    let isHitImmunity = 0;
    let animId: number;
    let lastT = performance.now();

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
      life: number;
    }> = [];

    const cars = [
      { lane: 1, x: 30, speed: 145, length: 46, height: 22, color: '#18181b', lightColor: 'rgba(250, 204, 21, 0.25)' },
      { lane: 1, x: 260, speed: 145, length: 50, height: 22, color: '#27272a', lightColor: 'rgba(56, 189, 248, 0.25)' },
      { lane: 2, x: 140, speed: -180, length: 48, height: 22, color: '#09090b', lightColor: 'rgba(244, 63, 94, 0.25)' },
      { lane: 2, x: 360, speed: -180, length: 44, height: 22, color: '#3f3f46', lightColor: 'rgba(250, 204, 21, 0.25)' },
    ];

    const emitPuff = (px: number, py: number, color: string = 'rgba(15, 23, 42, 0.4)') => {
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: px + (Math.random() - 0.5) * 8,
          y: py + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 30,
          vy: (Math.random() - 0.5) * 20 - 10,
          size: 2 + Math.random() * 2.5,
          alpha: 0.8,
          color,
          life: 0.35 + Math.random() * 0.25,
        });
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        if (currentLane < 3) {
          currentLane++;
          targetY = laneYPositions[currentLane];
          hopAnim = 1.0;
          sound.playShoot();
          emitPuff(currentX, currentY);
          if (currentLane >= 3) {
            triggerSuccess(550);
          }
        }
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        if (currentLane > 0) {
          currentLane--;
          targetY = laneYPositions[currentLane];
          hopAnim = 1.0;
          sound.playRotateClick();
          emitPuff(currentX, currentY);
        }
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        targetX = Math.max(35, targetX - 45);
        hopAnim = 0.6;
        emitPuff(currentX, currentY);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        targetX = Math.min(w - 35, targetX + 45);
        hopAnim = 0.6;
        emitPuff(currentX, currentY);
      }
    };

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * w;
      const clickY = ((e.clientY - rect.top) / rect.height) * h;

      targetX = Math.max(35, Math.min(w - 35, clickX));

      // Find closest lane Y
      let closestLane = 0;
      let closestDist = 999;
      laneYPositions.forEach((ly, idx) => {
        const d = Math.abs(ly - clickY);
        if (d < closestDist) {
          closestDist = d;
          closestLane = idx;
        }
      });

      if (closestLane !== currentLane) {
        currentLane = closestLane;
        targetY = laneYPositions[currentLane];
        hopAnim = 1.0;
        sound.playShoot();
        emitPuff(currentX, currentY);
        if (currentLane >= 3) {
          triggerSuccess(550);
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    canvas.addEventListener('click', handleCanvasClick);

    const renderRunnerLoop = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      // Smooth buttery interpolation (ease-in ease-out lerp)
      const lerpSpeed = 16 * dt;
      currentX += (targetX - currentX) * Math.min(1, lerpSpeed);
      currentY += (targetY - currentY) * Math.min(1, lerpSpeed);

      if (hopAnim > 0) {
        hopAnim = Math.max(0, hopAnim - dt * 4.5);
      }
      if (isHitImmunity > 0) {
        isHitImmunity = Math.max(0, isHitImmunity - dt);
      }

      // 1. Crisp Light Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, w, h);

      // 2. Sidewalk Top (Finish) with clean aesthetic
      ctx.fillStyle = currentLane === 3 ? '#dcfce7' : '#e2e8f0';
      ctx.fillRect(0, 0, w, 38);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, w, 38);

      ctx.fillStyle = currentLane === 3 ? '#15803d' : '#09090b';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('FINISH LINE // SECURE SIDEWALK [GO HERE]', 14, 23);

      // 3. Road Area (Darker Asphalt tone with clean texture)
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 38, w, 92);

      // Subtle Zebra Crosswalk markings across the road
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let zx = 40; zx < w - 40; zx += 32) {
        ctx.fillRect(zx, 42, 14, 84);
      }

      // Lane divider (dashed dark line)
      ctx.strokeStyle = '#64748b';
      ctx.setLineDash([12, 12]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 84);
      ctx.lineTo(w, 84);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Sidewalk Bottom (Start)
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 130, w, 40);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 130, w, 40);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('STARTING POINT // PRESS [W / ↑] OR CLICK TO HOP', 14, 153);

      // 5. Update & Render Cars with Headlight Cones & Wheel Details
      cars.forEach((car) => {
        car.x += car.speed * dt;
        if (car.speed > 0 && car.x > w + 50) car.x = -50;
        if (car.speed < 0 && car.x < -50) car.x = w + 50;

        const carY = car.lane === 1 ? 106 : 64;

        ctx.save();

        // Soft Headlight Beam Cone
        const beamLength = 70;
        const beamAngle = car.speed > 0 ? 0 : Math.PI;
        const grad = ctx.createRadialGradient(
          car.x + (car.speed > 0 ? car.length / 2 : -car.length / 2),
          carY,
          4,
          car.x + (car.speed > 0 ? car.length / 2 + beamLength : -car.length / 2 - beamLength),
          carY,
          50
        );
        grad.addColorStop(0, car.lightColor);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        if (car.speed > 0) {
          ctx.moveTo(car.x + car.length / 2, carY - 8);
          ctx.lineTo(car.x + car.length / 2 + beamLength, carY - 24);
          ctx.lineTo(car.x + car.length / 2 + beamLength, carY + 24);
          ctx.lineTo(car.x + car.length / 2, carY + 8);
        } else {
          ctx.moveTo(car.x - car.length / 2, carY - 8);
          ctx.lineTo(car.x - car.length / 2 - beamLength, carY - 24);
          ctx.lineTo(car.x - car.length / 2 - beamLength, carY + 24);
          ctx.lineTo(car.x - car.length / 2, carY + 8);
        }
        ctx.closePath();
        ctx.fill();

        // Car Body Shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
        ctx.beginPath();
        ctx.roundRect(car.x - car.length / 2 + 2, carY - car.height / 2 + 3, car.length, car.height, 6);
        ctx.fill();

        // Car Main Chassis
        ctx.fillStyle = car.color;
        ctx.beginPath();
        ctx.roundRect(car.x - car.length / 2, carY - car.height / 2, car.length, car.height, 6);
        ctx.fill();
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Car Windshield
        ctx.fillStyle = '#f8fafc';
        const windW = 10;
        const windX = car.speed > 0 ? car.x + 3 : car.x - 13;
        ctx.fillRect(windX, carY - car.height / 2 + 4, windW, car.height - 8);

        // Headlight lamps
        ctx.fillStyle = '#fef08a';
        if (car.speed > 0) {
          ctx.fillRect(car.x + car.length / 2 - 3, carY - 8, 3, 4);
          ctx.fillRect(car.x + car.length / 2 - 3, carY + 4, 3, 4);
        } else {
          ctx.fillRect(car.x - car.length / 2, carY - 8, 3, 4);
          ctx.fillRect(car.x - car.length / 2, carY + 4, 3, 4);
        }

        ctx.restore();
      });

      // 6. Update & Render Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;
        pt.alpha = Math.max(0, pt.life / 0.5);

        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (pt.life <= 0) {
          particles.splice(i, 1);
        }
      }

      // 7. Check collision with cars (with smooth collision response)
      if (isHitImmunity <= 0) {
        cars.forEach((car) => {
          const carY = car.lane === 1 ? 106 : 64;
          const hitX = Math.abs(car.x - currentX) < (car.length / 2 + 10);
          const hitY = Math.abs(carY - currentY) < 18;

          if (hitX && hitY) {
            sound.playPlayerHit();
            isHitImmunity = 0.8;
            currentLane = 0;
            targetY = laneYPositions[0];
            hopAnim = 1.2;
            emitPuff(currentX, currentY, '#ef4444');
            setErrorMsg('Glitch vehicle collision! Smoothly returned to sidewalk.');
            setTimeout(() => setErrorMsg(null), 1500);
          }
        });
      }

      // 8. Render Player Runner with Smooth Hop Bounce & Walking Rings
      ctx.save();
      const bounceOffset = Math.sin(hopAnim * Math.PI) * 5;
      const scaleX = 1.0 - Math.sin(hopAnim * Math.PI) * 0.15;
      const scaleY = 1.0 + Math.sin(hopAnim * Math.PI) * 0.25;

      ctx.translate(currentX, currentY - bounceOffset);
      ctx.scale(scaleX, scaleY);

      if (isHitImmunity > 0 && Math.floor(now / 80) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

      // Soft ground drop shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
      ctx.beginPath();
      ctx.ellipse(0, 10 + bounceOffset, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer sleek jet-black body
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner glowing core ring
      ctx.fillStyle = currentLane === 3 ? '#10b981' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      // Ambient aura ring
      ctx.strokeStyle = currentLane === 3 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(9, 9, 11, 0.2)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      if (!isSolvedRef.current) {
        animId = requestAnimationFrame(renderRunnerLoop);
      }
    };

    animId = requestAnimationFrame(renderRunnerLoop);

    return () => {
      window.removeEventListener('keydown', handleKey);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animId);
    };
  }, [challenge.type, isSolved]);

  // Catch The Cookies Canvas Loop
  useEffect(() => {
    if (challenge.type !== 'CATCH_THE_COOKIES' || isSolved) return;

    const canvas = catchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastT = performance.now();
    let basketX = canvas.width / 2;
    let caught = cookiesCaught;

    interface DroppingItem {
      x: number;
      y: number;
      speed: number;
      type: 'COOKIE' | 'BUG';
    }

    const items: DroppingItem[] = [
      { x: 70, y: 10, speed: 130, type: 'COOKIE' },
      { x: 190, y: -60, speed: 150, type: 'BUG' },
      { x: 290, y: -20, speed: 140, type: 'COOKIE' },
      { x: 380, y: -90, speed: 160, type: 'COOKIE' },
    ];

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      basketX = Math.max(30, Math.min(canvas.width - 30, (e.clientX - rect.left) * scaleX));
    };

    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        basketX = Math.max(30, basketX - 30);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        basketX = Math.min(canvas.width - 30, basketX + 30);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKey);

    const renderCatchLoop = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      const w = canvas.width;
      const h = canvas.height;

      // Inverted light background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, w, h);

      // Score bar
      ctx.fillStyle = '#09090b';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`COOKIES INGESTED: ${caught} / 5`, 15, 22);

      // Draw and update falling items
      items.forEach((item) => {
        item.y += item.speed * dt;

        if (item.y > h + 20) {
          item.y = -20;
          item.x = 40 + Math.random() * (w - 80);
          item.type = Math.random() > 0.35 ? 'COOKIE' : 'BUG';
        }

        // Check catch
        const basketY = h - 25;
        if (item.y >= basketY - 10 && item.y <= basketY + 15) {
          if (Math.abs(item.x - basketX) < 28) {
            if (item.type === 'COOKIE') {
              sound.playPickUpPowerUp();
              caught += 1;
              setCookiesCaught(caught);
              if (caught >= 5) {
                triggerSuccess(550);
              }
            } else {
              sound.playPlayerHit();
              caught = Math.max(0, caught - 1);
              setCookiesCaught(caught);
              setErrorMsg('Caught tracking bug! Lost 1 cookie.');
              setTimeout(() => setErrorMsg(null), 1200);
            }
            item.y = -20;
            item.x = 40 + Math.random() * (w - 80);
            item.type = Math.random() > 0.35 ? 'COOKIE' : 'BUG';
          }
        }

        // Draw item
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (item.type === 'COOKIE') {
          ctx.fillText('🍪', item.x, item.y);
        } else {
          ctx.fillText('👾', item.x, item.y);
        }
      });

      // Draw Basket in dark tone
      const bY = h - 20;
      ctx.save();
      ctx.fillStyle = '#09090b';
      ctx.fillRect(basketX - 25, bY - 8, 50, 16);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(basketX - 25, bY - 8, 50, 16);

      // Handle
      ctx.beginPath();
      ctx.arc(basketX, bY - 8, 16, Math.PI, 0);
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      if (!isSolvedRef.current) {
        animId = requestAnimationFrame(renderCatchLoop);
      }
    };

    animId = requestAnimationFrame(renderCatchLoop);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKey);
      cancelAnimationFrame(animId);
    };
  }, [challenge.type, isSolved, cookiesCaught]);

  // Memory Sequence Flashing
  const startMemorySequence = (seq: number[]) => {
    setIsShowingSequence(true);
    setUserSequence([]);

    seq.forEach((node, index) => {
      setTimeout(() => {
        setActiveMemoryLight(node);
        sound.playTone(300 + node * 120, 0.25);
        setTimeout(() => setActiveMemoryLight(null), 250);
      }, (index + 1) * 600);
    });

    const totalTime = (seq.length + 1) * 600;
    setTimeout(() => {
      setIsShowingSequence(false);
    }, totalTime);
  };

  useEffect(() => {
    if (challenge.type !== 'MEMORY_SEQUENCE' || !challenge.memorySequence || isSolved) return;
    const seq = challenge.memorySequence.sequence;
    startMemorySequence(seq);
  }, [challenge.type, challenge.memorySequence, isSolved]);

  const handleMemoryNodeClick = (nodeIndex: number) => {
    if (isShowingSequence || isSolved) return;
    sound.playTone(300 + nodeIndex * 120, 0.2);
    const nextSeq = [...userSequence, nodeIndex];
    setUserSequence(nextSeq);

    const targetSeq = challenge.memorySequence?.sequence || [];
    for (let i = 0; i < nextSeq.length; i++) {
      if (nextSeq[i] !== targetSeq[i]) {
        sound.playBuzzer();
        setErrorMsg('Incorrect sequence order! Resetting sequence.');
        setUserSequence([]);
        return;
      }
    }

    if (nextSeq.length === targetSeq.length) {
      triggerSuccess(550);
    }
  };

  // Whack-A-Bot
  const handleWhack = (holeIndex: number) => {
    if (isSolved) return;
    if (activeBotHoles.includes(holeIndex)) {
      sound.playWhack();
      const newHits = whackHits + 1;
      setWhackHits(newHits);

      setActiveBotHoles((prev) => {
        const next = prev.filter((h) => h !== holeIndex);
        while (next.length < 2) {
          const rand = Math.floor(Math.random() * 6);
          if (!next.includes(rand)) next.push(rand);
        }
        return next;
      });

      if (newHits >= 5) {
        triggerSuccess(550);
      }
    }
  };

  // Circuit Connect Check & Rotate Logic
  const isCircuitTileCorrect = (tile: CircuitTile) => {
    const norm = (tile.currentRotation % 360 + 360) % 360;
    return tile.correctRotations.includes(norm);
  };

  const isAllCircuitConnected = circuitTiles.every(isCircuitTileCorrect);

  const handleRotateCircuitTile = (tileId: number) => {
    if (isSolved) return;
    sound.playRotateClick();
    const nextTiles = circuitTiles.map((t) => {
      if (t.id === tileId) {
        const newRot = (t.currentRotation + 90) % 360;
        return { ...t, currentRotation: newRot };
      }
      return t;
    });
    setCircuitTiles(nextTiles);

    const allCorrect = nextTiles.every((t) => {
      const norm = (t.currentRotation % 360 + 360) % 360;
      return t.correctRotations.includes(norm);
    });

    if (allCorrect) {
      sound.playPowerUp();
      triggerSuccess(550);
    }
  };

  const handleAutoAlignCircuit = () => {
    if (isSolved) return;
    sound.playPowerUp();
    const alignedTiles = circuitTiles.map((t) => ({
      ...t,
      currentRotation: t.correctRotations[0],
    }));
    setCircuitTiles(alignedTiles);
    triggerSuccess(550);
  };

  // Laser Deflector Angle change
  const handleLaserAngleChange = (angle: number) => {
    if (isSolved) return;
    setLaserMirrorAngle(angle);
    const targetAngle = challenge.laserDeflector?.targetAngle || 45;
    if (Math.abs(angle - targetAngle) <= 6) {
      sound.playLaserPing();
      triggerSuccess(550);
    }
  };

  // Typing Challenge: String normalizer
  const normalizePhrase = (s: string) => s.trim().replace(/\s+/g, ' ').toUpperCase();

  const handleTypingChange = (val: string) => {
    if (isSolved) return;
    setTypedInput(val);
    sound.playTypeClack();
    const target = challenge.typingChallenge?.targetPhrase || '';
    if (normalizePhrase(val) === normalizePhrase(target)) {
      triggerSuccess(550);
    }
  };

  const handleTypingSubmit = () => {
    if (isSolved) return;
    const target = challenge.typingChallenge?.targetPhrase || '';
    if (normalizePhrase(typedInput) === normalizePhrase(target)) {
      triggerSuccess(550);
    } else {
      sound.playBuzzer();
      setErrorMsg('Phrase does not match yet! Check spelling or click auto-complete.');
    }
  };

  // Stroop Option Click
  const handleStroopOption = (isCorrect: boolean) => {
    if (isSolved) return;
    if (isCorrect) {
      triggerSuccess(550);
    } else {
      sound.playBuzzer();
      setErrorMsg('Incorrect ink color chosen! Observe the ink hue.');
    }
  };

  // Emoji Equation Answer Click
  const handleEmojiOption = (val: number) => {
    if (isSolved) return;
    setSelectedEmojiAnswer(val);
    const correct = challenge.emojiEquation?.correctAnswer;
    if (val === correct) {
      triggerSuccess(550);
    } else {
      sound.playBuzzer();
      setErrorMsg('Incorrect equation solution! Try calculating again.');
    }
  };

  // Pattern node click
  const handlePatternNodeClick = (nodeIndex: number) => {
    if (isSolved) return;

    const target = challenge.patternDraw?.targetPattern || [];
    const revTarget = [...target].reverse();

    if (drawnPattern.includes(nodeIndex)) {
      const idx = drawnPattern.indexOf(nodeIndex);
      setDrawnPattern(drawnPattern.slice(0, idx));
      sound.playRotateClick();
      setErrorMsg(null);
      return;
    }

    let expectedNext: number = target[0];
    if (drawnPattern.length === 0) {
      if (nodeIndex === target[0] || nodeIndex === revTarget[0]) {
        expectedNext = nodeIndex;
      } else {
        sound.playBuzzer();
        setErrorMsg(`Start at Node ${target[0] + 1} to begin!`);
        return;
      }
    } else {
      const isForward = drawnPattern.every((n, i) => n === target[i]);
      const isReverse = drawnPattern.every((n, i) => n === revTarget[i]);

      if (isForward && target[drawnPattern.length] !== undefined) {
        expectedNext = target[drawnPattern.length];
      } else if (isReverse && revTarget[drawnPattern.length] !== undefined) {
        expectedNext = revTarget[drawnPattern.length];
      } else {
        expectedNext = target[drawnPattern.length];
      }

      if (nodeIndex !== expectedNext) {
        sound.playBuzzer();
        setErrorMsg(`Next in sequence is Node ${expectedNext + 1}`);
        return;
      }
    }

    const next = [...drawnPattern, nodeIndex];
    setDrawnPattern(next);
    sound.playTone(320 + next.length * 60, 0.15);
    setErrorMsg(null);

    if (next.length === target.length) {
      triggerSuccess(550);
    }
  };

  // Select all matching helpers for Grid Select & Sliced Image
  const handleSelectAllGridTargets = () => {
    if (!challenge.grid) return;
    sound.playPowerUp();
    const targetIds = challenge.grid.filter((t) => t.isTarget).map((t) => t.id);
    setSelectedGridIds(targetIds);
  };

  const handleSelectAllSlicedTargets = () => {
    if (!challenge.slicedImage) return;
    sound.playPowerUp();
    const targetIds = challenge.slicedImage.targetIndices || [];
    setSelectedSlicedIds(targetIds);
  };

  // General Verification for Button-Confirmed Challenges
  const handleVerify = () => {
    if (isSolved) return;
    setIsVerifying(true);
    setErrorMsg(null);

    if (challenge.type === 'GRID_SELECT') {
      const correctIds = challenge.grid?.filter((t) => t.isTarget).map((t) => t.id) || [];
      const hasAllTargets =
        correctIds.length > 0 &&
        correctIds.every((id) => selectedGridIds.includes(id)) &&
        selectedGridIds.length === correctIds.length;

      if (hasAllTargets) {
        triggerSuccess(550);
      } else {
        sound.playBuzzer();
        setErrorMsg('Selection mismatch! Make sure all target squares are selected.');
        setIsVerifying(false);
      }
    } else if (challenge.type === 'SLICED_IMAGE') {
      const correctIds = challenge.slicedImage?.targetIndices || [];
      const isMatch =
        correctIds.length > 0 &&
        correctIds.every((id) => selectedSlicedIds.includes(id)) &&
        selectedSlicedIds.length === correctIds.length;

      if (isMatch) {
        triggerSuccess(550);
      } else {
        sound.playBuzzer();
        setErrorMsg('Selection mismatch! Ensure all target slice squares are chosen.');
        setIsVerifying(false);
      }
    } else if (challenge.type === 'SLIDER_PUZZLE') {
      const target = challenge.sliderPuzzle?.targetPosition || 50;
      const tolerance = challenge.sliderPuzzle?.tolerance || 6;
      if (Math.abs(sliderPos - target) <= tolerance) {
        triggerSuccess(550);
      } else {
        sound.playBuzzer();
        setErrorMsg('Puzzle key misaligned. Slide closer into the socket.');
        setIsVerifying(false);
      }
    } else if (challenge.type === 'ROTATION_PUZZLE') {
      const normAngle = (currentAngle % 360 + 360) % 360;
      if (normAngle === 0) {
        triggerSuccess(550);
      } else {
        sound.playBuzzer();
        setErrorMsg('Icon orientation not upright (0°). Rotate to verify.');
        setIsVerifying(false);
      }
    }
  };

  const isLaserAligned =
    challenge.type === 'LASER_DEFLECTOR' &&
    Math.abs(laserMirrorAngle - (challenge.laserDeflector?.targetAngle || 45)) <= 6;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 font-mono select-none">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-zinc-900 relative"
      >
        {/* Top Trigger Banner */}
        <div className="bg-zinc-100 px-4 py-2 border-b border-zinc-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-700 truncate font-medium">
            <span>{challenge.triggerIcon || '🛡️'}</span>
            <span className="truncate">{challenge.triggerReason || 'Firewall verification checkpoint.'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1 text-[11px] font-bold text-zinc-600 hover:text-zinc-950 px-2 py-0.5 rounded-md bg-zinc-200 transition-colors cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{showHint ? 'HIDE HINT' : 'HINT'}</span>
            </button>

            {/* Quick Fast-Pass button for zero-friction fail-safe */}
            <button
              type="button"
              onClick={() => triggerSuccess(200)}
              className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-zinc-800 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
              title="Quick Human Pass"
            >
              <FastForward className="w-3 h-3" />
              <span>PASS</span>
            </button>
          </div>
        </div>

        {/* Expandable Hint Banner */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-zinc-50 border-b border-zinc-200 px-4 py-2.5 overflow-hidden"
            >
              <div className="flex items-start gap-2 text-xs text-zinc-700 font-mono leading-relaxed">
                <HelpCircle className="w-4 h-4 text-zinc-950 flex-shrink-0 mt-0.5" />
                <p>{CAPTCHA_HINTS[challenge.type] || 'Analyze the puzzle carefully to verify human cognition.'}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Header */}
        <div className="bg-white px-5 py-3 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-mono font-extrabold text-sm text-zinc-950 uppercase tracking-wider">
                SECURITY VERIFICATION // {challenge.type.replace(/_/g, ' ')}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono font-medium">PROVE ORGANIC HUMAN COGNITION</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 border border-zinc-300 rounded-xl text-zinc-950 font-mono font-bold text-sm shadow-xs">
            <Clock className="w-4 h-4 text-zinc-600" />
            <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
          </div>
        </div>

        {/* Prompt Header */}
        <div className="px-5 pt-3 pb-1">
          <h4 className="font-extrabold text-base text-zinc-950 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-900 animate-pulse" />
            {challenge.prompt}
          </h4>
          {challenge.humorSubtitle && (
            <p className="text-xs text-zinc-500 mt-0.5 italic">{challenge.humorSubtitle}</p>
          )}
        </div>

        {/* Challenge Interactive Body */}
        <div className="px-5 py-3 flex-1 flex flex-col items-center justify-center min-h-[220px] relative">
          {/* 1. TRAFFIC RUNNER */}
          {challenge.type === 'TRAFFIC_RUNNER' && (
            <div className="w-full flex flex-col items-center gap-2.5">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-300 shadow-md">
                <canvas
                  ref={trafficCanvasRef}
                  width={440}
                  height={170}
                  className="bg-zinc-100 block cursor-pointer"
                />
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => {
                    const evt = new KeyboardEvent('keydown', { code: 'ArrowUp' });
                    window.dispatchEvent(evt);
                  }}
                  className="px-4 py-2 bg-zinc-950 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-zinc-800"
                >
                  <ArrowUp className="w-4 h-4" /> SPRINT FORWARD [W]
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => {
                    const evt = new KeyboardEvent('keydown', { code: 'ArrowDown' });
                    window.dispatchEvent(evt);
                  }}
                  className="px-3 py-2 bg-zinc-200 hover:bg-zinc-300 font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer text-zinc-800"
                >
                  <ArrowDown className="w-4 h-4" /> BACK [S]
                </motion.button>
              </div>
            </div>
          )}

          {/* 2. CATCH THE COOKIES */}
          {challenge.type === 'CATCH_THE_COOKIES' && (
            <div className="w-full flex flex-col items-center gap-2.5">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-300 shadow-md">
                <canvas
                  ref={catchCanvasRef}
                  width={440}
                  height={170}
                  className="bg-zinc-100 block cursor-crosshair"
                />
              </div>
              <div className="flex items-center justify-between w-full max-w-sm px-2 text-[11px] text-zinc-600 font-mono">
                <span>Move with <strong className="text-zinc-950">Mouse</strong> or <strong className="text-zinc-950">Arrow Keys</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setCookiesCaught((c) => {
                      const next = c + 1;
                      sound.playPickUpPowerUp();
                      if (next >= 5) triggerSuccess(550);
                      return next;
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-[10px] font-bold cursor-pointer hover:bg-zinc-800 shadow-xs"
                >
                  +1 🍪 CATCH
                </button>
              </div>
            </div>
          )}

          {/* 3. CIRCUIT CONNECT */}
          {challenge.type === 'CIRCUIT_CONNECT' && (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="relative p-4 bg-zinc-50 rounded-3xl border border-zinc-300 shadow-lg">
                <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-zinc-950 text-white font-bold font-mono text-[10px] flex items-center gap-1 shadow-md">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>POWER IN</span>
                </div>

                <div className="absolute -bottom-3 right-6 px-2.5 py-0.5 rounded-full bg-zinc-950 text-white font-bold font-mono text-[10px] flex items-center gap-1 shadow-md">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>BATTERY</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {circuitTiles.map((tile) => {
                    const isCorrect = isCircuitTileCorrect(tile);
                    return (
                      <motion.button
                        key={tile.id}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        onClick={() => handleRotateCircuitTile(tile.id)}
                        className={`w-24 h-24 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all group shadow-sm cursor-pointer border-2 ${
                          isCorrect
                            ? 'bg-zinc-100 border-zinc-950'
                            : 'bg-white border-zinc-300 hover:border-zinc-500'
                        }`}
                        title="Click to Rotate 90°"
                      >
                        <div
                          className="w-full h-full flex items-center justify-center transition-transform duration-300"
                          style={{ transform: `rotate(${tile.currentRotation}deg)` }}
                        >
                          <svg viewBox="0 0 96 96" className="w-full h-full">
                            {tile.type === 'straight' ? (
                              <>
                                <line
                                  x1="48"
                                  y1="0"
                                  x2="48"
                                  y2="96"
                                  stroke={isCorrect ? '#09090b' : '#94a3b8'}
                                  strokeWidth="10"
                                  strokeLinecap="round"
                                />
                                <line
                                  x1="48"
                                  y1="0"
                                  x2="48"
                                  y2="96"
                                  stroke={isCorrect ? '#3f3f46' : '#cbd5e1'}
                                  strokeWidth="4"
                                />
                              </>
                            ) : (
                              <>
                                <path
                                  d="M 48 0 L 48 48 L 96 48"
                                  fill="none"
                                  stroke={isCorrect ? '#09090b' : '#94a3b8'}
                                  strokeWidth="10"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <circle
                                  cx="48"
                                  cy="48"
                                  r="8"
                                  fill={isCorrect ? '#09090b' : '#94a3b8'}
                                />
                              </>
                            )}
                          </svg>
                        </div>

                        <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5 text-[9px] font-mono">
                          {isCorrect ? (
                            <span className="text-zinc-950 font-bold">✓ FLOW</span>
                          ) : (
                            <span className="text-zinc-500 group-hover:text-zinc-900">↻ 90°</span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isAllCircuitConnected) {
                      sound.playPowerUp();
                      triggerSuccess(550);
                    } else {
                      sound.playBuzzer();
                      setErrorMsg('Circuit incomplete! Keep rotating tiles.');
                      setTimeout(() => setErrorMsg(null), 1600);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-mono text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>CONNECT ENERGY</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoAlignCircuit}
                  className="px-3 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 border border-zinc-300 font-mono text-xs font-bold text-zinc-800 shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>AUTO-ALIGN</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. LASER DEFLECTOR */}
          {challenge.type === 'LASER_DEFLECTOR' && (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="w-full max-w-sm h-40 bg-zinc-100 border border-zinc-300 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10">
                  <div className="w-6 h-6 rounded-full bg-zinc-950 text-white font-black text-[10px] flex items-center justify-center">
                    ⚡
                  </div>
                  <span className="text-[9px] font-mono text-zinc-600 font-bold">EMITTER</span>
                </div>

                <div className="absolute right-4 top-4 flex flex-col items-center gap-1 z-10">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center text-base font-mono transition-all ${
                      isLaserAligned
                        ? 'border-zinc-950 bg-zinc-200 text-zinc-950 shadow-sm'
                        : 'border-zinc-300 bg-white text-zinc-400'
                    }`}
                  >
                    🎯
                  </div>
                  <span className={`text-[9px] font-mono font-bold ${isLaserAligned ? 'text-zinc-950' : 'text-zinc-500'}`}>
                    {isLaserAligned ? '✓ LOCKED' : 'TARGET'}
                  </span>
                </div>

                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line
                    x1="28"
                    y1="80"
                    x2="190"
                    y2="80"
                    stroke="#09090b"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {(() => {
                    const rad = (laserMirrorAngle * 2 * Math.PI) / 180;
                    const endX = 190 + Math.sin(rad) * 160;
                    const endY = 80 - Math.cos(rad) * 160;
                    return (
                      <line
                        x1="190"
                        y1="80"
                        x2={endX}
                        y2={endY}
                        stroke={isLaserAligned ? '#09090b' : '#94a3b8'}
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    );
                  })()}
                </svg>

                <div
                  className="w-16 h-3.5 bg-zinc-950 border border-zinc-700 rounded shadow-md z-20"
                  style={{ transform: `rotate(${laserMirrorAngle}deg)` }}
                />
              </div>

              <div className="w-full max-w-sm flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-600 font-bold">MIRROR ANGLE:</span>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={laserMirrorAngle}
                  onChange={(e) => handleLaserAngleChange(Number(e.target.value))}
                  className="flex-1 accent-zinc-950 h-2 bg-zinc-200 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-mono text-zinc-950 font-bold w-10 text-right">
                  {laserMirrorAngle}°
                </span>
              </div>
            </div>
          )}

          {/* 5. COLOR STROOP TEST */}
          {challenge.type === 'COLOR_STROOP_TEST' && challenge.colorStroop && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="px-8 py-4 bg-zinc-100 border border-zinc-300 rounded-2xl shadow-sm">
                <span
                  className="text-4xl font-black font-mono tracking-wider select-none"
                  style={{ color: challenge.colorStroop.displayColor }}
                >
                  {challenge.colorStroop.word}
                </span>
              </div>

              <div className="flex flex-wrap justify-center gap-2.5 max-w-xs">
                {challenge.colorStroop.options.map((opt) => (
                  <motion.button
                    key={opt.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => handleStroopOption(opt.isCorrect)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-950 font-mono text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.color }} />
                    <span>{opt.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* 6. TYPING SPEED CHALLENGE */}
          {challenge.type === 'TYPING_CHALLENGE' && challenge.typingChallenge && (
            <div className="w-full flex flex-col items-center gap-3 max-w-sm">
              <div className="w-full p-3 bg-zinc-100 border border-zinc-300 rounded-xl text-center font-mono text-sm text-zinc-950 font-bold tracking-wider shadow-xs">
                "{challenge.typingChallenge.targetPhrase}"
              </div>

              <div className="w-full flex gap-2">
                <input
                  ref={typingInputRef}
                  type="text"
                  value={typedInput}
                  onChange={(e) => handleTypingChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTypingSubmit()}
                  placeholder="Type verification phrase..."
                  className="flex-1 px-3 py-2 bg-white border border-zinc-300 rounded-xl font-mono text-xs text-zinc-950 focus:outline-none focus:border-zinc-950 shadow-xs"
                />
                <button
                  type="button"
                  onClick={handleTypingSubmit}
                  className="px-4 py-2 bg-zinc-950 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-zinc-800 shadow-sm"
                >
                  SUBMIT
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleTypingChange(challenge.typingChallenge!.targetPhrase)}
                className="text-[11px] text-zinc-600 hover:text-zinc-950 font-mono underline cursor-pointer"
              >
                Auto-complete Phrase
              </button>
            </div>
          )}

          {/* 7. EMOJI LOGIC EQUATION */}
          {challenge.type === 'EMOJI_EQUATION' && challenge.emojiEquation && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="p-4 bg-zinc-100 border border-zinc-300 rounded-2xl text-center font-mono text-base text-zinc-950 whitespace-pre-line leading-relaxed shadow-xs">
                {challenge.emojiEquation.equation}
              </div>

              <div className="flex gap-3">
                {challenge.emojiEquation.options.map((opt) => (
                  <motion.button
                    key={opt}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    type="button"
                    onClick={() => handleEmojiOption(opt)}
                    className={`w-14 h-14 rounded-2xl font-bold font-mono text-xl flex items-center justify-center shadow-md transition-all cursor-pointer ${
                      selectedEmojiAnswer === opt
                        ? 'bg-zinc-950 text-white border border-zinc-950'
                        : 'bg-white border border-zinc-300 text-zinc-950 hover:bg-zinc-100'
                    }`}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* 8. WHACK-A-BOT */}
          {challenge.type === 'WHACK_A_BOT' && (
            <div className="w-full flex flex-col items-center gap-2">
              <div className="grid grid-cols-3 gap-3 p-3 bg-zinc-100 rounded-2xl border border-zinc-300">
                {[0, 1, 2, 3, 4, 5].map((hole) => {
                  const hasBot = activeBotHoles.includes(hole);
                  return (
                    <motion.button
                      key={hole}
                      whileHover={hasBot ? { scale: 1.08 } : undefined}
                      whileTap={{ scale: 0.92 }}
                      type="button"
                      onClick={() => handleWhack(hole)}
                      className={`w-20 h-20 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                        hasBot
                          ? 'bg-white border-zinc-950 text-zinc-950 shadow-md'
                          : 'bg-zinc-200 border-zinc-300 opacity-60'
                      }`}
                    >
                      {hasBot ? (
                        <span className="text-3xl">🤖</span>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-zinc-300" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
              <p className="text-xs font-mono text-zinc-950 font-bold">
                HITS: {whackHits} / 5 BOTS
              </p>
            </div>
          )}

          {/* 9. MEMORY SEQUENCE */}
          {challenge.type === 'MEMORY_SEQUENCE' && challenge.memorySequence && (
            <div className="flex flex-col items-center gap-3">
              <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-100 rounded-2xl border border-zinc-300">
                {[0, 1, 2, 3].map((node) => {
                  const isLit = activeMemoryLight === node;
                  return (
                    <motion.button
                      key={node}
                      whileHover={!isShowingSequence ? { scale: 1.05 } : undefined}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      disabled={isShowingSequence}
                      onClick={() => handleMemoryNodeClick(node)}
                      className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center font-mono font-bold text-xl transition-all cursor-pointer ${
                        isLit
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-xl'
                          : 'bg-white border-zinc-300 text-zinc-800 hover:border-zinc-500'
                      }`}
                    >
                      PAD {node + 1}
                    </motion.button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={isShowingSequence}
                onClick={() => startMemorySequence(challenge.memorySequence?.sequence || [])}
                className="px-3.5 py-1.5 bg-zinc-200 hover:bg-zinc-300 border border-zinc-300 rounded-xl text-xs font-mono text-zinc-800 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isShowingSequence ? 'animate-spin' : ''}`} />
                <span>REPLAY SEQUENCE</span>
              </button>
            </div>
          )}

          {/* 10. PATTERN DRAW */}
          {challenge.type === 'PATTERN_DRAW' && challenge.patternDraw && (
            <div className="flex flex-col items-center gap-3">
              <div className="grid grid-cols-3 gap-3 p-3 bg-zinc-100 rounded-2xl border border-zinc-300">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((node) => {
                  const isConnected = drawnPattern.includes(node);
                  const stepIndex = drawnPattern.indexOf(node);
                  const isNextStep =
                    drawnPattern.length < challenge.patternDraw!.targetPattern.length &&
                    challenge.patternDraw!.targetPattern[drawnPattern.length] === node;

                  return (
                    <motion.button
                      key={node}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      type="button"
                      onClick={() => handlePatternNodeClick(node)}
                      className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                        isConnected
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                          : isNextStep
                          ? 'bg-zinc-200 border-zinc-800 text-zinc-950 animate-pulse'
                          : 'bg-white border-zinc-300 text-zinc-600 hover:border-zinc-500'
                      }`}
                    >
                      <span className="text-xs font-mono font-bold">{node + 1}</span>
                      {isConnected && (
                        <span className="text-[9px] font-mono font-bold text-zinc-300">
                          #{stepIndex + 1}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              <p className="text-[11px] font-mono text-zinc-600">
                Nodes Connected: {drawnPattern.length} / {challenge.patternDraw.targetPattern.length}
              </p>
            </div>
          )}

          {/* 11. GRID SELECT (BUS & TRAFFIC FIX WITH INSTANT SELECT ALL HELPER) */}
          {challenge.type === 'GRID_SELECT' && challenge.grid && (
            <div className="flex flex-col items-center gap-2.5 w-full max-w-sm">
              <div className="grid grid-cols-3 gap-2 p-2 bg-zinc-100 rounded-2xl border border-zinc-300 w-full">
                {challenge.grid.map((item) => {
                  const isSelected = selectedGridIds.includes(item.id);
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => {
                        sound.playShoot();
                        setSelectedGridIds((prev) =>
                          isSelected ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                        );
                      }}
                      className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center relative p-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-zinc-950 bg-zinc-200 shadow-md'
                          : 'border-zinc-300 bg-white hover:border-zinc-400'
                      }`}
                    >
                      <span className="text-3xl mb-1">
                        {item.imageType === 'traffic_light' && '🚦'}
                        {item.imageType === 'crosswalk' && '🦓'}
                        {item.imageType === 'bicycle' && '🚲'}
                        {item.imageType === 'hydrant' && '🧯'}
                        {item.imageType === 'car' && '🚗'}
                        {item.imageType === 'bus' && '🚌'}
                        {item.imageType === 'cat' && '🐱'}
                        {item.imageType === 'tree' && '🌳'}
                        {item.imageType === 'firewall' && '🛡️'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-950 uppercase truncate max-w-full font-bold">
                        {item.imageType.replace('_', ' ')}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5">
                          <CheckCircle2 className="w-4 h-4 text-zinc-950" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Quick Select All Matching Helper */}
              <button
                type="button"
                onClick={handleSelectAllGridTargets}
                className="text-[11px] font-mono text-zinc-600 hover:text-zinc-950 flex items-center gap-1 cursor-pointer underline font-bold"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Select all matching squares</span>
              </button>
            </div>
          )}

          {/* 12. SLICED IMAGE (BUS ON STREET FIX WITH CLEAR LABELS & ICONS) */}
          {challenge.type === 'SLICED_IMAGE' && challenge.slicedImage && (
            <div className="flex flex-col items-center gap-2.5 w-full max-w-md">
              <div className="grid grid-cols-4 gap-1.5 p-2 bg-zinc-100 rounded-2xl border border-zinc-300 w-full">
                {challenge.slicedImage.tiles.map((tile) => {
                  const isSelected = selectedSlicedIds.includes(tile.id);
                  return (
                    <motion.button
                      key={tile.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        sound.playShoot();
                        setSelectedSlicedIds((prev) =>
                          isSelected ? prev.filter((id) => id !== tile.id) : [...prev, tile.id]
                        );
                      }}
                      className={`h-16 border-2 rounded-xl flex flex-col items-center justify-center p-1 relative transition-all cursor-pointer ${
                        isSelected
                          ? 'border-zinc-950 bg-zinc-200 shadow-md'
                          : 'border-zinc-300 bg-white hover:border-zinc-400'
                      }`}
                    >
                      <span className="text-xl">
                        {tile.icon || (challenge.slicedImage?.theme === 'BUS_ON_STREET' ? '🚌' : '🚦')}
                      </span>
                      <span className="text-[8px] font-mono text-zinc-800 uppercase truncate max-w-full font-bold">
                        {tile.label || `Slice ${tile.id + 1}`}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Quick Select All Target Slices Helper */}
              <button
                type="button"
                onClick={handleSelectAllSlicedTargets}
                className="text-[11px] font-mono text-zinc-600 hover:text-zinc-950 flex items-center gap-1 cursor-pointer underline font-bold"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Select all target slices ({challenge.slicedImage.targetIndices.length} pieces)</span>
              </button>
            </div>
          )}

          {/* 13. SLIDER PUZZLE */}
          {challenge.type === 'SLIDER_PUZZLE' && challenge.sliderPuzzle && (
            <div className="w-full flex flex-col items-center gap-4 py-2 max-w-sm">
              <div className="w-full h-24 bg-zinc-100 border border-zinc-300 rounded-2xl relative overflow-hidden flex items-center shadow-inner">
                <div
                  className="absolute top-4 w-14 h-16 border-2 border-dashed border-zinc-950 bg-zinc-200 rounded-xl flex items-center justify-center text-xs font-mono text-zinc-950 font-bold"
                  style={{ left: `${challenge.sliderPuzzle.targetPosition}%` }}
                >
                  SLOT
                </div>

                <div
                  className="absolute top-4 w-14 h-16 bg-zinc-950 text-white border-2 border-zinc-800 rounded-xl shadow-lg flex items-center justify-center font-black transition-all"
                  style={{ left: `${sliderPos}%` }}
                >
                  KEY
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="85"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="w-full accent-zinc-950 h-2 bg-zinc-200 rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* 14. ROTATION PUZZLE */}
          {challenge.type === 'ROTATION_PUZZLE' && challenge.rotationPuzzle && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-28 h-28 bg-zinc-100 border border-zinc-300 rounded-full flex items-center justify-center relative shadow-inner">
                <span
                  className="text-5xl transition-transform duration-300 select-none"
                  style={{ transform: `rotate(${currentAngle}deg)` }}
                >
                  {challenge.rotationPuzzle.icon}
                </span>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    sound.playRotateClick();
                    setCurrentAngle((prev) => (prev - 90 + 360) % 360);
                  }}
                  className="px-3.5 py-2 bg-zinc-200 hover:bg-zinc-300 font-mono text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer text-zinc-800"
                >
                  <RotateCcw className="w-4 h-4" /> -90°
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playRotateClick();
                    setCurrentAngle((prev) => (prev + 90) % 360);
                  }}
                  className="px-4 py-2 bg-zinc-950 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1 shadow-md cursor-pointer hover:bg-zinc-800"
                >
                  <RotateCw className="w-4 h-4" /> +90° ROTATE
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 flex items-center gap-1.5 text-xs text-red-600 font-mono font-bold text-center bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Solved Celebration Overlay */}
          <AnimatePresence>
            {isSolved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 bg-white/98 rounded-2xl flex flex-col items-center justify-center gap-2 p-4 text-center border border-zinc-950"
              >
                <div className="w-14 h-14 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h3 className="font-mono font-extrabold text-lg text-zinc-950 tracking-wider">
                  HUMAN VERIFIED!
                </h3>
                <p className="text-xs font-mono text-zinc-600 max-w-xs">
                  CAPTCHA Solved • Protocol Authenticated
                </p>

                <div className="mt-1 flex items-center gap-1.5 px-3 py-1 bg-zinc-100 border border-zinc-300 rounded-xl text-xs font-mono text-zinc-950 font-bold">
                  <Award className="w-4 h-4 text-zinc-900" />
                  <span>+18% BATTERY & SPEED BOOST APPLIED</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="bg-zinc-50 px-5 py-3 border-t border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-600 font-bold">
            <RefreshCw className="w-3 h-3 text-zinc-950" />
            <span>REWARD: +18% BATTERY & SPEED</span>
          </div>

          <div className="flex gap-2">
            {['GRID_SELECT', 'SLICED_IMAGE', 'SLIDER_PUZZLE', 'ROTATION_PUZZLE'].includes(
              challenge.type
            ) && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleVerify}
                disabled={isVerifying || isSolved}
                className="px-5 py-2 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-extrabold font-mono text-xs rounded-xl shadow-md cursor-pointer transition-all"
              >
                VERIFY HUMANITY
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
