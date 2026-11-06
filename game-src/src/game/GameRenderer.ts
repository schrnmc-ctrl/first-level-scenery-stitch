import { Player, Enemy, Boss, Projectile, Particle, PowerUp, Shockwave, CaptchaZone, GameSettings } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT, easeInOutSine } from './constants';
import { backgroundUrl, hasImageBackground, LEVEL1_STAGE, LEVEL2_STAGE, LEVEL3_STAGE } from './levelScenery';
import { HERO_IMAGES, heroAnimationFrame } from './hero';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private time: number = 0;
  public stage: string = '';
  private backgrounds = new Map<string, HTMLImageElement>();
  private heroImages = new Map<string, HTMLImageElement>();
  private heroLastPosition: { x: number; y: number } | null = null;
  private heroLastTime = 0;
  private heroRunTime = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    // Preload idle and both run frames once, avoiding loads during animation.
    for (const [frame, url] of Object.entries(HERO_IMAGES)) {
      const image = new Image();
      image.src = url;
      this.heroImages.set(frame, image);
    }
    for (const stage of [LEVEL1_STAGE, LEVEL2_STAGE, LEVEL3_STAGE]) {
      const url = backgroundUrl(stage);
      if (!url) continue;
      const image = new Image();
      image.src = url;
      this.backgrounds.set(stage, image);
    }
  }

  public render(
    time: number,
    player: Player,
    enemies: Enemy[],
    boss: Boss | null,
    projectiles: Projectile[],
    particles: Particle[],
    powerUps: PowerUp[],
    shockwaves: Shockwave[],
    captchaZones: CaptchaZone[],
    scanlines: boolean,
    glitchIntensity: number,
    motionBlur: boolean = true,
    mousePos: { x: number; y: number } = { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 },
    settings?: GameSettings,
    camera: { x: number; y: number } = { x: 0, y: 0 }
  ) {
    this.time = time;
    const ctx = this.ctx;

    try {
      ctx.save();

      // Screen Shake with Settings Scaling and Easing
      const shakeMultiplier =
        settings?.screenShake === 'none' ? 0 :
        settings?.screenShake === 'low' ? 0.45 :
        settings?.screenShake === 'high' ? 1.6 : 1.0;

      if (glitchIntensity > 0 && shakeMultiplier > 0) {
        const clamped = Math.min(1.2, Math.max(0, glitchIntensity)) * shakeMultiplier;
        const offsetX = Math.max(-8, Math.min(8, (Math.random() - 0.5) * clamped * 9));
        const offsetY = Math.max(-8, Math.min(8, (Math.random() - 0.5) * clamped * 9));
        ctx.translate(offsetX, offsetY);
      }

      // 1. Subtle Motion Blur & Canvas Clear
      this.clearCanvas(motionBlur);

      // Static image scenery, exclusive to its own level.
      this.renderStageBackground(camera);

      // --- WORLD SPACE RENDERING (Translated by Camera) ---
      ctx.save();
      ctx.translate(-camera.x, -camera.y);

      // 2. Expanded Cyber Dot Grid & World Boundaries (skipped on Level 1: image background only)
      if (!hasImageBackground(this.stage)) this.renderWorldGrid(camera);

      // 3. Multi-Lane Highways & Checkpoint Terminals
      this.renderEnvironment(captchaZones, enemies, player);

      // 4. Power-Ups (Rotating Diamonds)
      this.renderPowerUps(powerUps);

      // 5. Shockwaves (Smooth Inverted Expanding Rings)
      this.renderShockwaves(shockwaves);

      // 6. Aim Guide Laser Sight (From Player towards Target)
      if (settings?.showAimLaser && player) {
        this.renderAimLaser(player, mousePos, settings.aimMode);
      }

      // 7. Enemies (Glitch Cars, Bots, Drones)
      this.renderEnemies(enemies, motionBlur);

      // 8. Boss (Monolithic Core)
      if (boss) {
        this.renderBoss(boss);
      }

      // 9. Player (Sleek Geometric Core)
      this.renderPlayer(player, motionBlur);

      // 10. Dynamic Aim Reticle / Crosshair in World Space
      if (settings?.showAimCrosshair) {
        this.renderAimCrosshair(mousePos);
      }

      // 11. Projectiles (Wi-Fi Pulses & Data Bullets)
      this.renderProjectiles(projectiles, motionBlur);

      // 12. Particles & Text Overlays
      this.renderParticles(particles);

      ctx.restore();
      // --- END WORLD SPACE RENDERING ---

      // --- SCREEN SPACE HUD OVERLAYS ---
      // 13. Low Battery Pulsing Screen Border
      if (player && player.battery < 25) {
        this.renderLowBatteryWarning(player.battery);
      }

      // 14. Tactical Sector Mini-Map Radar (Top-Right HUD Corner)
      this.renderTacticalMiniMap(player, enemies, boss, powerUps, captchaZones, camera);

      // 15. Subtle Minimalist Scanlines
      if (scanlines) {
        this.renderScanlines();
      }

      ctx.restore();
    } catch {
      ctx.restore();
    }
  }

  private clearCanvas(motionBlur: boolean) {
    const ctx = this.ctx;
    const margin = 80;
    const fullW = CANVAS_WIDTH + margin * 2;
    const fullH = CANVAS_HEIGHT + margin * 2;

    if (motionBlur) {
      // Very subtle, refined motion blur: 86% opacity ensures clear visibility without ghosting smudges
      ctx.fillStyle = 'rgba(248, 250, 252, 0.86)';
      ctx.fillRect(-margin, -margin, fullW, fullH);
    } else {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-margin, -margin, fullW, fullH);
    }
  }

  private renderStageBackground(camera: { x: number; y: number }) {
    const img = this.backgrounds.get(this.stage);
    if (!img?.complete || !img.naturalWidth) return;
    const ctx = this.ctx;
    // Background is fixed to the world (moves 1:1 with the camera, no parallax).
    const parallax = 1.0;
    // Scale to cover the canvas plus the full parallax travel range.
    const needW = CANVAS_WIDTH + (WORLD_WIDTH - CANVAS_WIDTH) * parallax;
    const needH = CANVAS_HEIGHT + (WORLD_HEIGHT - CANVAS_HEIGHT) * parallax;
    const scale = Math.max(needW / img.width, needH / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      img,
      -camera.x * parallax - (w - needW) / 2,
      -camera.y * parallax - (h - needH) / 2,
      w,
      h
    );
    ctx.restore();
  }

  private renderWorldGrid(camera: { x: number; y: number }) {
    const ctx = this.ctx;

    // Outer World Boundaries (Crisp Boundary Lines & Hazard Chevrons)
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Hazard Stripes on Arena Perimeter
    ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
    const stripeWidth = 16;
    for (let x = 0; x < WORLD_WIDTH; x += stripeWidth * 2) {
      // Top & Bottom border stripes
      ctx.fillRect(x, 0, stripeWidth, 8);
      ctx.fillRect(x, WORLD_HEIGHT - 8, stripeWidth, 8);
    }
    for (let y = 0; y < WORLD_HEIGHT; y += stripeWidth * 2) {
      // Left & Right border stripes
      ctx.fillRect(0, y, 8, stripeWidth);
      ctx.fillRect(WORLD_WIDTH - 8, y, 8, stripeWidth);
    }

    // Dot Matrix Grid (Culled to Visible Camera Region + Margin)
    const gridSize = 48;
    const startX = Math.max(24, Math.floor((camera.x - 60) / gridSize) * gridSize);
    const endX = Math.min(WORLD_WIDTH - 24, Math.ceil((camera.x + CANVAS_WIDTH + 60) / gridSize) * gridSize);
    const startY = Math.max(24, Math.floor((camera.y - 60) / gridSize) * gridSize);
    const endY = Math.min(WORLD_HEIGHT - 24, Math.ceil((camera.y + CANVAS_HEIGHT + 60) / gridSize) * gridSize);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.09)';
    for (let x = startX; x <= endX; x += gridSize) {
      for (let y = startY; y <= endY; y += gridSize) {
        ctx.fillRect(x - 1, y - 1, 2, 2);
      }
    }

    // Ambient floating cyber motes / data dust with smooth sinusoidal oscillation
    const t = this.time;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
    for (let i = 0; i < 28; i++) {
      const baseX = (i * 149 + 50) % WORLD_WIDTH;
      const baseY = (i * 181 + 70) % WORLD_HEIGHT;
      const waveX = baseX + Math.sin(t * 0.8 + i) * 32;
      const waveY = (baseY - t * (14 + (i % 6) * 3)) % WORLD_HEIGHT;
      const finalY = waveY < 0 ? waveY + WORLD_HEIGHT : waveY;
      const moteSize = (i % 3 === 0) ? 2.5 : 1.5;
      ctx.fillRect(waveX, finalY, moteSize, moteSize);
    }
  }

  private renderEnvironment(zones: CaptchaZone[], enemies: Enemy[], player: Player) {
    const ctx = this.ctx;

    // Multi-Lane Highways spanning across the 2400x1500 Cyber Arena
    // (skipped on Level 1: only the image background, enemies and captcha gates show)
    const lanes = hasImageBackground(this.stage) ? [] : [260, 520, 780, 1040, 1280];

    lanes.forEach((laneY, idx) => {
      // Lane bed outline in crisp dark line
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, laneY - 36, WORLD_WIDTH, 72);

      // Minimalist dashed center divider
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.24)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([14, 14]);
      ctx.beginPath();
      ctx.moveTo(0, laneY);
      ctx.lineTo(WORLD_WIDTH, laneY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Clean zebra crossing lines in soft charcoal
      ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
      for (let x = 140; x < WORLD_WIDTH - 140; x += 160) {
        for (let stripe = 0; stripe < 3; stripe++) {
          ctx.fillRect(x + stripe * 14, laneY - 30, 7, 60);
        }
      }

      // Sector Highway Label
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.textAlign = 'left';
      ctx.fillText(`HIGHWAY-CORRIDOR // SECTOR-0${idx + 1}`, 30, laneY - 42);
    });

    // Render Clean Inverted Gateways (in solve order along the road)
    const nextZone = zones.find((z) => !z.checked);
    zones.forEach((zone, idx) => {
      const status = zone.checked ? 'solved' : zone === nextZone ? 'next' : 'locked';
      this.renderMinimalTerminal(zone, player, status, idx + 1);
    });
  }

  private renderMinimalTerminal(
    zone: CaptchaZone,
    player: Player,
    status: 'solved' | 'next' | 'locked' = zone.checked ? 'solved' : 'next',
    order: number = 1
  ) {
    const ctx = this.ctx;
    const centerX = zone.x + zone.width / 2;
    const centerY = zone.y + zone.height / 2;

    const distToPlayer = Math.hypot(player.x - centerX, player.y - centerY);
    const isNearby = distToPlayer < 120;
    const t = this.time;

    // Ease-in and ease-out breathing cycle
    const breathe = easeInOutSine((Math.sin(t * 3.5) + 1) * 0.5);

    ctx.save();
    ctx.translate(centerX, centerY);

    const isL1 = hasImageBackground(this.stage);

    if (isL1) {
      // High-visibility gates that pop against the busy pixel-art background
      const accent =
        status === 'solved' ? '#4ade80' : status === 'next' ? '#22d3ee' : '#64748b';

      // Soft glowing backdrop panel
      ctx.save();
      ctx.shadowColor = accent;
      ctx.shadowBlur = status === 'next' ? 26 : 12;
      ctx.fillStyle =
        status === 'solved'
          ? 'rgba(6, 40, 24, 0.85)'
          : status === 'next'
          ? 'rgba(8, 47, 73, 0.88)'
          : 'rgba(15, 23, 42, 0.72)';
      ctx.fillRect(-zone.width / 2, -zone.height / 2, zone.width, zone.height);
      ctx.restore();

      // Border (dashed & dim when locked)
      ctx.strokeStyle = accent;
      ctx.lineWidth = status === 'next' ? 3 : 2;
      if (status === 'locked') ctx.setLineDash([6, 5]);
      ctx.globalAlpha = status === 'locked' ? 0.55 : 1;
      ctx.strokeRect(-zone.width / 2, -zone.height / 2, zone.width, zone.height);
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Always-on pulsing beacon around the NEXT gate to solve
      if (status === 'next') {
        const ringRadius = zone.width / 2 + 12 + breathe * 10;
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.75 - breathe * 0.45})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Order number badge (top-left corner)
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(-zone.width / 2, -zone.height / 2, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0b1120';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(order), -zone.width / 2, -zone.height / 2);

      // Center label
      ctx.font = 'bold 13px monospace';
      if (status === 'solved') {
        ctx.fillStyle = '#4ade80';
        ctx.fillText('✓ VERIFIED', 0, 0);
      } else if (status === 'next') {
        ctx.fillStyle = '#a5f3fc';
        ctx.fillText(`SOLVE: ${zone.category.toUpperCase().slice(0, 10)}`, 0, 0);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('🔒 LOCKED', 0, 0);
      }

      ctx.restore();
      return;
    }

    // Terminal Outer Bounding Box (Crisp Black Geometry)
    ctx.strokeStyle = zone.checked
      ? '#09090b'
      : isNearby
      ? '#09090b'
      : 'rgba(9, 9, 11, 0.65)';
    ctx.lineWidth = isNearby ? 2.5 : 1.5;

    ctx.strokeRect(-zone.width / 2, -zone.height / 2, zone.width, zone.height);

    // Dynamic Corner Brackets
    const bracketSize = 8;
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-zone.width / 2 - 2, -zone.height / 2 - 2, bracketSize, 3);
    ctx.fillRect(-zone.width / 2 - 2, -zone.height / 2 - 2, 3, bracketSize);
    ctx.fillRect(zone.width / 2 - bracketSize + 2, -zone.height / 2 - 2, bracketSize, 3);
    ctx.fillRect(zone.width / 2 - 1, -zone.height / 2 - 2, 3, bracketSize);
    ctx.fillRect(-zone.width / 2 - 2, zone.height / 2 - 1, bracketSize, 3);
    ctx.fillRect(-zone.width / 2 - 2, zone.height / 2 - bracketSize + 2, 3, bracketSize);
    ctx.fillRect(zone.width / 2 - bracketSize + 2, zone.height / 2 - 1, bracketSize, 3);
    ctx.fillRect(zone.width / 2 - 1, zone.height / 2 - bracketSize + 2, 3, bracketSize);

    // Proximity Beacon Rings with Ease-in-out breathing
    if (isNearby && !zone.checked) {
      const ringRadius = (zone.width / 2 + 14) + breathe * 8;
      ctx.strokeStyle = `rgba(9, 9, 11, ${0.45 - breathe * 0.25})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Centered Verification Icon
    ctx.fillStyle = '#09090b';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (zone.checked) {
      ctx.fillText('✓ VERIFIED', 0, 0);
    } else {
      ctx.fillText(zone.category.toUpperCase().slice(0, 10), 0, 0);
    }

    // Top status indicator
    ctx.font = 'bold 9px monospace';
    if (zone.checked) {
      ctx.fillStyle = '#09090b';
      ctx.fillText('[ RECHARGED ]', 0, -36);
    } else {
      ctx.fillStyle = isNearby ? '#09090b' : 'rgba(9, 9, 11, 0.65)';
      ctx.fillText(isNearby ? '[ ENTER ZONE ]' : '[ CAPTCHA GATE ]', 0, -36);
    }

    ctx.restore();
  }

  private renderAimLaser(player: Player, mousePos: { x: number; y: number }, aimMode: string) {
    const ctx = this.ctx;
    ctx.save();

    const p = player;
    const startX = p.x + Math.cos(p.angle) * 16;
    const startY = p.y + Math.sin(p.angle) * 16;

    let targetX = mousePos.x;
    let targetY = mousePos.y;

    if (aimMode === 'MOVEMENT_DIRECTION') {
      targetX = p.x + Math.cos(p.angle) * 350;
      targetY = p.y + Math.sin(p.angle) * 350;
    }

    // Dynamic ease-in-out laser opacity pulse
    const pulse = easeInOutSine((Math.sin(this.time * 6) + 1) * 0.5);
    const laserAlpha = 0.22 + pulse * 0.16;

    // Laser Line (crisp minimalist dashed line in dark charcoal)
    ctx.strokeStyle = `rgba(9, 9, 11, ${laserAlpha})`;
    ctx.lineWidth = 1.25;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Small laser impact point
    ctx.fillStyle = `rgba(9, 9, 11, ${0.4 + pulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(targetX, targetY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderAimCrosshair(mousePos: { x: number; y: number }) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(mousePos.x, mousePos.y);

    const pulse = easeInOutSine((Math.sin(this.time * 4) + 1) * 0.5);
    const radius = 10 + pulse * 2;

    // Center dot
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    // 4 Crosshair ticks with smooth spacing
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;

    // Top tick
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(0, -radius - 5);
    ctx.stroke();

    // Bottom tick
    ctx.beginPath();
    ctx.moveTo(0, radius);
    ctx.lineTo(0, radius + 5);
    ctx.stroke();

    // Left tick
    ctx.beginPath();
    ctx.moveTo(-radius, 0);
    ctx.lineTo(-radius - 5, 0);
    ctx.stroke();

    // Right tick
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(radius + 5, 0);
    ctx.stroke();

    // Subtle faint outer ring
    ctx.strokeStyle = 'rgba(9, 9, 11, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  private renderLowBatteryWarning(battery: number) {
    const ctx = this.ctx;
    const pulse = easeInOutSine((Math.sin(this.time * 6) + 1) * 0.5);
    const alpha = (1 - battery / 25) * (0.18 + pulse * 0.22);

    ctx.save();
    ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, CANVAS_WIDTH - 8, CANVAS_HEIGHT - 8);
    ctx.restore();
  }

  private renderPowerUps(powerUps: PowerUp[]) {
    const ctx = this.ctx;
    powerUps.forEach((p) => {
      ctx.save();
      ctx.translate(p.x + p.width / 2, p.y + p.height / 2);

      // Smooth ease-in-out bobbing
      const bob = easeInOutSine((Math.sin(this.time * 4.5 + p.x * 0.05) + 1) * 0.5) * 6 - 3;
      ctx.translate(0, bob);

      // Rotating Clean Inverted Geometric Diamond
      ctx.save();
      ctx.rotate(this.time * 2.2);
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-11, -11, 22, 22);
      ctx.restore();

      // Inner Clean Shape
      ctx.fillStyle = '#09090b';
      if (p.type === 'POWER_BANK') {
        // Battery Rectangle
        ctx.fillRect(-6, -8, 12, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -6, 8, 12);
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-2, -10, 4, 2);
      } else {
        // 4-Bar Signal
        for (let b = 0; b < 3; b++) {
          ctx.fillRect(-6 + b * 4, 6 - (b + 1) * 4, 3, (b + 1) * 4);
        }
      }

      // Minimalist Label
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#09090b';
      ctx.textAlign = 'center';
      ctx.fillText(p.type === 'POWER_BANK' ? '+BAT' : '+WIFI', 0, 22);

      ctx.restore();
    });
  }

  private renderShockwaves(shockwaves: Shockwave[]) {
    const ctx = this.ctx;
    shockwaves.forEach((sw) => {
      const progress = sw.timer / sw.duration;
      const easedProgress = easeInOutSine(progress);
      const alpha = 1 - easedProgress;
      ctx.save();

      // Outer crisp circle
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(9, 9, 11, ${alpha * 0.9})`;
      ctx.lineWidth = 2.5 * (1 - progress * 0.4);
      ctx.stroke();

      // Inner faint circle
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, Math.max(0, sw.radius - 12), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(9, 9, 11, ${alpha * 0.4})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    });
  }

  private renderPlayer(player: Player, motionBlur: boolean) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(player.x, player.y);

    // Soft drop shadow beneath the player
    ctx.fillStyle = 'rgba(9, 9, 11, 0.28)';
    ctx.beginPath();
    ctx.ellipse(3, 10, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Buttery Smooth Motion Blur Trailing Geometry
    if (motionBlur && (Math.abs(player.vx) > 15 || Math.abs(player.vy) > 15)) {
      ctx.fillStyle = 'rgba(9, 9, 11, 0.16)';
      ctx.beginPath();
      ctx.arc(-player.vx * 0.045, -player.vy * 0.045, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(9, 9, 11, 0.08)';
      ctx.beginPath();
      ctx.arc(-player.vx * 0.09, -player.vy * 0.09, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Invincibility flashing
    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 16) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    // Animate actual displacement, not held keys, so walls and pauses show idle.
    const previous = this.heroLastPosition;
    const moving = previous !== null && Math.hypot(player.x - previous.x, player.y - previous.y) > 0.001;
    const elapsed = Math.max(0, Math.min(0.04, this.time - this.heroLastTime));
    this.heroRunTime = moving ? this.heroRunTime + elapsed : 0;
    this.heroLastPosition = { x: player.x, y: player.y };
    this.heroLastTime = this.time;
    const frame = this.heroImages.get(heroAnimationFrame(moving, this.heroRunTime));
    // Keep idle as a fallback if a run image has not finished loading.
    const hero = frame?.complete && frame.naturalWidth ? frame : this.heroImages.get('idle');
    if (hero?.complete && hero.naturalWidth) {
      // Never rotate the right-facing art with aim; scale up from its feet.
      ctx.imageSmoothingEnabled = false;
      const height = player.height;
      const width = height * hero.naturalWidth / hero.naturalHeight;
      const feetY = player.height / 2;
      ctx.drawImage(hero, -width / 2, feetY - height, width, height);
      ctx.restore();
      return;
    }

    // Wi-Fi signal circle ring surrounding user with subtle ease-in-out expansion
    const pulse = easeInOutSine((Math.sin(this.time * 5) + 1) * 0.5);
    const auraRadius = 24 + (player.wifiLevel - 1) * 4 + pulse * 2;
    ctx.strokeStyle = 'rgba(9, 9, 11, 0.28)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rotate towards aim angle
    ctx.rotate(player.angle);

    // Forward Aim Pointer Beam Line
    ctx.strokeStyle = 'rgba(9, 9, 11, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(24, 0);
    ctx.stroke();

    // Main Player Body: Clean Crisp Jet-Black Circle
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();

    // White Inner Core Ring
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // Direction Pointer Triangle in Black
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(11, 0);
    ctx.lineTo(3, -5);
    ctx.lineTo(3, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private renderEnemies(enemies: Enemy[], motionBlur: boolean) {
    const ctx = this.ctx;

    enemies.forEach((enemy) => {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);

      // Soft drop shadow beneath the enemy
      ctx.fillStyle = 'rgba(9, 9, 11, 0.24)';
      ctx.beginPath();
      ctx.ellipse(3, enemy.height / 2 - 1, enemy.width / 2 + 2, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // High-visibility halo so enemies pop against the busy Level 1 background
      if (hasImageBackground(this.stage)) {
        ctx.save();
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 18;
        ctx.fillStyle = `${enemy.color}2e`;
        ctx.beginPath();
        ctx.ellipse(0, 0, enemy.width / 2 + 7, enemy.height / 2 + 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = enemy.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, enemy.width / 2 + 7, enemy.height / 2 + 7, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (enemy.type === 'GLITCH_CAR') {
        this.renderGlitchCar(enemy, motionBlur);
      } else if (enemy.type === 'TRAFFIC_LIGHT') {
        this.renderTrafficLight(enemy);
      } else if (enemy.type === 'SPAM_BOT') {
        this.renderSpamBot(enemy);
      } else if (enemy.type === 'MINI_SPAM_BOT') {
        this.renderMiniSpamBot(enemy);
      } else if (enemy.type === 'BICYCLE_DRONE') {
        this.renderBicycleDrone(enemy);
      } else if (enemy.type === 'FIRE_HYDRANT_BOT') {
        this.renderHydrantBot(enemy);
      } else {
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
      }

      // Minimalist Health Line (only shown if damaged)
      if (enemy.hp < enemy.maxHp) {
        const hpBarW = enemy.width;
        const hpPercent = Math.max(0, enemy.hp / enemy.maxHp);
        ctx.fillStyle = 'rgba(9, 9, 11, 0.2)';
        ctx.fillRect(-hpBarW / 2, -enemy.height / 2 - 8, hpBarW, 2);
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-hpBarW / 2, -enemy.height / 2 - 8, hpBarW * hpPercent, 2);
      }

      ctx.restore();
    });
  }

  private renderGlitchCar(car: Enemy, motionBlur: boolean) {
    const ctx = this.ctx;
    const w = car.width;
    const h = car.height;

    const isGoingRight = car.vx > 0;
    if (!isGoingRight && car.vx !== 0) {
      ctx.scale(-1, 1);
    }

    // Motion Blur Trail in soft dark shade
    if (motionBlur) {
      ctx.fillStyle = 'rgba(9, 9, 11, 0.12)';
      ctx.fillRect(-w / 2 - 20, -h / 2, 20, h);
    }

    // Clean Minimalist Car Body: Outlined Sleek Rectangle in Black
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    // Inner Cabin Square
    ctx.strokeRect(-w / 4, -h / 3, w / 2, h * 0.66);

    // Headlight Beam Line in Black/Charcoal
    ctx.strokeStyle = 'rgba(9, 9, 11, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2 + 40, 0);
    ctx.stroke();
  }

  private renderTrafficLight(light: Enemy) {
    const ctx = this.ctx;
    const w = light.width;
    const h = light.height;

    // Minimalist Vertical Pill
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    const lensRadius = 5;
    const states = [
      { active: light.activeState === 'RED', y: -h / 3 },
      { active: light.activeState === 'YELLOW', y: 0 },
      { active: light.activeState === 'GREEN', y: h / 3 },
    ];

    states.forEach((lens) => {
      ctx.beginPath();
      ctx.arc(0, lens.y, lensRadius, 0, Math.PI * 2);
      if (lens.active) {
        ctx.fillStyle = '#09090b';
        ctx.fill();
        ctx.strokeStyle = '#09090b';
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(9, 9, 11, 0.3)';
        ctx.stroke();
      }
    });
  }

  private renderSpamBot(bot: Enemy) {
    const ctx = this.ctx;
    const w = bot.width;
    const h = bot.height;

    // Minimalist Diamond Shape (Rotated Square in Black)
    ctx.save();
    ctx.rotate(Math.PI / 4);
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-w * 0.35, -h * 0.35, w * 0.7, h * 0.7);

    // Inner solid dot
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();

    // Antenna Line
    ctx.strokeStyle = 'rgba(9, 9, 11, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(0, -h / 2 - 6);
    ctx.stroke();
  }

  private renderMiniSpamBot(bot: Enemy) {
    const ctx = this.ctx;
    const w = bot.width;

    // Small clean triangle in Black
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -w / 2);
    ctx.lineTo(w / 2, w / 2);
    ctx.lineTo(-w / 2, w / 2);
    ctx.closePath();
    ctx.stroke();
  }

  private renderBicycleDrone(drone: Enemy) {
    const ctx = this.ctx;
    const r = drone.width / 2;

    // Outer Circle Ring in Black
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating 4-Point Cross
    ctx.save();
    ctx.rotate(this.time * 6);
    ctx.beginPath();
    ctx.moveTo(-r + 3, 0);
    ctx.lineTo(r - 3, 0);
    ctx.moveTo(0, -r + 3);
    ctx.lineTo(0, r - 3);
    ctx.stroke();
    ctx.restore();
  }

  private renderHydrantBot(bot: Enemy) {
    const ctx = this.ctx;
    const w = bot.width;
    const h = bot.height;

    // Clean Hexagon / Trapezoid in Black
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.beginPath();
    ctx.arc(0, -h / 2, 6, Math.PI, 0);
    ctx.stroke();
  }

  private renderBoss(boss: Boss) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(boss.x + boss.glitchOffset.x, boss.y + boss.glitchOffset.y);

    const w = boss.width;
    const h = boss.height;

    // Main Boss Frame: Clean Minimalist Monolith Box in Black
    ctx.strokeStyle = boss.shieldActive ? '#09090b' : 'rgba(9, 9, 11, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    // Top Header Divider
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2 + 24);
    ctx.lineTo(w / 2, -h / 2 + 24);
    ctx.stroke();

    ctx.fillStyle = '#09090b';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CORE // NOT A ROBOT', -w / 2 + 10, -h / 2 + 16);

    ctx.textAlign = 'right';
    ctx.fillText(
      boss.shieldActive ? `SHIELD (${Math.ceil(boss.shieldDuration)}s)` : 'EXPOSED!',
      w / 2 - 10,
      -h / 2 + 16
    );

    // Minimalist Geometric Eye Core with Ease-In-Out Movement
    const eyeRadius = 32;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 6, eyeRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Pupil in Black
    const pupilX = Math.sin(this.time * 2.5) * 6;
    const pupilY = Math.cos(this.time * 2) * 6;
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(pupilX, 6 + pupilY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting Satellite Shields (Geometric Diamonds in Black)
    if (boss.shieldActive) {
      const shieldCount = 6;
      const orbitRadius = 110;

      for (let i = 0; i < shieldCount; i++) {
        const angle = boss.shieldAngle + (i * Math.PI * 2) / shieldCount;
        const sx = Math.cos(angle) * orbitRadius;
        const sy = Math.sin(angle) * orbitRadius;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angle);

        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2;
        ctx.strokeRect(-12, -12, 24, 24);

        ctx.fillStyle = '#09090b';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', 0, 0);

        ctx.restore();
      }
    }

    // Laser Beam in Black with Ease-In-Out Pulse
    if (boss.laserFiring || boss.laserCharging) {
      ctx.save();
      ctx.rotate(boss.laserAngle);

      if (boss.laserCharging) {
        const laserPulse = easeInOutSine((Math.sin(this.time * 12) + 1) * 0.5);
        ctx.strokeStyle = `rgba(9, 9, 11, ${0.35 + laserPulse * 0.35})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(CANVAS_WIDTH * 1.5, 0);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, -12, CANVAS_WIDTH * 1.5, 24);
      }
      ctx.restore();
    }

    // Minimalist Boss Health Bar or Core Meltdown Banner
    if (boss.isDefeated) {
      const overloadProgress = Math.min(1, (boss.defeatTimer || 0) / 3.6);
      ctx.fillStyle = '#e11d48';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`CORE COLLAPSE // MELTDOWN ${Math.round(overloadProgress * 100)}%`, 0, -h / 2 - 16);

      // Expanding EMP Fracture Rings
      const ringCount = 3;
      for (let r = 0; r < ringCount; r++) {
        const ringProgress = (overloadProgress * 3 + r * 0.33) % 1;
        const ringRadius = 40 + ringProgress * 140;
        ctx.strokeStyle = `rgba(225, 29, 72, ${1 - ringProgress})`;
        ctx.lineWidth = 2 * (1 - ringProgress);
        ctx.beginPath();
        ctx.arc(0, 6, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Overload Electric Fissure Lines across boss body
      ctx.strokeStyle = 'rgba(9, 9, 11, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 4);
      ctx.lineTo(-w / 6, 0);
      ctx.lineTo(w / 4, -h / 6);
      ctx.lineTo(w / 2, h / 3);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-w / 3, h / 2);
      ctx.lineTo(0, h / 6);
      ctx.lineTo(w / 3, h / 2);
      ctx.stroke();
    } else {
      const bossHpPct = Math.max(0, boss.hp / boss.maxHp);
      const hpBarW = 200;
      ctx.strokeStyle = 'rgba(9, 9, 11, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-hpBarW / 2, -h / 2 - 14, hpBarW, 6);
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-hpBarW / 2, -h / 2 - 14, hpBarW * bossHpPct, 6);
    }

    ctx.restore();
  }

  private renderProjectiles(projectiles: Projectile[], motionBlur: boolean) {
    const ctx = this.ctx;

    projectiles.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.type === 'WIFI_PULSE') {
        const angle = Math.atan2(p.vy, p.vx);
        ctx.rotate(angle);

        // Motion Blur Trail
        if (motionBlur) {
          ctx.strokeStyle = 'rgba(9, 9, 11, 0.25)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-16, 0);
          ctx.lineTo(-4, 0);
          ctx.stroke();
        }

        // Crisp Black Geometric Wi-Fi Arc
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-4, 0, 8, -Math.PI / 2.5, Math.PI / 2.5);
        ctx.stroke();

        ctx.fillStyle = '#09090b';
        ctx.fillRect(-2, -2, 4, 4);
      } else if (p.type === 'CAPTCHA_CHAR') {
        // Boss Character Bullet: Clean Outlined Square with Char in Black
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-10, -10, 20, 20);

        ctx.fillStyle = '#09090b';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.charText || 'K9', 0, 0);
      } else {
        // Clean Minimalist Enemy Bullet: Solid Black Circle
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  private renderParticles(particles: Particle[]) {
    const ctx = this.ctx;

    particles.forEach((pt) => {
      const progress = 1 - Math.max(0, pt.life / pt.maxLife);
      const alpha = 1 - easeInOutSine(progress);
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.translate(pt.x, pt.y);

      if (pt.rotation !== undefined) {
        ctx.rotate(pt.rotation + (pt.vRot || 0) * (pt.maxLife - pt.life));
      }

      // Clean Minimalist Geometric Spark Dot, Shard, Ring, or Text in Black/Color
      ctx.fillStyle = pt.color || '#09090b';
      ctx.strokeStyle = pt.color || '#09090b';

      if (pt.shape === 'text' && pt.text) {
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(pt.text, 0, 0);
      } else if (pt.shape === 'ring') {
        const ringRad = Math.max(1, pt.size * (1 + progress * 2));
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, ringRad, 0, Math.PI * 2);
        ctx.stroke();
      } else if (pt.shape === 'shard') {
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-pt.size, 0);
        ctx.lineTo(pt.size, 0);
        ctx.stroke();
      } else if (pt.shape === 'spark') {
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-pt.size, 0);
        ctx.lineTo(pt.size, 0);
        ctx.moveTo(0, -pt.size);
        ctx.lineTo(0, pt.size);
        ctx.stroke();
      } else if (pt.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, pt.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size);
      }

      ctx.restore();
    });
  }

  private renderTacticalMiniMap(
    player: Player,
    enemies: Enemy[],
    boss: Boss | null,
    powerUps: PowerUp[],
    captchaZones: CaptchaZone[],
    camera: { x: number; y: number }
  ) {
    const ctx = this.ctx;
    ctx.save();

    const mapW = 144;
    const mapH = 90;
    const mapX = CANVAS_WIDTH - mapW - 18;
    const mapY = 16;

    const scaleX = mapW / WORLD_WIDTH;
    const scaleY = mapH / WORLD_HEIGHT;

    // Mini-Map Frame & Translucent Backdrop
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(mapX, mapY, mapW, mapH);

    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mapX, mapY, mapW, mapH);

    // Highway Lane Guidelines on Mini-Map
    const lanes = [260, 520, 780, 1040, 1280];
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
    ctx.lineWidth = 1;
    lanes.forEach((laneY) => {
      const my = mapY + laneY * scaleY;
      ctx.beginPath();
      ctx.moveTo(mapX, my);
      ctx.lineTo(mapX + mapW, my);
      ctx.stroke();
    });

    // CAPTCHA Zones
    captchaZones.forEach((zone) => {
      ctx.strokeStyle = zone.checked ? 'rgba(16, 185, 129, 0.7)' : 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        mapX + zone.x * scaleX,
        mapY + zone.y * scaleY,
        Math.max(4, zone.width * scaleX),
        Math.max(3, zone.height * scaleY)
      );
    });

    // Power-Ups
    powerUps.forEach((pu) => {
      ctx.fillStyle = pu.type === 'POWER_BANK' ? '#10b981' : '#38bdf8';
      ctx.fillRect(mapX + pu.x * scaleX - 1.5, mapY + pu.y * scaleY - 1.5, 3, 3);
    });

    // Enemies & Glitch Cars
    enemies.forEach((e) => {
      if (e.type === 'GLITCH_CAR') {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(mapX + e.x * scaleX - 2, mapY + e.y * scaleY - 1, 4, 2);
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(mapX + e.x * scaleX, mapY + e.y * scaleY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Boss Blip
    if (boss) {
      const pulse = easeInOutSine((Math.sin(this.time * 6) + 1) * 0.5);
      ctx.fillStyle = boss.shieldActive ? '#9333ea' : '#e11d48';
      ctx.beginPath();
      ctx.arc(mapX + boss.x * scaleX, mapY + boss.y * scaleY, 4 + pulse * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Camera Frustum Viewport Box
    const camBoxX = mapX + camera.x * scaleX;
    const camBoxY = mapY + camera.y * scaleY;
    const camBoxW = CANVAS_WIDTH * scaleX;
    const camBoxH = CANVAS_HEIGHT * scaleY;

    ctx.strokeStyle = 'rgba(9, 9, 11, 0.55)';
    ctx.lineWidth = 1.25;
    ctx.setLineDash([3, 2]);
    ctx.strokeRect(camBoxX, camBoxY, camBoxW, camBoxH);
    ctx.setLineDash([]);

    // Player Blip & Pointer
    const px = mapX + player.x * scaleX;
    const py = mapY + player.y * scaleY;

    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Small heading pointer
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(player.angle) * 5, py + Math.sin(player.angle) * 5);
    ctx.stroke();

    // Radar Header Label
    ctx.fillStyle = '#09090b';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('RADAR // 2.4k SECTOR', mapX + 5, mapY + 10);

    // Coordinates Footnote
    ctx.font = '7px monospace';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillText(`X:${Math.round(player.x)} Y:${Math.round(player.y)}`, mapX + 5, mapY + mapH - 4);

    ctx.restore();
  }

  private renderScanlines() {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.035)';
    for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
      ctx.fillRect(0, y, CANVAS_WIDTH, 1.5);
    }
    ctx.restore();
  }
}
