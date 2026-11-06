import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../game-src/src/audio/soundEffects', () => ({ sound: new Proxy({}, { get: () => vi.fn(), set: () => true }) }));
import { GameEngine } from '../../game-src/src/game/GameEngine';
import { HERO_HEIGHT, HERO_WIDTH, heroBox, heroOverlapsBox, heroOverlapsCircle } from '../../game-src/src/game/hero';
import { CANVAS_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT } from '../../game-src/src/game/constants';
import { imageToWorld, isSceneryBlocked } from '../../game-src/src/game/levelScenery';

describe('Hero rules', () => {
  let engine;
  beforeEach(() => { engine = new GameEngine(); engine.gameState = 'PLAYING'; });
  it('starts with 3 lives and resets them for a new game', () => {
    expect(engine.player.lives).toBe(3);
    engine.hitHero(); engine.resetGame();
    expect(engine.player.lives).toBe(3);
  });
  it('removes one life per hit and ignores hits for exactly 1 second', () => {
    expect(engine.hitHero()).toBe(true);
    expect(engine.player.lives).toBe(2);
    expect(engine.player.invincibleTimer).toBe(1);
    expect(engine.hitHero()).toBe(false);
    engine.update(0.99);
    expect(engine.hitHero()).toBe(false);
    engine.update(0.011);
    expect(engine.hitHero()).toBe(true);
    expect(engine.player.lives).toBe(1);
  });
  it('uses the existing game-over state after the third hit', () => {
    for (let i = 0; i < 3; i++) { engine.player.invincibleTimer = 0; engine.hitHero(); }
    expect(engine.player.lives).toBe(0);
    expect(engine.gameState).toBe('GAME_OVER');
    expect(engine.hitHero()).toBe(false);
  });
  it('does not apply test hits outside active gameplay', () => {
    engine.gameState = 'PAUSED'; expect(engine.hitHero()).toBe(false);
    expect(engine.player.lives).toBe(3);
  });
  it('moves at 240 pixels per second with WASD including normalized diagonals', () => {
    const start = imageToWorld(450, 280);
    Object.assign(engine.player, start); engine.captchaGraceTimer = 10;
    engine.keys.KeyD = true; engine.update(0.04);
    expect(engine.player.speed).toBe(240);
    expect(engine.player.x - start.x).toBeCloseTo(9.6);
    Object.assign(engine.player, start); engine.keys.KeyW = true; engine.update(0.04);
    expect(Math.hypot(engine.player.x - start.x, engine.player.y - start.y)).toBeCloseTo(9.6);
  });
  it('scales to 64 pixels relative to a 450-high view while preserving proportions', () => {
    expect(HERO_HEIGHT * 450 / CANVAS_HEIGHT).toBe(64);
    expect(HERO_WIDTH / HERO_HEIGHT).toBeCloseTo(445 / 393);
  });
  it('uses a centered 70% box and excludes empty edges from hits', () => {
    Object.assign(engine.player, { x: 100, y: 100, width: 100, height: 100 });
    expect(heroBox(engine.player)).toEqual({ left: 65, right: 135, top: 65, bottom: 135 });
    expect(heroOverlapsBox(engine.player, 145, 100, 10, 10)).toBe(false);
    expect(heroOverlapsBox(engine.player, 130, 100, 10, 10)).toBe(true);
    expect(heroOverlapsCircle(engine.player, 145, 100, 5)).toBe(false);
    expect(heroOverlapsCircle(engine.player, 134, 100, 5)).toBe(true);
  });
  it('keeps existing spawn points and respects scenery and playable bounds', () => {
    const spawn = { x: engine.player.x, y: engine.player.y };
    engine.resetGame(); expect({ x: engine.player.x, y: engine.player.y }).toEqual(spawn);
    const start = imageToWorld(890, 277);
    Object.assign(engine.player, start); engine.keys.KeyD = true; engine.captchaGraceTimer = 10;
    for (let i = 0; i < 25; i++) engine.update(0.04);
    expect(engine.player.x).toBeLessThan(start.x + 240);
    expect(isSceneryBlocked(engine.stage, engine.player.x, engine.player.y)).toBe(false);
    expect(heroBox(engine.player).right).toBeLessThanOrEqual(WORLD_WIDTH - 18);
    expect(heroBox(engine.player).bottom).toBeLessThanOrEqual(WORLD_HEIGHT - 18);
  });
});