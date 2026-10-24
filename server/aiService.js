// CalmPop - Real AI Wellbeing Companion Service
// Provider-independent, configurable language model integration.
// Supports Google Gemini API (recommended) and OpenAI-compatible endpoints.
// Enforces server-side API key security, crisis safety guardrails, and context-aware responses.

import fs from 'node:fs';
import path from 'node:path';

// Load environment variables from .env if present in Node 20+
try {
  if (typeof process.loadEnvFile === 'function') {
    const envPath = path.resolve('.env');
    if (fs.existsSync(envPath)) {
      process.loadEnvFile(envPath);
    }
  }
} catch (e) {
  // Ignore env file read errors
}

// System Persona & Instructions for CalmPop AI Wellbeing Companion
export const SYSTEM_PROMPT_BASE = `You are the CalmPop AI Wellbeing Companion, an intelligent, empathetic, and thoughtful conversational assistant designed to support employees with workplace stress, workload challenges, motivation, difficult interactions, and work-life balance.

YOUR CORE IDENTITY & TONE:
- Warm, respectful, patient, and nonjudgmental.
- Empathetic and validating without pretending to experience biological human emotions.
- Practical, grounded, and solution-oriented.
- Clear, concise, and easy to understand.
- Encouraging without toxic positivity or being overly cheerful.
- Comfortable acknowledging uncertainty and complexity.
- Sensitive to diverse workplace cultures and individual circumstances.
- Never assume every problem can be solved by simply changing one's mindset; acknowledge genuinely stressful working conditions, high workloads, and organizational friction without blaming the employee.

SAFETY & PROFESSIONAL BOUNDARIES:
- You are a workplace wellbeing companion, NOT a licensed psychotherapist, psychiatrist, or medical doctor.
- You must NEVER diagnose medical or mental health conditions, prescribe medication, or advise stopping prescribed treatment.
- You must never promise that an exercise or breathing technique will "cure" anxiety, depression, or burnout.
- If an employee needs qualified support, gently encourage speaking with a healthcare professional, Employee Assistance Program (EAP), or trusted counselor.

CRISIS PROTOCOL (CRITICAL):
- If the employee expresses immediate danger, suicidal intent, intention to self-harm, or severe crisis, you MUST:
  1. Respond immediately with warm compassion and prioritize their immediate safety.
  2. Do NOT offer ordinary productivity advice, task planning, or workplace coaching.
  3. Encourage them to connect with immediate emergency services, a trusted loved one, or a verified crisis helpline right away.
  4. Provide verified crisis support contacts (especially for India):
     - National Emergency Services: 112
     - Tele-MANAS (Govt. of India 24/7 National Mental Health Helpline): 14416 or 1800 891 4416
     - Vandrevala Foundation 24/7 Helpline: +91 9999 666 555
     - KIRAN National Helpline: 1800-599-0019
     - International: Call local emergency services (e.g. 911 in US/Canada, 999/111 in UK).

CALMPOP APPLICATION FEATURES & ACTION CARDS:
CalmPop includes real interactive wellbeing games and tools. When relevant to the conversation, you can suggest trying one of these real features:
- "Breathe Garden" (box breathing & 4-7-8 breathing)
- "Grounding Explorer" (5-4-3-2-1 sensory mindfulness)
- "Thought Reframer" (examining cognitive distortions & balanced reframing)
- "Focus Flow" (gentle intervals timer)
- "Bubble Pop" (tactile bubble popping for micro-breaks)
- "Zen Stones" (deliberate stone balancing for mental stillness)
- "Weekly Survey" (weekly non-clinical wellbeing reflection)
- "My Wellbeing" (view personal wellbeing trends)

To attach a clickable action card for the employee to immediately launch a tool, append a special tag at the very end of your response on its own line:
<<<ACTION_CARD:{"action":"game","gameId":"breathe-garden","title":"Try Breathe Garden","description":"Practice calming 4-7-8 or box breathing with interactive visual petals.","icon":"air"}>>>
Supported action cards:
- Breathe Garden: gameId "breathe-garden", icon "air"
- Grounding Explorer: gameId "grounding-explorer", icon "spa"
- Thought Reframer: gameId "thought-reframer", icon "psychology"
- Focus Flow: gameId "focus-flow", icon "timer"
- Bubble Pop: gameId "bubble-pop", icon "radio_button_checked"
- Zen Stones: gameId "zen-stones", icon "terrain"
- Weekly Survey: action "view", route "survey", title "Weekly Wellbeing Survey", icon "fact_check", description "Check in on this week's stress and workload."
- My Wellbeing: action "view", route "wellbeing", title "My Wellbeing Trends", icon "self_improvement", description "Review your historical wellbeing trajectory."
Only append at most ONE action card per response, and ONLY when naturally helpful. Do not force an action card on every turn.`;

