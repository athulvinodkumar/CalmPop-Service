// CalmPop - Central Mock Store & Pricing Configuration
// IMPORTANT: ALL PAYMENTS AND FINANCIAL DATA IN THIS STORE ARE SIMULATED MOCK DATA.
// NO REAL MONEY, NO EXTERNAL PAYMENT GATEWAYS (STRIPE, RAZORPAY, UPI, ETC.) ARE CONNECTED.

const STORAGE_KEY = 'calmpop_mock_db_v2';

// 1. Central Configurable INR Pricing
export const DEFAULT_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    subtitle: 'For Small Teams',
    description: 'Foundational check-ins and burnout prevention for early-stage crews.',
    monthlyPricePerEmployee: 349, // ₹349 / employee / month
    annualPricePerEmployee: 279.20, // ₹279.20 / employee / month (20% discount)
    employeeLimit: 25,
    minSeats: 5,
    features: [
      'Full 100+ Question Bank',
      'Weekly automated survey cadence',
      'Basic company stress index',
      'Moments of Calm audio resets',
      'Email support'
    ]
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    subtitle: 'Scaling Organizations',
    description: 'Deep departmental filtering and advanced executive reporting.',
    monthlyPricePerEmployee: 599, // ₹599 / employee / month
    annualPricePerEmployee: 479.20, // ₹479.20 / employee / month (20% discount)
    employeeLimit: 100,
    minSeats: 10,
    isPopular: true,
    features: [
      'Everything in Starter, plus:',
      'Department heatmap segmentation',
      'Custom survey delivery schedule',
      'Interactive stress-relief game hub',
      'Slack & Microsoft Teams bot delivery',
      'Priority support'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    subtitle: 'Global Workforces',
    description: 'Bespoke integrations, customized analytics, and HIPAA compliance.',
    monthlyPricePerEmployee: 999, // ₹999 demonstration base
    annualPricePerEmployee: 799.20,
    employeeLimit: 500,
    minSeats: 100,
    isCustom: true,
    features: [
      'Unlimited seat capacity & flexible sync',
      'SSO, SAML & Okta Integration',
      'Dedicated Organizational Psychologist',
      'Custom Question Set Authoring',
      'SOC2 Type II & Enterprise BAA',
      '24/7 dedicated account manager'
    ]
  }
};

// 2. INR Currency Formatter Helper
export function formatINR(amount, includeDecimals = false) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0
  }).format(amount);
}

// 3. Initial Seed Database
export function getInitialData() {
  const seedCompanyId = 'CP-ORG-78214';
  const initialCompany = {
    id: seedCompanyId,
    name: 'Strata Labs',
    email: 'contact@stratalabs.com',
    location: 'Bengaluru, Karnataka, India',
    adminName: 'Priya Sharma',
    adminEmail: 'priya@stratalabs.com',
    username: 'priyasharma',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    subscription: {
      planId: 'growth',
      planName: 'Growth',
      billingCycle: 'annual',
      seats: 45,
      seatLimit: 100,
      pricePerSeat: 479.20,
      monthlyTotalEquivalent: 45 * 479.20,
      annualBilledTotal: 45 * 479.20 * 12,
      status: 'active',
      startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      renewalDate: new Date(Date.now() + 335 * 86400000).toISOString(),
      lastTransactionId: 'DEMO-CP-8F42A1'
    },
    surveySchedule: {
      weekday: 'Thursday',
      time: '14:00',
      timezone: 'Asia/Kolkata (IST)',
      autoReminders: true
    },
    employees: [
      { id: 'EMP-01', name: 'Aarav Patel', username: 'aaravpatel', email: 'aarav@stratalabs.com', department: 'Platform Engineering', title: 'Senior Backend Engineer', status: 'active', joinedAt: '2025-01-15' },
      { id: 'EMP-02', name: 'Ananya Iyer', username: 'ananyaiyer', email: 'ananya@stratalabs.com', department: 'Product & Design', title: 'Principal UX Designer', status: 'active', joinedAt: '2025-02-01' },
      { id: 'EMP-03', name: 'Rohan Mehta', username: 'rohanmehta', email: 'rohan@stratalabs.com', department: 'Enterprise Sales', title: 'Sales Director', status: 'active', joinedAt: '2025-03-10' },
      { id: 'EMP-04', name: 'Sneha Rao', username: 'sneharao', email: 'sneha@stratalabs.com', department: 'Customer Success', title: 'Lead Success Partner', status: 'active', joinedAt: '2025-03-22' },
      { id: 'EMP-05', name: 'Devendra Kulkarni', username: 'devendrak', email: 'devendra@stratalabs.com', department: 'Platform Engineering', title: 'DevOps Architect', status: 'active', joinedAt: '2025-04-05' },
      { id: 'EMP-06', name: 'Tanvi Nair', username: 'tanvinair', email: 'tanvi@stratalabs.com', department: 'Product & Design', title: 'Design Researcher', status: 'active', joinedAt: '2025-04-18' }
    ],
    recentSurveys: [
      { id: 'SRV-101', date: '2026-10-22', department: 'Platform Engineering', sentiment: 'Normal Steady', score: 78 },
      { id: 'SRV-102', date: '2026-10-22', department: 'Product & Design', sentiment: 'Optimal Calm', score: 92 },
      { id: 'SRV-103', date: '2026-10-21', department: 'Enterprise Sales', sentiment: 'Moderate Pressure', score: 62 },
      { id: 'SRV-104', date: '2026-10-21', department: 'Customer Success', sentiment: 'Healthy Calm', score: 85 }
    ]
  };

  const initialTransactions = [
    {
      id: 'DEMO-CP-8F42A1',
      invoiceNumber: 'INV-DEMO-2025-001',
      companyId: seedCompanyId,
      companyName: 'Strata Labs',
      planId: 'growth',
      planName: 'Growth',
      billingCycle: 'annual',
      seats: 45,
      unitRate: 479.20,
      subtotal: 45 * 479.20 * 12,
      taxAmount: (45 * 479.20 * 12) * 0.18,
      totalAmount: (45 * 479.20 * 12) * 1.18,
      paymentMethod: 'UPI (GPay Demo)',
      status: 'success',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      isSimulated: true
    }
  ];

  return {
    plans: { ...DEFAULT_PLANS },
    companies: [initialCompany],
    transactions: initialTransactions,
    currentSession: {
      role: 'company_admin', // 'company_admin' | 'superadmin' | null
      companyId: seedCompanyId
    }
  };
}

