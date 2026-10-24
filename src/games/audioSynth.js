// CalmPop - Zero-dependency Soothing Web Audio Synthesizer
// Produces gentle, peaceful harmonic tones and ambient nature-inspired audio
// without relying on external audio files.

class AudioSynth {
  constructor() {
    this.ctx = null;
    this.isMuted = typeof localStorage !== 'undefined' ? localStorage.getItem('calmpop_audio_muted') === 'true' : false;
    this.ambientGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('calmpop_audio_muted', String(this.isMuted));
    if (this.isMuted && this.ambientGain) {
      try { this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime); } catch {}
    }
    return this.isMuted;
  }

  playGentleTone(freq = 432, duration = 1.2, type = 'sine', maxVol = 0.08) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Smooth attack and exponential decay
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(maxVol, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Audio not permitted or supported
    }
  }

  playBreatheInTone() {
    // Gentle ascending tone (C4 to G4)
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(261.63, now);
      osc.frequency.exponentialRampToValueAtTime(392.00, now + 3.8);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 1.5);
      gain.gain.linearRampToValueAtTime(0.0001, now + 4.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 4.0);
    } catch {}
  }

  playBreatheOutTone() {
    // Gentle descending tone (G4 to C4)
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(392.00, now);
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 5.8);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 2.0);
      gain.gain.linearRampToValueAtTime(0.0001, now + 6.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 6.0);
    } catch {}
  }

  playPop() {
    // Soft bubble pop
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  playChime(note = 523.25) { // C5
    this.playGentleTone(note, 1.4, 'sine', 0.05);
  }

  playSuccessChime() {
    // Soft pentatonic chord progression (F4, A4, C5)
    setTimeout(() => this.playGentleTone(349.23, 1.2, 'sine', 0.04), 0);
    setTimeout(() => this.playGentleTone(440.00, 1.4, 'sine', 0.04), 180);
    setTimeout(() => this.playGentleTone(523.25, 2.0, 'sine', 0.05), 360);
  }

  playWaterRipple() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  playPaperRustle() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {}
  }

  // --- 1. ZEN SAND: Whispering Sand Friction & Ocean Wave ---
  playSandRakeFriction(speed = 1.0) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const duration = 0.08 + Math.min(speed * 0.04, 0.12);
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.7;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // Filtered to low-mid whispering grit
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 750 + Math.random() * 200;
      filter.Q.value = 1.8;

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      const vol = Math.min(0.035 * Math.max(0.4, speed), 0.06);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch {}
  }

  playOceanWaveSmoothing() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const duration = 2.8;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      const now = this.ctx.currentTime;
      filter.frequency.setValueAtTime(250, now);
      filter.frequency.linearRampToValueAtTime(700, now + 1.2);
      filter.frequency.exponentialRampToValueAtTime(150, now + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 1.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch {}
  }

  // --- 2. CALM KEYS: Pure Bell Overtones & Harmonic Shimmer ---
  playCalmBell(freq = 261.63, duration = 2.5, shimmer = true, customVol = 0.08) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Partials for rich acoustic metallic chime
      const partials = [
        { mult: 1.0, gain: 1.0, decay: duration },          // Fundamental
        { mult: 2.0, gain: 0.45, decay: duration * 0.75 },   // Octave
        { mult: 3.01, gain: 0.22, decay: duration * 0.5 },   // 12th
        { mult: 4.07, gain: 0.12, decay: duration * 0.35 },  // Metallic ring
        { mult: 5.4, gain: 0.06, decay: duration * 0.2 }     // Shimmer
      ];

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(customVol, now);
      masterGain.connect(this.ctx.destination);

      partials.forEach(p => {
        const osc = this.ctx.createOscillator();
        const pGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * p.mult, now);

        // Instant attack, long exponential decay
        pGain.gain.setValueAtTime(0.0001, now);
        pGain.gain.linearRampToValueAtTime(p.gain, now + 0.015);
        pGain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

        osc.connect(pGain);
        pGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + p.decay);
      });

      // Subtle vibrato / shimmer overtone if requested
      if (shimmer) {
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(freq * 0.5, now);
        subGain.gain.setValueAtTime(0.0001, now);
        subGain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.6);
        subOsc.connect(subGain);
        subGain.connect(masterGain);
        subOsc.start(now);
        subOsc.stop(now + duration * 0.6);
      }
    } catch {}
  }

  // --- 3. STAR CATCHER: Celestial Chime Sparkle Bursts ---
  playStarSparkle(baseFreq = 880) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // 3-note crystalline arpeggio sparkle
      const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2.0];
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.045;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.035, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.85);
      });
    } catch {}
  }

  // --- 4. MANDALA BLOOM: Harmonic Pentatonic Bell Tone ---
  playMandalaHarmonic(freq = 440, pan = 0) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      // Stereo panning if supported
      if (this.ctx.createStereoPanner) {
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(this.ctx.destination);
      }

      osc.start(now);
      osc.stop(now + 1.2);
    } catch {}
  }
}

export const audioSynth = new AudioSynth();
