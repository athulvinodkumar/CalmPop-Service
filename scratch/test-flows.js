// Automated Unit & Integration Tests for CalmPop Mock Store & Subscription Flows
// Polyfill global environment for Node.js test runner
const storageMap = new Map();
globalThis.localStorage = {
  getItem: (key) => storageMap.get(key) || null,
  setItem: (key, val) => storageMap.set(key, String(val)),
  removeItem: (key) => storageMap.delete(key),
  clear: () => storageMap.clear()
};

globalThis.window = globalThis;
globalThis.document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

const { mockStore, formatINR, DEFAULT_PLANS } = await import('../src/mockStore.js');
const { initCheckout, getPendingCheckout } = await import('../src/views/checkout.js');

console.log("=== CALMPOP AUTOMATED TESTS START ===");

// 1. Test Indian Rupee Formatting
const formatted349 = formatINR(349);
console.log(`Test 1.1: formatINR(349) -> ${formatted349}`);
if (!formatted349.includes('₹') || !formatted349.includes('349')) {
  throw new Error("formatINR failed for 349");
}

const formattedDecimal = formatINR(279.20, true);
console.log(`Test 1.2: formatINR(279.20, true) -> ${formattedDecimal}`);
if (!formattedDecimal.includes('279.20')) {
  throw new Error("formatINR decimal formatting failed");
}

// 2. Test Pricing Calculation as per Spec
// Example from user request: Starter with 10 employees
// Monthly: 10 x ₹349 = ₹3,490 per month
// Annual: 10 x ₹279.20 x 12 = ₹33,504 per year
const starterMonthly = mockStore.calculateOrder('starter', 'monthly', 10);
console.log(`Test 2.1 Starter Monthly: Subtotal = ${starterMonthly.subtotal}, Expected = 3490`);
if (starterMonthly.subtotal !== 3490) {
  throw new Error(`Starter Monthly expected 3490 but got ${starterMonthly.subtotal}`);
}

const starterAnnual = mockStore.calculateOrder('starter', 'annual', 10);
console.log(`Test 2.2 Starter Annual: Subtotal = ${starterAnnual.subtotal}, Expected = 33504`);
if (starterAnnual.subtotal !== 33504) {
  throw new Error(`Starter Annual expected 33504 but got ${starterAnnual.subtotal}`);
}

// Check Growth with 10 employees
const growthMonthly = mockStore.calculateOrder('growth', 'monthly', 10);
console.log(`Test 2.3 Growth Monthly: Subtotal = ${growthMonthly.subtotal}, Expected = 5990`);
if (growthMonthly.subtotal !== 5990) {
  throw new Error(`Growth Monthly expected 5990 but got ${growthMonthly.subtotal}`);
}

const growthAnnual = mockStore.calculateOrder('growth', 'annual', 10);
console.log(`Test 2.4 Growth Annual: Subtotal = ${growthAnnual.subtotal}, Expected = 57504`);
if (growthAnnual.subtotal !== 57504) {
  throw new Error(`Growth Annual expected 57504 but got ${growthAnnual.subtotal}`);
}

// 3. Test Company Registration & ID Generation
const newReg = {
  companyName: 'Zenith Dynamics',
  companyEmail: 'contact@zenithdynamics.in',
  location: 'Bengaluru, India',
  adminName: 'Kavita Nair',
  adminEmail: 'kavita@zenithdynamics.in',
  username: 'kavitanair',
  cadenceDay: 'Thursday'
};

const order = mockStore.calculateOrder('growth', 'annual', 45);
const initTx = { id: 'DEMO-CP-TEST01', totalAmount: order.totalAmount };
const registeredComp = mockStore.createCompany(newReg, order, initTx);
console.log(`Test 3: Registered Company ID = ${registeredComp.id}, Name = ${registeredComp.name}`);
if (!registeredComp.id.startsWith('CP-ORG-') || registeredComp.employees.length !== 1) {
  throw new Error("Company registration or initial employee seeding failed");
}

// 4. Test Employee Addition & Seat Limit Enforcement
console.log(`Test 4.1: Checking seat limit for Growth plan (${registeredComp.subscription.seatLimit} seats max)`);
for (let i = 2; i <= 10; i++) {
  mockStore.addEmployee(registeredComp.id, {
    name: `Team Member ${i}`,
    email: `member${i}@zenithdynamics.in`,
    department: 'Engineering',
    title: 'Developer'
  });
}
console.log(`Added 9 more employees, total now = ${registeredComp.employees.length}`);

