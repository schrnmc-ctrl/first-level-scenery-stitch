import { WORLD_WIDTH, WORLD_HEIGHT } from './constants';
import level1 from '../assets/level1-replacement.jpg.asset.json';
import level2 from '../assets/level2-replacement.jpg.asset.json';
import level3 from '../assets/level3-bg.jpg.asset.json';

export const LEVEL1_STAGE = 'STAGE_1_CROSSWALK';
export const LEVEL2_STAGE = 'STAGE_2_SPAM_GRID';
export const LEVEL3_STAGE = 'STAGE_3_DISTORTION';
export function backgroundUrl(stage: string): string | undefined {
  if (stage === LEVEL1_STAGE) return level1.url;
  if (stage === LEVEL2_STAGE) return level2.url;
  if (stage === LEVEL3_STAGE) return level3.url;
  return undefined;
}
export function hasImageBackground(stage: string): boolean {
  return backgroundUrl(stage) !== undefined;
}

// Trace in a common 1024 × 572 source space; renderer uses the same cover transform.
type Point = [number, number];
const scale = Math.max(WORLD_WIDTH / 1024, WORLD_HEIGHT / 572);
const offsetX = (1024 * scale - WORLD_WIDTH) / 2;
const offsetY = (572 * scale - WORLD_HEIGHT) / 2;
export function imageToWorld(x: number, y: number) {
  return { x: x * scale - offsetX, y: y * scale - offsetY };
}
const solids: Record<string, Point[][]> = {
  [LEVEL1_STAGE]: [
    [[0,0],[1024,0],[1024,47],[0,47]],
    [[0,527],[1024,527],[1024,572],[0,572]],
    [[0,0],[43,0],[43,572],[0,572]],
    [[979,0],[1024,0],[1024,572],[979,572]],
    [[45,48],[282,48],[282,102],[140,140],[45,126]],
    [[317,48],[480,48],[480,105],[341,118]],
    [[521,47],[888,47],[888,100],[649,120],[523,106]],
    [[43,173],[90,173],[125,238],[125,304],[43,326]],
    [[45,348],[103,348],[112,409],[112,448],[44,459]],
    [[905,158],[979,128],[979,326],[904,306]],
    [[907,381],[980,380],[980,527],[848,527],[848,455]],
    [[174,462],[318,462],[418,479],[432,527],[142,527]],
    [[478,475],[548,450],[601,454],[605,527],[478,527]],
    [[621,441],[671,441],[699,478],[808,473],[850,492],[850,527],[621,527]],
  ],
  [LEVEL2_STAGE]: [
    [[0,0],[1024,0],[1024,37],[0,37]],
    [[0,538],[1024,538],[1024,572],[0,572]],
    [[0,0],[40,0],[40,572],[0,572]],
    [[984,0],[1024,0],[1024,572],[984,572]],
    [[90,148],[255,96],[307,82],[365,110],[451,57],[527,68],[557,102],[637,83],[687,112],[771,52],[794,77],[697,134],[637,116],[568,137],[521,108],[454,91],[360,146],[306,115],[237,129],[104,177]],
    [[84,165],[107,169],[103,286],[111,307],[92,338],[80,318],[80,270],[59,343],[39,335],[80,295]],
    [[915,159],[945,137],[946,289],[932,308],[949,381],[918,422],[909,297],[900,271]],
    [[337,459],[398,448],[469,446],[498,458],[540,486],[554,521],[549,538],[329,538]],
    [[58,328],[94,333],[110,370],[87,404],[42,408],[42,352]],
    [[748,27],[852,27],[869,63],[841,78],[792,101],[752,90]],
    [[177,104],[226,101],[238,146],[222,176],[185,173]],
    [[274,95],[319,88],[326,128],[309,164],[285,165]],
    [[908,304],[962,300],[980,346],[961,379],[930,382],[908,352]],
    [[116,76],[139,75],[148,100],[116,103]],
    [[657,139],[685,136],[697,162],[660,169]],
    [[727,109],[752,111],[763,136],[731,139]],
    [[113,375],[134,375],[141,402],[113,405]],
    [[738,441],[762,440],[770,473],[731,476]],
    [[843,473],[870,473],[880,499],[842,505]],
    [[882,375],[910,375],[914,403],[880,406]],
  ],
  [LEVEL3_STAGE]: [
    [[0,0],[1024,0],[1024,82],[0,82]],
    [[0,505],[1024,505],[1024,572],[0,572]],
    [[0,0],[88,0],[88,572],[0,572]],
    [[943,0],[1024,0],[1024,572],[943,572]],
    [[365,193],[457,182],[482,131],[517,116],[547,177],[640,174],[662,239],[649,306],[666,340],[659,397],[371,397]],
  ],
};
function contains(polygon: Point[], x: number, y: number) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (!a || !b) continue;
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
export function isSceneryBlocked(stage: string, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x > WORLD_WIDTH || y > WORLD_HEIGHT) return true;
  return (solids[stage] ?? []).some(p => contains(p, (x + offsetX) / scale, (y + offsetY) / scale));
}
const roads: Record<string, Point[]> = {
  [LEVEL1_STAGE]: [[100,492],[251,387],[399,369],[557,230],[740,190],[924,96]],
  [LEVEL2_STAGE]: [[105,482],[264,388],[450,364],[664,340],[780,220],[910,75]],
  [LEVEL3_STAGE]: [[180,455],[270,380],[278,283],[290,177],[585,108],[842,151]],
};
export function sceneryGateCenter(stage: string, index: number) {
  const point = roads[stage]?.[Math.max(0, Math.min(5, index))];
  return point ? imageToWorld(point[0], point[1]) : imageToWorld(500, 285);
}