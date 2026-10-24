// CalmPop - Games Catalog & Factory Registry
// Registers all 12 stress-relief games with metadata, custom SVG brand illustrations,
// duration options, and renderer/controller bindings.

import { renderBreatheGarden, BreatheGardenController } from './implementations/breatheGarden.js';
import { renderFocusFlow, FocusFlowController } from './implementations/focusFlow.js';
import { renderThoughtReframer, ThoughtReframerController } from './implementations/thoughtReframer.js';
import { renderCalmRiver, CalmRiverController } from './implementations/calmRiver.js';
import { renderInkstorm, InkstormController } from './implementations/inkstorm.js';
import { renderEmotionWeather, EmotionWeatherController } from './implementations/emotionWeather.js';
import { renderGroundingExplorer, GroundingExplorerController } from './implementations/groundingExplorer.js';
import { renderTensionReleaseIslands, TensionReleaseIslandsController } from './implementations/tensionReleaseIslands.js';
import { renderMemoryMeadow, MemoryMeadowController } from './implementations/memoryMeadow.js';
import { renderPaperCranes, PaperCranesController } from './implementations/paperCranes.js';
import { renderWorryBalloon, WorryBalloonController } from './implementations/worryBalloon.js';
import { renderKindnessQuest, KindnessQuestController } from './implementations/kindnessQuest.js';

