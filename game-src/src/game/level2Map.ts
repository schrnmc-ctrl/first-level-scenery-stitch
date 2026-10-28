import { WORLD_WIDTH, WORLD_HEIGHT } from './constants';

export const LEVEL2_STAGE = 'STAGE_2_SPAM_GRID';
const IMAGE_WIDTH = 1024;
const IMAGE_HEIGHT = 572;
const scale = Math.max(WORLD_WIDTH / IMAGE_WIDTH, WORLD_HEIGHT / IMAGE_HEIGHT);
const offsetX = (IMAGE_WIDTH * scale - WORLD_WIDTH) / 2;
const offsetY = (IMAGE_HEIGHT * scale - WORLD_HEIGHT) / 2;

// Hand-traced solid rocks, plants and perimeter walls in source-image pixels.
// Dunes, shadows and the diagonal road are intentionally walkable.
const objects: number[][][] = [
  [[0,0],[943,0],[943,49],[46,49],[46,515],[0,515]],
  [[980,0],[1024,0],[1024,572],[101,572],[101,536],[976,527],[976,41]],
  [[54,69],[84,49],[113,53],[125,77],[97,98],[58,98]],
  [[57,310],[73,288],[86,296],[97,337],[111,359],[88,372],[57,365]],
  [[110,348],[120,340],[135,354],[130,362],[110,362]],
  [[57,449],[68,447],[78,485],[58,486]],
  [[59,399],[73,396],[84,429],[62,438]],
  [[112,395],[132,402],[140,425],[113,429]],
  [[83,371],[104,373],[109,395],[83,395]],
  [[265,462],[278,442],[297,443],[300,481],[315,500],[310,518],[265,516],[257,500]],
  [[234,467],[247,468],[254,492],[238,496]],
  [[316,487],[337,493],[345,518],[315,519]],
  [[142,499],[159,495],[166,519],[142,527]],
  [[916,459],[945,441],[965,450],[972,479],[967,515],[948,526],[897,519],[895,487]],
  [[868,455],[883,454],[888,486],[872,496]],
  [[917,414],[934,420],[940,451],[923,457]],
  [[941,128],[953,105],[966,116],[967,159],[978,170],[968,183],[939,177]],
  [[918,157],[934,163],[938,187],[918,190]],
  [[949,243],[961,234],[972,245],[972,263],[950,267]],
  [[756,60],[774,48],[790,58],[803,77],[762,83]],
  [[794,90],[807,84],[820,98],[815,105],[791,104]],
  [[712,60],[727,57],[739,68],[731,77],[713,77]],
];

export function imageToLevel2World(x: number, y: number) {
  return { x: x * scale - offsetX, y: y * scale - offsetY };
}

function contains(polygon: number[][], x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

export function isL2Blocked(x: number, y: number): boolean {
  if (x < 0 || y < 0 || x > WORLD_WIDTH || y > WORLD_HEIGHT) return true;
  const ix = (x + offsetX) / scale;
  const iy = (y + offsetY) / scale;
  return objects.some(polygon => contains(polygon, ix, iy));
}

export function hasImageBackground(stage: string): boolean {
  return stage === 'STAGE_1_CROSSWALK' || stage === LEVEL2_STAGE;
}

export function level2GateCenter(index: number) {
  const t = (index + 0.5) / 6;
  return imageToLevel2World(105 + t * 790, 505 - t * 397);
}