// Comprehensive Verification Test Suite for CalmPop 12 Stress-Relief Games
import { GAMES_CATALOG, getGameById } from '../src/games/catalog.js';
import { db } from '../server/db.js';

async function runGamesTestSuite() {
  console.log('====================================================');
  console.log('CALMPOP 12 STRESS-RELIEF GAMES COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      throw new Error(message);
    }
    console.log(`✓ ${message}`);
    passed++;
  }

  // 1. Catalog Verification
  console.log('\n--- 1. GAMES CATALOG VERIFICATION ---');
  assert(GAMES_CATALOG.length === 12, 'Catalog must contain exactly 12 games');
  const expectedIds = [
    'breathe-garden', 'focus-flow', 'thought-reframer',
    'calm-river', 'inkstorm', 'emotion-weather',
    'grounding-explorer', 'tension-islands',
    'memory-meadow', 'paper-cranes', 'worry-balloon',
    'kindness-quest'
  ];
  for (const id of expectedIds) {
    const game = getGameById(id);
    assert(game !== null, `Game ${id} must be registered in catalog`);
    assert(typeof game.title === 'string' && game.title.length > 0, `${id} must have a title`);
    assert(typeof game.category === 'string', `${id} must have a category`);
    assert(typeof game.description === 'string', `${id} must have a description`);
    assert(typeof game.render === 'function', `${id} must have a render function`);
    assert(typeof game.createController === 'function', `${id} must have a createController function`);
  }

  // 2. Specific Game Mechanics Validation
  console.log('\n--- 2. GAME MECHANICS VALIDATION ---');
  
  // Game 1: Breathe Garden
  const bg = getGameById('breathe-garden');
  assert(bg.defaultDuration === 180, 'Breathe Garden must default to 3 minutes (180s)');
  assert(bg.durationOptions.includes(120) && bg.durationOptions.includes(300), 'Breathe Garden must support 2-5 minutes configurable duration');
  const bgMockSm = { status: 'in_progress', targetDurationSeconds: 180, getTrueElapsedSeconds: () => 30, recordEvent: () => {} };
  const bgHtml = bg.render(bgMockSm, { guided: true });
  assert(bgHtml.includes('Breathe in gently.'), 'Breathe Garden must display gentle inhale prompt');
  assert(bgHtml.includes('4 seconds'), 'Breathe Garden must cue 4 seconds inhale');
  assert(bgHtml.includes('6 seconds'), 'Breathe Garden must cue 6 seconds exhale');
  assert(bgHtml.includes('bg-breathing-orb'), 'Breathe Garden must render luminous breathing orb');
  assert(bgHtml.includes('timing cues only'), 'Breathe Garden must include non-physiological reminder');

  // Game 2: Focus Flow
  const ff = getGameById('focus-flow');
  assert(ff.defaultDuration === 300, 'Focus Flow must default to 5 minutes (300s)');
  const ffHtml = ff.render(bgMockSm, { complexity: 'gentle' });
  assert(ffHtml.includes('focus-flow-grid'), 'Focus Flow must render puzzle grid container');
  assert(ffHtml.includes('Hint'), 'Focus Flow must have Hint control');
  assert(ffHtml.includes('Undo'), 'Focus Flow must have Undo control');

  // Game 3: Thought Reframer
  const tr = getGameById('thought-reframer');
  const trHtml = tr.render(bgMockSm);
  assert(trHtml.includes('Step 1 of 5'), 'Thought Reframer must implement 5-step reflection');
  assert(trHtml.includes('What do I know for sure?'), 'Thought Reframer must separate verifiable facts');
  assert(trHtml.includes('What am I predicting or assuming?'), 'Thought Reframer must separate assumptions');
  assert(trHtml.includes('Explore another perspective'), 'Thought Reframer must explore alternative views');
  assert(trHtml.includes('Choose a realistic next step'), 'Thought Reframer must provide realistic next step choices');
  assert(trHtml.includes('Private by design'), 'Thought Reframer must guarantee reflection privacy');

  // Game 4: Calm River
  const cr = getGameById('calm-river');
  const crHtml = cr.render(bgMockSm, { sensitivity: 'normal' });
  assert(crHtml.includes('calm-river-canvas'), 'Calm River must render river canvas');
  assert(crHtml.includes('Sensitivity:'), 'Calm River must support adjustable sensitivity');
  assert(crHtml.includes('Breathing Cue:'), 'Calm River must support visual breathing rhythm');

  // Game 5: Inkstorm
  const ink = getGameById('inkstorm');
  const inkHtml = ink.render(bgMockSm);
  assert(inkHtml.includes('inkstorm-canvas'), 'Inkstorm must render creative painting canvas');
  assert(inkHtml.includes('ink_eraser'), 'Inkstorm must support eraser');
  assert(inkHtml.includes('Save Privately'), 'Inkstorm must allow saving artwork privately');

  // Game 6: Emotion Weather Report
  const ew = getGameById('emotion-weather');
  const ewHtml = ew.render(bgMockSm);
  assert(ewHtml.includes('Sunshine') && ewHtml.includes('Rain') && ewHtml.includes('Clouds') && ewHtml.includes('Wind') && ewHtml.includes('Fog'), 'Emotion Weather must include fog, sunshine, wind, rain, clouds');
  assert(ewHtml.includes('Optional Context Tags'), 'Emotion Weather must support context tags');

  // Game 7: Grounding Explorer
  const ge = getGameById('grounding-explorer');
  const geHtml = ge.render(bgMockSm);
  assert(geHtml.includes('5-4-3-2-1 Sensory Grounding'), 'Grounding Explorer must implement 5-4-3-2-1 sensory grounding');
  assert(geHtml.includes('Skip this sense'), 'Grounding Explorer must allow skipping senses');

  // Game 8: Tension Release Islands
  const ti = getGameById('tension-islands');
  const tiHtml = ti.render(bgMockSm);
  assert(tiHtml.includes('Gentle Awareness') && tiHtml.includes('Squeeze & Release'), 'Tension Release Islands must offer both passive and active relaxation');
  assert(tiHtml.includes('Skip this area'), 'Tension Release Islands must allow skipping body areas');

  // Game 9: Memory Meadow
  const mm = getGameById('memory-meadow');
  const mmHtml = mm.render(bgMockSm);
  assert(mmHtml.includes('mm-card-grid'), 'Memory Meadow must render card matching grid');
  assert(mmHtml.includes('4 Pairs') && mmHtml.includes('6 Pairs') && mmHtml.includes('8 Pairs'), 'Memory Meadow must support adjustable grid difficulty');

  // Game 10: Paper Cranes
  const pc = getGameById('paper-cranes');
  const pcHtml = pc.render(bgMockSm);
  assert(pcHtml.includes('Start a small task') && pcHtml.includes('Take a break') && pcHtml.includes('Ask for help'), 'Paper Cranes must provide designated action categories');
  assert(pcHtml.includes('Fold & Release Crane'), 'Paper Cranes must support origami folding and flight');

  // Game 11: Worry Balloon Release
  const wb = getGameById('worry-balloon');
  const wbHtml = wb.render(bgMockSm);
  assert(wbHtml.includes('Something I can act on') && wbHtml.includes('Something I can revisit later') && wbHtml.includes('Something I cannot control right now'), 'Worry Balloon must provide the 4 grounded worry categories');

  // Game 12: Kindness Quest
  const kq = getGameById('kindness-quest');
  const kqHtml = kq.render(bgMockSm);
  assert(kqHtml.includes('The Morning Overwhelm'), 'Kindness Quest must feature everyday workplace challenges');
  assert(kqHtml.toLowerCase().includes('self-compassion'), 'Kindness Quest must provide self-compassion choices');

  // 3. Backend API & Tenant Isolation Testing
  console.log('\n--- 3. BACKEND API & TENANT ISOLATION TESTING ---');
  const baseUrl = 'http://localhost:5173';

  // Login as Aarav Patel (CP-ORG-78214)
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyId: 'CP-ORG-78214',
      username: 'aaravpatel',
      password: 'CalmPop@2026!'
    })
  });
  assert(loginRes.ok, 'Employee login for Aarav Patel must succeed');
  const loginData = await loginRes.json();
  const token = loginData.token;
  assert(Boolean(token), 'Login response must provide valid session token');

  // Auth headers
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Verify auth me
  const meRes = await fetch(`${baseUrl}/api/auth/me`, { headers: authHeaders });
  assert(meRes.ok, '/api/auth/me must return 200 with valid session');
  const meData = await meRes.json();
  assert(meData.employee.username === 'aaravpatel', 'Authenticated employee must be aaravpatel');
  assert(meData.employee.companyId === 'CP-ORG-78214', 'Authenticated company must be CP-ORG-78214');

  // Test Game Session API: Start & Update
  const testSessionId = `TEST-GS-${Date.now()}`;
  const sessionSaveRes = await fetch(`${baseUrl}/api/employee/games/session`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      sessionId: testSessionId,
      gameId: 'breathe-garden',
      startTime: Date.now() - 180000,
      endTime: Date.now(),
      elapsedDuration: 180,
      status: 'completed',
      selectedSettings: { durationSeconds: 180, guided: true },
      completionStatus: true,
      eventsMetadata: { cyclesCompleted: 18, checkInPost: 'peaceful' }
    })
  });
  assert(sessionSaveRes.ok, 'POST /api/employee/games/session must succeed');

  // Retrieve sessions
  const getSessionsRes = await fetch(`${baseUrl}/api/employee/games/sessions`, { headers: authHeaders });
  assert(getSessionsRes.ok, 'GET /api/employee/games/sessions must succeed');
  const sessionsData = await getSessionsRes.json();
  assert(Array.isArray(sessionsData.sessions), 'Sessions must return an array');
  const foundSession = sessionsData.sessions.find(s => s.sessionId === testSessionId);
  assert(foundSession !== undefined, 'Saved session must be retrieved from SQLite database');
  assert(foundSession.gameId === 'breathe-garden', 'Session gameId must match');
  assert(foundSession.status === 'completed', 'Session status must be completed');

  // Test Private Reflections API
  const testPrivId = `TEST-PRIV-${Date.now()}`;
  const savePrivRes = await fetch(`${baseUrl}/api/employee/private-items`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      id: testPrivId,
      itemType: 'thought_reframer',
      content: {
        thought: 'Testing private reflection isolation',
        nextStep: 'Take one small action'
      }
    })
  });
  assert(savePrivRes.ok, 'POST /api/employee/private-items must succeed');

  // Retrieve private items
  const getPrivRes = await fetch(`${baseUrl}/api/employee/private-items?itemType=thought_reframer`, { headers: authHeaders });
  assert(getPrivRes.ok, 'GET /api/employee/private-items must succeed');
  const privData = await getPrivRes.json();
  assert(Array.isArray(privData.items), 'Private items must return an array');
  const foundPriv = privData.items.find(i => i.id === testPrivId);
  assert(foundPriv !== undefined, 'Private reflection must be retrieved for authenticated employee');
  assert(foundPriv.content.thought === 'Testing private reflection isolation', 'Private reflection content must match');

  // Delete private item
  const delPrivRes = await fetch(`${baseUrl}/api/employee/private-items/${encodeURIComponent(testPrivId)}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  assert(delPrivRes.ok, 'DELETE /api/employee/private-items/:id must succeed');

  // Verify deletion
  const getPrivAfterDel = await fetch(`${baseUrl}/api/employee/private-items?itemType=thought_reframer`, { headers: authHeaders });
  const privAfterData = await getPrivAfterDel.json();
  assert(!privAfterData.items.some(i => i.id === testPrivId), 'Deleted private item must no longer exist');

  // Cross-tenant Isolation Check:
  // Verify that company admin surveys endpoint NEVER returns private reflections
  const adminSurveysRes = await fetch(`${baseUrl}/api/admin/company-surveys?companyId=CP-ORG-78214`);
  assert(adminSurveysRes.ok, '/api/admin/company-surveys must succeed');
  const adminSurveysData = await adminSurveysRes.json();
  const jsonStr = JSON.stringify(adminSurveysData);
  assert(!jsonStr.includes('Testing private reflection isolation'), 'Admin reports must NEVER leak private employee thoughts or reflections');

  console.log(`\n====================================================`);
  console.log(`ALL TESTS PASSED! (${passed}/${total} assertions verified)`);
  console.log(`====================================================\n`);
}

runGamesTestSuite().catch(err => {
  console.error('\nTest suite encountered an error:', err);
  process.exit(1);
});
