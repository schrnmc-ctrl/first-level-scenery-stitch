import title from '../assets/screen-title.jpg.asset.json';
import victory from '../assets/screen-victory.jpg.asset.json';
import logo from '../assets/screen-logo.png.asset.json';
import upgrades from '../assets/screen-upgrades.jpg.asset.json';

// Edit screen presentation here; gameplay and level scenery are independent.
export const CONFIG = {
  size: { width: 800, height: 450 }, // Logical screen size; images retain their aspect ratio.
  images: { title: title.url, victory: victory.url, logo: logo.url, upgrades: upgrades.url }, // Original-quality hosted images.
  font: '"Press Start 2P", monospace', // Pixel font with a safe local fallback.
  fontUrl: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap', // Loaded with a link, not a CSS import.
  colors: { accent: '#66efff', dark: '#071322', light: '#ffffff', fallback: '#173c4c', panel: 'rgba(255,255,255,0.8)', storyShade: 'rgba(0,0,0,0.6)' }, // Screen palette and readable overlays.
  buttons: { start: 'Press Start', restart: 'Restart', map: 'Enter Level', continue: 'Continue' }, // Button words.
  story: 'You are a normal guy. Robots and ai are taking over with captchas to stop the player from accessing his gmail. You must solve captchas to get to the end and read the gmail.', // Exact story text.
  ending: 'You can finally check your Gmail!', // Final message.
  timing: { storyLine: 1000, fade: 500, flash: 500, blink: 700 }, // Milliseconds for reveals, transitions, one flash and prompts.
  effects: { victoryFlash: true, victoryGlow: true, outline: 5 }, // Code-drawn effects and heading outline.
  upgrades: [ // One upgrade per cleared level, never after Level 3.
    { id: 'battery', label: 'Recharge battery', detail: '+25% battery', amount: 25 },
    { id: 'wifi', label: 'Wi-Fi upgrade', detail: '+1 Wi-Fi level', amount: 1 },
    { id: 'speed', label: 'Speed upgrade', detail: '+30 movement speed', amount: 30 },
  ],
};

export type ScreenId = 'title' | 'story' | 'map' | 'upgrades' | 'victory';