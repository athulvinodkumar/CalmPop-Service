// Test Real Employee Authentication API Endpoints
async function runTests() {
  console.log('=== REAL EMPLOYEE AUTHENTICATION API TEST SUITE ===');

  // Test 1: Valid Login
  const loginRes = await fetch('http://127.0.0.1:5173/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyId: 'CP-ORG-78214',
      username: 'aaravpatel',
      password: 'CalmPop@2026!',
      rememberMe: true
    })
  });

  const loginData = await loginRes.json();
  console.log('Test 1 - Valid Login status:', loginRes.status, 'Employee:', loginData.employee?.name);
  if (loginRes.status !== 200 || !loginData.token || loginData.employee.username !== 'aaravpatel') {
    throw new Error('Test 1 Failed: Valid login did not succeed');
  }

  const sessionToken = loginData.token;
  const cookieHeader = loginRes.headers.get('set-cookie');
  console.log('Set-Cookie returned:', !!cookieHeader);

  // Test 2: Protected /api/auth/me with Bearer token
  const meRes = await fetch('http://127.0.0.1:5173/api/auth/me', {
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  });
  const meData = await meRes.json();
  console.log('Test 2 - /api/auth/me status:', meRes.status, 'Authenticated:', meData.authenticated);
  if (meRes.status !== 200 || meData.employee.companyId !== 'CP-ORG-78214') {
    throw new Error('Test 2 Failed: Protected /api/auth/me failed');
  }

  // Test 3: Incorrect Password
  const wrongPassRes = await fetch('http://127.0.0.1:5173/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyId: 'CP-ORG-78214',
      username: 'aaravpatel',
      password: 'WrongPassword123'
    })
  });
  console.log('Test 3 - Wrong Password status:', wrongPassRes.status);
  if (wrongPassRes.status !== 401) {
    throw new Error('Test 3 Failed: Wrong password was not rejected with 401');
  }

  // Test 4: Incorrect Company ID
  const wrongCompRes = await fetch('http://127.0.0.1:5173/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyId: 'CP-ORG-WRONG',
      username: 'aaravpatel',
      password: 'CalmPop@2026!'
    })
  });
  console.log('Test 4 - Wrong Company ID status:', wrongCompRes.status);
  if (wrongCompRes.status !== 401) {
    throw new Error('Test 4 Failed: Wrong company ID was not rejected with 401');
  }

  // Test 5: Cross-Company Attack (valid password for Zenith Global user attempting login under Strata Labs)
  const crossCompRes = await fetch('http://127.0.0.1:5173/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyId: 'CP-ORG-78214', // Strata Labs
      username: 'aaravpatel',
      password: 'Zenith@2026!'   // Password only valid for Zenith Global!
    })
  });
  console.log('Test 5 - Cross-Company Attack status:', crossCompRes.status);
  if (crossCompRes.status !== 401) {
    throw new Error('Test 5 Failed: Cross-company password match was not blocked');
  }

  // Test 6: Fetch Employee Surveys (isolated to authenticated employee)
  const surveysRes = await fetch('http://127.0.0.1:5173/api/employee/surveys', {
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  });
  const surveysData = await surveysRes.json();
  console.log('Test 6 - Employee Surveys count:', surveysData.surveys?.length);
  if (surveysRes.status !== 200 || !Array.isArray(surveysData.surveys)) {
    throw new Error('Test 6 Failed: Could not fetch surveys');
  }

  // Test 7: Submit a Survey
  const submitSurveyRes = await fetch('http://127.0.0.1:5173/api/employee/surveys', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}` 
    },
    body: JSON.stringify({
      stressLevel: 25,
      workloadScore: 3,
      energyLevel: 4,
      sentiment: 'Calm & Steady',
      notes: 'Testing real survey submission to SQLite'
    })
  });
  const submitData = await submitSurveyRes.json();
  console.log('Test 7 - Submit Survey status:', submitSurveyRes.status, 'Survey ID:', submitData.surveyId);
  if (submitSurveyRes.status !== 200 || !submitData.surveyId) {
    throw new Error('Test 7 Failed: Survey submission failed');
  }

  // Test 8: Logout & Invalidation
  const logoutRes = await fetch('http://127.0.0.1:5173/api/auth/logout', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  });
  console.log('Test 8 - Logout status:', logoutRes.status);

  // Verify token is now invalid
  const afterLogoutRes = await fetch('http://127.0.0.1:5173/api/auth/me', {
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  });
  console.log('Test 8.1 - Invalidation check status:', afterLogoutRes.status);
  if (afterLogoutRes.status !== 401) {
    throw new Error('Test 8 Failed: Session token was not invalidated after logout');
  }

  console.log('=== ALL REAL AUTHENTICATION SERVER TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(err => {
  console.error('API Test Error:', err);
  process.exit(1);
});
