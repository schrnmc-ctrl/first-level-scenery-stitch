import {
  Player,
  Enemy,
  Boss,
  Projectile,
  Particle,
  PowerUp,
  Shockwave,
  CaptchaZone,
  StageId,
  GameState,
  CaptchaChallenge,
  GameStats,
  GameSettings,
} from '../types';
import { isL1Blocked } from './level1Collision';
import { isL2Blocked, level2GateCenter, LEVEL2_STAGE } from './level2Map';
import {

  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  PLAYER_SPEED,
  PLAYER_SIZE,
  BATTERY_DRAIN_ON_HIT,
  BATTERY_DRAIN_PER_SEC,
  BATTERY_DRAIN_SHOOT,
  BATTERY_DRAIN_SHOCKWAVE,
  WIFI_PROJECTILE_SPEED,
  STAGE_CONFIGS,
  easeInOutSine,
} from './constants';
import { sound } from '../audio/soundEffects';
import { generateRandomCaptcha } from './captchaGenerator';

export class GameEngine {
  public player: Player;
  public enemies: Enemy[] = [];
  public boss: Boss | null = null;
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public powerUps: PowerUp[] = [];
  public shockwaves: Shockwave[] = [];
  public captchaZones: CaptchaZone[] = [];
  public stage: StageId = 'STAGE_1_CROSSWALK';
  public gameState: GameState = 'MENU';
  public stageTimer: number = 0;
  public glitchIntensity: number = 0;
  public activeCaptcha: CaptchaChallenge | null = null;
  public solvedCaptchasCount: number = 0;
  public packagesDelivered: number = 0;
  public captchaGraceTimer: number = 0;