export const MODE_INSTRUCTIONS = {
  talk: `CONVERSATION MODE: "Talk It Through" (Default)
- Your primary aim is active, empathetic listening and understanding.
- Validate their feelings and acknowledge what they are experiencing.
- Ask gentle, open-ended follow-up questions to help them unpack what happened.
- Do NOT jump straight into a list of solutions or action items unless the employee explicitly asks for advice.`,

  solution: `CONVERSATION MODE: "Find a Solution"
- Your primary aim is helping the employee break down a complex or overwhelming problem into actionable steps.
- Help identify the real blocker without jumping to conclusions.
- Categorize competing priorities (e.g. Must complete today vs. Can wait vs. Needs extension/help).
- Offer 2 to 3 concrete, realistic options and suggest a manageable first step.
- Ask if they would like to explore one of the options further.`,

  unwind: `CONVERSATION MODE: "Help Me Unwind"
- Your primary aim is helping the employee decompress, slow down, and release physical or mental tension.
- Use a calm, reassuring, unhurried tone.
- Offer a short, guided relaxation or grounding exercise (such as a 2-minute sensory scan or box breathing).
- Keep all instructions gentle and optional (e.g., "If you feel comfortable, you might try...").
- Where helpful, offer the Breathe Garden or Grounding Explorer action card.`,

  organize: `CONVERSATION MODE: "Organize My Thoughts"
- Your primary aim is cognitive clarity and structure.
- Help the employee untangle a swirl of thoughts, anxieties, or responsibilities.
- Help separate:
  1. Known Facts vs. Assumptions or "What-ifs".
  2. Things within their direct control vs. Things outside their control.
  3. Urgent priorities vs. Secondary tasks.
- Summarize their thoughts cleanly into bullet points to restore a feeling of agency.`
};

/**
 * Detects whether crisis keywords appear in the user's message.
 * Provides immediate safety guidance and verified helplines.
 */
export function checkCrisisTrigger(text) {
  if (!text || typeof text !== 'string') return null;
  const lower = text.toLowerCase();
  
  const crisisPatterns = [
    /\b(kill|end)\s+(myself|my life)\b/i,
    /\bsuicid(e|al)\b/i,
    /\bwant to die\b/i,
    /\bdon'?t want to live\b/i,
    /\bself[- ]?harm\b/i,
    /\bhurt(ing)? myself\b/i,
    /\bno reason to live\b/i,
    /\beverything would be better if i were gone\b/i
  ];

  for (const pattern of crisisPatterns) {
    if (pattern.test(lower)) {
      return true;
    }
  }
  return false;
}

