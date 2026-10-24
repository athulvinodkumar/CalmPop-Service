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
      <svg viewBox="0 0 200 120" class="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="zenSandClip">
            <rect width="200" height="120" rx="0"/>
          </clipPath>
        </defs>
        <image href="/images/zen-sand-thumbnail.jpg" x="0" y="0" width="200" height="120" preserveAspectRatio="xMidYMid slice" clip-path="url(#zenSandClip)"/>
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
      <svg viewBox="0 0 200 120" class="w-full h-full object-cover">
        <defs>
          <linearGradient id="chimeBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#F8FAFC"/>
            <stop offset="100%" stop-color="#E2E8F0"/>
          </linearGradient>
          <linearGradient id="keyGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#18B9ED"/>
            <stop offset="100%" stop-color="#C9F246"/>
          </linearGradient>
        </defs>
        <rect width="200" height="120" fill="url(#chimeBg)" rx="16"/>
        <!-- Harmonic Wave Ripples -->
        <circle cx="100" cy="50" r="38" stroke="#18B9ED" stroke-width="1.5" fill="none" opacity="0.3"/>
        <circle cx="100" cy="50" r="24" stroke="#18B9ED" stroke-width="1.5" fill="none" opacity="0.5"/>
        <!-- Chime Bars -->
        <rect x="25" y="25" width="16" height="75" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
        <circle cx="33" cy="35" r="3" fill="#18B9ED"/>
        <rect x="47" y="30" width="16" height="70" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
        <circle cx="55" cy="40" r="3" fill="#38BDF8"/>
        <rect x="69" y="35" width="16" height="65" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
        <circle cx="77" cy="45" r="3" fill="#34D399"/>
        <rect x="91" y="22" width="18" height="78" rx="6" fill="#006191" stroke="#004B71" stroke-width="1.5"/>
        <circle cx="100" cy="34" r="3.5" fill="#C9F246"/>
        <rect x="115" y="42" width="16" height="58" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
        <circle cx="123" cy="52" r="3" fill="#FBBF24"/>
        <rect x="137" y="47" width="16" height="53" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
        <circle cx="145" cy="57" r="3" fill="#FB923C"/>
        <rect x="159" y="52" width="16" height="48" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
        <circle cx="167" cy="62" r="3" fill="#F472B6"/>
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
      <svg viewBox="0 0 200 120" class="w-full h-full object-cover">
        <defs>
          <linearGradient id="starSky" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#E0F2FE"/>
            <stop offset="50%" stop-color="#BAE6FD"/>
            <stop offset="100%" stop-color="#7DD3FC"/>
          </linearGradient>
          <radialGradient id="starBurstGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1"/>
            <stop offset="40%" stop-color="#C9F246" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#18B9ED" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="200" height="120" fill="url(#starSky)" rx="16"/>
        <!-- Constellation Lines -->
        <line x1="30" y1="40" x2="75" y2="25" stroke="#FFFFFF" stroke-width="1.2" stroke-dasharray="3,3" opacity="0.6"/>
        <line x1="75" y1="25" x2="120" y2="55" stroke="#FFFFFF" stroke-width="1.2" stroke-dasharray="3,3" opacity="0.6"/>
        <line x1="120" y1="55" x2="165" y2="35" stroke="#FFFFFF" stroke-width="1.2" stroke-dasharray="3,3" opacity="0.6"/>
        <!-- Drifting Stars -->
        <circle cx="30" cy="40" r="4.5" fill="#FFFFFF"/>
        <circle cx="75" cy="25" r="5" fill="#FFFFFF"/>
        <circle cx="165" cy="35" r="4" fill="#FFFFFF"/>
        <circle cx="45" cy="85" r="3.5" fill="#FFFFFF" opacity="0.8"/>
        <circle cx="170" cy="80" r="3" fill="#FFFFFF" opacity="0.8"/>
        <!-- Stardust Burst Center -->
        <circle cx="120" cy="55" r="22" fill="url(#starBurstGlow)"/>
        <!-- Star 4-Point Diamond -->
        <path d="M 120,43 Q 120,55 132,55 Q 120,55 120,67 Q 120,55 108,55 Q 120,55 120,43 Z" fill="#FFFFFF"/>
        <!-- Sparkle Dust Particles -->
        <circle cx="105" cy="42" r="1.8" fill="#C9F246"/>
        <circle cx="134" cy="44" r="1.5" fill="#C9F246"/>
        <circle cx="110" cy="70" r="2" fill="#FFFFFF"/>
        <circle cx="132" cy="68" r="1.6" fill="#18B9ED"/>
        <circle cx="138" cy="58" r="1.8" fill="#FFFFFF"/>
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
      <svg viewBox="0 0 200 120" class="w-full h-full object-cover">
        <defs>
          <linearGradient id="mandalaBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0F172A"/>
            <stop offset="100%" stop-color="#1E293B"/>
          </linearGradient>
        </defs>
        <rect width="200" height="120" fill="url(#mandalaBg)" rx="16"/>
        <!-- Outer Glowing Circle -->
        <circle cx="100" cy="60" r="48" stroke="#38BDF8" stroke-width="1.2" fill="none" opacity="0.35"/>
        <circle cx="100" cy="60" r="32" stroke="#C084FC" stroke-width="1.2" fill="none" opacity="0.4"/>
        <circle cx="100" cy="60" r="16" stroke="#C9F246" stroke-width="1.5" fill="none" opacity="0.6"/>
        <!-- 8-Fold Radial Petals -->
        <g transform="translate(100, 60)">
          <!-- Petal 0 & 4 -->
          <path d="M 0,0 C -10,-20 -5,-38 0,-44 C 5,-38 10,-20 0,0" fill="none" stroke="#38BDF8" stroke-width="2"/>
          <path d="M 0,0 C -10,20 -5,38 0,44 C 5,38 10,20 0,0" fill="none" stroke="#38BDF8" stroke-width="2"/>
          <!-- Petal 2 & 6 -->
          <path d="M 0,0 C -20,-10 -38,-5 -44,0 C -38,5 -20,10 0,0" fill="none" stroke="#38BDF8" stroke-width="2"/>
          <path d="M 0,0 C 20,-10 38,-5 44,0 C 38,5 20,10 0,0" fill="none" stroke="#38BDF8" stroke-width="2"/>
          <!-- Diagonal Petals -->
          <path d="M 0,0 C -22,-8 -32,-32 0,0" fill="none" stroke="#C084FC" stroke-width="1.8"/>
          <path d="M 0,0 C 22,8 32,32 0,0" fill="none" stroke="#C084FC" stroke-width="1.8"/>
          <path d="M 0,0 C -8,22 -32,32 0,0" fill="none" stroke="#F472B6" stroke-width="1.8"/>
          <path d="M 0,0 C 8,-22 32,-32 0,0" fill="none" stroke="#F472B6" stroke-width="1.8"/>
          <!-- Central Seed Blossom -->
          <circle cx="0" cy="0" r="4" fill="#C9F246"/>
        </g>
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
      <svg viewBox="0 0 200 120" class="w-full h-full object-cover">
        <defs>
          <linearGradient id="soundscapeBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#082F49"/>
            <stop offset="100%" stop-color="#041E2F"/>
          </linearGradient>
          <radialGradient id="soundOrb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.8"/>
            <stop offset="50%" stop-color="#06B6D4" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#041E2F" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="200" height="120" fill="url(#soundscapeBg)" rx="16"/>
        <!-- Central Pulsing Glow -->
        <circle cx="100" cy="52" r="36" fill="url(#soundOrb)"/>
        <circle cx="100" cy="52" r="14" fill="#38BDF8" opacity="0.9"/>
        <!-- Undulating Sound Wave Layers -->
        <path d="M 0 78 Q 50 64 100 78 T 200 78 L 200 120 L 0 120 Z" fill="#0D9488" opacity="0.35"/>
        <path d="M 0 88 Q 50 74 100 88 T 200 88 L 200 120 L 0 120 Z" fill="#06B6D4" opacity="0.45"/>
        <path d="M 0 98 Q 50 86 100 98 T 200 98 L 200 120 L 0 120 Z" fill="#38BDF8" opacity="0.3"/>
        <!-- Mirrored Spectrum Bars -->
        <rect x="82" y="44" width="3" height="16" rx="1.5" fill="#38BDF8" opacity="0.7"/>
        <rect x="88" y="38" width="3" height="28" rx="1.5" fill="#C9F246" opacity="0.8"/>
        <rect x="94" y="32" width="3" height="40" rx="1.5" fill="#FFFFFF" opacity="0.9"/>
        <rect x="103" y="32" width="3" height="40" rx="1.5" fill="#FFFFFF" opacity="0.9"/>
        <rect x="109" y="38" width="3" height="28" rx="1.5" fill="#C9F246" opacity="0.8"/>
        <rect x="115" y="44" width="3" height="16" rx="1.5" fill="#38BDF8" opacity="0.7"/>
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
