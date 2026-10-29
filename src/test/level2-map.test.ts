import { describe, expect, it } from 'vitest';
import { hasImageBackground, imageToLevel2World, isL2Blocked, level2GateCenter } from '../../game-src/src/game/level2Map';

describe('Level-specific scenery', () => {
  it('restricts custom scenery to Levels 1, 2 and 3', () => {
    expect(hasImageBackground('STAGE_1_CROSSWALK')).toBe(true);
    expect(hasImageBackground('STAGE_2_SPAM_GRID')).toBe(true);
    expect(hasImageBackground('STAGE_3_DISTORTION')).toBe(true);
    expect(hasImageBackground('STAGE_BOSS')).toBe(false);
  });
  it('blocks a rock but leaves ground and all six road gates walkable', () => {
    const rock = imageToLevel2World(285, 490);
    expect(isL2Blocked(rock.x, rock.y)).toBe(true);
    const ground = imageToLevel2World(500, 250);
    expect(isL2Blocked(ground.x, ground.y)).toBe(false);
    for (let i = 0; i < 6; i++) {
      const gate = level2GateCenter(i);
      for (const dx of [-75, 0, 75]) for (const dy of [-32.5, 0, 32.5]) {
        expect(isL2Blocked(gate.x + dx, gate.y + dy)).toBe(false);
      }
    }
    expect(isL2Blocked(120, 1360)).toBe(false);
  });
});