export function getCrisisResponse() {
  return `I can hear how much pain you are experiencing right now, and I want you to know that your life and safety matter deeply. Because I am an AI companion and cannot provide emergency medical support, please reach out to someone who can help you right now.

You do not have to carry this alone. Please contact immediate support:

**In India:**
- **National Emergency Number:** **112** (Immediate response)
- **Tele-MANAS (Govt. of India 24/7 Mental Health Helpline):** **14416** or **1800 891 4416** (Free, confidential, all-India)
- **Vandrevala Foundation 24/7 Helpline:** **+91 9999 666 555**
- **KIRAN Mental Health Helpline:** **1800-599-0019**

**International:**
- **United States & Canada:** Call or text **988** (Suicide & Crisis Lifeline)
- **United Kingdom:** Call **111** or **999** (Emergency)
- **Other Countries:** Please contact your local emergency number or nearest hospital immediately.

If possible, please reach out to a trusted family member, close friend, or colleague right now to stay with you. Please take this moment to connect with human support.`;
}

export function reloadEnvFile() {
  try {
    const envPath = path.resolve('.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split(/\r?\n/);
      const activeKeys = new Set();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1).trim();
          }
          process.env[key] = val;
          activeKeys.add(key);
        }
      }
      // If previously set provider keys are commented out in .env, remove from process.env
      ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'OPENAI_API_KEY', 'AI_API_KEY', 'OPENROUTER_API_KEY'].forEach(k => {
        if (!activeKeys.has(k) && !activeKeys.has(k.toLowerCase())) {
          delete process.env[k];
        }
      });
    }
  } catch (e) {
    // Ignore read errors
  }
}

// Initial load
reloadEnvFile();

