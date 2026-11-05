import type { Player } from '../types';
import { CANVAS_HEIGHT } from './constants';
import idle from '../assets/hero-idle.png.asset.json';
import runA from '../assets/hero-run-a.png.asset.json';
import runB from '../assets/hero-run-b.png.asset.json';

// Preserve gameplay dimensions: 64 pixels on a 450-high view scales proportionally.
export const HERO_HEIGHT = 64 * CANVAS_HEIGHT / 450;
export const HERO_WIDTH = HERO_HEIGHT * 445 / 393;
export const HERO_HITBOX_SCALE = 0.7;
export const HERO_LIVES = 3;
export const HERO_IMMUNITY_SECONDS = 1;
export const HERO_IMAGES = { idle: idle.url, runA: runA.url, runB: runB.url };

// The player position is the body center; the lower edge stays fixed while drawing.
export function heroBox(player: Pick<Player, 'x' | 'y' | 'width' | 'height'>) {
  const halfWidth = player.width * HERO_HITBOX_SCALE / 2;
  const halfHeight = player.height * HERO_HITBOX_SCALE / 2;
  return { left: player.x - halfWidth, right: player.x + halfWidth,
    top: player.y - halfHeight, bottom: player.y + halfHeight };
}

export function heroOverlapsBox(player: Player, x: number, y: number, width: number, height: number) {
  const box = heroBox(player);
  return box.left < x + width / 2 && box.right > x - width / 2 &&
    box.top < y + height / 2 && box.bottom > y - height / 2;
}

export function heroOverlapsCircle(player: Player, x: number, y: number, radius: number) {
  const box = heroBox(player);
  const closestX = Math.max(box.left, Math.min(box.right, x));
  const closestY = Math.max(box.top, Math.min(box.bottom, y));
  return (x - closestX) ** 2 + (y - closestY) ** 2 < radius ** 2;
}

// One shared damage rule covers hazards, projectiles, lasers and the H test key.
export function takeHeroHit(player: Player): boolean {
  if (player.lives <= 0 || player.invincibleTimer > 0) return false;
  player.lives -= 1;
  player.invincibleTimer = HERO_IMMUNITY_SECONDS;
  return true;
}