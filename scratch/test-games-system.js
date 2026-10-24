// Comprehensive Verification Test Suite for CalmPop 5 Interactive Stress-Relief Games
// 1. Zen Sand, 2. Calm Keys, 3. Star Catcher, 4. Mandala Bloom, 5. Calm Soundscapes
import { GAMES_CATALOG, getGameById } from '../src/games/catalog.js';
import { mountCalmSoundscapes } from '../src/games/implementations/calmSoundscapes.js';
import { db } from '../server/db.js';
import fs from 'fs';
import path from 'path';

async function runGamesTestSuite() {
  console.log('================================================================');
  console.log('CALMPOP 5 INTERACTIVE STRESS-RELIEF GAMES TEST SUITE');
  console.log('================================================================\n');

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

  // 1. Catalog Verification (Strictly 5 Games)
  console.log('\n--- 1. GAMES CATALOG VERIFICATION (EXACTLY 5 GAMES) ---');
  assert(GAMES_CATALOG.length === 5, `Catalog must contain exactly 5 games (found: ${GAMES_CATALOG.length})`);
  
  const expectedIds = ['zen-sand', 'calm-keys', 'star-catcher', 'mandala-bloom', 'calmSoundscapes'];
  for (const id of expectedIds) {
    const game = getGameById(id);
    assert(game !== null, `Game ${id} must be registered in catalog`);
    assert(typeof game.title === 'string' && game.title.length > 0, `${id} must have a title`);
    assert(typeof game.category === 'string', `${id} must have a category`);
    assert(Array.isArray(game.recommendedMoods) && game.recommendedMoods.length > 0, `${id} must have recommended moods`);
    assert(typeof game.description === 'string', `${id} must have a description`);
    assert(typeof game.thumbnailSvg === 'string' && game.thumbnailSvg.includes('<svg'), `${id} must have SVG thumbnail`);
    assert(typeof game.render === 'function', `${id} must have a render function`);
    assert(typeof game.createController === 'function', `${id} must have a createController function`);
    assert(typeof game.route === 'string' && game.route.startsWith('/employee/games/'), `${id} must have valid route`);
  }

  // 2. Game 1: Zen Sand Verification
  console.log('\n--- 2. ZEN SAND VERIFICATION ---');
  const zs = getGameById('zen-sand');
  assert(zs.category === 'Focus', 'Zen Sand category must be Focus');
  assert(zs.recommendedMoods.includes('Tired') && zs.recommendedMoods.includes('Overwhelmed'), 'Zen Sand must recommend Tired & Overwhelmed moods');
  assert(zs.defaultDuration === 180, 'Zen Sand default duration must be 3 min (180s)');
  
  const mockSm = { status: 'in_progress', targetDurationSeconds: 180, getTrueElapsedSeconds: () => 15, recordEvent: () => {} };
  const zsHtml = zs.render(mockSm);
  assert(zsHtml.includes('zen-sand-canvas'), 'Zen Sand must render sand canvas');
  assert(zsHtml.includes('zen-wave-canvas'), 'Zen Sand must render wave overlay canvas');
  assert(zsHtml.includes('3-Tine Rake'), 'Zen Sand must feature 3-tine rake');
  assert(zsHtml.includes('btn-zen-wave-smooth'), 'Zen Sand must provide wave smoothing action');
  assert(zsHtml.includes('btn-zen-reset'), 'Zen Sand must provide reset sand action');
  assert(zsHtml.includes('zen-tool-stone'), 'Zen Sand must allow placing Zen stones');

  const zsCtrl = zs.createController(mockSm);
  assert(zsCtrl !== null && typeof zsCtrl.init === 'function' && typeof zsCtrl.destroy === 'function', 'Zen Sand must have complete controller lifecycle');

  // 3. Game 2: Calm Keys Verification
  console.log('\n--- 3. CALM KEYS VERIFICATION ---');
  const ck = getGameById('calm-keys');
  assert(ck.category === 'Auditory', 'Calm Keys category must be Auditory');
  assert(ck.recommendedMoods.includes('Anxious') && ck.recommendedMoods.includes('Sad'), 'Calm Keys must recommend Anxious & Sad moods');
  
  const ckHtml = ck.render(mockSm);
  assert(ckHtml.includes('Diatonic C Major (with F & B)'), 'Calm Keys must support Diatonic C Major scale');
  assert(ckHtml.includes('Pentatonic Chimes'), 'Calm Keys must support Pentatonic mode');
  assert(ckHtml.includes('key-bar-C4') && ckHtml.includes('key-bar-B4') && ckHtml.includes('key-bar-F4'), 'Calm Keys must include C4, F4, and B4 diatonic chime bars');
  assert(ckHtml.includes('keys-volume-slider'), 'Calm Keys must provide volume control');
  assert(ckHtml.includes('btn-toggle-sequences'), 'Calm Keys must support gentle sequence exploration');

  const ckCtrl = ck.createController(mockSm);
  assert(ckCtrl !== null && typeof ckCtrl.init === 'function', 'Calm Keys controller must initialize properly');

  // 4. Game 3: Star Catcher Verification
  console.log('\n--- 4. STAR CATCHER VERIFICATION ---');
  const sc = getGameById('star-catcher');
  assert(sc.category === 'Focus', 'Star Catcher category must be Focus');
  assert(sc.recommendedMoods.includes('Sad') && sc.recommendedMoods.includes('Restless'), 'Star Catcher must recommend Sad & Restless moods');
  
  const scHtml = sc.render(mockSm);
  assert(scHtml.includes('star-catcher-canvas'), 'Star Catcher must render celestial star canvas');
  assert(scHtml.includes('star-catcher-count'), 'Star Catcher must have mindful non-competitive star counter');
  assert(scHtml.includes('btn-star-pause'), 'Star Catcher must have pause drift control');
  assert(scHtml.includes('btn-star-cascade'), 'Star Catcher must have stardust cascade sparkle trigger');

  const scCtrl = sc.createController(mockSm);
  assert(scCtrl !== null && typeof scCtrl.init === 'function', 'Star Catcher controller must initialize');

  // 5. Game 4: Mandala Bloom Verification
  console.log('\n--- 5. MANDALA BLOOM VERIFICATION ---');
  const mb = getGameById('mandala-bloom');
  assert(mb.category === 'Creative', 'Mandala Bloom category must be Creative');
  assert(mb.recommendedMoods.includes('Restless') && mb.recommendedMoods.includes('Okay'), 'Mandala Bloom must recommend Restless & Okay moods');
  
  const mbHtml = mb.render(mockSm);
  assert(mbHtml.includes('mandala-bloom-canvas'), 'Mandala Bloom must render circular drawing canvas');
  assert(mbHtml.includes('btn-color-shifting'), 'Mandala Bloom must support Shifting Pastels mode');
  assert(mbHtml.includes('mandala-brush-size'), 'Mandala Bloom must provide brush size control');
  assert(mbHtml.includes('btn-mandala-undo') && mbHtml.includes('btn-mandala-redo'), 'Mandala Bloom must provide undo and redo');
  assert(mbHtml.includes('btn-mandala-clear'), 'Mandala Bloom must provide clear canvas action');
  assert(mbHtml.includes('btn-mandala-save'), 'Mandala Bloom must provide save artwork action');

  const mbCtrl = mb.createController(mockSm);
  assert(mbCtrl !== null && typeof mbCtrl.init === 'function', 'Mandala Bloom controller must initialize');

  // 6. Game 5: Calm Soundscapes Verification
  console.log('\n--- 6. CALM SOUNDSCAPES VERIFICATION ---');
  const cs = getGameById('calmSoundscapes');
  assert(cs !== null, 'Calm Soundscapes must be registered in catalog with ID calmSoundscapes');
  assert(cs.category === 'Auditory', 'Calm Soundscapes category must be Auditory');
  assert(cs.recommendedMoods.includes('Anxious'), 'Calm Soundscapes must recommend Anxious mood');
  assert(cs.recommendedMoods.includes('Overwhelmed'), 'Calm Soundscapes must recommend Overwhelmed mood');
  assert(cs.recommendedMoods.includes('Tired'), 'Calm Soundscapes must recommend Tired mood');
  assert(cs.description.includes('switch between ocean waves, rain, forest, night and campfire sounds'), 'Calm Soundscapes must have correct description');
  assert(cs.defaultDuration === 1800, 'Calm Soundscapes default duration must be 30 min (1800s)');

  // Verify file existence and exports
  const csFilePath = path.join(process.cwd(), 'src', 'games', 'implementations', 'calmSoundscapes.js');
  assert(fs.existsSync(csFilePath), 'calmSoundscapes.js file must exist in src/games/implementations/');
  assert(typeof mountCalmSoundscapes === 'function', 'calmSoundscapes.js must export mountCalmSoundscapes function');

  // Verify HTML rendering contains all 5 procedural scene buttons, controls, and canvas
  const csHtml = cs.render(mockSm);
  assert(csHtml.includes('soundscape-canvas'), 'Calm Soundscapes must render visualizer canvas');
  assert(csHtml.includes('btn-scene-waves'), 'Calm Soundscapes must include Waves scene button');
  assert(csHtml.includes('btn-scene-rain'), 'Calm Soundscapes must include Rain scene button');
  assert(csHtml.includes('btn-scene-forest'), 'Calm Soundscapes must include Forest scene button');
  assert(csHtml.includes('btn-scene-night'), 'Calm Soundscapes must include Night scene button');
  assert(csHtml.includes('btn-scene-campfire'), 'Calm Soundscapes must include Campfire scene button');
  assert(csHtml.includes('btn-soundscape-toggle-play'), 'Calm Soundscapes must include Play/Pause button');
  assert(csHtml.includes('btn-soundscape-toggle-mute'), 'Calm Soundscapes must include Mute button');
  assert(csHtml.includes('soundscape-volume-slider'), 'Calm Soundscapes must include Volume slider');
  assert(csHtml.includes('timer-preset-btn'), 'Calm Soundscapes must include Sleep Timer presets');

  // Verify controller lifecycle
  const csCtrl = cs.createController(mockSm);
  assert(csCtrl !== null && typeof csCtrl.init === 'function' && typeof csCtrl.destroy === 'function', 'Calm Soundscapes controller must have complete init/destroy lifecycle');
  assert(typeof csCtrl.switchScene === 'function', 'Calm Soundscapes controller must support switchScene');
  assert(typeof csCtrl.setSleepTimer === 'function', 'Calm Soundscapes controller must support setSleepTimer');

  // 7. Old Game Files Removal Verification
  console.log('\n--- 7. VERIFY OLD GAME FILES CLEANED UP ---');
  const oldFiles = [
    'breatheGarden.js', 'calmRiver.js', 'emotionWeather.js',
    'focusFlow.js', 'groundingExplorer.js', 'inkstorm.js',
    'kindnessQuest.js', 'memoryMeadow.js', 'paperCranes.js',
    'tensionReleaseIslands.js', 'thoughtReframer.js', 'worryBalloon.js'
  ];
  for (const f of oldFiles) {
    const fullPath = path.join(process.cwd(), 'src', 'games', 'implementations', f);
    assert(!fs.existsSync(fullPath), `Obsolete game file ${f} must be deleted`);
  }

  // 8. Verify Unrelated Features & Database Integrity
  console.log('\n--- 8. VERIFY UNRELATED CORE SYSTEMS & DATABASE INTEGRITY ---');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  const tableNames = tables.map(t => t.name);
  assert(tableNames.includes('employees'), 'employees database table must be intact');
  assert(tableNames.includes('employee_surveys'), 'employee_surveys database table must be intact');
  assert(tableNames.includes('survey_attempts'), 'survey_attempts database table must be intact');
  assert(tableNames.includes('chat_conversations'), 'chat_conversations table must be intact');
  assert(tableNames.includes('chat_messages'), 'chat_messages table must be intact');
  assert(tableNames.includes('game_sessions'), 'game_sessions database table must be intact');

  // Verify game_sessions table accepts calmSoundscapes session without schema conflicts
  const testSessionId = 'test-session-soundscape-' + Date.now();
  const sampleEmp = db.prepare('SELECT company_id, id FROM employees LIMIT 1').get() || { company_id: 'default', id: 'emp_default' };
  const insertTest = db.prepare(`
    INSERT INTO game_sessions 
    (id, company_id, employee_id, game_id, start_time, end_time, elapsed_duration, status, selected_settings, completion_status, events_metadata, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertTest.run(
    testSessionId,
    sampleEmp.company_id,
    sampleEmp.id,
    'calmSoundscapes',
    Date.now(),
    Date.now() + 60000,
    60,
    'completed',
    JSON.stringify({ scene: 'waves' }),
    1,
    '{}',
    new Date().toISOString(),
    new Date().toISOString()
  );

  const inserted = db.prepare('SELECT * FROM game_sessions WHERE id = ?').get(testSessionId);
  assert(inserted && inserted.game_id === 'calmSoundscapes', 'game_sessions table must store calmSoundscapes sessions');

  // Clean up test record
  db.prepare('DELETE FROM game_sessions WHERE id = ?').run(testSessionId);
  assert(db.prepare('SELECT * FROM game_sessions WHERE id = ?').get(testSessionId) === undefined, 'Test session cleaned up');

  console.log('\n================================================================');
  console.log(`ALL TESTS PASSED! (${passed}/${total} assertions)`);
  console.log('================================================================\n');
}

runGamesTestSuite().catch(err => {
  console.error('\n❌ Test suite failed with error:', err);
  process.exit(1);
});
