import { describe, expect, it } from 'vitest';
import { backgroundUrl, imageToWorld, isSceneryBlocked, sceneryGateCenter } from '../../game-src/src/game/levelScenery';
import level1 from '../../game-src/src/assets/level1-replacement.jpg.asset.json';
import level2 from '../../game-src/src/assets/level2-replacement.jpg.asset.json';
import level3 from '../../game-src/src/assets/level3-bg.jpg.asset.json';

describe('Replacement scenery isolation', () => {
  it('uses the Level 1 replacement only on Level 1', () => {
    expect(backgroundUrl('STAGE_1_CROSSWALK')).toBe(level1.url);
    expect(backgroundUrl('STAGE_2_SPAM_GRID')).not.toBe(level1.url);
    expect(backgroundUrl('STAGE_3_DISTORTION')).not.toBe(level1.url);
  });
  it('uses the Level 2 replacement only on Level 2', () => {
    expect(backgroundUrl('STAGE_2_SPAM_GRID')).toBe(level2.url);
    expect(backgroundUrl('STAGE_1_CROSSWALK')).not.toBe(level2.url);
    expect(backgroundUrl('STAGE_3_DISTORTION')).not.toBe(level2.url);
  });
  it('uses the Level 3 image only on Level 3', () => {
    expect(backgroundUrl('STAGE_3_DISTORTION')).toBe(level3.url);
    expect(backgroundUrl('STAGE_BOSS')).toBeUndefined();
    expect(backgroundUrl('ENDLESS')).toBeUndefined();
  });
  for (const stage of ['STAGE_1_CROSSWALK', 'STAGE_2_SPAM_GRID', 'STAGE_3_DISTORTION']) {
    it(`${stage} keeps its gate areas walkable`, () => {
      for (let i = 0; i < 6; i++) {
        const gate = sceneryGateCenter(stage, i);
        for (const dx of [-75, 0, 75]) for (const dy of [-32.5, 0, 32.5]) {
          expect(isSceneryBlocked(stage, gate.x + dx, gate.y + dy)).toBe(false);
        }
      }
    });
  }
  it('blocks replacement-map objects while leaving open ground clear', () => {
    for (const [stage, x, y] of [['STAGE_1_CROSSWALK', 920, 277], ['STAGE_2_SPAM_GRID', 674, 150], ['STAGE_3_DISTORTION', 510, 275]] as const) {
      const p = imageToWorld(x, y);
      expect(isSceneryBlocked(stage, p.x, p.y)).toBe(true);
      const ground = imageToWorld(310, 275);
      expect(isSceneryBlocked(stage, ground.x, ground.y)).toBe(false);
    }
  });
});