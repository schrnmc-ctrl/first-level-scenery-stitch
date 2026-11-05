export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 750;

// Expanded Cyber World Arena with smooth camera tracking
export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 1500;

export const PLAYER_SPEED = 240; // Hero base speed in world pixels per second.
export const PLAYER_SIZE = 28;
export const BATTERY_DRAIN_ON_HIT = 12;
export const BATTERY_DRAIN_PER_SEC = 0.4;
export const BATTERY_DRAIN_SHOOT = 0.25;
export const BATTERY_DRAIN_SHOCKWAVE = 4.5;

export const WIFI_PROJECTILE_SPEED = 590;
export const WIFI_COOLDOWN = 0.14; // firing rate

/**
 * Smooth Ease-In-Ease-Out (Smoothstep / Cubic-Sine) curve
 * Generates continuous, non-jarring progression between 0 and 1
 */
export function easeInOutSine(x: number): number {
  return -(Math.cos(Math.PI * Math.max(0, Math.min(1, x))) - 1) / 2;
}

export function smoothStep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

export const STAGE_CONFIGS = {
  STAGE_1_CROSSWALK: {
    name: 'STAGE 1: Cyber Crosswalk & Traffic Grid',
    description: 'Dodge multi-lane autonomous Glitch Cars and clear roaming Traffic Light drones!',
    targetScore: 1600,
    duration: 38,
    carInterval: 1.8, // Organic base cadence with subtle smooth easing
    botInterval: 1.8,
    captchaPuzzlesRequired: 2,
  },
  STAGE_2_SPAM_GRID: {
    name: 'STAGE 2: Spam-Bot & Firewall Swarm',
    description: 'Bicycle drones & spam bots are swarming the server plaza! Trigger shockwaves!',
    targetScore: 3600,
    duration: 44,
    carInterval: 1.6,
    botInterval: 1.35,
    captchaPuzzlesRequired: 3,
  },
  STAGE_3_DISTORTION: {
    name: 'STAGE 3: Alphanumeric Matrix Distortion',
    description: 'Matrix noise, multi-lane interceptors, and high-frequency CAPTCHA security gates!',
    targetScore: 5800,
    duration: 50,
    carInterval: 1.5,
    botInterval: 1.15,
    captchaPuzzlesRequired: 3,
  },
  STAGE_BOSS: {
    name: 'FINAL STAGE: The "I Am Not A Robot" Core',
    description: 'Dodge rotating checkmark shields until overheat cooldown, then strike the Core Eye!',
    targetScore: 12000,
    duration: 120,
    carInterval: 2.4,
    botInterval: 1.3,
    captchaPuzzlesRequired: 0,
  },
};


