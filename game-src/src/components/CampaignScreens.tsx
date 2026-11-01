import React, { useEffect, useRef, useState } from 'react';
import { CONFIG, type ScreenId } from '../game/screenConfig';
import { CAMPAIGN_STAGES } from '../game/campaign';
import { backgroundUrl } from '../game/levelScenery';

interface Props {
  screen: ScreenId;
  level: number;
  score: number;
  onAction: (action?: string) => void;
}

type HitArea = { label: string; x: number; y: number; width: number; height: number; action?: string };

// Text is drawn on the canvas. These matching controls provide keyboard and touch access.
function ScreenButton({ area, onAction }: { area: HitArea; onAction: Props['onAction'] }) {
  return <button type="button" className="screen-hit-area" aria-label={area.label}
    style={{ left: `${area.x / 8}%`, top: `${area.y / 4.5}%`, width: `${area.width / 8}%`, height: `${area.height / 4.5}%` }}
    onClick={() => onAction(area.action)} />;
}

export function CampaignScreens({ screen, level, score, onAction }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealRef = useRef(false);
  const finishedRef = useRef(false);
  const [storyFinished, setStoryFinished] = useState(false);

  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[data-game-pixel-font]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = CONFIG.fontUrl;
      link.dataset.gamePixelFont = 'true';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat || (event.target as HTMLElement)?.tagName === 'BUTTON') return;
      event.preventDefault();
      if (screen === 'story' && !finishedRef.current) { revealRef.current = true; return; }
      if (screen !== 'upgrades') onAction();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, onAction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    revealRef.current = false;
    finishedRef.current = false;
    setStoryFinished(false);
    const images = new Map<string, HTMLImageElement>();
    for (const url of [...Object.values(CONFIG.images), ...CAMPAIGN_STAGES.map(stage => backgroundUrl(stage)).filter((url): url is string => Boolean(url))]) {
      const image = new Image();
      image.src = url;
      images.set(url, image);
    }
    const start = performance.now();
    let raf = 0;
    const { width: w, height: h } = CONFIG.size;
    const { colors } = CONFIG;

    function text(value: string, x: number, y: number, size = 16, color = colors.accent, outlined = true) {
      if (!ctx) return;
      ctx.font = `${size}px ${CONFIG.font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      if (outlined) { ctx.lineWidth = CONFIG.effects.outline; ctx.strokeStyle = colors.dark; ctx.strokeText(value, x, y); }
      ctx.fillStyle = color;
      ctx.fillText(value, x, y);
    }
    function wrap(value: string, maxWidth: number, size: number) {
      if (!ctx) return [];
      ctx.font = `${size}px ${CONFIG.font}`;
      const lines: string[] = [];
      let line = '';
      for (const word of value.split(' ')) {
        const trial = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(trial).width > maxWidth) { lines.push(line); line = word; }
        else line = trial;
      }
      if (line) lines.push(line);
      return lines;
    }
    function image(url: string, x = 0, y = 0, width = w, height = h) {
      if (!ctx) return false;
      const img = images.get(url);
      if (!img?.complete || !img.naturalWidth) return false;
      // Cover, never stretch. The 1600×900 title/victory draw exactly to 800×450.
      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, width, height); ctx.clip();
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, x + (width - img.naturalWidth * scale) / 2, y + (height - img.naturalHeight * scale) / 2, img.naturalWidth * scale, img.naturalHeight * scale);
      ctx.restore();
      return true;
    }
    function button(area: HitArea, label = area.label) {
      if (!ctx) return;
      ctx.fillStyle = colors.accent; ctx.strokeStyle = colors.dark; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(area.x, area.y, area.width, area.height, 8); ctx.fill(); ctx.stroke();
      text(label, area.x + area.width / 2, area.y + area.height / 2, 16, colors.dark, false);
    }
    function draw(now: number) {
      if (!ctx) return;
      const elapsed = now - start;
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.fallback; ctx.fillRect(0, 0, w, h);
      image(screen === 'victory' ? CONFIG.images.victory : screen === 'upgrades' ? CONFIG.images.upgrades : CONFIG.images.title);
      if (screen === 'title') {
        const logo = images.get(CONFIG.images.logo);
        if (logo?.complete && logo.naturalWidth) {
          const logoWidth = w / 2;
          const logoHeight = logoWidth * logo.naturalHeight / logo.naturalWidth;
          ctx.drawImage(logo, (w - logoWidth) / 2, 24, logoWidth, logoHeight);
        } else text('DELIVERANCE', w / 2, 100, 28);
        button({ label: CONFIG.buttons.start, x: 270, y: 340, width: 260, height: 52 });
        if (Math.floor(elapsed / CONFIG.timing.blink) % 2 === 0) text('Press SPACE to start', 400, 420, 12);
      }
      if (screen === 'story') {
        ctx.fillStyle = colors.storyShade; ctx.fillRect(0, 0, w, h);
        const lines = wrap(CONFIG.story, 690, 16);
        const top = h / 2 - (lines.length - 1) * 17;
        lines.forEach((line, index) => {
          ctx.globalAlpha = revealRef.current ? 1 : Math.max(0, Math.min(1, (elapsed - index * CONFIG.timing.storyLine) / 400));
          text(line, 400, top + index * 34, 16, colors.light);
        });
        ctx.globalAlpha = 1;
        const finished = revealRef.current || elapsed >= (lines.length - 1) * CONFIG.timing.storyLine + 400;
        if (finished && !finishedRef.current) { finishedRef.current = true; setStoryFinished(true); }
        if (finished && Math.floor(elapsed / CONFIG.timing.blink) % 2 === 0) text('Press SPACE to continue', 400, 405, 12);
      }
      if (screen === 'map') {
        ctx.fillStyle = colors.storyShade; ctx.fillRect(0, 0, w, h);
        text('WORLD MAP', 400, 70, 28);
        ctx.strokeStyle = colors.accent; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(180, 220); ctx.lineTo(620, 220); ctx.stroke();
        CAMPAIGN_STAGES.forEach((stage, index) => {
          const x = 90 + index * 220;
          const url = backgroundUrl(stage);
          ctx.fillStyle = colors.fallback; ctx.fillRect(x, 150, 180, 110);
          if (url) image(url, x, 150, 180, 110);
          ctx.strokeStyle = index + 1 === level ? colors.accent : colors.light;
          ctx.lineWidth = index + 1 === level ? 5 : 1;
          ctx.strokeRect(x, 150, 180, 110);
          text(`LEVEL ${index + 1}`, x + 90, 290, 14);
          if (index + 1 < level) text('CLEARED', x + 90, 317, 10);
        });
        button({ label: `${CONFIG.buttons.map} ${level}`, x: 260, y: 357, width: 280, height: 52 });
      }
      if (screen === 'upgrades') {
        ctx.fillStyle = colors.panel; ctx.beginPath(); ctx.roundRect(90, 70, 620, 325, 8); ctx.fill();
        text(`LEVEL ${level} CLEARED`, 400, 108, 20, colors.dark, false);
        text('Choose your upgrade', 400, 154, 16, colors.dark, false);
        CONFIG.upgrades.forEach((upgrade, index) => {
          const area = { label: upgrade.label, x: 140, y: 188 + index * 62, width: 520, height: 50 };
          button(area, upgrade.label);
          text(upgrade.detail, 400, area.y + 39, 9, colors.dark, false);
        });
      }
      if (screen === 'victory') {
        if (CONFIG.effects.victoryGlow) {
          ctx.globalAlpha = 0.06 + (Math.sin(elapsed / 900) + 1) * 0.025;
          ctx.fillStyle = colors.light; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1;
        }
        const lines = wrap(CONFIG.ending, 670, 24);
        lines.forEach((line, index) => text(line, 400, 180 + index * 38, 24));
        text(`FINAL SCORE: ${score}`, 400, 280, 18, colors.light);
        button({ label: CONFIG.buttons.restart, x: 270, y: 350, width: 260, height: 52 });
        if (CONFIG.effects.victoryFlash && elapsed < CONFIG.timing.flash) {
          ctx.globalAlpha = 1 - elapsed / CONFIG.timing.flash;
          ctx.fillStyle = colors.light; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1;
        }
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [screen, level, score]);

  const areas: HitArea[] = screen === 'upgrades'
    ? CONFIG.upgrades.map((upgrade, index) => ({ label: upgrade.label, action: upgrade.id, x: 140, y: 188 + index * 62, width: 520, height: 50 }))
    : screen === 'story' ? [{ label: storyFinished ? 'Continue story' : 'Reveal story', x: 0, y: 0, width: 800, height: 450 }]
    : [{ label: screen === 'title' ? CONFIG.buttons.start : screen === 'victory' ? CONFIG.buttons.restart : `${CONFIG.buttons.map} ${level}`, x: screen === 'map' ? 260 : 270, y: screen === 'title' ? 340 : screen === 'map' ? 357 : 350, width: screen === 'map' ? 280 : 260, height: 52 }];

  return <section className="campaign-screen" aria-label={`${screen} screen`}>
    <div className="campaign-screen-stage">
      <canvas ref={canvasRef} width={CONFIG.size.width} height={CONFIG.size.height} aria-label={screen === 'story' ? CONFIG.story : screen === 'victory' ? `${CONFIG.ending} Final score: ${score}` : `${screen} screen`} />
      {areas.map(area => <ScreenButton key={area.label} area={area} onAction={screen === 'story' && !storyFinished ? () => { revealRef.current = true; } : onAction} />)}
    </div>
  </section>;
}