// CalmPop - Games Catalog & Registry
// Exclusively registers the four interactive stress-relief activities:
// 1. Zen Sand (Focus - Tired, Overwhelmed)
// 2. Calm Keys (Auditory - Anxious, Sad)
// 3. Star Catcher (Focus - Sad, Restless)
// 4. Mandala Bloom (Creative - Restless, Okay)

import { renderZenSand, ZenSandController } from './implementations/zenSand.js';
import { renderCalmKeys, CalmKeysController } from './implementations/calmKeys.js';
import { renderStarCatcher, StarCatcherController } from './implementations/starCatcher.js';
import { renderMandalaBloom, MandalaBloomController } from './implementations/mandalaBloom.js';
import { renderCalmSoundscapes, CalmSoundscapesController } from './implementations/calmSoundscapes.js';

export const GAMES_CATALOG = [
  {
    id: 'zen-sand',
    title: 'Zen Sand',
    category: 'Focus',
    recommendedMoods: ['Tired', 'Overwhelmed'],
    typicalDuration: '3 min',
    defaultDuration: 180,
    durationOptions: [120, 180, 300],
    description: 'Carve peaceful rake grooves in a tactile sand garden with gentle ocean wave smoothing.',
    instructions: 'Drag your mouse or touch to guide a 3-tine bamboo rake through warm grains. Place smooth basalt river stones, or activate Wave Smoothing to gently wash the garden clean.',
    soundDescription: 'Filtered, whispering sand friction & gentle ocean wash',
    badge: 'Tactile Garden',
    icon: 'draw',
    color: 'from-amber-600/15 via-orange-500/10 to-amber-700/15 text-amber-800',
    route: '/employee/games/zen-sand',
    hashRoute: '#employee/games/zen-sand',
    thumbnailSvg: `
      <svg viewBox="0 0 200 120" preserveAspectRatio="none" class="w-full h-full block m-0 p-0" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; display: block; margin: 0; padding: 0;">
        <image href="/images/zen-sand-thumbnail.jpg" x="0" y="0" width="200" height="120" preserveAspectRatio="xMidYMid slice" style="width: 100%; height: 100%;"/>
      </svg>
    `,
    render: (sm, opts) => renderZenSand(sm, opts),
    createController: (sm, opts) => new ZenSandController(sm, opts)
  },
  {
    id: 'calm-keys',
    title: 'Calm Keys',
    category: 'Auditory',
    recommendedMoods: ['Anxious', 'Sad'],
    typicalDuration: '4 min',
    defaultDuration: 240,
    durationOptions: [120, 240, 360],
    description: 'Serene Diatonic C Major and pentatonic chime keys with shimmering bell harmonics.',
    instructions: 'Tap or click sculpted musical chime bars (or use keyboard keys A–L) to release pure harmonic bell overtones. Explore peaceful melodic phrases without failure or score.',
    soundDescription: 'Pure bell overtones, harmonic partials & overtone shimmer',
    badge: 'Harmonic Chimes',
    icon: 'music_note',
    color: 'from-sky-500/15 via-cyan-400/10 to-primary/15 text-primary',
    route: '/employee/games/calm-keys',
    hashRoute: '#employee/games/calm-keys',
    thumbnailSvg: `
      <svg viewBox="0 0 200 120" preserveAspectRatio="none" class="w-full h-full block m-0 p-0" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; display: block; margin: 0; padding: 0;">
        <image href="/images/calm-keys-thumbnail.jpg" x="0" y="0" width="200" height="120" preserveAspectRatio="xMidYMid slice" style="width: 100%; height: 100%;"/>
      </svg>
    `,
    render: (sm, opts) => renderCalmKeys(sm, opts),
    createController: (sm, opts) => new CalmKeysController(sm, opts)
  },
  {
    id: 'star-catcher',
    title: 'Star Catcher',
    category: 'Focus',
    recommendedMoods: ['Sad', 'Restless'],
    typicalDuration: '3 min',
    defaultDuration: 180,
    durationOptions: [120, 180, 300],
    description: 'Guide soft drifting stars across a celestial sky and trigger delicate stardust sparkle bursts.',
    instructions: 'Tap or click floating stars to release glowing stardust cascades. Sit back, breathe, and enjoy a calming cosmic drift with zero stress, targets, or timers.',
    soundDescription: 'Celestial chime sparkle bursts & crystalline overtones',
    badge: 'Celestial Focus',
    icon: 'stars',
    color: 'from-cyan-500/15 via-teal-400/10 to-blue-500/15 text-cyan-700',
    route: '/employee/games/star-catcher',
    hashRoute: '#employee/games/star-catcher',
    thumbnailSvg: `
      <svg viewBox="0 0 200 120" preserveAspectRatio="none" class="w-full h-full block m-0 p-0" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; display: block; margin: 0; padding: 0;">
        <image href="/images/star-catcher-thumbnail.jpg" x="0" y="0" width="200" height="120" preserveAspectRatio="xMidYMid slice" style="width: 100%; height: 100%;"/>
      </svg>
    `,
    render: (sm, opts) => renderStarCatcher(sm, opts),
    createController: (sm, opts) => new StarCatcherController(sm, opts)
  },
  {
    id: 'mandala-bloom',
    title: 'Mandala Bloom',
    category: 'Creative',
    recommendedMoods: ['Restless', 'Okay'],
    typicalDuration: '4 min',
    defaultDuration: 240,
    durationOptions: [180, 240, 360],
    description: 'Eight-fold radial kaleidoscopic drawing in shifting pastels with harmonic bell tones.',
    instructions: 'Draw fluid strokes on the circular canvas. Each motion blossoms outward in 8-fold sacred symmetry with harmonic pentatonic bell tones mapped to the distance from center.',
    soundDescription: 'Harmonic pentatonic bell tones mapped to canvas radius',
    badge: 'Kaleidoscope Art',
    icon: 'auto_awesome',
    color: 'from-violet-500/15 via-pink-400/10 to-teal-400/15 text-violet-700',
    route: '/employee/games/mandala-bloom',
    hashRoute: '#employee/games/mandala-bloom',
    thumbnailSvg: `
      <svg viewBox="0 0 200 120" preserveAspectRatio="none" class="w-full h-full block m-0 p-0" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; display: block; margin: 0; padding: 0;">
        <image href="/images/mandala-bloom-thumbnail.png" x="0" y="0" width="200" height="120" preserveAspectRatio="xMidYMid slice" style="width: 100%; height: 100%;"/>
      </svg>
    `,
    render: (sm, opts) => renderMandalaBloom(sm, opts),
    createController: (sm, opts) => new MandalaBloomController(sm, opts)
  },
  {
    id: 'calmSoundscapes',
    title: 'Calm Soundscapes',
    category: 'Auditory',
    recommendedMoods: ['Anxious', 'Overwhelmed', 'Tired'],
    typicalDuration: '15-60 min',
    defaultDuration: 1800,
    durationOptions: [900, 1800, 3600],
    description: 'switch between ocean waves, rain, forest, night and campfire sounds with a wave background that moves with the audio',
    instructions: 'Choose between 5 procedural sound scenes (Ocean Waves, Gentle Rain, Whispering Forest, Summer Night, Cozy Campfire). Switch smoothly with keys 1–5 or buttons, adjust volume, and set an optional sleep timer.',
    soundDescription: 'Procedural noise textures, sweeping resonance filters, gentle crickets, birdsong & campfire crackle',
    badge: 'Generative Audio',
    icon: 'headphones',
    color: 'from-cyan-500/15 via-teal-400/10 to-primary/15 text-primary',
    route: '/employee/games/calmSoundscapes',
    hashRoute: '#employee/games/calmSoundscapes',
    thumbnailSvg: `
      <svg viewBox="0 0 200 120" preserveAspectRatio="none" class="w-full h-full block m-0 p-0" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; display: block; margin: 0; padding: 0;">
        <image href="/images/calm-soundscapes-thumbnail.png" x="0" y="0" width="200" height="120" preserveAspectRatio="xMidYMid slice" style="width: 100%; height: 100%;"/>
      </svg>
    `,
    render: (sm, opts) => renderCalmSoundscapes(sm, opts),
    createController: (sm, opts) => new CalmSoundscapesController(sm, opts)
  }
];

export function getGameById(id) {
  if (!id) return null;
  return GAMES_CATALOG.find(g => 
    g.id === id || 
    g.id === id.replace(/-/g, '') ||
    g.id.toLowerCase() === id.toLowerCase() ||
    g.id.toLowerCase() === id.replace(/-/g, '').toLowerCase() ||
    (g.route && g.route.endsWith('/' + id))
  ) || null;
}
