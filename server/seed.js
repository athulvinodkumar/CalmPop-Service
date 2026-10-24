// CalmPop - Real Database Seeder
// Seeds initial demonstration accounts with scrypt hashed passwords and survey history into SQLite.

import { db } from './db.js';
import { hashPassword } from './authUtils.js';

console.log('[CalmPop Seeder] Starting database seeding for real employee authentication...');

// 1. Seed Companies
const seedCompanies = [
  { id: 'CP-ORG-78214', name: 'Strata Labs' },
  { id: 'CP-ORG-99001', name: 'Zenith Global' }
];

const insertComp = db.prepare(`
  INSERT OR REPLACE INTO companies (id, name, created_at)
  VALUES (?, ?, ?)
`);

for (const comp of seedCompanies) {
  insertComp.run(comp.id, comp.name, new Date().toISOString());
  console.log(`[CalmPop Seeder] Company seeded: ${comp.name} (${comp.id})`);
}

// 2. Seed Real Employees with Scrypt Hashed Passwords
const seedEmployees = [
  {
    id: 'EMP-01',
    companyId: 'CP-ORG-78214',
    username: 'aaravpatel',
    password: 'CalmPop@2026!',
    name: 'Aarav Patel',
    email: 'aarav@stratalabs.com',
    department: 'Platform Engineering',
    title: 'Senior Backend Engineer'
  },
  {
    id: 'EMP-02',
    companyId: 'CP-ORG-78214',
    username: 'ananyaiyer',
    password: 'CalmPop@2026!',
    name: 'Ananya Iyer',
    email: 'ananya@stratalabs.com',
    department: 'Product & Design',
    title: 'Principal UX Designer'
  },
  {
    id: 'EMP-03',
    companyId: 'CP-ORG-78214',
    username: 'rohanmehta',
    password: 'CalmPop@2026!',
    name: 'Rohan Mehta',
    email: 'rohan@stratalabs.com',
    department: 'Enterprise Sales',
    title: 'Sales Director'
  },
  {
    id: 'EMP-04',
    companyId: 'CP-ORG-78214',
    username: 'deviraman',
    password: 'CalmPop@2026!',
    name: 'Devi Raman',
    email: 'devi.raman@stratalabs.com',
    department: 'Platform Engineering',
    title: 'Staff Cloud Architect'
  },
  // Cross-company test employee: Same username 'aaravpatel', but different company & password!
  {
    id: 'EMP-01',
    companyId: 'CP-ORG-99001',
    username: 'aaravpatel',
    password: 'Zenith@2026!',
    name: 'Aarav Patel (Zenith Global)',
    email: 'aarav@zenithglobal.com',
    department: 'Operations',
    title: 'Operations Analyst'
  }
];

const insertEmp = db.prepare(`
  INSERT OR REPLACE INTO employees 
  (id, company_id, username, email, name, department, title, password_hash, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const emp of seedEmployees) {
  const hash = hashPassword(emp.password);
  insertEmp.run(
    emp.id,
    emp.companyId,
    emp.username,
    emp.email,
    emp.name,
    emp.department,
    emp.title,
    hash,
    new Date().toISOString()
  );
  console.log(`[CalmPop Seeder] Employee seeded: ${emp.name} (@${emp.username}) in ${emp.companyId}`);
}

// 3. Seed Survey History for Aarav Patel (CP-ORG-78214)
const seedSurveys = [
  {
    id: 'SRV-882101',
    employeeId: 'EMP-01',
    companyId: 'CP-ORG-78214',
    stressLevel: 24,
    workloadScore: 2,
    sentiment: 'Optimal Steady',
    energyLevel: 4,
    notes: 'Sprint completed smoothly without after-hours paging.',
    submittedAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    weekIdentifier: '2026-W39'
  },
  {
    id: 'SRV-882102',
    employeeId: 'EMP-01',
    companyId: 'CP-ORG-78214',
    stressLevel: 32,
    workloadScore: 3,
    sentiment: 'Focused & Calm',
    energyLevel: 4,
    notes: 'Q4 deployment preparation went well. Good team pacing.',
    submittedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    weekIdentifier: '2026-W40'
  },
  {
    id: 'SRV-882103',
    employeeId: 'EMP-01',
    companyId: 'CP-ORG-78214',
    stressLevel: 28,
    workloadScore: 2,
    sentiment: 'Normal Steady',
    energyLevel: 5,
    notes: '3-minute midday breathing pauses helped keep context switching manageable.',
    submittedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    weekIdentifier: '2026-W41'
  }
];

const insertSurvey = db.prepare(`
  INSERT OR REPLACE INTO employee_surveys 
  (id, employee_id, company_id, stress_level, workload_score, sentiment, energy_level, notes, submitted_at, week_identifier)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const s of seedSurveys) {
  insertSurvey.run(
    s.id,
    s.employeeId,
    s.companyId,
    s.stressLevel,
    s.workloadScore,
    s.sentiment,
    s.energyLevel,
    s.notes,
    s.submittedAt,
    s.weekIdentifier
  );
}

console.log('[CalmPop Seeder] Seeded 3 historical weekly survey records.');
console.log('[CalmPop Seeder] Real employee authentication database is ready!');