// 4. Mock Store State Manager
class MockStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Ensure plans have fallback to defaults
          if (!parsed.plans) parsed.plans = { ...DEFAULT_PLANS };
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse mock store from localStorage, using initial seed.', e);
    }
    const initial = getInitialData();
    this.save(initial);
    return initial;
  }

  save(dataToSave = this.data) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      }
    } catch (e) {
      console.error('Error saving mock data to localStorage', e);
    }
  }

  resetDemoData() {
    const initial = getInitialData();
    this.data = initial;
    this.save(initial);
    return initial;
  }

  // --- Plans & Pricing ---
  getPlans() {
    return this.data.plans || DEFAULT_PLANS;
  }

  getPlan(planId) {
    const plans = this.getPlans();
    return plans[planId] || plans.starter;
  }

  updatePlanPricing(planId, monthlyRate, annualRate, limit) {
    if (this.data.plans && this.data.plans[planId]) {
      this.data.plans[planId].monthlyPricePerEmployee = parseFloat(monthlyRate);
      this.data.plans[planId].annualPricePerEmployee = parseFloat(annualRate);
      if (limit) this.data.plans[planId].employeeLimit = parseInt(limit, 10);
      this.save();
    }
  }

  // Calculate pricing breakdown
  calculateOrder(planId, billingCycle, seats) {
    const plan = this.getPlan(planId);
    const isAnnual = billingCycle === 'annual';
    const unitRate = isAnnual ? plan.annualPricePerEmployee : plan.monthlyPricePerEmployee;
    const count = parseInt(seats, 10) || plan.minSeats || 10;

    let subtotal = 0;
    let periodMonths = isAnnual ? 12 : 1;

    if (isAnnual) {
      subtotal = Math.round(count * unitRate * 12);
    } else {
      subtotal = Math.round(count * unitRate);
    }

    const gstRate = 0.18; // 18% standard GST demonstration
    const taxAmount = Math.round(subtotal * gstRate);
    const totalAmount = subtotal + taxAmount;

    // Monthly savings compared to monthly plan
    const fullMonthlyRate = plan.monthlyPricePerEmployee;
    const monthlyEquivalent = isAnnual ? Math.round(count * unitRate) : subtotal;
    const annualSavings = isAnnual ? Math.round(count * (fullMonthlyRate - unitRate) * 12) : 0;

    return {
      plan,
      planId,
      billingCycle,
      seats: count,
      unitRate,
      periodMonths,
      subtotal,
      gstRate: 18,
      taxAmount,
      totalAmount,
      monthlyEquivalent,
      annualSavings
    };
  }

  // --- Session & Current Company ---
  getCurrentSession() {
    return this.data.currentSession || { role: null, companyId: null };
  }

  setCurrentSession(role, companyId = null) {
    this.data.currentSession = { role, companyId };
    this.save();
  }

  getCurrentCompany() {
    const session = this.getCurrentSession();
    if (session.companyId) {
      return this.getCompanyById(session.companyId);
    }
    return this.data.companies[0] || null;
  }

  // --- Companies ---
  getCompanies() {
    return this.data.companies || [];
  }

  getCompanyById(companyId) {
    return (this.data.companies || []).find(c => c.id === companyId) || null;
  }

  createCompany(companyData, subscriptionData, transactionRecord) {
    // Generate unique mock Company ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const companyId = `CP-ORG-${randomSuffix}`;

    const newCompany = {
      id: companyId,
      name: companyData.companyName,
      email: companyData.companyEmail,
      location: companyData.location || 'India',
      adminName: companyData.adminName,
      adminEmail: companyData.adminEmail,
      username: companyData.username || companyData.adminEmail.split('@')[0],
      status: 'active',
      createdAt: new Date().toISOString(),
      subscription: {
        planId: subscriptionData.planId,
        planName: subscriptionData.plan.name,
        billingCycle: subscriptionData.billingCycle,
        seats: subscriptionData.seats,
        seatLimit: subscriptionData.plan.employeeLimit,
        pricePerSeat: subscriptionData.unitRate,
        monthlyTotalEquivalent: subscriptionData.monthlyEquivalent,
        annualBilledTotal: subscriptionData.subtotal,
        status: 'active',
        startDate: new Date().toISOString(),
        renewalDate: new Date(Date.now() + (subscriptionData.billingCycle === 'annual' ? 365 : 30) * 86400000).toISOString(),
        lastTransactionId: transactionRecord.id
      },
      surveySchedule: {
        weekday: companyData.cadenceDay || 'Thursday',
        time: '14:00',
        timezone: 'Asia/Kolkata (IST)',
        autoReminders: true
      },
      employees: [
        {
          id: 'EMP-01',
          name: companyData.adminName,
          email: companyData.adminEmail,
          department: 'Executive Leadership',
          title: 'Organization Administrator',
          status: 'active',
          joinedAt: new Date().toISOString().split('T')[0]
        }
      ],
      recentSurveys: [
        { id: 'SRV-01', date: new Date().toISOString().split('T')[0], department: 'Executive Leadership', sentiment: 'Optimal Calm', score: 94 }
      ]
    };

    // Attach companyId to transaction
    transactionRecord.companyId = companyId;
    transactionRecord.companyName = newCompany.name;

    this.data.companies.unshift(newCompany);
    this.data.transactions.unshift(transactionRecord);
    this.setCurrentSession('company_admin', companyId);
    this.save();

    return newCompany;
  }

  updateCompany(companyId, updates) {
    const company = this.getCompanyById(companyId);
    if (!company) return null;
    Object.assign(company, updates);
    this.save();
    return company;
  }

  toggleCompanyStatus(companyId) {
    const company = this.getCompanyById(companyId);
    if (!company) return null;
    company.status = company.status === 'active' ? 'suspended' : 'active';
    this.save();
    return company;
  }

  // --- Subscription Management ---
  updateSubscription(companyId, newPlanId, newBillingCycle, newSeats) {
    const company = this.getCompanyById(companyId);
    if (!company) return null;

    const order = this.calculateOrder(newPlanId, newBillingCycle, newSeats);
    const mockTxId = `DEMO-CP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    company.subscription.planId = order.planId;
    company.subscription.planName = order.plan.name;
    company.subscription.billingCycle = order.billingCycle;
    company.subscription.seats = order.seats;
    company.subscription.seatLimit = order.plan.employeeLimit;
    company.subscription.pricePerSeat = order.unitRate;
    company.subscription.monthlyTotalEquivalent = order.monthlyEquivalent;
    company.subscription.annualBilledTotal = order.subtotal;
    company.subscription.status = 'active';
    company.subscription.lastTransactionId = mockTxId;
    company.subscription.renewalDate = new Date(Date.now() + (newBillingCycle === 'annual' ? 365 : 30) * 86400000).toISOString();

    const txRecord = {
      id: mockTxId,
      invoiceNumber: `INV-DEMO-${Date.now().toString().slice(-6)}`,
      companyId: company.id,
      companyName: company.name,
      planId: order.planId,
      planName: order.plan.name,
      billingCycle: order.billingCycle,
      seats: order.seats,
      unitRate: order.unitRate,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      totalAmount: order.totalAmount,
      paymentMethod: 'Simulated Subscription Update',
      status: 'success',
      createdAt: new Date().toISOString(),
      isSimulated: true
    };

    this.data.transactions.unshift(txRecord);
    this.save();
    return { company, transaction: txRecord };
  }

  cancelSubscription(companyId) {
    const company = this.getCompanyById(companyId);
    if (!company) return null;
    company.subscription.status = 'cancelled';
    company.subscription.cancelledAt = new Date().toISOString();
    this.save();
    return company;
  }

  // --- Employees Management (with strict seat limit enforcement) ---
  getNextEmployeeId(companyId) {
    const company = this.getCompanyById(companyId);
    if (!company || !company.employees) return 'EMP-01';
    const nums = company.employees.map(e => {
      const match = (e.id || '').match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
    const nextNum = (Math.max(0, ...nums) + 1).toString().padStart(2, '0');
    return `EMP-${nextNum}`;
  }

  isUsernameTaken(companyId, username, excludeEmpId = null) {
    const company = this.getCompanyById(companyId);
    if (!company || !username) return false;
    const cleanUser = username.trim().toLowerCase();
    return company.employees.some(e => {
      if (excludeEmpId && e.id === excludeEmpId) return false;
      const u = (e.username || (e.email ? e.email.split('@')[0] : '')).toLowerCase();
      return u === cleanUser;
    });
  }

  isEmailTaken(companyId, email, excludeEmpId = null) {
    const company = this.getCompanyById(companyId);
    if (!company || !email) return false;
    const cleanEmail = email.trim().toLowerCase();
    return company.employees.some(e => {
      if (excludeEmpId && e.id === excludeEmpId) return false;
      return (e.email || '').toLowerCase() === cleanEmail;
    });
  }

  addEmployee(companyId, employeeData) {
    const company = this.getCompanyById(companyId);
    if (!company) throw new Error('Company not found');

    const activeCount = company.employees.filter(e => e.status === 'active').length;
    const limit = company.subscription.seatLimit || 25;

    if (activeCount >= limit) {
      throw new Error(`Plan seat limit reached (${activeCount}/${limit}). Upgrade your subscription in Subscription & Billing to add more team members.`);
    }

    if (!employeeData.name || !employeeData.name.trim()) {
      throw new Error('Employee Full Name is required.');
    }

    const username = (employeeData.username || (employeeData.email ? employeeData.email.split('@')[0] : '')).trim().toLowerCase();
    if (!username) {
      throw new Error('Username is required.');
    }

    if (this.isUsernameTaken(companyId, username)) {
      throw new Error(`Username "${username}" is already taken in this organization. Please choose a unique username.`);
    }

    const email = (employeeData.email || '').trim().toLowerCase();
    if (!email) {
      throw new Error('Email address is required.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid work email address (e.g. name@company.com).');
    }

    if (this.isEmailTaken(companyId, email)) {
      throw new Error(`Email address "${email}" is already registered for another employee.`);
    }

    const empId = employeeData.id || this.getNextEmployeeId(companyId);
    const newEmp = {
      id: empId,
      name: employeeData.name.trim(),
      username: username,
      email: email,
      department: employeeData.department || 'Platform Engineering',
      title: (employeeData.title || '').trim() || 'Software Engineer',
      status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
      tempPassword: employeeData.password || 'Calm@2026!'
    };

    company.employees.unshift(newEmp);
    this.save();
    return newEmp;
  }

  updateEmployee(companyId, empId, updates) {
    const company = this.getCompanyById(companyId);
    if (!company) return null;
    const emp = company.employees.find(e => e.id === empId);
    if (!emp) return null;
    Object.assign(emp, updates);
    this.save();
    return emp;
  }

  toggleEmployeeStatus(companyId, empId) {
    const company = this.getCompanyById(companyId);
    if (!company) return null;
    const emp = company.employees.find(e => e.id === empId);
    if (!emp) return null;

    if (emp.status === 'inactive') {
      // Check seat limit when reactivating
      const activeCount = company.employees.filter(e => e.status === 'active').length;
      const limit = company.subscription.seatLimit || 25;
      if (activeCount >= limit) {
        throw new Error(`Cannot reactivate employee: Seat limit reached (${limit} seats max).`);
      }
      emp.status = 'active';
    } else {
      emp.status = 'inactive';
    }

    this.save();
    return emp;
  }

  deleteEmployee(companyId, empId) {
    const company = this.getCompanyById(companyId);
    if (!company) return false;
    const idx = company.employees.findIndex(e => e.id === empId);
    if (idx !== -1) {
      company.employees.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Transactions ---
  getTransactions(filterCompanyId = null) {
    const txs = this.data.transactions || [];
    if (filterCompanyId) {
      return txs.filter(t => t.companyId === filterCompanyId);
    }
    return txs;
  }

  getTransactionById(txId) {
    return (this.data.transactions || []).find(t => t.id === txId) || null;
  }

  recordTransaction(txData) {
    this.data.transactions.unshift(txData);
    this.save();
    return txData;
  }
}

export const mockStore = new MockStore();