export const GAMES_CATALOG = [
  // --- MILESTONE 1 GAMES ---
  {
    id: 'breathe-garden',
    title: 'Breathe Garden',
    category: 'Breathing',
    typicalDuration: '3 min',
    defaultDuration: 180,
    durationOptions: [120, 180, 240, 300],
    description: 'Nurture a magical blooming garden through gentle 4s inhale and 6s exhale cycles.',
    instructions: 'Follow the glowing orb as it gently expands (4 seconds) and contracts (6 seconds). As you breathe, leaves unfurl, blossoms bloom, and fireflies arrive. Stop whenever you wish.',
    badge: 'Milestone 1',
    icon: 'spa',
    color: 'from-cyan-500/10 to-lime-500/10 text-cyan-600',
    render: (sm, opts) => renderBreatheGarden(sm, opts),
    createController: (sm, opts) => new BreatheGardenController(sm, opts)
  },
  {
    id: 'focus-flow',
    title: 'Focus Flow',
    category: 'Puzzles',
    typicalDuration: '5 min',
    defaultDuration: 300,
    durationOptions: [180, 300, 420],
    description: 'A tactile, calming symbol match puzzle with smooth cascades, undo, and hints.',
    instructions: 'Swap adjacent symbols to create gentle lines of 3 or more. Enjoy the soft chimes and cascades. No timer, no lives, and unlimited undos.',
    badge: 'Milestone 1',
    icon: 'grid_view',
    color: 'from-primary/10 to-cyan-500/10 text-primary',
    render: (sm, opts) => renderFocusFlow(sm, opts),
    createController: (sm, opts) => new FocusFlowController(sm, opts)
  },
  {
    id: 'thought-reframer',
    title: 'Thought Reframer',
    category: 'Reflection',
    typicalDuration: '3 min',
    defaultDuration: 180,
    durationOptions: [120, 180, 240],
    description: 'CBT-inspired 5-step reflection separating concrete facts from worst-case predictions.',
    instructions: 'Examine a stressful thought step-by-step: what is fact, what is an assumption, what is an alternative view, and what is one realistic next step. Saved strictly private.',
    badge: 'Milestone 1',
    icon: 'psychology',
    color: 'from-amber-500/10 to-primary/10 text-amber-600',
    render: (sm, opts) => renderThoughtReframer(sm, opts),
    createController: (sm, opts) => new ThoughtReframerController(sm, opts)
  },

  // --- MILESTONE 2 GAMES ---
  {
    id: 'calm-river',
    title: 'Calm River',
    category: 'Relaxation',
    typicalDuration: '4 min',
    defaultDuration: 240,
    durationOptions: [120, 180, 240, 360],
    description: 'Guide an origami paper boat along a tranquil river with gentle visual breathing cues.',
    instructions: 'Steer your paper boat left and right using Arrow keys, A/D, or touch dragging. Glide around water lilies and smooth river stones without penalty.',
    badge: 'Milestone 2',
    icon: 'sailing',
    color: 'from-sky-500/10 to-blue-500/10 text-sky-600',
    render: (sm, opts) => renderCalmRiver(sm, opts),
    createController: (sm, opts) => new CalmRiverController(sm, opts)
  },
  {
    id: 'inkstorm',
    title: 'Inkstorm',
    category: 'Creative',
    typicalDuration: '4 min',
    defaultDuration: 240,
    durationOptions: [120, 240, 360],
    description: 'Creative fluid ink painting canvas with brushes, erasing, undo/redo, and private saving.',
    instructions: 'Paint with flowing watercolors, choose soothing palettes, adjust brush size, and transform the canvas at your own pace. Export or save privately.',
    badge: 'Milestone 2',
    icon: 'palette',
    color: 'from-violet-500/10 to-pink-500/10 text-violet-600',
    render: (sm, opts) => renderInkstorm(sm, opts),
    createController: (sm, opts) => new InkstormController(sm, opts)
  },
  {
    id: 'emotion-weather',
    title: 'Emotion Weather Report',
    category: 'Reflection',
    typicalDuration: '3 min',
    defaultDuration: 180,
    durationOptions: [120, 180, 240],
    description: 'Build your personal internal weather scene with fog, sunshine, wind, rain, and clouds.',
    instructions: 'Select the elements that describe your present atmosphere. Add optional context tags or private notes. Displays a factual, non-judgmental summary.',
    badge: 'Milestone 2',
    icon: 'cloudy_snowing',
    color: 'from-sky-400/10 to-slate-400/10 text-sky-600',
    render: (sm, opts) => renderEmotionWeather(sm, opts),
    createController: (sm, opts) => new EmotionWeatherController(sm, opts)
  },
  {
    id: 'grounding-explorer',
    title: 'Grounding Explorer',
    category: 'Grounding',
    typicalDuration: '3 min',
    defaultDuration: 180,
    durationOptions: [120, 180, 240],
    description: '5-4-3-2-1 sensory grounding exercise with gentle alternatives and self-pacing.',
    instructions: 'Engage with your physical surroundings: 5 things to see, 4 to feel, 3 to hear, 2 to smell, 1 to taste or appreciate. Skip any sense that feels uncomfortable.',
    badge: 'Milestone 2',
    icon: 'nature_people',
    color: 'from-emerald-500/10 to-lime-500/10 text-emerald-600',
    render: (sm, opts) => renderGroundingExplorer(sm, opts),
    createController: (sm, opts) => new GroundingExplorerController(sm, opts)
  },
  {
    id: 'tension-islands',
    title: 'Tension Release Islands',
    category: 'Relaxation',
    typicalDuration: '4 min',
    defaultDuration: 240,
    durationOptions: [120, 180, 240, 360],
    description: 'Island-hopping body relaxation across hands, shoulders, jaw, arms, and feet.',
    instructions: 'Hop across 5 relaxation islands. Choose between gentle squeeze-and-release or pure passive mindful softening. Skip any area at any time.',
    badge: 'Milestone 2',
    icon: 'waves',
    color: 'from-amber-400/10 to-teal-400/10 text-teal-700',
    render: (sm, opts) => renderTensionReleaseIslands(sm, opts),
    createController: (sm, opts) => new TensionReleaseIslandsController(sm, opts)
  },

  // --- MILESTONE 3 GAMES ---
  {
    id: 'memory-meadow',
    title: 'Memory Meadow',
    category: 'Puzzles',
    typicalDuration: '3 min',
    defaultDuration: 180,
    durationOptions: [120, 180, 240],
    description: 'Soothing nature card matching with gentle flip animations and unlimited attempts.',
    instructions: 'Flip two cards per turn to discover pairs of blossoms, ferns, and songbirds. Choose from 4, 6, or 8 pairs without any timer or stress penalties.',
    badge: 'Milestone 3',
    icon: 'view_cozy',
    color: 'from-lime-500/10 to-teal-500/10 text-lime-700',
    render: (sm, opts) => renderMemoryMeadow(sm, opts),
    createController: (sm, opts) => new MemoryMeadowController(sm, opts)
  },
  {
    id: 'paper-cranes',
    title: 'Paper Cranes',
    category: 'Stories',
    typicalDuration: '3 min',
    defaultDuration: 180,
    durationOptions: [120, 180, 240],
    description: 'Fold a virtual origami crane for one realistic action, with folding animation and flight.',
    instructions: 'Select an action category (small task, break, support, tomorrow, enjoyment). Customize your crane and watch it take flight into the open sky.',
    badge: 'Milestone 3',
    icon: 'flutter',
    color: 'from-cyan-400/10 to-primary/10 text-cyan-700',
    render: (sm, opts) => renderPaperCranes(sm, opts),
    createController: (sm, opts) => new PaperCranesController(sm, opts)
  },
  {
    id: 'worry-balloon',
    title: 'Worry Balloon Release',
    category: 'Reflection',
    typicalDuration: '3 min',
    defaultDuration: 180,
    durationOptions: [120, 180, 240],
    description: 'Sort concerns into 4 grounded categories and release a hot air balloon into twilight.',
    instructions: 'Categorize a worry into what you can act on, revisit later, cannot control, or discuss. Animate a hot air balloon drifting into the twilight sky.',
    badge: 'Milestone 3',
    icon: 'airplanemode_active',
    color: 'from-indigo-500/10 to-purple-500/10 text-indigo-600',
    render: (sm, opts) => renderWorryBalloon(sm, opts),
    createController: (sm, opts) => new WorryBalloonController(sm, opts)
  },
  {
    id: 'kindness-quest',
    title: 'Kindness Quest',
    category: 'Stories',
    typicalDuration: '4 min',
    defaultDuration: 240,
    durationOptions: [180, 240, 360],
    description: 'Branching story game navigating everyday workplace overwhelm with self-compassion.',
    instructions: 'Guide Pip through an overgrown greenhouse morning. Make choices involving self-compassion, asking for help, taking breaks, and setting healthy boundaries.',
    badge: 'Milestone 3',
    icon: 'auto_stories',
    color: 'from-rose-500/10 to-amber-500/10 text-rose-600',
    render: (sm, opts) => renderKindnessQuest(sm, opts),
    createController: (sm, opts) => new KindnessQuestController(sm, opts)
  }
];

export function getGameById(id) {
  return GAMES_CATALOG.find(g => g.id === id) || null;
}
