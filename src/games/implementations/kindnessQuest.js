// CalmPop - Game 12: Kindness Quest
// Interactive branching story game with a friendly character (Pip the Garden Caretaker)
// navigating everyday challenges (workload overwhelm, mistakes, breaks, support, boundaries).
// Non-judgmental, with diverse valid paths grounded in self-compassion and realistic boundaries.

import { audioSynth } from '../audioSynth.js';

const QUEST_STORY = {
  start: {
    id: 'start',
    scene: 'The Morning Overwhelm',
    text: 'Pip arrives at the community botanical greenhouse on a brisk Tuesday morning. The whiteboard is crowded with urgent notes: three overgrown saplings need repotting, irrigation valves need checking, and two new deliveries have just arrived.',
    question: 'Pip pauses at the door, feeling that familiar chest-tightening rush. What gentle choice should Pip make first?',
    characterEmotion: 'overwhelmed',
    choices: [
      {
        text: 'Take a slow grounding breath and acknowledge: "There is a lot here, and I can only do one task at a time."',
        target: 'self_compassion_path',
        type: 'Self-Compassion'
      },
      {
        text: 'Walk over to Maya at the potting bench and ask: "Could we divide up these two deliveries together?"',
        target: 'support_path',
        type: 'Asking Support'
      },
      {
        text: 'Pour a cup of warm tea and sit for five minutes before touching any tools.',
        target: 'break_path',
        type: 'Taking a Break'
      }
    ]
  },

  self_compassion_path: {
    id: 'self_compassion_path',
    scene: 'One Plant at a Time',
    text: 'Pip exhales slowly. Acknowledging the workload without harsh self-judgment immediately lowers the noise. Pip selects the first overgrown fern and begins loosening the root ball. Mid-task, an email alert chimes with an urgent question about tomorrow’s schedule.',
    question: 'Pip’s attention is pulled in two directions. How does Pip respond?',
    characterEmotion: 'focused',
    choices: [
      {
        text: 'Finish potting this fern first, then review the email with undivided focus.',
        target: 'small_step_path',
        type: 'One Small Step'
      },
      {
        text: 'Send a quick polite message: "Received! I am wrapping up morning potting and will review by 2 PM."',
        target: 'boundary_path',
        type: 'Setting a Boundary'
      }
    ]
  },

  support_path: {
    id: 'support_path',
    scene: 'Shared Hands',
    text: 'Maya smiles with relief: "Honestly, I was looking at that pile too! Let’s unpack the seedlings together." Working side-by-side, the task takes half the time. While moving a ceramic tray, Pip accidentally knocks over a box of seed markers, scattering them across the path.',
    question: 'A classic workplace mistake. Pip feels a momentary spike of embarrassment. How does Pip treat this moment?',
    characterEmotion: 'flustered',
    choices: [
      {
        text: 'Acknowledge the slip-up neutrally: "Oops! Well, gravity happens. Let’s scoop them up together."',
        target: 'mistake_compassion_path',
        type: 'Self-Compassion'
      },
      {
        text: 'Take 30 seconds to breathe before picking them up, avoiding rushing in panic.',
        target: 'break_path',
        type: 'Taking a Break'
      }
    ]
  },

  break_path: {
    id: 'break_path',
    scene: 'The Quiet Bench',
    text: 'Pip sits near the jasmine trellises with a steaming mug. The greenhouse air smells like damp earth and eucalyptus. Taking those five minutes allows Pip’s nervous system to reset. The urgent tasks haven’t disappeared, but Pip’s mind is no longer in emergency mode.',
    question: 'Refreshed, Pip stands up. What is the most realistic next step?',
    characterEmotion: 'calm',
    choices: [
      {
        text: 'Pick just the single highest priority task and commit only to starting it.',
        target: 'small_step_path',
        type: 'One Small Step'
      },
      {
        text: 'Check in with a colleague to see what actually needs to be completed by noon.',
        target: 'support_path',
        type: 'Asking Support'
      }
    ]
  },

  boundary_path: {
    id: 'boundary_path',
    scene: 'A Clear Boundary',
    text: 'Setting an honest timeframe gives Pip breathing room. The colleague replies: "Perfect, thanks for letting me know!" Pip completes the fern with steady care and places it in the sunlight. Pip realizes that boundaries often build trust rather than disappointment.',
    question: 'As the morning concludes, Pip reflects on the day. What wisdom feels most grounding?',
    characterEmotion: 'fulfilled',
    choices: [
      {
        text: 'Reflect: "Honoring my capacity is what allows me to do sustainable, good work."',
        target: 'conclusion_peaceful',
        type: 'Self-Compassion'
      },
      {
        text: 'Reflect: "Clear communication protects both my team and my own wellbeing."',
        target: 'conclusion_steady',
        type: 'Setting a Boundary'
      }
    ]
  },

  small_step_path: {
    id: 'small_step_path',
    scene: 'Steady Progress',
    text: 'Pip finishes the fern repotting with smooth, rhythmic motions. One plant, fresh soil, fresh water. Seeing that single completed pot on the shelf brings a quiet feeling of satisfaction. The overwhelming mountain turned out to be just a series of small, individual actions.',
    question: 'How does Pip celebrate this quiet accomplishment?',
    characterEmotion: 'content',
    choices: [
      {
        text: 'Pause and mentally say: "Good job taking that first step, Pip."',
        target: 'conclusion_peaceful',
        type: 'Self-Compassion'
      },
      {
        text: 'Take a stretch break in the sunlight before choosing the next small action.',
        target: 'conclusion_steady',
        type: 'Taking a Break'
      }
    ]
  },

  mistake_compassion_path: {
    id: 'mistake_compassion_path',
    scene: 'Lightness of Being',
    text: 'Maya laughs gently and helps gather the wooden markers. "I spilled an entire bag of compost yesterday," Maya notes. Pip realizes that mistakes are part of ordinary life, not evidence of inadequacy. By not spiraling into blame, energy was preserved for what truly matters.',
    question: 'What closing thought stays with Pip?',
    characterEmotion: 'connected',
    choices: [
      {
        text: 'Kindness toward myself makes it easier to be kind and patient with others.',
        target: 'conclusion_peaceful',
        type: 'Self-Compassion'
      },
      {
        text: 'Perfection was never the requirement. Steadiness and connection are enough.',
        target: 'conclusion_steady',
        type: 'Perspective'
      }
    ]
  },

  conclusion_peaceful: {
    id: 'conclusion_peaceful',
    scene: 'Afternoon Sunlight',
    text: 'By mid-afternoon, the greenhouse is peaceful. The saplings are thriving in their fresh pots, the tools are neatly hung, and Pip is heading home with energy left to spare. Kindness was the compass that guided every step.',
    question: 'Your quest is complete.',
    isEnding: true,
    characterEmotion: 'peaceful',
    summary: 'You guided Pip through challenges using self-compassion, boundaries, and mindful pacing. There was no single right answer — only gentle choices that honored humanity in the workplace.'
  },

  conclusion_steady: {
    id: 'conclusion_steady',
    scene: 'Grounded & Centered',
    text: 'Pip washes the garden shears and locks the greenhouse door. Today wasn’t effortless, but it was navigated with honesty, support, and realistic boundaries. Pip proved that pacing yourself is the truest superpower in a busy world.',
    question: 'Your quest is complete.',
    isEnding: true,
    characterEmotion: 'peaceful',
    summary: 'You guided Pip through challenges using steady boundaries, honest teamwork, and presence. Every response affirmed that workdays are healthier when we pace ourselves with care.'
  }
};