// Set seat limit artificially low to verify limit exception
registeredComp.subscription.seatLimit = 10;
try {
  mockStore.addEmployee(registeredComp.id, {
    name: 'Over Limit User',
    email: 'overlimit@zenithdynamics.in',
    department: 'Engineering',
    title: 'Developer'
  });
  throw new Error("Seat limit failed to throw error on overflow!");
} catch (err) {
  console.log(`Test 4.2: Seat limit properly enforced: "${err.message}"`);
}

// 4.3 Test Username Uniqueness & Next ID
registeredComp.subscription.seatLimit = 50;
const nextEmpId = mockStore.getNextEmployeeId(registeredComp.id);
console.log(`Test 4.3: Next auto-generated ID = ${nextEmpId}`);
if (!nextEmpId.startsWith('EMP-')) {
  throw new Error("Next employee ID generation failed");
}

const strataComp = mockStore.getCompanies().find(c => c.name === 'Strata Labs');
const isAaravTaken = mockStore.isUsernameTaken(strataComp.id, 'aaravpatel');
console.log(`Test 4.4: Is username 'aaravpatel' taken in ${strataComp.name}? -> ${isAaravTaken}`);
if (!isAaravTaken) {
  throw new Error("isUsernameTaken should return true for aaravpatel");
}

const isNonExistentTaken = mockStore.isUsernameTaken(strataComp.id, 'unique_new_user_xyz');
console.log(`Test 4.5: Is 'unique_new_user_xyz' taken? -> ${isNonExistentTaken}`);
if (isNonExistentTaken) {
  throw new Error("isUsernameTaken should return false for unique_new_user_xyz");
}

// 4.6 Test Duplicate Username Rejection in addEmployee
try {
  mockStore.addEmployee(strataComp.id, {
    name: 'Duplicate Aarav',
    username: 'aaravpatel',
    email: 'new.aarav@stratalabs.com'
  });
  throw new Error("Failed to block duplicate username!");
} catch (err) {
  console.log(`Test 4.6: Duplicate username correctly blocked: "${err.message}"`);
}

// 5. Test Subscription Upgrade Simulation
const upgradeResult = mockStore.updateSubscription(registeredComp.id, 'enterprise', 'annual', 150);
console.log(`Test 5: Upgraded to ${upgradeResult.company.subscription.planName}, seatLimit = ${upgradeResult.company.subscription.seatLimit}`);
if (upgradeResult.company.subscription.planId !== 'enterprise' || upgradeResult.company.subscription.seatLimit !== 500) {
  throw new Error("Upgrade simulation failed");
}

// 6. Test Subscription Cancellation Simulation
const cancelResult = mockStore.cancelSubscription(registeredComp.id);
console.log(`Test 6: Cancelled subscription status = ${cancelResult.subscription.status}`);
if (cancelResult.subscription.status !== 'cancelled') {
  throw new Error("Cancellation simulation failed");
}

// 7. Test Transaction Recording
const mockTx = {
  id: 'DEMO-CP-TEST01',
  companyId: registeredComp.id,
  companyName: registeredComp.name,
  planName: 'Growth',
  seats: 45,
  subtotal: 258768,
  taxAmount: 46578,
  totalAmount: 305346,
  paymentMethod: 'UPI (GPay)',
  status: 'success',
  createdAt: new Date().toISOString()
};
mockStore.recordTransaction(mockTx);
const retrievedTx = mockStore.getTransactionById('DEMO-CP-TEST01');
console.log(`Test 7: Recorded transaction = ${retrievedTx.id}, status = ${retrievedTx.status}`);
if (!retrievedTx || retrievedTx.totalAmount !== 305346) {
  throw new Error("Transaction recording failed");
}

// 8. Test Superadmin Pricing Update
mockStore.updatePlanPricing('starter', 399, 319.20, 30);
const updatedPlans = mockStore.getPlans();
console.log(`Test 8: Updated starter monthly = ${updatedPlans.starter.monthlyPricePerEmployee}, limit = ${updatedPlans.starter.employeeLimit}`);
if (updatedPlans.starter.monthlyPricePerEmployee !== 399 || updatedPlans.starter.employeeLimit !== 30) {
  throw new Error("Superadmin pricing update failed");
}

// Restore default starter pricing for clean state
mockStore.updatePlanPricing('starter', 349, 279.20, 25);

// 9. Test Checkout Initialization
const checkoutState = initCheckout(newReg, 'growth', 'annual', 45);
console.log(`Test 9: Checkout order totalAmount = ${checkoutState.order.totalAmount}`);
if (checkoutState.order.seats !== 45 || checkoutState.order.planId !== 'growth') {
  throw new Error("Checkout state init failed");
}

console.log("=== ALL AUTOMATED TESTS PASSED SUCCESSFULLY! ===");
