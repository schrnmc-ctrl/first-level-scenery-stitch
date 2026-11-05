export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'CAPTCHA_POPUP' | 'BOSS_DEFEAT_CINEMATIC' | 'GAME_OVER' | 'VICTORY' | 'LEVEL_COMPLETE';

export interface GameSettings {
  aimMode: 'TRACKPAD_AIM' | 'MOVEMENT_DIRECTION';
  aimSmoothing: number; // 0 to 1
  soundVolume: number; // 0 to 1
  soundEnabled: boolean;
  scanlines: boolean;
  motionBlur: boolean;
  screenShake: 'none' | 'low' | 'medium' | 'high';
  showAimLaser: boolean;
  showAimCrosshair: boolean;
}

export type StageId = 'STAGE_1_CROSSWALK' | 'STAGE_2_SPAM_GRID' | 'STAGE_3_DISTORTION' | 'STAGE_BOSS';

export interface GameStats {
  timeSurvived: number; // in seconds
  totalScore: number;
  enemiesDefeated: number;
  glitchCarsDodged: number;
  captchasAttempted: number;
  captchasSolved: number;
  accuracy: number; // 0 - 100%
  peakStreak: number;
  batteryRemaining: number;
  rank: 'S+' | 'S' | 'A' | 'B' | 'C';
  rankTitle: string;
  isEndless?: boolean;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  speed: number;
  angle: number;
  battery: number; // 0 - 100%
  maxBattery: number;
  lives: number; // Separate hero lives; battery mechanics remain unchanged.
  wifiLevel: number; // 1 to 4
  shockwaveCooldown: number; // in seconds
  shockwaveMaxCooldown: number;
  invincibleTimer: number; // flash duration on hit
  speedBoostTimer?: number; // active temporary speed overclock
  score: number;
  streak: number;
}

export type EnemyType = 
  | 'SPAM_BOT' 
  | 'MINI_SPAM_BOT'
  | 'TRAFFIC_LIGHT' 
  | 'GLITCH_CAR' 
  | 'FIRE_HYDRANT_BOT' 
  | 'BICYCLE_DRONE'
  | 'CAPTCHA_TILE_SEEKER';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  color: string;
  patternTimer?: number;
  activeState?: 'RED' | 'YELLOW' | 'GREEN';
  warningTimer?: number;
  direction?: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';
  iconType: 'crosswalk' | 'car' | 'traffic_light' | 'bot' | 'hydrant' | 'bicycle' | 'bus';
}

export interface Boss {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  phase: 1 | 2 | 3;
  shieldActive: boolean;
  shieldAngle: number;
  shieldCooldown: number;
  shieldMaxCooldown: number;
  shieldDuration: number;
  laserAngle: number;
  laserCharging: boolean;
  laserFiring: boolean;
  laserTimer: number;
  attackTimer: number;
  glitchOffset: { x: number; y: number };
  isDefeated?: boolean;
  defeatTimer?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  damage: number;
  fromPlayer: boolean;
  life: number;
  maxLife: number;
  type: 'WIFI_PULSE' | 'GLITCH_DATA' | 'CAPTCHA_CHAR' | 'BOSS_LASER_ORB';
  charText?: string;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  duration: number;
  timer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  shape?: 'square' | 'circle' | 'text' | 'ring' | 'shard' | 'spark';
  text?: string;
  rotation?: number;
  vRot?: number;
}

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'POWER_BANK' | 'WIFI_BOOSTER' | 'SOLAR_PAD' | 'CLEAR_CACHE';
  duration: number;
}

export interface CaptchaZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetCategory: string;
  category: string;
  isValid: boolean;
  active: boolean;
  checked: boolean;
}

export type CaptchaType =
  | 'TRAFFIC_RUNNER'
  | 'WHACK_A_BOT'
  | 'CIRCUIT_CONNECT'
  | 'CATCH_THE_COOKIES'
  | 'LASER_DEFLECTOR'
  | 'COLOR_STROOP_TEST'
  | 'TYPING_CHALLENGE'
  | 'EMOJI_EQUATION'
  | 'PATTERN_DRAW'
  | 'MEMORY_SEQUENCE'
  | 'SLIDER_PUZZLE'
  | 'ROTATION_PUZZLE'
  | 'GRID_SELECT'
  | 'SLICED_IMAGE';

export interface SlicedTile {
  id: number;
  row: number;
  col: number;
  isTarget: boolean;
  selected: boolean;
  label?: string;
  icon?: string;
}

export interface CircuitTile {
  id: number;
  type: 'straight' | 'corner' | 't-shape' | 'cross';
  currentRotation: number; // 0, 90, 180, 270
  correctRotations: number[];
}

export interface CaptchaChallenge {
  type: CaptchaType;
  prompt: string;
  targetCategory: string;
  humorSubtitle?: string;
  triggerReason?: string;
  triggerIcon?: string;
  grid?: {
    id: number;
    imageType: 'traffic_light' | 'crosswalk' | 'bus' | 'bicycle' | 'hydrant' | 'cat' | 'car' | 'tree' | 'firewall';
    isTarget: boolean;
    selected: boolean;
  }[];
  slicedImage?: {
    theme: 'BUS_ON_STREET' | 'TRAFFIC_LIGHT_POLE' | 'CROSSWALK_CROSSING' | 'BICYCLE_RACK';
    totalRows: number;
    totalCols: number;
    targetIndices: number[];
    tiles: SlicedTile[];
  };
  sliderPuzzle?: {
    targetPosition: number; // 0 - 100%
    currentPosition: number;
    tolerance: number;
    backgroundTheme: 'CITY_GRID' | 'FIREWALL' | 'CORE_SERVER';
  };
  rotationPuzzle?: {
    targetAngle: number; // 0 deg
    initialAngle: number; // e.g. 90, 180, 270 deg
    currentAngle: number;
    icon: string;
    label: string;
  };
  trafficRunner?: {
    playerLane: number; // 0 (start), 1, 2, 3 (finish)
    cars: { lane: number; x: number; speed: number; color: string }[];
  };
  whackABot?: {
    targetsRequired: number;
    currentHits: number;
  };
  patternDraw?: {
    targetPattern: number[]; // e.g. [0, 1, 2, 5, 8]
    nodeCount: number;
    patternName?: string;
    description?: string;
  };
  memorySequence?: {
    sequence: number[]; // e.g. [0, 2, 1, 3]
    flashSpeed: number;
  };
  circuitConnect?: {
    tiles: CircuitTile[];
    batteryConnected: boolean;
  };
  catchCookies?: {
    targetCount: number;
    timeLimit: number;
  };
  laserDeflector?: {
    targetAngle: number;
    currentAngle: number;
    tolerance: number;
    laserColor: string;
  };
  colorStroop?: {
    word: string;
    displayColor: string;
    options: { label: string; color: string; isCorrect: boolean }[];
  };
  typingChallenge?: {
    targetPhrase: string;
    timeLimit: number;
  };
  emojiEquation?: {
    equation: string;
    options: number[];
    correctAnswer: number;
    item1: { emoji: string; value: number; name: string };
    item2: { emoji: string; value: number; name: string };
  };
  timeRemaining: number;
  rewardType: 'BATTERY' | 'WIFI' | 'SPEED_BOOST';
}
