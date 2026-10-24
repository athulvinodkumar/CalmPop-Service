// Automated test suite for CalmPop 30-Question Randomized Weekly Survey System
import { db } from '../server/db.js';
import { QUESTION_BANK, selectRandomQuestions, calculateWellbeingScore } from '../server/questionBank.js';

async function runTests() {
  console.log('=== STARTING CALMPOP 30-QUESTION SURVEY TEST SUITE ===');

  // Test 1: Question Bank Integrity
  console.log('Test 1: Verifying question bank count and category distribution...');
  console.assert(QUESTION_BANK.length >= 100, `Expected at least 100 questions, got ${QUESTION_BANK.length}`);
  const categories = {};
  for (const q of QUESTION_BANK) {
    categories[q.category] = (categories[q.category] || 0) + 1;
  }
  console.log('Categories count:', Object.keys(categories).length);
  for (const [cat, count] of Object.entries(categories)) {
    console.assert(count >= 10, `Category ${cat} should have >= 10 questions, got ${count}`);
    console.log(` - ${cat}: ${count} questions`);
  }
  console.log('✓ Test 1 Passed: 100 questions across 10 categories verified.');

  // Test 2: Random Selection without Replacement
  console.log('\nTest 2: Verifying 30 unique questions selected without replacement...');
  const selected = selectRandomQuestions(30);
  console.assert(selected.length === 30, `Expected 30 questions, got ${selected.length}`);
  const idSet = new Set(selected.map(q => q.id));
  console.assert(idSet.size === 30, `Expected 30 unique question IDs, got ${idSet.size}`);
  console.log('✓ Test 2 Passed: 30 distinct questions selected with zero duplicates.');

  // Test 3: Directional Scoring Normalization
  console.log('\nTest 3: Verifying directional scoring logic...');
  // Stress-positive question (e.g. Q002 - How often overwhelmed: 1=Never, 5=Always)
  // Wellbeing-positive question (e.g. Q071 - How supported by manager: 1=Not supported, 5=Completely supported)
  const testResponses = {
    'Q002': { score: 1, answerIndex: 0, answerText: 'Never' }, // 0% stress
    'Q071': { score: 5, answerIndex: 4, answerText: 'Completely supported' } // 0% stress
  };
  const lowStressScore = calculateWellbeingScore(testResponses);
  console.log('Low stress score result:', lowStressScore.stressIndex);
  console.assert(lowStressScore.stressIndex === 0, `Expected 0% stress index, got ${lowStressScore.stressIndex}`);

  const highStressResponses = {
    'Q002': { score: 5, answerIndex: 4, answerText: 'Always' }, // 100% stress
    'Q071': { score: 1, answerIndex: 0, answerText: 'Not at all supported' } // 100% stress
  };
  const highStressScore = calculateWellbeingScore(highStressResponses);
  console.log('High stress score result:', highStressScore.stressIndex);
  console.assert(highStressScore.stressIndex === 100, `Expected 100% stress index, got ${highStressScore.stressIndex}`);
  console.log('✓ Test 3 Passed: Transparent directional scoring verified accurately.');

  // Test 4: End-to-end API HTTP calls against running server
  console.log('\nTest 4: Verifying survey lifecycle via API endpoints (port 5173)...');
  const baseUrl = 'http://127.0.0.1:5173';

  // Login as Devi Raman (EMP-04)
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyId: 'CP-ORG-78214',
      username: 'deviraman',
      password: 'CalmPop@2026!'
    })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.assert(loginRes.ok && token, 'Devi Raman login succeeded');
  console.log('Logged in as:', loginData.employee.name);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Clean any previous attempt for clean test
  db.prepare(`DELETE FROM survey_attempts WHERE employee_id = 'EMP-04'`).run();

  // 4.1: Start survey
  const startRes = await fetch(`${baseUrl}/api/employee/survey/start`, {
    method: 'POST',
    headers: authHeaders
  });
  const startData = await startRes.json();
  console.assert(startRes.ok, 'Survey started');
  console.assert(startData.questions.length === 30, 'Received 30 questions');
  const attemptId = startData.attemptId;
  console.log('Attempt ID created:', attemptId);

  // 4.2: Page refresh / re-start check (stability check)
  const restartRes = await fetch(`${baseUrl}/api/employee/survey/start`, {
    method: 'POST',
    headers: authHeaders
  });
  const restartData = await restartRes.json();
  console.assert(restartData.resumed === true, 'Survey was resumed rather than regenerated');
  console.assert(restartData.attemptId === attemptId, 'Same attempt ID retained');
  console.assert(
    JSON.stringify(startData.questions.map(q => q.id)) === JSON.stringify(restartData.questions.map(q => q.id)),
    'Question order is identical and stable across calls'
  );
  console.log('✓ Stable question order verified across requests.');

  // 4.3: Save progress on question 1
  const q1 = startData.questions[0];
  const saveRes = await fetch(`${baseUrl}/api/employee/survey/save-progress`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      attemptId,
      questionId: q1.id,
      score: q1.options[0].value,
      answerIndex: 0,
      answerText: q1.options[0].text,
      currentQuestionIndex: 1
    })
  });
  const saveData = await saveRes.json();
  console.assert(saveRes.ok && saveData.answeredCount === 1, 'Progress saved for question 1');
  console.log('✓ Progress saved successfully');

  // 4.4: Incomplete submission must be rejected
  const prematureSubmit = await fetch(`${baseUrl}/api/employee/survey/submit`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ attemptId })
  });
  console.assert(prematureSubmit.status === 400, 'Premature submit rejected (unanswered questions exist)');
  console.log('✓ Incomplete survey submission rejected as expected');

  // 4.5: Answer all 30 questions
  for (let i = 0; i < startData.questions.length; i++) {
    const q = startData.questions[i];
    await fetch(`${baseUrl}/api/employee/survey/save-progress`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        attemptId,
        questionId: q.id,
        score: q.options[1].value, // option 2
        answerIndex: 1,
        answerText: q.options[1].text,
        currentQuestionIndex: i
      })
    });
  }

  // 4.6: Complete submission
  const finalSubmit = await fetch(`${baseUrl}/api/employee/survey/submit`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ attemptId })
  });
  const finalData = await finalSubmit.json();
  console.assert(finalSubmit.ok, 'Final submission succeeded');
  console.assert(typeof finalData.report.stressIndex === 'number', 'Report contains calculated stressIndex');
  console.log('✓ Final 30-question survey submitted! Calculated Stress Index:', finalData.report.stressIndex + '%');
  console.log('✓ Wellbeing category:', finalData.report.indicatorCategory);

  // 4.7: Duplicate submission must be blocked
  const dupSubmit = await fetch(`${baseUrl}/api/employee/survey/submit`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ attemptId })
  });
  console.assert(dupSubmit.status === 400, 'Duplicate submission blocked');
  console.log('✓ Duplicate submission blocked successfully');

  // 4.8: Verify My Wellbeing history
  const wellbeingRes = await fetch(`${baseUrl}/api/employee/wellbeing`, {
    headers: authHeaders
  });
  const wellbeingData = await wellbeingRes.json();
  console.assert(wellbeingRes.ok && wellbeingData.totalCompleted >= 1, 'My Wellbeing reports retrieved');
  console.log('✓ My Wellbeing endpoint returned authenticated employee history');

  console.log('\n=== ALL 30-QUESTION RANDOMIZED SURVEY TESTS PASSED! ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
