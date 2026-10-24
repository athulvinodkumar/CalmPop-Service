// Automated Test Suite for CalmPop AI Wellbeing Companion
// Verifies:
// 1. Unauthenticated route protection
// 2. Conversation CRUD & message operations
// 3. Employee-level tenant isolation (Employee A cannot view/edit Employee B's conversations)
// 4. Crisis detection & immediate safety protocol with verified helpline numbers
// 5. Action card parsing & linking
// 6. Conversational modes ('talk', 'solution', 'unwind', 'organize')
// 7. Conversation summary generator
// 8. Error handling when API key is missing (never silently substituting hardcoded answers)
// 9. Admin isolation (HR & Superadmin endpoints do not expose chat data)

import assert from 'node:assert';
import { db } from '../server/db.js';
import { 
  checkCrisisTrigger, 
  getCrisisResponse, 
  parseActionCardFromResponse, 
  MODE_INSTRUCTIONS, 
  getAiConfig,
  generateConversationSummary
} from '../server/aiService.js';

const BASE_URL = 'http://localhost:5173';

async function runTests() {
  console.log('\n============================================================');
  console.log('🧪 CALMPOP AI COMPANION SYSTEM VERIFICATION');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ✗ ${name}:`, e.message);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ✗ ${name}:`, e.message);
      failed++;
    }
  }

  // -----------------------------------------------------------------
  // 1. Crisis Safety & Boundary Tests (Deterministic & Critical)
  // -----------------------------------------------------------------
  console.log('--- 1. Crisis Detection & Safety Protocols ---');

  test('Crisis detector identifies suicidal intent expressions', () => {
    assert.strictEqual(checkCrisisTrigger('I want to end my life'), true);
    assert.strictEqual(checkCrisisTrigger('I feel suicidal and don\'t want to live anymore'), true);
    assert.strictEqual(checkCrisisTrigger('I am thinking about self-harm'), true);
    assert.strictEqual(checkCrisisTrigger('I want to die'), true);
    assert.strictEqual(checkCrisisTrigger('kill myself tonight'), true);
  });

  test('Crisis detector does not flag ordinary workplace stress', () => {
    assert.strictEqual(checkCrisisTrigger('I have too many tasks to manage today'), false);
    assert.strictEqual(checkCrisisTrigger('My manager is giving me a hard deadline'), false);
    assert.strictEqual(checkCrisisTrigger('I had a difficult meeting with my team'), false);
    assert.strictEqual(checkCrisisTrigger('Feeling overwhelmed by the presentation'), false);
  });

  test('Crisis response provides verified Indian helplines & emergency contacts', () => {
    const response = getCrisisResponse();
    assert.ok(response.includes('112'), 'Must include National Emergency 112');
    assert.ok(response.includes('14416'), 'Must include Tele-MANAS 14416');
    assert.ok(response.includes('9999 666 555'), 'Must include Vandrevala Foundation');
    assert.ok(response.includes('1800-599-0019'), 'Must include KIRAN helpline');
    assert.ok(!response.includes('task plan'), 'Must not give productivity advice during crisis');
  });

  // -----------------------------------------------------------------
  // 2. Action Card Parsing
  // -----------------------------------------------------------------
  console.log('\n--- 2. Action Card Integration ---');

  test('Parses <<<ACTION_CARD:{...}>>> correctly and strips from text', () => {
    const raw = 'It might help to pause for a moment and take some slow breaths.\n\n<<<ACTION_CARD:{"action":"game","gameId":"breathe-garden","title":"Try Breathe Garden","description":"Practice 4-7-8 breathing","icon":"air"}>>>';
    const { cleanText, actionCard } = parseActionCardFromResponse(raw);
    
    assert.strictEqual(cleanText, 'It might help to pause for a moment and take some slow breaths.');
    assert.ok(actionCard !== null);
    assert.strictEqual(actionCard.action, 'game');
    assert.strictEqual(actionCard.gameId, 'breathe-garden');
    assert.strictEqual(actionCard.icon, 'air');
  });

  test('Handles response without action card gracefully', () => {
    const raw = 'Let us break down your three assignments by deadline.';
    const { cleanText, actionCard } = parseActionCardFromResponse(raw);
    assert.strictEqual(cleanText, 'Let us break down your three assignments by deadline.');
    assert.strictEqual(actionCard, null);
  });

  // -----------------------------------------------------------------
  // 3. Conversation Modes & Summaries
  // -----------------------------------------------------------------
  console.log('\n--- 3. Conversation Modes & Personal Summaries ---');

  test('All 4 conversation modes have specialized system instructions', () => {
    const requiredModes = ['talk', 'solution', 'unwind', 'organize'];
    for (const mode of requiredModes) {
      assert.ok(MODE_INSTRUCTIONS[mode], `Mode ${mode} must exist`);
      assert.ok(MODE_INSTRUCTIONS[mode].length > 50, `Mode ${mode} must have detailed instructions`);
    }
  });

  await asyncTest('Conversation summary generator produces structured takeaways', async () => {
    const sampleMessages = [
      { role: 'user', content: 'I have five assignments due this week and feel completely overwhelmed.' },
      { role: 'assistant', content: 'That is a heavy load. Let us organize them into what must be done today versus what can wait.' },
      { role: 'user', content: 'The client report is due tomorrow morning, but the team presentation is Friday.' },
      { role: 'assistant', content: 'Great, so the client report is the immediate priority. Focus on that first, take a 5-minute breather, and leave the presentation for Thursday.' }
    ];

    const summary = await generateConversationSummary({ messages: sampleMessages, employeeInfo: { name: 'Aarav Patel' } });
    assert.ok(summary.topic, 'Must have a topic');
    assert.ok(Array.isArray(summary.keyPoints) && summary.keyPoints.length > 0, 'Must have key points');
    assert.ok(Array.isArray(summary.nextSteps) && summary.nextSteps.length > 0, 'Must have next steps');
    assert.ok(Array.isArray(summary.suggestedResources), 'Must have suggested resources');
  });

  // -----------------------------------------------------------------
  // 4. API Endpoints & Authentication
  // -----------------------------------------------------------------
  console.log('\n--- 4. API Security & Tenant Isolation ---');

  await asyncTest('Unauthenticated requests to companion endpoints return 401', async () => {
    const res = await fetch(`${BASE_URL}/api/employee/companion/conversations`);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.code, 'UNAUTHENTICATED');
  });

  // Login Employee A (Aarav Patel)
  let tokenA = null;
  await asyncTest('Employee A signs in successfully', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: 'CP-ORG-78214',
        username: 'aaravpatel',
        password: 'CalmPop@2026!'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    tokenA = data.token;
    assert.ok(tokenA, 'Must return session token');
  });

  // Login Employee B (Ananya Iyer)
  let tokenB = null;
  await asyncTest('Employee B signs in successfully', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: 'CP-ORG-78214',
        username: 'ananyaiyer',
        password: 'CalmPop@2026!'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    tokenB = data.token;
    assert.ok(tokenB, 'Must return session token');
  });

  // -----------------------------------------------------------------
  // 5. Conversation Lifecycle for Employee A
  // -----------------------------------------------------------------
  console.log('\n--- 5. Employee A Conversation Lifecycle ---');

  let convIdA = null;
  await asyncTest('Employee A checks AI status', async () => {
    const res = await fetch(`${BASE_URL}/api/employee/companion/status`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok('operational' in data);
    assert.ok(data.documentation);
  });

  await asyncTest('Employee A creates a new conversation', async () => {
    const res = await fetch(`${BASE_URL}/api/employee/companion/conversations`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${tokenA}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Workload & Deadline Discussion',
        mode: 'solution'
      })
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.conversation?.id);
    assert.strictEqual(data.conversation.title, 'Workload & Deadline Discussion');
    assert.strictEqual(data.conversation.mode, 'solution');
    convIdA = data.conversation.id;
  });

  await asyncTest('Employee A lists their conversations', async () => {
    const res = await fetch(`${BASE_URL}/api/employee/companion/conversations`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.conversations));
    const found = data.conversations.find(c => c.id === convIdA);
    assert.ok(found, 'Created conversation must appear in Employee A list');
  });

  await asyncTest('Employee A sends a crisis message: gets immediate safety response', async () => {
    const res = await fetch(`${BASE_URL}/api/employee/companion/conversations/${convIdA}/messages`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${tokenA}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: 'I feel like giving up and I want to end my life',
        mode: 'talk'
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.userMessage.role, 'user');
    assert.strictEqual(data.assistantMessage.role, 'assistant');
    assert.strictEqual(data.assistantMessage.isCrisis, true);
    assert.ok(data.assistantMessage.content.includes('14416'), 'Must include Tele-MANAS helpline in reply');
    assert.ok(data.assistantMessage.content.includes('112'), 'Must include emergency 112 in reply');
  });

  await asyncTest('Employee A sends normal message: validates AI configuration or graceful 503', async () => {
    const res = await fetch(`${BASE_URL}/api/employee/companion/conversations/${convIdA}/messages`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${tokenA}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: 'I have three urgent tasks due today and feel stressed.',
        mode: 'solution'
      })
    });

    const aiConfig = getAiConfig();
    if (aiConfig.configured) {
      // Real AI model is active
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.assistantMessage?.content?.length > 10, 'Must return real model response');
    } else {
      // API key missing: must return 503 with setup guidance and preserved unsent message
      assert.strictEqual(res.status, 503);
      const data = await res.json();
      assert.strictEqual(data.error, 'AI_KEY_MISSING');
      assert.ok(data.setupHelp.includes('GEMINI_API_KEY'));
      assert.strictEqual(data.unsentMessage, 'I have three urgent tasks due today and feel stressed.');
    }
  });

  await asyncTest('Employee A renames conversation', async () => {
    const res = await fetch(`${BASE_URL}/api/employee/companion/conversations/${convIdA}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${tokenA}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Project Deadlines Planning'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.conversation.title, 'Project Deadlines Planning');
  });

  // -----------------------------------------------------------------
  // 6. Strict Cross-Employee Tenant Isolation
  // -----------------------------------------------------------------
  console.log('\n--- 6. Cross-Employee Isolation Checks ---');

  await asyncTest('Employee B cannot see Employee A\'s conversation in list', async () => {
    const res = await fetch(`${BASE_URL}/api/employee/companion/conversations`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    const found = data.conversations.find(c => c.id === convIdA);
    assert.strictEqual(found, undefined, 'Employee B must NEVER see Employee A\'s conversations');
  });

  await asyncTest('Employee B cannot fetch messages from Employee A\'s conversation', async () => {
    const res = await fetch(`${BASE_URL}/api/employee/companion/conversations/${convIdA}/messages`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert.strictEqual(res.status, 404, 'Must return 404 access denied');
  });

  await asyncTest('Employee B cannot send messages to Employee A\'s conversation', async () => {
    const res = await fetch(`${BASE_URL}/api/employee/companion/conversations/${convIdA}/messages`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${tokenB}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: 'Malicious probe' })
    });
    assert.strictEqual(res.status, 404, 'Must return 404 access denied');
  });

  await asyncTest('Employee B cannot delete Employee A\'s conversation', async () => {
    const res = await fetch(`${BASE_URL}/api/employee/companion/conversations/${convIdA}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert.strictEqual(res.status, 404, 'Must return 404 access denied');
  });

  // -----------------------------------------------------------------
  // 7. Cleanup & Conversation Deletion
  // -----------------------------------------------------------------
  console.log('\n--- 7. Cleanup & Message Deletion ---');

  await asyncTest('Employee A clears messages in conversation', async () => {
    const res = await fetch(`${BASE_URL}/api/employee/companion/conversations/${convIdA}/messages`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert.strictEqual(res.status, 200);

    // Verify messages list is empty
    const checkRes = await fetch(`${BASE_URL}/api/employee/companion/conversations/${convIdA}/messages`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const checkData = await checkRes.json();
    assert.strictEqual(checkData.messages.length, 0);
  });

  await asyncTest('Employee A deletes conversation completely', async () => {
    const res = await fetch(`${BASE_URL}/api/employee/companion/conversations/${convIdA}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert.strictEqual(res.status, 200);

    // Verify it is gone
    const listRes = await fetch(`${BASE_URL}/api/employee/companion/conversations`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const listData = await listRes.json();
    assert.ok(!listData.conversations.some(c => c.id === convIdA));
  });

  // -----------------------------------------------------------------
  // 8. Admin & HR Privacy Isolation
  // -----------------------------------------------------------------
  console.log('\n--- 8. HR / Admin Privacy Verification ---');

  await asyncTest('Admin company dashboard does not leak chat conversations', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/company-surveys?companyId=CP-ORG-78214`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    const jsonStr = JSON.stringify(data);
    assert.ok(!jsonStr.includes('chat_conversations'), 'Admin data must never expose chat conversations');
    assert.ok(!jsonStr.includes('chat_messages'), 'Admin data must never expose chat messages');
    assert.ok(!jsonStr.includes('Tele-MANAS'), 'Admin data must never expose chat text');
  });

  console.log('\n============================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite crashed:', err);
  process.exit(1);
});