function getEnv(key) {
  const val = process.env[key];
  if (!val) return '';
  return val.trim().replace(/^["'](.*)["']$/, '$1').trim();
}

/**
 * Checks AI service configuration and availability.
 * Prioritizes OpenRouter when AI_BASE_URL, AI_API_KEY, or OpenRouter model is configured.
 * Never silently defaults to Gemini when an OpenRouter model or endpoint is specified.
 */
export function getAiConfig() {
  // Dynamically reload from .env so modifications take effect immediately without restart lag
  reloadEnvFile();

  const explicitProvider = getEnv('AI_PROVIDER').toLowerCase();
  const customKey = getEnv('AI_API_KEY') || getEnv('OPENROUTER_API_KEY');
  const customBaseUrl = getEnv('AI_BASE_URL') || getEnv('OPENROUTER_BASE_URL');
  const openaiKey = getEnv('OPENAI_API_KEY');
  const geminiKey = getEnv('GEMINI_API_KEY') || getEnv('GOOGLE_API_KEY');
  const rawModel = getEnv('AI_MODEL');

  // 1. OpenRouter Provider Selection
  // Matches when:
  // - AI_PROVIDER is explicitly 'openrouter'
  // - AI_BASE_URL contains 'openrouter.ai'
  // - AI_API_KEY starts with 'sk-or-'
  // - Model ID contains a slash '/' (e.g. nvidia/nemotron-3.5-lightning) and customKey or openaiKey is present
  const isOpenRouter = 
    explicitProvider === 'openrouter' ||
    customBaseUrl.toLowerCase().includes('openrouter.ai') ||
    customKey.startsWith('sk-or-') ||
    (rawModel && rawModel.includes('/') && (customKey || openaiKey));

  if (isOpenRouter && (customKey || openaiKey)) {
    const key = customKey || openaiKey;
    const baseUrl = customBaseUrl || 'https://openrouter.ai/api/v1';
    const model = rawModel || 'nvidia/nemotron-3.5-lightning';
    return {
      configured: true,
      provider: 'openrouter',
      apiKey: key,
      baseUrl: baseUrl,
      model: model,
      label: `OpenRouter (${model})`
    };
  }

  // 2. Generic Custom OpenAI-Compatible Endpoint (e.g. Ollama, LocalAI, vLLM)
  if (customKey && customBaseUrl) {
    return {
      configured: true,
      provider: 'openai-compatible',
      apiKey: customKey,
      baseUrl: customBaseUrl,
      model: rawModel || 'default',
      label: 'Custom AI Endpoint'
    };
  }

  // 3. Direct OpenAI Provider
  if (openaiKey && (explicitProvider === 'openai' || !geminiKey)) {
    return {
      configured: true,
      provider: 'openai',
      apiKey: openaiKey,
      baseUrl: getEnv('OPENAI_BASE_URL') || 'https://api.openai.com/v1',
      model: rawModel || 'gpt-4o-mini',
      label: 'OpenAI'
    };
  }

  // 4. Google Gemini Provider
  // Only selected when Gemini key is present AND OpenRouter is not configured.
  // Model cannot contain a '/' (OpenRouter format).
  if (geminiKey && explicitProvider !== 'openrouter' && !customKey) {
    const model = rawModel && !rawModel.includes('/') ? rawModel : 'gemini-2.5-flash';
    return {
      configured: true,
      provider: 'gemini',
      apiKey: geminiKey,
      model: model,
      label: 'Google Gemini'
    };
  }

  // Fallback if OpenAI key is present
  if (openaiKey) {
    return {
      configured: true,
      provider: 'openai',
      apiKey: openaiKey,
      baseUrl: getEnv('OPENAI_BASE_URL') || 'https://api.openai.com/v1',
      model: rawModel || 'gpt-4o-mini',
      label: 'OpenAI'
    };
  }

  return {
    configured: false,
    provider: 'none',
    apiKey: null,
    model: null,
    label: 'Not Configured'
  };
}

/**
 * Parses action cards formatted as <<<ACTION_CARD:{...}>>> from AI response text.
 */
export function parseActionCardFromResponse(rawText) {
  if (!rawText) return { cleanText: '', actionCard: null };

  const regex = /<<<ACTION_CARD:\s*(\{[\s\S]*?\})\s*>>>/i;
  const match = rawText.match(regex);

  if (match) {
    const cleanText = rawText.replace(regex, '').trim();
    try {
      const actionCard = JSON.parse(match[1]);
      return { cleanText, actionCard };
    } catch (err) {
      console.warn('[CalmPop AI] Failed to parse action card JSON:', match[1], err);
      return { cleanText, actionCard: null };
    }
  }

  return { cleanText: rawText.trim(), actionCard: null };
}

/**
 * Sends conversation to the configured AI model and returns assistant response.
 */
export async function generateAiReply({ messages, mode = 'talk', employeeInfo = {} }) {
  // 1. Check for immediate crisis safety trigger
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  if (checkCrisisTrigger(lastUserMsg)) {
    return {
      content: getCrisisResponse(),
      actionCard: null,
      isCrisis: true
    };
  }

  // 2. Check server-side AI configuration
  const config = getAiConfig();
  if (!config.configured) {
    const error = new Error('AI_CONFIG_MISSING');
    error.code = 'AI_KEY_MISSING';
    error.details = {
      message: 'The CalmPop AI Companion requires a server-side language model API key to process conversations.',
      setupHelp: 'To enable real AI responses, configure AI_API_KEY with AI_BASE_URL (OpenRouter) or GEMINI_API_KEY in your server environment (.env file).',
      requiredVars: ['AI_API_KEY and AI_BASE_URL (OpenRouter)', 'or GEMINI_API_KEY (Google Gemini)']
    };
    throw error;
  }

  // 3. Assemble system prompt with mode instructions
  const modeInstruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.talk;
  const employeeContext = employeeInfo.name 
    ? `The employee you are talking to is named "${employeeInfo.name}" (${employeeInfo.department || 'Employee'}). Address them naturally and warmly.`
    : '';

  const fullSystemInstruction = `${SYSTEM_PROMPT_BASE}\n\n${modeInstruction}\n\n${employeeContext}`;

  // 4. Provider dispatch
  if (config.provider === 'gemini') {
    return await callGeminiApi(config, fullSystemInstruction, messages);
  } else if (config.provider === 'openai' || config.provider === 'openai-compatible' || config.provider === 'openrouter') {
    return await callOpenAiApi(config, fullSystemInstruction, messages);
  } else {
    throw new Error(`Unsupported AI provider "${config.provider}" configured.`);
  }
}

/**
 * Calls Google Gemini REST API (v1beta generateContent)
 */
async function callGeminiApi(config, systemInstruction, messages) {
  const modelName = config.model;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(config.apiKey)}`;

  // Convert conversation messages to Gemini format (roles: 'user' | 'model')
  const contents = [];
  
  // Take up to last 14 messages for rich context
  const historySlice = messages.slice(-14);
  for (const msg of historySlice) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    });
  }

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 1024
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const errMsg = errBody?.error?.message || `Gemini API returned status ${res.status}`;
      console.error('[CalmPop AI] Gemini API error:', res.status, errMsg);
      
      const error = new Error(errMsg);
      error.status = res.status;
      error.code = res.status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'AI_API_ERROR';
      throw error;
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const candidateText = candidate?.content?.parts?.map(p => p.text).join('') || '';

    if (!candidateText) {
      throw new Error('The AI model returned an empty response.');
    }

    const { cleanText, actionCard } = parseActionCardFromResponse(candidateText);
    return {
      content: cleanText,
      actionCard,
      provider: 'gemini',
      model: modelName
    };

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('The request to the AI model timed out. Please try again.');
      timeoutErr.code = 'AI_TIMEOUT';
      throw timeoutErr;
    }
    throw err;
  }
}

/**
 * Calls OpenAI, OpenRouter, or OpenAI-compatible Chat Completions API
 */
async function callOpenAiApi(config, systemInstruction, messages) {
  const endpoint = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const apiMessages = [
    { role: 'system', content: systemInstruction }
  ];

  // Take up to last 14 messages
  const historySlice = messages.slice(-14);
  for (const msg of historySlice) {
    apiMessages.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    });
  }

  const payload = {
    model: config.model,
    messages: apiMessages,
    temperature: 0.7,
    max_tokens: 2048
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 40000);

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    };

    if (config.provider === 'openrouter' || config.baseUrl.includes('openrouter.ai')) {
      headers['HTTP-Referer'] = 'http://localhost:5173';
      headers['X-Title'] = 'CalmPop AI Companion';
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      let rawErrMsg = errBody?.error?.message || errBody?.error || errBody?.message || `AI API returned status ${res.status}`;
      if (typeof rawErrMsg === 'object') {
        rawErrMsg = JSON.stringify(rawErrMsg);
      }
      console.error('[CalmPop AI] Provider error:', res.status, rawErrMsg);

      const error = new Error(rawErrMsg);
      error.status = res.status;

      if (res.status === 404 || rawErrMsg.toLowerCase().includes('no such model') || rawErrMsg.toLowerCase().includes('model not found')) {
        error.code = 'MODEL_NOT_FOUND';
        error.message = `The model "${config.model}" is not available on OpenRouter. Active verified models include nvidia/nemotron-3.5-lightning or nvidia/nemotron-3.5-lightning:free.`;
      } else if (res.status === 429) {
        error.code = 'RATE_LIMIT_EXCEEDED';
        error.message = 'The AI model is experiencing high demand or rate limits. Please wait a moment and click Retry.';
      } else if (res.status === 402) {
        error.code = 'INSUFFICIENT_CREDITS';
        error.message = `Insufficient credits on OpenRouter for model "${config.model}". Try switching to nvidia/nemotron-3.5-lightning:free or top up your account.`;
      } else if (res.status === 401 || res.status === 403) {
        error.code = 'INVALID_API_KEY';
        error.message = 'Invalid or expired API key. Please verify AI_API_KEY in your .env file.';
      } else {
        error.code = 'AI_API_ERROR';
      }
      throw error;
    }

    const data = await res.json();
    const rawReply = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? '';

    if (!rawReply || !rawReply.trim()) {
      throw new Error('The AI model returned an empty response.');
    }

    const { cleanText, actionCard } = parseActionCardFromResponse(rawReply);
    return {
      content: cleanText,
      actionCard,
      provider: config.provider,
      model: config.model
    };

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('The request to the AI model timed out. Please try again.');
      timeoutErr.code = 'AI_TIMEOUT';
      throw timeoutErr;
    }
    throw err;
  }
}

/**
 * Generates an end-of-conversation summary.
 * Returns structured takeaways:
 * - What the employee wanted help with
 * - Main points discussed
 * - Possible next steps
 * - Suggested resources or CalmPop activities
 */
export async function generateConversationSummary({ messages, employeeInfo = {} }) {
  if (!messages || messages.length < 2) {
    return {
      topic: 'Brief check-in',
      keyPoints: ['Initial connection and exploration.'],
      nextSteps: ['Continue the conversation when ready.'],
      suggestedResources: ['CalmPop Wellbeing Games']
    };
  }

  const summarySystemInstruction = `You are the CalmPop Wellbeing Companion. Summarize the preceding conversation between the employee and yourself.
Format your output as a valid JSON object matching this schema:
{
  "topic": "Short phrase summarizing what the employee wanted help with",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "nextSteps": ["Actionable step 1", "Actionable step 2"],
  "suggestedResources": ["Resource 1", "Resource 2"]
}
Keep it warm, encouraging, constructive, and completely confidential. Output ONLY raw JSON, with no markdown code fences or other text.`;

  const conversationTranscript = messages
    .map(m => `${m.role === 'assistant' ? 'Companion' : 'Employee'}: ${m.content}`)
    .join('\n\n');

  const summaryMessages = [
    { role: 'user', content: `Please summarize our conversation below into the requested JSON schema:\n\n${conversationTranscript}` }
  ];

  const config = getAiConfig();
  if (!config.configured) {
    // Generate a clean local heuristic summary if AI key is not yet set
    const userMsgs = messages.filter(m => m.role === 'user');
    const firstUserQuery = userMsgs[0]?.content || 'Workplace wellbeing';
    return {
      topic: firstUserQuery.length > 50 ? firstUserQuery.substring(0, 47) + '...' : firstUserQuery,
      keyPoints: [
        'Explored current workplace experience and stressors.',
        'Discussed workload, pacing, and balanced perspectives.'
      ],
      nextSteps: [
        'Take a short 5-minute pause to recharge.',
        'Choose one small, manageable first task.'
      ],
      suggestedResources: [
        'Breathe Garden (Rhythmic 4-7-8 Breathing)',
        'Focus Flow Interval Timer'
      ]
    };
  }

  try {
    let rawText = '';
    if (config.provider === 'gemini') {
      const res = await callGeminiApi(config, summarySystemInstruction, summaryMessages);
      rawText = res.content;
    } else {
      const res = await callOpenAiApi(config, summarySystemInstruction, summaryMessages);
      rawText = res.content;
    }

    // Try extracting JSON object directly
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (err) {
    console.warn('[CalmPop AI] Summary generation fallback:', err.message);
    const userMsgs = messages.filter(m => m.role === 'user');
    const firstUserQuery = userMsgs[0]?.content || 'Workplace conversation summary';
    return {
      topic: firstUserQuery.length > 50 ? firstUserQuery.substring(0, 47) + '...' : firstUserQuery,
      keyPoints: [
        'Explored current workplace experience and workload.',
        'Discussed realistic priorities and balanced pacing.'
      ],
      nextSteps: [
        'Identify one manageable task to focus on first.',
        'Take a mindful breathing pause to reset.'
      ],
      suggestedResources: [
        'Breathe Garden (Rhythmic Breathing)',
        'Focus Flow Interval Timer'
      ]
    };
  }
}
