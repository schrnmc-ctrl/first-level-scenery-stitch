import runImage from '../assets/virus-run.png.asset.json';
import attackImage from '../assets/virus-attack.png.asset.json';

// Level 1 Virus enemy: browser-safe rules shared by the engine, renderer and tests.
export const VIRUS_IMAGES = { run: runImage.url, attack: attackImage.url };
export const VIRUS_HEIGHT = 48; // running image is scaled to 48 px tall
export const VIRUS_WIDTH = 48; // trimmed running art is roughly square
export const VIRUS_SPEED = 90;
export const VIRUS_MAX = 6;
export const VIRUS_MIN_SPAWN_DISTANCE = 200;
export const VIRUS_ATTACK_RANGE = 200;
export const VIRUS_ATTACK_COOLDOWN = 2;
export const VIRUS_WARNING = 0.4;
export const VIRUS_STRIKE = 0.1;
export const VIRUS_RECOVER = 0.4;
export const VIRUS_BALL_SPEED = 220;
export const VIRUS_BALL_RADIUS = 6; // 12 px wide
export const VIRUS_BALL_LIFE = 2;
export const VIRUS_BALL_COLOR = '#5ee7ff'; // the robot's glowing cyan
export const VIRUS_FLASH = 0.15;
export const VIRUS_HIT_IMMUNITY = 0.3;
export const VIRUS_SMOKE_SECONDS = 0.5;

export type VirusPhase = 'move' | 'warning' | 'strike' | 'recover';
export interface VirusState {
  phase: VirusPhase;
  phaseTimer: number;
  cooldown: number;
  flashTimer: number;
  hitImmunity: number;
  facingLeft: boolean;
  moving: boolean;
  age: number;
}

export function createVirusState(): VirusState {
  return { phase: 'move', phaseTimer: 0, cooldown: 0, flashTimer: 0, hitImmunity: 0, facingLeft: false, moving: false, age: 0 };
}

// Body-only hitbox: 40% wide, 70% tall, resting on the feet point (x, y).
export function virusBox(x: number, y: number) {
  const w = VIRUS_WIDTH * 0.4;
  const h = VIRUS_HEIGHT * 0.7;
  return { left: x - w / 2, right: x + w / 2, top: y - h, bottom: y, cx: x, cy: y - h / 2, w, h };
}

/** Advances the attack steps; returns true on the frame the ball must be fired. */
export function stepVirusAttack(v: VirusState, dt: number, heroDistance: number): boolean {
  v.cooldown = Math.max(0, v.cooldown - dt);
  if (v.phase === 'move') {
    if (heroDistance <= VIRUS_ATTACK_RANGE && v.cooldown <= 0) {
      v.phase = 'warning'; v.phaseTimer = 0; v.cooldown = VIRUS_ATTACK_COOLDOWN;
    }
    return false;
  }
  v.phaseTimer += dt;
  if (v.phase === 'warning' && v.phaseTimer >= VIRUS_WARNING) {
    v.phase = 'strike'; v.phaseTimer = 0;
    return true;
  }
  if (v.phase === 'strike' && v.phaseTimer >= VIRUS_STRIKE) { v.phase = 'recover'; v.phaseTimer = 0; }
  else if (v.phase === 'recover' && v.phaseTimer >= VIRUS_RECOVER) { v.phase = 'move'; v.phaseTimer = 0; }
  return false;
}

// Hop while moving (6 px, 4 per second); gentle 3 px bob over 1.2 s while still.
export function virusLift(v: Pick<VirusState, 'moving' | 'age'>): number {
  if (v.moving) return 6 * Math.abs(Math.sin(v.age * Math.PI * 4));
  return 1.5 - 1.5 * Math.cos(v.age * Math.PI * 2 / 1.2);
}

export function usesAttackImage(phase: VirusPhase): boolean {
  return phase === 'warning' || phase === 'strike';
}

// Trimmed sprite data: smallest visible box plus the feet midpoint inside it.
export interface TrimmedSprite { canvas: HTMLCanvasElement; width: number; height: number; footX: number }

export function findTrim(alpha: (x: number, y: number) => number, width: number, height: number) {
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (alpha(x, y) > 16) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  if (maxX < 0) return { minX: 0, minY: 0, w: width, h: height, footX: width / 2 };
  const h = maxY - minY + 1;
  // Feet: lowest 12% of the visible rows, middle of their left-most and right-most pixels.
  const footTop = maxY - Math.max(1, Math.round(h * 0.12)) + 1;
  let fMin = width, fMax = -1;
  for (let y = footTop; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    if (alpha(x, y) > 16) { if (x < fMin) fMin = x; if (x > fMax) fMax = x; }
  }
  return { minX, minY, w: maxX - minX + 1, h, footX: (fMin + fMax) / 2 - minX };
}

export function trimSprite(image: HTMLImageElement): TrimmedSprite {
  const src = document.createElement('canvas');
  src.width = image.naturalWidth; src.height = image.naturalHeight;
  const sctx = src.getContext('2d');
  if (!sctx) throw new Error('Sprite canvas is unavailable');
  sctx.drawImage(image, 0, 0);
  const data = sctx.getImageData(0, 0, src.width, src.height).data;
  const t = findTrim((x, y) => data[(y * src.width + x) * 4 + 3] ?? 0, src.width, src.height);
  const canvas = document.createElement('canvas');
  canvas.width = t.w; canvas.height = t.h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Sprite canvas is unavailable');
  ctx.drawImage(src, t.minX, t.minY, t.w, t.h, 0, 0, t.w, t.h);
  return { canvas, width: t.w, height: t.h, footX: t.footX };
}