export function renderKindnessQuest(sessionManager) {
  return `
    <div id="kindness-quest-app" class="w-full max-w-xl mx-auto space-y-4">
      
      <!-- STORY PROGRESS & CHAPTER HEADER -->
      <div class="flex items-center justify-between text-xs px-1">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          <span id="kq-scene-badge" class="font-bold text-primary">Chapter: The Morning Overwhelm</span>
        </div>
        <button 
          type="button" 
          onclick="window.kindnessQuestInstance?.restartStory()"
          class="text-outline hover:text-on-surface text-[11px] font-semibold flex items-center gap-1"
        >
          <span class="material-symbols-outlined text-[14px]">restart_alt</span>
          <span>Restart Story</span>
        </button>
      </div>

      <!-- MAIN STORY CARD -->
      <div class="bg-surface-container-low/70 rounded-3xl p-6 sm:p-7 border border-surface-container shadow-xs min-h-[360px] flex flex-col justify-between space-y-5">
        
        <div class="space-y-4">
          
          <!-- Character Avatar & Scene Title -->
          <div class="flex items-center gap-3">
            <div id="kq-avatar-wrap" class="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 shadow-xs border border-primary/20">
              <span id="kq-avatar-icon" class="material-symbols-outlined text-[32px]">emoji_nature</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-outline tracking-wider">Pip the Caretaker</span>
              <h2 id="kq-heading" class="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">
                The Morning Overwhelm
              </h2>
            </div>
          </div>

          <!-- Narrative Text -->
          <div class="p-4 sm:p-5 bg-surface-container-lowest rounded-2xl border border-surface-container/70 shadow-xs leading-relaxed text-xs sm:text-sm text-on-surface space-y-2">
            <p id="kq-story-text">
              Pip arrives at the community botanical greenhouse on a brisk Tuesday morning. The whiteboard is crowded with urgent notes: three overgrown saplings need repotting, irrigation valves need checking, and two new deliveries have just arrived.
            </p>
          </div>

          <!-- Story Prompt Question -->
          <p id="kq-question-text" class="text-xs font-bold text-primary">
            Pip pauses at the door, feeling that familiar chest-tightening rush. What gentle choice should Pip make first?
          </p>

          <!-- Branching Choices Container -->
          <div id="kq-choices-container" class="space-y-2">
            <!-- Rendered dynamically -->
          </div>

        </div>

        <!-- AFFIRMING ENDING CARD (Shown on final chapter) -->
        <div id="kq-ending-panel" class="hidden p-4 bg-tertiary-fixed/20 rounded-2xl border border-tertiary-fixed/40 text-center space-y-2">
          <p class="font-bold text-tertiary-container text-xs">Quest Complete</p>
          <p id="kq-ending-summary" class="text-[11px] text-on-surface-variant leading-relaxed"></p>
          <div class="pt-1 flex gap-2 justify-center">
            <button 
              type="button" 
              onclick="window.kindnessQuestInstance?.restartStory()"
              class="px-4 py-2 rounded-full border border-surface-container bg-surface-container-lowest text-xs font-semibold text-on-surface"
            >
              Explore Another Path
            </button>
            <button 
              type="button" 
              onclick="window.activeGameShell?.confirmExit()"
              class="px-5 py-2 rounded-full bg-primary text-on-primary text-xs font-bold shadow-xs"
            >
              Return to Games
            </button>
          </div>
        </div>

      </div>

      <!-- FOOTER NOTE -->
      <div class="text-[11px] text-outline text-center flex items-center justify-center gap-1.5">
        <span class="material-symbols-outlined text-[14px] text-tertiary">favorite</span>
        <span>Every choice is valid. Self-compassion, boundaries, and pacing are all honorable paths.</span>
      </div>

    </div>
  `;
}