  // Smooth Camera Tracker
  public camera: { x: number; y: number } = { x: 0, y: 0 };
  public screenMousePos: { x: number; y: number } = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };

  // Live in-game settings (editable on the fly without restarting)
  public settings: GameSettings = {
    aimMode: 'TRACKPAD_AIM',
    aimSmoothing: 0.3,
    soundVolume: 0.8,
    soundEnabled: true,
    scanlines: false,
    motionBlur: true,
    screenShake: 'medium',
    showAimLaser: true,
    showAimCrosshair: true,
  };

  // Run Statistics & Progression
  public totalPlayTime: number = 0;
  public enemiesDefeatedCount: number = 0;
  public glitchCarsDodgedCount: number = 0;
  public captchasAttemptedCount: number = 0;
  public peakStreakCount: number = 0;
  public isEndlessMode: boolean = false;
  public endlessCycle: number = 1;

  // Timers
  private lastShootTime: number = 0;
  private spawnCarTimer: number = 0;
  private spawnBotTimer: number = 0;
  private spawnPowerUpTimer: number = 0;
  private spawnZoneTimer: number = 0;
  private shootCooldown: number = 0.15;

  // Controls state
  public keys: Record<string, boolean> = {};
  public mousePos: { x: number; y: number } = { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 };
  public isMouseDown: boolean = false;

  constructor() {
    this.player = this.createDefaultPlayer();
    this.camera.x = Math.max(0, Math.min(WORLD_WIDTH - CANVAS_WIDTH, this.player.x - CANVAS_WIDTH / 2));
    this.camera.y = Math.max(0, Math.min(WORLD_HEIGHT - CANVAS_HEIGHT, this.player.y - CANVAS_HEIGHT / 2));
    this.initStage(this.stage);
  }

  public updateSettings(newSettings: Partial<GameSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (newSettings.soundVolume !== undefined) {
      sound.volume = newSettings.soundVolume;
    }
    if (newSettings.soundEnabled !== undefined) {
      sound.enabled = newSettings.soundEnabled;
    }
  }

  public togglePause() {
    if (this.gameState === 'PLAYING') {
      this.gameState = 'PAUSED';
    } else if (this.gameState === 'PAUSED') {
      this.gameState = 'PLAYING';
    }
  }

  public pause() {
    if (this.gameState === 'PLAYING') {
      this.gameState = 'PAUSED';
    }
  }

  public resume() {
    if (this.gameState === 'PAUSED') {
      this.gameState = 'PLAYING';
    }
  }

  public createDefaultPlayer(): Player {
    return {
      x: 120,
      y: WORLD_HEIGHT - 120,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      vx: 0,
      vy: 0,
      speed: PLAYER_SPEED,
      angle: -Math.PI / 2,
      battery: 100,
      maxBattery: 100,
      wifiLevel: 1,
      shockwaveCooldown: 0,
      shockwaveMaxCooldown: 4.0,
      invincibleTimer: 0,
      speedBoostTimer: 0,
      score: 0,
      streak: 0,
    };
  }

  public resetGame() {
    this.player = this.createDefaultPlayer();
    this.camera.x = Math.max(0, Math.min(WORLD_WIDTH - CANVAS_WIDTH, this.player.x - CANVAS_WIDTH / 2));
    this.camera.y = Math.max(0, Math.min(WORLD_HEIGHT - CANVAS_HEIGHT, this.player.y - CANVAS_HEIGHT / 2));
    this.enemies = [];
    this.boss = null;
    this.projectiles = [];
    this.particles = [];
    this.powerUps = [];
    this.shockwaves = [];
    this.captchaZones = [];
    this.solvedCaptchasCount = 0;
    this.totalPlayTime = 0;
    this.enemiesDefeatedCount = 0;
    this.glitchCarsDodgedCount = 0;
    this.captchasAttemptedCount = 0;
    this.peakStreakCount = 0;
    this.isEndlessMode = false;
    this.endlessCycle = 1;
    this.stage = 'STAGE_1_CROSSWALK';
    this.gameState = 'PLAYING';
    this.activeCaptcha = null;
    this.initStage(this.stage);
  }

  public startEndlessMode() {
    this.isEndlessMode = true;
    this.endlessCycle += 1;
    this.player.battery = Math.min(this.player.maxBattery, this.player.battery + 40);
    this.player.wifiLevel = Math.min(4, this.player.wifiLevel + 1);
    this.enemies = [];
    this.projectiles = [];
    this.boss = null;
    this.stage = 'STAGE_1_CROSSWALK';
    this.gameState = 'PLAYING';
    this.initStage(this.stage);
    sound.playPowerUp();
    this.addTextParticle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, `⚡ OVERCLOCK WAVE #${this.endlessCycle} STARTED! ⚡`, '#facc15');
  }

  public getGameStats(): GameStats {
    const accuracy = this.captchasAttemptedCount > 0
      ? Math.round((this.solvedCaptchasCount / this.captchasAttemptedCount) * 100)
      : 100;

    const score = this.player.score;
    const battery = Math.round(this.player.battery);

    let rank: 'S+' | 'S' | 'A' | 'B' | 'C' = 'B';
    let rankTitle = 'VERIFIED HUMAN ARCHITECT';

    if (score >= 11000 && accuracy >= 80 && battery >= 45) {
      rank = 'S+';
      rankTitle = 'SUPREME TURING CONQUEROR';
    } else if (score >= 8000 && accuracy >= 70) {
      rank = 'S';
      rankTitle = 'MASTER SECURITY DECRYPTOR';
    } else if (score >= 5000) {
      rank = 'A';
      rankTitle = 'CERTIFIED HUMAN OPERATIVE';
    } else if (score >= 2500) {
      rank = 'B';
      rankTitle = 'STANDARD HUMAN RECIPIENT';
    } else {
      rank = 'C';
      rankTitle = 'NOVICE AUTHENTICATOR';
    }

    return {
      timeSurvived: Math.max(1, Math.round(this.totalPlayTime)),
      totalScore: score,
      enemiesDefeated: this.enemiesDefeatedCount,
      glitchCarsDodged: this.glitchCarsDodgedCount,
      captchasAttempted: this.captchasAttemptedCount,
      captchasSolved: this.solvedCaptchasCount,
      accuracy,
      peakStreak: this.peakStreakCount,
      batteryRemaining: battery,
      rank,
      rankTitle,
      isEndless: this.isEndlessMode,
    };
  }

  /**
   * Subtle Ease-In-Ease-Out Difficulty Scaling Factor
   * Produces a gentle, organic multiplier (1.0 to 1.25) with no sharp step-cliffs
   */
  public getDifficultyMultiplier(): number {
    const config = STAGE_CONFIGS[this.stage];
    const stageProgress = Math.min(1, this.stageTimer / (config.duration || 45));
    const easedProgress = easeInOutSine(stageProgress);

    // Baseline stage difficulty step (smooth 5% per stage)
    const stageBase =
      this.stage === 'STAGE_1_CROSSWALK' ? 1.0 :
      this.stage === 'STAGE_2_SPAM_GRID' ? 1.08 :
      this.stage === 'STAGE_3_DISTORTION' ? 1.16 : 1.24;

    // Endless cycle modifier (subtle +6% per full cycle)
    const cycleBonus = (this.endlessCycle - 1) * 0.08;

    // Organic wave curve (eases in and out over time)
    const curve = stageBase + easedProgress * 0.08 + cycleBonus;

    // Adaptive buffer: If low battery, give subtle ease-out relief (-12%)
    if (this.player.battery < 25) {
      return curve * 0.88;
    }

    return curve;
  }

  public initStage(stageId: StageId) {
    this.stage = stageId;
    this.stageTimer = 0;
    this.enemies = [];
    this.projectiles = [];
    this.captchaZones = [];

    if (stageId === LEVEL2_STAGE) {
      this.player.x = 120;
      this.player.y = WORLD_HEIGHT - 140;
      this.camera.x = 0;
      this.camera.y = WORLD_HEIGHT - CANVAS_HEIGHT;
    }

    if (stageId !== 'STAGE_BOSS') {
      this.spawnCaptchaZone();
      this.spawnCaptchaZone();
      this.spawnCaptchaZone();
      this.spawnCaptchaZone();
    } else {
      this.initBoss();
      sound.playBossAlarm();
      this.glitchIntensity = 0.7;
    }
  }

  public initBoss() {
    this.boss = {
      x: WORLD_WIDTH / 2,
      y: 360,
      width: 150,
      height: 110,
      hp: 1600,
      maxHp: 1600,
      phase: 1,
      shieldActive: true,
      shieldAngle: 0,
      shieldCooldown: 0,
      shieldMaxCooldown: 5.0,
      shieldDuration: 10.0,
      laserAngle: Math.PI / 2,
      laserCharging: false,
      laserFiring: false,
      laserTimer: 0,
      attackTimer: 0,
      glitchOffset: { x: 0, y: 0 },
    };
  }

  public update(deltaTime: number) {
    if (this.gameState !== 'PLAYING' && this.gameState !== 'BOSS_DEFEAT_CINEMATIC') return;

    if (this.glitchIntensity > 0) {
      this.glitchIntensity = Math.max(0, this.glitchIntensity - deltaTime * 1.5);
    }

    if (this.captchaGraceTimer > 0) {
      this.captchaGraceTimer = Math.max(0, this.captchaGraceTimer - deltaTime);
    }

    if (this.gameState === 'PLAYING') {
      this.stageTimer += deltaTime;
    }

    this.updatePlayer(deltaTime);

    // Smooth Camera Tracker (Lerp camera towards centering the player)
    const targetCamX = Math.max(0, Math.min(WORLD_WIDTH - CANVAS_WIDTH, this.player.x - CANVAS_WIDTH / 2));
    const targetCamY = Math.max(0, Math.min(WORLD_HEIGHT - CANVAS_HEIGHT, this.player.y - CANVAS_HEIGHT / 2));
    const camLerp = Math.min(1, deltaTime * 7.5);
    this.camera.x += (targetCamX - this.camera.x) * camLerp;
    this.camera.y += (targetCamY - this.camera.y) * camLerp;

    // Synchronize world mouse position with current camera viewport
    this.mousePos.x = this.screenMousePos.x + this.camera.x;
    this.mousePos.y = this.screenMousePos.y + this.camera.y;

    if (this.gameState === 'PLAYING' && (this.isMouseDown || this.keys['Space'])) {
      this.tryShoot();
    }

    this.updateShockwaves(deltaTime);

    if (this.gameState === 'PLAYING') {
      this.updateSpawners(deltaTime);
      this.updateEnemies(deltaTime);
    }

    if (this.boss) {
      this.updateBoss(deltaTime);
    }

    this.updateProjectiles(deltaTime);
    this.updateParticles(deltaTime);
    this.updatePowerUps(deltaTime);

    if (this.gameState === 'PLAYING') {
      this.checkCollisions();
      this.checkStageProgress();
    }
  }

  private updatePlayer(dt: number) {
    const p = this.player;
    this.totalPlayTime += dt;

    let dx = 0;
    let dy = 0;

    if (this.keys['ArrowUp'] || this.keys['KeyW']) dy -= 1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) dy += 1;
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) dx -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) dx += 1;

    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
    }

    // Speed boost if active
    let currentSpeed = p.speed;
    if (p.speedBoostTimer && p.speedBoostTimer > 0) {
      p.speedBoostTimer -= dt;
      currentSpeed *= 1.38; // 38% speed boost perk
    }

    p.vx = dx * currentSpeed;
    p.vy = dy * currentSpeed;

    const nextX = p.x + p.vx * dt;
    const nextY = p.y + p.vy * dt;

    if (this.stage === 'STAGE_1_CROSSWALK' || this.stage === LEVEL2_STAGE) {
      // Collide with background objects (path and solid ground stay walkable).
      // Axis-separated checks let the player slide along obstacles.
      const r = Math.max(p.width, p.height) / 2;
      const isBlocked = this.stage === LEVEL2_STAGE ? isL2Blocked : isL1Blocked;
      const blocked = (x: number, y: number) =>
        isBlocked(x - r, y - r) ||
        isBlocked(x + r, y - r) ||
        isBlocked(x - r, y + r) ||
        isBlocked(x + r, y + r);
      if (!blocked(nextX, p.y)) p.x = nextX;
      if (!blocked(p.x, nextY)) p.y = nextY;
    } else {
      p.x = nextX;
      p.y = nextY;
    }

    // Clamp within expanded world arena
    p.x = Math.max(p.width / 2 + 18, Math.min(WORLD_WIDTH - p.width / 2 - 18, p.x));
    p.y = Math.max(p.height / 2 + 18, Math.min(WORLD_HEIGHT - p.height / 2 - 18, p.y));

    // Emit movement particles & dust specks when moving
    if (Math.abs(p.vx) > 10 || Math.abs(p.vy) > 10) {
      if (Math.random() < 0.35) {
        this.particles.push({
          x: p.x - (p.vx / currentSpeed) * 14 + (Math.random() - 0.5) * 6,
          y: p.y - (p.vy / currentSpeed) * 14 + (Math.random() - 0.5) * 6,
          vx: -(p.vx * 0.15) + (Math.random() - 0.5) * 10,
          vy: -(p.vy * 0.15) + (Math.random() - 0.5) * 10,
          size: 2 + Math.random() * 2,
          color: p.speedBoostTimer && p.speedBoostTimer > 0 ? '#38bdf8' : 'rgba(15, 23, 42, 0.25)',
          life: 0.3,
          maxLife: 0.3,
          shape: 'square',
        });
      }
    }

    // Target Aim Direction based on Trackpad/Cursor or Movement
    let targetAngle = p.angle;
    if (this.settings.aimMode === 'TRACKPAD_AIM') {
      targetAngle = Math.atan2(this.mousePos.y - p.y, this.mousePos.x - p.x);
    } else if (this.settings.aimMode === 'MOVEMENT_DIRECTION') {
      if (Math.abs(p.vx) > 5 || Math.abs(p.vy) > 5) {
        targetAngle = Math.atan2(p.vy, p.vx);
      } else {
        targetAngle = Math.atan2(this.mousePos.y - p.y, this.mousePos.x - p.x);
      }
    }

    // Ease-in and ease-out angular smoothing (Shortest arc rotation interpolation)
    let angleDiff = targetAngle - p.angle;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

    if (this.settings.aimSmoothing <= 0.02) {
      p.angle = targetAngle;
    } else {
      const responsiveness = (1 - Math.min(0.9, this.settings.aimSmoothing * 0.75)) * 32;
      p.angle += angleDiff * Math.min(1, responsiveness * dt);
    }

    p.battery = Math.max(0, p.battery - BATTERY_DRAIN_PER_SEC * dt);

    if (p.invincibleTimer > 0) {
      p.invincibleTimer -= dt;
    }

    if (p.shockwaveCooldown > 0) {
      p.shockwaveCooldown = Math.max(0, p.shockwaveCooldown - dt);
    }

    if (p.streak > this.peakStreakCount) {
      this.peakStreakCount = p.streak;
    }

    if (p.battery <= 0) {
      this.triggerGameOver('Your phone battery died! Delivery verification failed.');
    }
  }

  public tryShoot() {
    const now = performance.now() / 1000;
    if (now - this.lastShootTime < this.shootCooldown) return;
    if (this.player.battery < BATTERY_DRAIN_SHOOT) return;

    this.lastShootTime = now;
    this.player.battery = Math.max(0, this.player.battery - BATTERY_DRAIN_SHOOT);

    const p = this.player;
    const baseAngle = p.angle;
    const count = p.wifiLevel;

    const spreadAngle = 0.14;
    const startAngle = baseAngle - ((count - 1) * spreadAngle) / 2;

    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * spreadAngle;
      this.projectiles.push({
        id: Math.random().toString(),
        x: p.x + Math.cos(baseAngle) * 20,
        y: p.y + Math.sin(baseAngle) * 20,
        vx: Math.cos(angle) * WIFI_PROJECTILE_SPEED,
        vy: Math.sin(angle) * WIFI_PROJECTILE_SPEED,
        radius: 6,
        color: '#38bdf8',
        damage: 26 + (p.wifiLevel - 1) * 8,
        fromPlayer: true,
        life: 0,
        maxLife: 1.4,
        type: 'WIFI_PULSE',
      });
    }

    sound.playShoot();
  }

  public triggerShockwave() {
    const p = this.player;
    if (p.shockwaveCooldown > 0) return;
    if (p.battery < BATTERY_DRAIN_SHOCKWAVE) return;

    p.shockwaveCooldown = p.shockwaveMaxCooldown;
    p.battery = Math.max(0, p.battery - BATTERY_DRAIN_SHOCKWAVE);

    this.shockwaves.push({
      x: p.x,
      y: p.y,
      radius: 10,
      maxRadius: 200,
      duration: 0.5,
      timer: 0,
    });

    sound.playShockwave();

    this.enemies.forEach((enemy) => {
      const dist = Math.hypot(enemy.x - p.x, enemy.y - p.y);
      if (dist < 200) {
        const pushAngle = Math.atan2(enemy.y - p.y, enemy.x - p.x);
        enemy.x += Math.cos(pushAngle) * 110;
        enemy.y += Math.sin(pushAngle) * 110;
        enemy.hp -= 70;

        this.addTextParticle(enemy.x, enemy.y, 'BLAST!', '#38bdf8');
      }
    });

    this.projectiles = this.projectiles.filter((proj) => {
      if (!proj.fromPlayer) {
        const dist = Math.hypot(proj.x - p.x, proj.y - p.y);
        if (dist < 200) {
          this.createExplosion(proj.x, proj.y, '#38bdf8', 4);
          return false;
        }
      }
      return true;
    });
  }

  private updateShockwaves(dt: number) {
    this.shockwaves.forEach((sw) => {
      sw.timer += dt;
      sw.radius = (sw.timer / sw.duration) * sw.maxRadius;
    });
    this.shockwaves = this.shockwaves.filter((sw) => sw.timer < sw.duration);
  }

  private updateSpawners(dt: number) {
    const config = STAGE_CONFIGS[this.stage];
    const diffMul = this.getDifficultyMultiplier();

    // Smooth organic wave breathing cycle (subtle 4-second sinusoidal wave)
    const trafficWave = 1.0 + Math.sin(this.stageTimer * 0.5) * 0.15;

    const effectiveCarInterval = (config.carInterval / diffMul) * trafficWave;
    const effectiveBotInterval = config.botInterval / diffMul;

    this.spawnCarTimer += dt;
    if (this.spawnCarTimer >= effectiveCarInterval) {
      this.spawnCarTimer = 0;
      this.spawnGlitchCar(diffMul);
      if (Math.random() < 0.28 * diffMul) {
        setTimeout(() => this.spawnGlitchCar(diffMul), 400);
      }
    }

    this.spawnBotTimer += dt;
    if (this.spawnBotTimer >= effectiveBotInterval) {
      this.spawnBotTimer = 0;
      this.spawnChallengingEnemies(diffMul);
    }

    this.spawnPowerUpTimer += dt;
    if (this.spawnPowerUpTimer >= 8.5) {
      this.spawnPowerUpTimer = 0;
      this.spawnPowerUp();
    }

    if (this.stage !== 'STAGE_BOSS') {
      this.spawnZoneTimer += dt;
      if (this.spawnZoneTimer >= 8.0) {
        this.spawnZoneTimer = 0;
        this.spawnCaptchaZone();
      }
    }
  }

  private spawnGlitchCar(diffMul: number = 1.0) {
    // Multi-lane highways spread across the expanded 2400x1500 cyber arena
    const lanes = [260, 520, 780, 1040, 1280];
    const laneY = lanes[Math.floor(Math.random() * lanes.length)];
    const direction = (laneY === 520 || laneY === 1040) ? 'LEFT' : 'RIGHT';
    const speed = (440 + Math.random() * 140) * Math.min(1.25, diffMul);

    const carColors = ['#facc15', '#ef4444', '#38bdf8', '#10b981', '#ec4899'];
    const color = carColors[Math.floor(Math.random() * carColors.length)];

    const x = direction === 'RIGHT' ? -120 : WORLD_WIDTH + 120;
    const vx = direction === 'RIGHT' ? speed : -speed;

    this.enemies.push({
      id: Math.random().toString(),
      type: 'GLITCH_CAR',
      x,
      y: laneY,
      width: 72,
      height: 32,
      vx,
      vy: 0,
      hp: 180,
      maxHp: 180,
      color,
      iconType: 'car',
    });

    sound.playHonk();
    this.addTextParticle(
      direction === 'RIGHT' ? 120 : WORLD_WIDTH - 120,
      laneY,
      '⚠ GLITCH HIGHWAY INTERCEPTOR ⚠',
      '#facc15'
    );
  }

  private spawnChallengingEnemies(diffMul: number = 1.0) {
    const r = Math.random();
    const spawnFromTop = Math.random() > 0.35;
    const x = 100 + Math.random() * (WORLD_WIDTH - 200);
    const y = spawnFromTop ? -40 : Math.random() * (WORLD_HEIGHT * 0.6);

    if (r < 0.3) {
      // Traffic Light with Laser Pulsing
      this.enemies.push({
        id: Math.random().toString(),
        type: 'TRAFFIC_LIGHT',
        x,
        y: Math.max(100, y),
        width: 34,
        height: 58,
        vx: (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 40,
        hp: 120,
        maxHp: 120,
        color: '#111827',
        activeState: 'RED',
        patternTimer: 0,
        iconType: 'traffic_light',
      });
    } else if (r < 0.65) {
      // Aggressive Spam Bot
      this.enemies.push({
        id: Math.random().toString(),
        type: 'SPAM_BOT',
        x,
        y,
        width: 32,
        height: 32,
        vx: 0,
        vy: 0,
        hp: 65,
        maxHp: 65,
        color: '#be185d',
        iconType: 'bot',
      });
    } else if (r < 0.85) {
      // Fast Dash Bicycle Drone
      this.enemies.push({
        id: Math.random().toString(),
        type: 'BICYCLE_DRONE',
        x,
        y,
        width: 32,
        height: 32,
        vx: 0,
        vy: 0,
        hp: 50,
        maxHp: 50,
        color: '#06b6d4',
        iconType: 'bicycle',
      });
    } else {
      // Hydrant with 4-way water jet
      this.enemies.push({
        id: Math.random().toString(),
        type: 'FIRE_HYDRANT_BOT',
        x,
        y: Math.max(120, y),
        width: 36,
        height: 40,
        vx: 0,
        vy: 0,
        hp: 95,
        maxHp: 95,
        color: '#dc2626',
        patternTimer: 0,
        iconType: 'hydrant',
      });
    }
  }

  private spawnPowerUp() {
    const isWifi = Math.random() > 0.65;
    this.powerUps.push({
      id: Math.random().toString(),
      x: 120 + Math.random() * (WORLD_WIDTH - 240),
      y: 160 + Math.random() * (WORLD_HEIGHT - 320),
      width: 26,
      height: 26,
      type: isWifi ? 'WIFI_BOOSTER' : 'POWER_BANK',
      duration: 16,
    });
  }

  private spawnCaptchaZone() {
    if (this.captchaZones.length >= 6) return;

    const categories = ['traffic_light', 'crosswalk', 'bicycle', 'hydrant', 'car', 'bus', 'firewall'];
    const cat = categories[Math.floor(Math.random() * categories.length)];

    // Line zones up along the road running from the bottom-left corner
    // to the top-right corner of the world.
    const t = 0.12 + (this.captchaZones.length / 5) * 0.76;
    const jitterX = (Math.random() - 0.5) * 70;
    const jitterY = (Math.random() - 0.5) * 70;

    let zx = 140 + t * (WORLD_WIDTH - 380) + jitterX;
    let zy = WORLD_HEIGHT - 180 - t * (WORLD_HEIGHT - 400) + jitterY;

    if (this.stage === LEVEL2_STAGE) {
      const center = level2GateCenter(this.captchaZones.length);
      zx = center.x - 75;
      zy = center.y - 32.5;
    }

    // On Level 1, snap the zone onto walkable ground (off background objects)
    if (this.stage === 'STAGE_1_CROSSWALK') {
      const w = 150;
      const h = 65;
      if (isL1Blocked(zx + w / 2, zy + h / 2)) {
        let found = false;
        for (let radius = 40; radius <= 320 && !found; radius += 40) {
          for (let a = 0; a < 12 && !found; a++) {
            const ang = (a / 12) * Math.PI * 2;
            const cx = zx + w / 2 + Math.cos(ang) * radius;
            const cy = zy + h / 2 + Math.sin(ang) * radius;
            if (!isL1Blocked(cx, cy)) {
              zx = cx - w / 2;
              zy = cy - h / 2;
              found = true;
            }
          }
        }
      }
    }

    this.captchaZones.push({
      id: Math.random().toString(),
      x: zx,
      y: zy,
      width: 150,
      height: 65,
      targetCategory: cat,
      category: cat,
      isValid: true,
      active: true,
      checked: false,
    });
  }

  private updateEnemies(dt: number) {
    const p = this.player;

    this.enemies.forEach((e) => {
      if (e.type === 'GLITCH_CAR') {
        e.x += e.vx * dt;
      } else if (e.type === 'SPAM_BOT') {
        // Flanking & Zig-Zag chasing
        const angle = Math.atan2(p.y - e.y, p.x - e.x);
        const zig = Math.sin(this.stageTimer * 6 + e.x) * 45;
        const speed = 125;
        e.vx = Math.cos(angle) * speed + Math.cos(angle + Math.PI / 2) * zig;
        e.vy = Math.sin(angle) * speed + Math.sin(angle + Math.PI / 2) * zig;
        e.x += e.vx * dt;
        e.y += e.vy * dt;

        // Spread shot
        if (Math.random() < 0.02 && this.projectiles.length < 70) {
          const shootAngle = Math.atan2(p.y - e.y, p.x - e.x);
          [-0.15, 0.15].forEach((offset) => {
            this.projectiles.push({
              id: Math.random().toString(),
              x: e.x,
              y: e.y,
              vx: Math.cos(shootAngle + offset) * 220,
              vy: Math.sin(shootAngle + offset) * 220,
              radius: 5,
              color: '#f43f5e',
              damage: 12,
              fromPlayer: false,
              life: 0,
              maxLife: 3.5,
              type: 'GLITCH_DATA',
            });
          });
        }
      } else if (e.type === 'MINI_SPAM_BOT') {
        // Fast mini bot dash
        const angle = Math.atan2(p.y - e.y, p.x - e.x);
        const speed = 175;
        e.vx = Math.cos(angle) * speed;
        e.vy = Math.sin(angle) * speed;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
      } else if (e.type === 'BICYCLE_DRONE') {
        // High speed dash charge
        const angle = Math.atan2(p.y - e.y, p.x - e.x);
        const speed = 160;
        e.vx = Math.cos(angle) * speed;
        e.vy = Math.sin(angle) * speed;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
      } else if (e.type === 'TRAFFIC_LIGHT') {
        e.patternTimer = (e.patternTimer || 0) + dt;
        if (e.patternTimer > 2.5) {
          e.patternTimer = 0;
          if (e.activeState === 'RED') e.activeState = 'YELLOW';
          else if (e.activeState === 'YELLOW') e.activeState = 'GREEN';
          else e.activeState = 'RED';
        }

        // When RED, shoots 4-direction hazard beam
        if (e.activeState === 'RED' && Math.random() < 0.03) {
          for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2 + this.stageTimer;
            this.projectiles.push({
              id: Math.random().toString(),
              x: e.x,
              y: e.y,
              vx: Math.cos(angle) * 200,
              vy: Math.sin(angle) * 200,
              radius: 6,
              color: '#ef4444',
              damage: 14,
              fromPlayer: false,
              life: 0,
              maxLife: 2.8,
              type: 'GLITCH_DATA',
            });
          }
        }
      } else if (e.type === 'FIRE_HYDRANT_BOT') {
        e.patternTimer = (e.patternTimer || 0) + dt;
        if (e.patternTimer > 2.0) {
          e.patternTimer = 0;
          // Cardinal 4-way water jet
          [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((ang) => {
            this.projectiles.push({
              id: Math.random().toString(),
              x: e.x,
              y: e.y,
              vx: Math.cos(ang) * 230,
              vy: Math.sin(ang) * 230,
              radius: 6,
              color: '#38bdf8',
              damage: 13,
              fromPlayer: false,
              life: 0,
              maxLife: 2.2,
              type: 'GLITCH_DATA',
            });
          });
        }
      }
    });

    this.enemies = this.enemies.filter((e) => {
      if (e.type === 'GLITCH_CAR') {
        return e.x > -160 && e.x < WORLD_WIDTH + 160;
      }
      return e.hp > 0;
    });
  }

  private updateBoss(dt: number) {
    const boss = this.boss;
    if (!boss) return;

    boss.shieldAngle += dt * 2.1;

    if (boss.shieldActive) {
      boss.shieldDuration -= dt;
      if (boss.shieldDuration <= 0) {
        boss.shieldActive = false;
        boss.shieldCooldown = boss.shieldMaxCooldown;
        this.addTextParticle(boss.x, boss.y - 40, '⚡ SHIELD OVERHEAT! FIRE NOW! ⚡', '#ef4444');
        this.glitchIntensity = 0.6;
        sound.playBossAlarm();
      }
    } else {
      boss.shieldCooldown -= dt;
      if (boss.shieldCooldown <= 0) {
        boss.shieldActive = true;
        boss.shieldDuration = 10.0;
        this.addTextParticle(boss.x, boss.y - 40, '🛡️ CHECKMARK SHIELDS RESTORED', '#10b981');
      }
    }

    boss.attackTimer += dt;
    if (boss.attackTimer >= 1.8) {
      boss.attackTimer = 0;

      const projectileCount = 14;
      const chars = ['K9', '7X', '4M', 'W3', 'R2', '9Q', 'V8'];
      for (let i = 0; i < projectileCount; i++) {
        const angle = (i * Math.PI * 2) / projectileCount + boss.shieldAngle;
        this.projectiles.push({
          id: Math.random().toString(),
          x: boss.x,
          y: boss.y,
          vx: Math.cos(angle) * 190,
          vy: Math.sin(angle) * 190,
          radius: 8,
          color: '#ec4899',
          damage: 14,
          fromPlayer: false,
          life: 0,
          maxLife: 4.0,
          type: 'CAPTCHA_CHAR',
          charText: chars[i % chars.length],
        });
      }
    }

    boss.laserTimer += dt;
    if (boss.laserTimer > 6.5 && !boss.laserCharging && !boss.laserFiring) {
      boss.laserCharging = true;
      boss.laserAngle = Math.atan2(this.player.y - boss.y, this.player.x - boss.x);
      sound.playCarWarning();
    } else if (boss.laserCharging && boss.laserTimer > 8.0) {
      boss.laserCharging = false;
      boss.laserFiring = true;
      sound.playBossAlarm();
    } else if (boss.laserFiring) {
      boss.laserAngle += dt * 1.0;
      if (boss.laserTimer > 11.0) {
        boss.laserFiring = false;
        boss.laserTimer = 0;
      }

      const p = this.player;
      const angleToPlayer = Math.atan2(p.y - boss.y, p.x - boss.x);
      const angleDiff = Math.abs(
        Math.atan2(Math.sin(angleToPlayer - boss.laserAngle), Math.cos(angleToPlayer - boss.laserAngle))
      );
      if (angleDiff < 0.14 && p.invincibleTimer <= 0) {
        p.battery = Math.max(0, p.battery - 24);
        p.invincibleTimer = 1.0;
        this.glitchIntensity = 0.8;
        sound.playHit();
        this.addTextParticle(p.x, p.y, 'VERIFICATION LASER HIT! -24%', '#ef4444');
      }
    }

    if (Math.random() < 0.2) {
      boss.glitchOffset = {
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 6,
      };
    } else {
      boss.glitchOffset = { x: 0, y: 0 };
    }

    if (boss.hp <= 0 || boss.isDefeated) {
      if (!boss.isDefeated) {
        boss.isDefeated = true;
        boss.defeatTimer = 0;
        this.gameState = 'BOSS_DEFEAT_CINEMATIC';
        this.enemies = [];
        this.projectiles = this.projectiles.filter((p) => p.fromPlayer);
        this.player.score += 5000;
        sound.playBossCoreMeltdown();
        this.addTextParticle(boss.x, boss.y - 40, '⚠ CORE OVERLOAD INITIATED ⚠', '#ef4444');
      }

      boss.defeatTimer = (boss.defeatTimer || 0) + dt;

      // Cascading secondary explosion arcs across boss chassis
      if (Math.random() < 0.5) {
        const offX = boss.x + (Math.random() - 0.5) * boss.width * 0.9;
        const offY = boss.y + (Math.random() - 0.5) * boss.height * 0.9;
        this.createExplosion(offX, offY, Math.random() > 0.5 ? '#f43f5e' : '#f59e0b', 6);
        this.shockwaves.push({
          x: offX,
          y: offY,
          radius: 4,
          maxRadius: 70 + Math.random() * 50,
          duration: 0.45,
          timer: 0,
        });
      }

      // Shard bursts tearing off the boss
      if (Math.random() < 0.35) {
        const angle = Math.random() * Math.PI * 2;
        this.particles.push({
          x: boss.x + (Math.random() - 0.5) * 40,
          y: boss.y + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * (90 + Math.random() * 140),
          vy: Math.sin(angle) * (90 + Math.random() * 140),
          size: 8 + Math.random() * 14,
          color: '#09090b',
          life: 0.8,
          maxLife: 0.8,
          shape: 'shard',
          rotation: angle,
          vRot: (Math.random() - 0.5) * 10,
        });
      }

      if (boss.defeatTimer >= 3.8) {
        // Final catastrophic shockwave & celebratory spark burst
        this.shockwaves.push({
          x: boss.x,
          y: boss.y,
          radius: 10,
          maxRadius: 380,
          duration: 1.0,
          timer: 0,
        });
        for (let i = 0; i < 40; i++) {
          const a = (i * Math.PI * 2) / 40;
          this.particles.push({
            x: boss.x,
            y: boss.y,
            vx: Math.cos(a) * 240,
            vy: Math.sin(a) * 240,
            size: 6,
            color: i % 2 === 0 ? '#10b981' : '#09090b',
            life: 1.4,
            maxLife: 1.4,
            shape: 'spark',
            rotation: a,
            vRot: 4,
          });
        }
        this.triggerVictory();
      }
      return;
    }
  }

  private updateProjectiles(dt: number) {
    this.projectiles.forEach((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dt;
    });

    this.projectiles = this.projectiles.filter(
      (p) =>
        p.life < p.maxLife &&
        p.x >= -80 &&
        p.x <= WORLD_WIDTH + 80 &&
        p.y >= -80 &&
        p.y <= WORLD_HEIGHT + 80
    );
  }

  private updateParticles(dt: number) {
    this.particles.forEach((pt) => {
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
    });

    this.particles = this.particles.filter((pt) => pt.life > 0);
  }

  private updatePowerUps(dt: number) {
    this.powerUps.forEach((p) => {
      p.duration -= dt;
    });

    this.powerUps = this.powerUps.filter((p) => p.duration > 0);
  }

  private checkCollisions() {
    const p = this.player;

    this.projectiles.forEach((proj) => {
      if (!proj.fromPlayer) return;

      this.enemies.forEach((enemy) => {
        if (enemy.hp <= 0) return;
        const dist = Math.hypot(enemy.x - proj.x, enemy.y - proj.y);
        if (dist < enemy.width / 2 + proj.radius) {
          enemy.hp -= proj.damage;
          proj.life = proj.maxLife;
          this.createExplosion(proj.x, proj.y, '#38bdf8', 5);

          if (enemy.hp <= 0) {
            this.handleEnemyKill(enemy);
          }
        }
      });

      if (this.boss && this.boss.hp > 0) {
        const boss = this.boss;
        const distToBoss = Math.hypot(boss.x - proj.x, boss.y - proj.y);

        if (boss.shieldActive && distToBoss < 135) {
          proj.life = proj.maxLife;
          this.createExplosion(proj.x, proj.y, '#10b981', 6);
          sound.playShieldDeflect();
          this.addTextParticle(proj.x, proj.y, 'BLOCKED BY ✓ SHIELD', '#10b981');
          return;
        }

        if (!boss.shieldActive && distToBoss < boss.width / 2 + 10) {
          boss.hp -= proj.damage;
          proj.life = proj.maxLife;
          p.score += 85;
          this.createExplosion(proj.x, proj.y, '#ef4444', 8);
          this.addTextParticle(proj.x, proj.y, `-${proj.damage}`, '#f87171');
          sound.playBotExplode();
        }
      }
    });

    this.projectiles.forEach((proj) => {
      if (proj.fromPlayer) return;
      if (p.invincibleTimer > 0) return;

      const dist = Math.hypot(p.x - proj.x, p.y - proj.y);
      if (dist < p.width / 2 + proj.radius) {
        p.battery = Math.max(0, p.battery - BATTERY_DRAIN_ON_HIT);
        p.invincibleTimer = 0.8;
        proj.life = proj.maxLife;
        this.glitchIntensity = 0.6;
        sound.playHit();
        this.addTextParticle(p.x, p.y, `-${BATTERY_DRAIN_ON_HIT}% BATTERY`, '#ef4444');
      }
    });

    this.enemies.forEach((enemy) => {
      if (p.invincibleTimer > 0) return;

      const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
      if (dist < p.width / 2 + enemy.width / 2) {
        const damage = enemy.type === 'GLITCH_CAR' ? 30 : 16;
        p.battery = Math.max(0, p.battery - damage);
        p.invincibleTimer = 1.0;
        this.glitchIntensity = 0.7;
        sound.playHit();
        this.addTextParticle(p.x, p.y, `HAZARD HIT! -${damage}%`, '#ef4444');
      }
    });

    this.powerUps = this.powerUps.filter((pup) => {
      const dist = Math.hypot(p.x - (pup.x + pup.width / 2), p.y - (pup.y + pup.height / 2));
      if (dist < p.width / 2 + 16) {
        if (pup.type === 'POWER_BANK') {
          p.battery = Math.min(p.maxBattery, p.battery + 35);
          p.score += 200;
          this.addTextParticle(p.x, p.y, '+35% BATTERY CHARGE!', '#10b981');
        } else if (pup.type === 'WIFI_BOOSTER') {
          p.wifiLevel = Math.min(4, p.wifiLevel + 1);
          p.score += 300;
          this.addTextParticle(p.x, p.y, `5G OVERCLOCK LVL ${p.wifiLevel}!`, '#38bdf8');
        }
        sound.playPowerUp();
        return false;
      }
      return true;
    });

    if (this.captchaGraceTimer <= 0 && this.gameState === 'PLAYING') {
      // Captchas must be solved in order: only the first unsolved zone
      // (the one closest to the start of the road) can be triggered.
      const nextZone = this.captchaZones.find((zone) => !zone.checked);
      if (nextZone) {
        const insideX = p.x >= nextZone.x && p.x <= nextZone.x + nextZone.width;
        const insideY = p.y >= nextZone.y && p.y <= nextZone.y + nextZone.height;

        if (insideX && insideY) {
          nextZone.checked = true;
          this.triggerInteractiveCaptcha();
        }
      }
    }
  }

  private handleEnemyKill(enemy: Enemy) {
    this.player.score += enemy.type === 'GLITCH_CAR' ? 260 : 110;
    this.player.streak += 1;

    if (enemy.type === 'GLITCH_CAR') {
      this.glitchCarsDodgedCount += 1;
    } else {
      this.enemiesDefeatedCount += 1;
    }

    sound.playBotExplode();
    this.createExplosion(enemy.x, enemy.y, enemy.color, 12);
    this.addTextParticle(enemy.x, enemy.y, '+VERIFIED HUMAN', '#10b981');

    // Spam Bots split into 2 fast Mini-Bots upon destruction!
    if (enemy.type === 'SPAM_BOT') {
      [-1, 1].forEach((dir) => {
        this.enemies.push({
          id: Math.random().toString(),
          type: 'MINI_SPAM_BOT',
          x: enemy.x + dir * 16,
          y: enemy.y + dir * 16,
          width: 18,
          height: 18,
          vx: dir * 140,
          vy: 140,
          hp: 20,
          maxHp: 20,
          color: '#f43f5e',
          iconType: 'bot',
        });
      });
    }

    if (Math.random() < 0.25) {
      this.powerUps.push({
        id: Math.random().toString(),
        x: enemy.x,
        y: enemy.y,
        width: 24,
        height: 24,
        type: Math.random() > 0.4 ? 'POWER_BANK' : 'WIFI_BOOSTER',
        duration: 12,
      });
    }
  }

  public triggerInteractiveCaptcha() {
    if (this.activeCaptcha || this.gameState === 'CAPTCHA_POPUP') return;
    this.captchasAttemptedCount += 1;
    this.activeCaptcha = generateRandomCaptcha();
    this.gameState = 'CAPTCHA_POPUP';
    sound.playCarWarning();
  }

  public submitCaptchaResult(success: boolean) {
    this.captchaGraceTimer = 3.0; // 3 second grace buffer to avoid immediate re-trigger
    if (success) {
      this.solvedCaptchasCount += 1;
      this.player.score += 450;
      // Balanced Small Reward: +18% battery + 3s speed boost + mini breathing room shockwave
      this.player.battery = Math.min(this.player.maxBattery, this.player.battery + 18);
      this.player.speedBoostTimer = 3.5;

      // Small tactical shockwave around player (breathing room, not screen wipe)
      this.shockwaves.push({
        x: this.player.x,
        y: this.player.y,
        radius: 10,
        maxRadius: 180,
        duration: 0.5,
        timer: 0,
      });

      // Push back closest 3 enemies
      this.enemies.forEach((enemy) => {
        const dist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
        if (dist < 180) {
          const pushAngle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
          enemy.x += Math.cos(pushAngle) * 80;
          enemy.y += Math.sin(pushAngle) * 80;
          enemy.hp -= 40;
        }
      });

      sound.playCaptchaSuccess();
      this.addTextParticle(this.player.x, this.player.y, '+18% JUICE & SPEED BOOST!', '#10b981');
    } else {
      this.player.battery = Math.max(0, this.player.battery - 15);
      this.glitchIntensity = 0.8;
      sound.playHit();
      this.addTextParticle(this.player.x, this.player.y, 'CAPTCHA FAILED! -15% BATTERY', '#ef4444');
    }

    this.activeCaptcha = null;
    this.gameState = 'PLAYING';
  }

  private checkStageProgress() {
    const config = STAGE_CONFIGS[this.stage];

    if (this.stage === 'STAGE_1_CROSSWALK') {
      if (this.player.score >= config.targetScore || this.stageTimer >= config.duration) {
        this.initStage('STAGE_2_SPAM_GRID');
        sound.playPowerUp();
        this.addTextParticle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'CROSSWALK PASSED! LEVEL 2', '#38bdf8');
      }
    } else if (this.stage === 'STAGE_2_SPAM_GRID') {
      if (this.player.score >= config.targetScore || this.stageTimer >= config.duration) {
        this.initStage('STAGE_3_DISTORTION');
        sound.playPowerUp();
        this.addTextParticle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'FIREWALL WARPED! LEVEL 3', '#a855f7');
      }
    } else if (this.stage === 'STAGE_3_DISTORTION') {
      if (this.player.score >= config.targetScore || this.stageTimer >= config.duration) {
        this.initStage('STAGE_BOSS');
      }
    }
  }

  private triggerGameOver(reason: string) {
    this.gameState = 'GAME_OVER';
    sound.playGameOver();
    this.addTextParticle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, reason, '#ef4444');
  }

  private triggerVictory() {
    this.gameState = 'VICTORY';
    this.packagesDelivered += 1;
    sound.playVictory();
  }

  public createExplosion(x: number, y: number, color: string, count: number = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
        shape: 'square',
      });
    }
  }

  public addTextParticle(x: number, y: number, text: string, color: string = '#ffffff') {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 20,
      vy: -50,
      size: 14,
      color,
      life: 1.2,
      maxLife: 1.2,
      shape: 'text',
      text,
    });
  }
}
