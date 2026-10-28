/**
 * Web Audio API synthesizer for retro chiptune and cyber-glitch game sound effects.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public enabled: boolean = true;
  private _volume: number = 0.8;

  public get volume(): number {
    return this._volume;
  }

  public set volume(val: number) {
    this._volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.enabled ? this._volume : 0, this.ctx.currentTime);
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.enabled ? this._volume : 0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private getDestination(): AudioNode | null {
    this.initCtx();
    if (!this.ctx) return null;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.enabled ? this._volume : 0, this.ctx.currentTime);
      return this.masterGain;
    }
    return this.ctx.destination;
  }

  public playShoot() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public playShockwave() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  public playHit() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playBotExplode() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  public playPlayerHit() {
    this.playHit();
  }

  public playPickUpPowerUp() {
    this.playPowerUp();
  }

  public playPowerUp() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.18, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.01, now + (idx + 1) * 0.06);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now + idx * 0.06);
      osc.stop(now + (idx + 1) * 0.06);
    });
  }

  public playCaptchaSuccess() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.08 + 0.15);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.15);
    });
  }

  public playShieldDeflect() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  public playBossAlarm() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.setValueAtTime(300, this.ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(600, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  public playCarWarning() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playGameOver() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;
    const notes = [400, 350, 300, 200];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      gain.gain.setValueAtTime(0.25, now + idx * 0.15);
      gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.15 + 0.2);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.2);
    });
  }

  public playHonk() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.setValueAtTime(420, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  public playTone(freq: number, duration: number = 0.2) {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playRoboticCode(code: string) {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const chars = code.split('');
    chars.forEach((c, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const charCode = c.charCodeAt(0);
        osc.frequency.setValueAtTime(200 + (charCode % 10) * 80, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);
        osc.connect(gain);
        gain.connect(dest);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.14);
      }, idx * 220);
    });
  }

  public playSecurityChime() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;
    const notes = [440, 659.25, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.2, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.07 + 0.18);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.18);
    });
  }

  public playCatch() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(980, this.ctx.currentTime + 0.09);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  public playRotateClick() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  public playLaserPing() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public playTypeClack() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.025);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.025);
  }

  public playBuzzer() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  public playWhack() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(550, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playVictory() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;
    const melody = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.5];
    const times = [0, 0.12, 0.24, 0.36, 0.52, 0.72];
    melody.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + times[idx]);
      gain.gain.setValueAtTime(0.3, now + times[idx]);
      gain.gain.linearRampToValueAtTime(0.01, now + times[idx] + 0.3);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now + times[idx]);
      osc.stop(now + times[idx] + 0.3);
    });
  }

  public playIntroCharge() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(960, now + 1.2);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.8);
    gain.gain.linearRampToValueAtTime(0.001, now + 1.25);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 1.25);
  }

  public playIntroLaunch() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playBossCoreMeltdown() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;

    // Deep sub-bass pulse
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 2.5);
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.linearRampToValueAtTime(0.01, now + 2.5);
    subOsc.connect(subGain);
    subGain.connect(dest);
    subOsc.start(now);
    subOsc.stop(now + 2.5);

    // Staggered EMP crackles
    [0.2, 0.6, 1.1, 1.6, 2.0].forEach((offset, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(400 - idx * 40, now + offset);
      osc.frequency.exponentialRampToValueAtTime(90, now + offset + 0.18);
      gain.gain.setValueAtTime(0.2, now + offset);
      gain.gain.linearRampToValueAtTime(0.01, now + offset + 0.18);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now + offset);
      osc.stop(now + offset + 0.18);
    });
  }

  public playBossDetonation() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 1.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 1.2);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  public playAccessGranted() {
    if (!this.enabled) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C Major triumph
    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.08 + 0.8);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.8);
    });
  }
}

export const sound = new SoundEngine();