export class KindnessQuestController {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    this.currentNodeId = 'start';
    this.choiceHistory = [];
  }

  init() {
    window.kindnessQuestInstance = this;
    this.renderNode('start');
  }

  renderNode(nodeId) {
    this.currentNodeId = nodeId;
    const node = QUEST_STORY[nodeId] || QUEST_STORY.start;

    const badge = document.getElementById('kq-scene-badge');
    const heading = document.getElementById('kq-heading');
    const text = document.getElementById('kq-story-text');
    const question = document.getElementById('kq-question-text');
    const choicesBox = document.getElementById('kq-choices-container');
    const endingPanel = document.getElementById('kq-ending-panel');
    const avatarIcon = document.getElementById('kq-avatar-icon');

    if (badge) badge.textContent = `Scene: ${node.scene}`;
    if (heading) heading.textContent = node.scene;
    if (text) text.textContent = node.text;
    if (question) question.textContent = node.question;

    if (avatarIcon) {
      if (node.characterEmotion === 'overwhelmed') avatarIcon.textContent = 'psychology';
      else if (node.characterEmotion === 'focused') avatarIcon.textContent = 'spa';
      else if (node.characterEmotion === 'flustered') avatarIcon.textContent = 'sentiment_dissatisfied';
      else if (node.characterEmotion === 'calm') avatarIcon.textContent = 'self_improvement';
      else avatarIcon.textContent = 'emoji_nature';
    }

    if (node.isEnding) {
      if (choicesBox) choicesBox.classList.add('hidden');
      if (endingPanel) {
        endingPanel.classList.remove('hidden');
        const sum = document.getElementById('kq-ending-summary');
        if (sum) sum.textContent = node.summary;
      }
      audioSynth.playSuccessChime();
      this.sessionManager.complete();
    } else {
      if (endingPanel) endingPanel.classList.add('hidden');
      if (choicesBox) {
        choicesBox.classList.remove('hidden');
        choicesBox.innerHTML = node.choices.map((ch, idx) => `
          <button 
            type="button" 
            onclick="window.kindnessQuestInstance?.choose('${ch.target}', '${ch.type.replace(/'/g, "\\'")}')"
            class="w-full text-left p-3 rounded-2xl bg-surface-container-lowest hover:bg-surface-container border border-surface-container transition-all flex items-start gap-3 shadow-xs group"
          >
            <div class="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-white transition-colors">
              ${idx + 1}
            </div>
            <div class="min-w-0 flex-1">
              <span class="text-[10px] font-bold text-primary block uppercase tracking-wide">${ch.type}</span>
              <p class="text-xs text-on-surface font-medium leading-relaxed">${ch.text}</p>
            </div>
          </button>
        `).join('');
      }
    }

    this.sessionManager.recordEvent('questStoryStep', nodeId);
  }

  choose(targetId, choiceType) {
    this.choiceHistory.push({ from: this.currentNodeId, to: targetId, type: choiceType });
    this.sessionManager.recordEvent('questChoices', 1);
    audioSynth.playPop();
    this.renderNode(targetId);
  }

  restartStory() {
    this.choiceHistory = [];
    audioSynth.playWaterRipple();
    this.renderNode('start');
  }

  destroy() {}
}
