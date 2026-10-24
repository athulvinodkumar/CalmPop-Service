// CalmPop - Predefined Wellbeing Question Bank
// Contains 100 distinct workplace wellbeing questions across 10 categories (10 questions each).
// Each question specifies:
// - id: Unique identifier (e.g., Q001 - Q100)
// - category: Workplace wellbeing domain
// - question: Question text
// - answerType: 'manageability' | 'frequency' | 'agreement' | 'quality' | 'support'
// - options: 5 scaled options with numerical value (1 to 5)
// - scoringDirection: 'stress_positive' (higher value = more stress/strain)
//                     or 'wellbeing_positive' (higher value = better wellbeing/support)
// - isActive: Active status flag

export const QUESTION_CATEGORIES = [
  'Workload and deadlines',
  'Emotional stress',
  'Energy and fatigue',
  'Sleep and recovery',
  'Work-life balance',
  'Focus and concentration',
  'Team support',
  'Manager support',
  'Job satisfaction',
  'Coping and relaxation'
];

// Standard Scaled Options
const OPTIONS_FREQUENCY = [
  { text: 'Never', value: 1 },
  { text: 'Rarely', value: 2 },
  { text: 'Sometimes', value: 3 },
  { text: 'Often', value: 4 },
  { text: 'Always / Constantly', value: 5 }
];

const OPTIONS_MANAGEABILITY = [
  { text: 'Very manageable', value: 1 },
  { text: 'Mostly manageable', value: 2 },
  { text: 'Somewhat difficult', value: 3 },
  { text: 'Very difficult', value: 4 },
  { text: 'Extremely overwhelming', value: 5 }
];

const OPTIONS_AGREEMENT = [
  { text: 'Strongly disagree', value: 1 },
  { text: 'Disagree', value: 2 },
  { text: 'Neutral / Undecided', value: 3 },
  { text: 'Agree', value: 4 },
  { text: 'Strongly agree', value: 5 }
];

const OPTIONS_QUALITY = [
  { text: 'Poor / Inadequate', value: 1 },
  { text: 'Below average', value: 2 },
  { text: 'Adequate / Fair', value: 3 },
  { text: 'Good / Healthy', value: 4 },
  { text: 'Excellent / Refreshing', value: 5 }
];

const OPTIONS_SUPPORT = [
  { text: 'Not at all supported', value: 1 },
  { text: 'Minimally supported', value: 2 },
  { text: 'Moderately supported', value: 3 },
  { text: 'Well supported', value: 4 },
  { text: 'Completely supported', value: 5 }
];

export const QUESTION_BANK = [
  // ==========================================
  // Category 1: Workload and deadlines (Q001 - Q010)
  // ==========================================
  {
    id: 'Q001',
    category: 'Workload and deadlines',
    question: 'How manageable was your workload this week?',
    answerType: 'manageability',
    options: OPTIONS_MANAGEABILITY,
    scoringDirection: 'stress_positive', // 1=Very manageable (low stress), 5=Extremely overwhelming (high stress)
    isActive: true
  },
  {
    id: 'Q002',
    category: 'Workload and deadlines',
    question: 'How often did you feel overwhelmed by deadlines?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q003',
    category: 'Workload and deadlines',
    question: 'Did you have enough time to finish your tasks?',
    answerType: 'frequency',
    options: [
      { text: 'Always had enough time', value: 5 },
      { text: 'Usually had enough time', value: 4 },
      { text: 'Sometimes rushed', value: 3 },
      { text: 'Rarely had enough time', value: 2 },
      { text: 'Never had enough time', value: 1 }
    ],
    scoringDirection: 'wellbeing_positive', // 5=Always had time (good), 1=Never had time (bad)
    isActive: true
  },
  {
    id: 'Q004',
    category: 'Workload and deadlines',
    question: 'How often did unexpected tasks increase your stress?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q005',
    category: 'Workload and deadlines',
    question: 'Did you have enough breaks during work?',
    answerType: 'frequency',
    options: [
      { text: 'Plenty of restful breaks', value: 5 },
      { text: 'Adequate breaks', value: 4 },
      { text: 'Occasional short breaks', value: 3 },
      { text: 'Very few breaks', value: 2 },
      { text: 'Zero breaks, worked continuously', value: 1 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q006',
    category: 'Workload and deadlines',
    question: 'How clear were your priorities this week?',
    answerType: 'agreement',
    options: [
      { text: 'Completely unclear', value: 1 },
      { text: 'Mostly unclear', value: 2 },
      { text: 'Somewhat clear', value: 3 },
      { text: 'Mostly clear', value: 4 },
      { text: 'Crystal clear priorities', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q007',
    category: 'Workload and deadlines',
    question: 'How often did you feel rushed at work?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q008',
    category: 'Workload and deadlines',
    question: 'Was your workload balanced?',
    answerType: 'agreement',
    options: [
      { text: 'Extremely unbalanced', value: 1 },
      { text: 'Mostly unbalanced', value: 2 },
      { text: 'Fairly balanced', value: 3 },
      { text: 'Well balanced', value: 4 },
      { text: 'Perfect balance', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q009',
    category: 'Workload and deadlines',
    question: 'How manageable were your meetings?',
    answerType: 'manageability',
    options: OPTIONS_MANAGEABILITY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q010',
    category: 'Workload and deadlines',
    question: 'Did you have enough time for focused work?',
    answerType: 'agreement',
    options: [
      { text: 'No focused time at all', value: 1 },
      { text: 'Very little focus time', value: 2 },
      { text: 'Moderate focus time', value: 3 },
      { text: 'Good focused time', value: 4 },
      { text: 'Abundant uninterrupted time', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },

  // ==========================================
  // Category 2: Emotional stress (Q011 - Q020)
  // ==========================================
  {
    id: 'Q011',
    category: 'Emotional stress',
    question: 'How stressed did you feel this week?',
    answerType: 'frequency',
    options: [
      { text: 'Not stressed at all', value: 1 },
      { text: 'Mildly stressed', value: 2 },
      { text: 'Moderately stressed', value: 3 },
      { text: 'Very stressed', value: 4 },
      { text: 'Extremely stressed', value: 5 }
    ],
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q012',
    category: 'Emotional stress',
    question: 'How often did you feel mentally overwhelmed?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q013',
    category: 'Emotional stress',
    question: 'How often did you feel tense during work?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q014',
    category: 'Emotional stress',
    question: 'How easy was it to relax after work?',
    answerType: 'agreement',
    options: [
      { text: 'Impossible to relax', value: 1 },
      { text: 'Very difficult', value: 2 },
      { text: 'Somewhat difficult', value: 3 },
      { text: 'Easy to relax', value: 4 },
      { text: 'Completely effortless', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q015',
    category: 'Emotional stress',
    question: 'How often did work-related worries follow you home?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q016',
    category: 'Emotional stress',
    question: 'How often did you feel emotionally drained?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q017',
    category: 'Emotional stress',
    question: 'How manageable did workplace challenges feel?',
    answerType: 'manageability',
    options: OPTIONS_MANAGEABILITY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q018',
    category: 'Emotional stress',
    question: 'How often did small problems feel difficult to handle?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q019',
    category: 'Emotional stress',
    question: 'How calm did you generally feel during work?',
    answerType: 'frequency',
    options: [
      { text: 'Never felt calm', value: 1 },
      { text: 'Rarely felt calm', value: 2 },
      { text: 'Sometimes calm', value: 3 },
      { text: 'Often felt calm', value: 4 },
      { text: 'Consistently calm and centered', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q020',
    category: 'Emotional stress',
    question: 'How confident did you feel handling stressful situations?',
    answerType: 'agreement',
    options: [
      { text: 'Not confident at all', value: 1 },
      { text: 'Slightly confident', value: 2 },
      { text: 'Moderately confident', value: 3 },
      { text: 'Very confident', value: 4 },
      { text: 'Extremely confident', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },

  // ==========================================
  // Category 3: Energy and fatigue (Q021 - Q030)
  // ==========================================
  {
    id: 'Q021',
    category: 'Energy and fatigue',
    question: 'How energetic did you feel during work?',
    answerType: 'quality',
    options: [
      { text: 'Completely exhausted', value: 1 },
      { text: 'Low energy', value: 2 },
      { text: 'Moderate energy', value: 3 },
      { text: 'High energy', value: 4 },
      { text: 'Vibrant and energetic', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q022',
    category: 'Energy and fatigue',
    question: 'How often did you feel exhausted by the end of the day?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q023',
    category: 'Energy and fatigue',
    question: 'How difficult was it to maintain your energy?',
    answerType: 'agreement',
    options: [
      { text: 'Very easy', value: 1 },
      { text: 'Mostly manageable', value: 2 },
      { text: 'Somewhat difficult', value: 3 },
      { text: 'Very difficult', value: 4 },
      { text: 'Extremely exhausting', value: 5 }
    ],
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q024',
    category: 'Energy and fatigue',
    question: 'How often did you feel mentally tired?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q025',
    category: 'Energy and fatigue',
    question: 'Did you have enough time to recover between workdays?',
    answerType: 'agreement',
    options: [
      { text: 'Never enough time', value: 1 },
      { text: 'Rarely enough time', value: 2 },
      { text: 'Sometimes enough', value: 3 },
      { text: 'Usually enough time', value: 4 },
      { text: 'Plenty of recovery time', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q026',
    category: 'Energy and fatigue',
    question: 'How alert did you feel during working hours?',
    answerType: 'quality',
    options: [
      { text: 'Constantly sluggish', value: 1 },
      { text: 'Often drowsy', value: 2 },
      { text: 'Moderately alert', value: 3 },
      { text: 'Sharp and alert', value: 4 },
      { text: 'Peak cognitive alertness', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q027',
    category: 'Energy and fatigue',
    question: 'How often did you struggle to get started on tasks?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q028',
    category: 'Energy and fatigue',
    question: 'How frequently did you need a break to recharge?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q029',
    category: 'Energy and fatigue',
    question: 'How balanced was your energy throughout the week?',
    answerType: 'quality',
    options: [
      { text: 'Extreme crashes', value: 1 },
      { text: 'Frequent dips', value: 2 },
      { text: 'Moderately steady', value: 3 },
      { text: 'Consistent energy', value: 4 },
      { text: 'Exceptionally steady energy', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q030',
    category: 'Energy and fatigue',
    question: 'How refreshed did you feel at the start of your workdays?',
    answerType: 'quality',
    options: [
      { text: 'Felt depleted', value: 1 },
      { text: 'Somewhat tired', value: 2 },
      { text: 'Neutral', value: 3 },
      { text: 'Refreshed', value: 4 },
      { text: 'Completely energized', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },

  // ==========================================
  // Category 4: Sleep and recovery (Q031 - Q040)
  // ==========================================
  {
    id: 'Q031',
    category: 'Sleep and recovery',
    question: 'How well did you sleep this week?',
    answerType: 'quality',
    options: OPTIONS_QUALITY,
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q032',
    category: 'Sleep and recovery',
    question: 'How often did you feel tired after waking up?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q033',
    category: 'Sleep and recovery',
    question: 'Did you get enough rest between workdays?',
    answerType: 'agreement',
    options: [
      { text: 'Far too little rest', value: 1 },
      { text: 'Insufficient rest', value: 2 },
      { text: 'Just enough rest', value: 3 },
      { text: 'Good amount of rest', value: 4 },
      { text: 'Abundant deep rest', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q034',
    category: 'Sleep and recovery',
    question: 'How refreshed did you feel in the morning?',
    answerType: 'quality',
    options: [
      { text: 'Exhausted', value: 1 },
      { text: 'Groggy', value: 2 },
      { text: 'Fairly rested', value: 3 },
      { text: 'Well refreshed', value: 4 },
      { text: 'Thoroughly rejuvenated', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q035',
    category: 'Sleep and recovery',
    question: 'How often did work interfere with your sleep?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q036',
    category: 'Sleep and recovery',
    question: 'How easy was it to switch off after work?',
    answerType: 'agreement',
    options: [
      { text: 'Unable to switch off', value: 1 },
      { text: 'Very difficult', value: 2 },
      { text: 'Somewhat manageable', value: 3 },
      { text: 'Easy to switch off', value: 4 },
      { text: 'Effortlessly disconnected', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q037',
    category: 'Sleep and recovery',
    question: 'How often did you feel you needed more rest?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q038',
    category: 'Sleep and recovery',
    question: 'How satisfied were you with your recovery time?',
    answerType: 'agreement',
    options: [
      { text: 'Very dissatisfied', value: 1 },
      { text: 'Dissatisfied', value: 2 },
      { text: 'Neutral', value: 3 },
      { text: 'Satisfied', value: 4 },
      { text: 'Highly satisfied', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q039',
    category: 'Sleep and recovery',
    question: 'Did you have enough time to unwind?',
    answerType: 'agreement',
    options: [
      { text: 'No unwind time at all', value: 1 },
      { text: 'Very little time', value: 2 },
      { text: 'Some time to unwind', value: 3 },
      { text: 'Good evening unwind', value: 4 },
      { text: 'Plenty of relaxation time', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q040',
    category: 'Sleep and recovery',
    question: 'How rested did you feel overall?',
    answerType: 'quality',
    options: [
      { text: 'Chronically tired', value: 1 },
      { text: 'Under-rested', value: 2 },
      { text: 'Adequately rested', value: 3 },
      { text: 'Well rested', value: 4 },
      { text: 'Completely energized and rested', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },

  // ==========================================
  // Category 5: Work-life balance (Q041 - Q050)
  // ==========================================
  {
    id: 'Q041',
    category: 'Work-life balance',
    question: 'How balanced did work and personal life feel?',
    answerType: 'quality',
    options: [
      { text: 'Extremely imbalanced', value: 1 },
      { text: 'Mostly out of balance', value: 2 },
      { text: 'Moderate balance', value: 3 },
      { text: 'Well balanced', value: 4 },
      { text: 'Ideal harmonious balance', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q042',
    category: 'Work-life balance',
    question: 'How often did work take time away from personal activities?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q043',
    category: 'Work-life balance',
    question: 'Did you have enough time for yourself?',
    answerType: 'agreement',
    options: [
      { text: 'Zero personal time', value: 1 },
      { text: 'Barely any time', value: 2 },
      { text: 'Some personal time', value: 3 },
      { text: 'Good personal time', value: 4 },
      { text: 'Abundant personal time', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q044',
    category: 'Work-life balance',
    question: 'How easy was it to disconnect from work?',
    answerType: 'agreement',
    options: [
      { text: 'Never disconnected', value: 1 },
      { text: 'Difficult to disconnect', value: 2 },
      { text: 'Moderate effort', value: 3 },
      { text: 'Easy to disconnect', value: 4 },
      { text: 'Completely disconnected seamlessly', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q045',
    category: 'Work-life balance',
    question: 'How manageable were your working hours?',
    answerType: 'manageability',
    options: OPTIONS_MANAGEABILITY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q046',
    category: 'Work-life balance',
    question: 'Did you have enough flexibility in your schedule?',
    answerType: 'agreement',
    options: [
      { text: 'Completely rigid', value: 1 },
      { text: 'Very limited flexibility', value: 2 },
      { text: 'Moderate flexibility', value: 3 },
      { text: 'Good flexibility', value: 4 },
      { text: 'Excellent autonomy and flexibility', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q047',
    category: 'Work-life balance',
    question: 'How often did you work beyond your planned hours?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q048',
    category: 'Work-life balance',
    question: 'How satisfied were you with your work-life balance?',
    answerType: 'agreement',
    options: [
      { text: 'Extremely dissatisfied', value: 1 },
      { text: 'Dissatisfied', value: 2 },
      { text: 'Neutral', value: 3 },
      { text: 'Satisfied', value: 4 },
      { text: 'Highly satisfied', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q049',
    category: 'Work-life balance',
    question: 'Did you have enough time for family or friends?',
    answerType: 'agreement',
    options: [
      { text: 'No social / family time', value: 1 },
      { text: 'Very little time', value: 2 },
      { text: 'Adequate time', value: 3 },
      { text: 'Good quality time', value: 4 },
      { text: 'Rich and fulfilling time', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q050',
    category: 'Work-life balance',
    question: 'How often did you feel that work dominated your day?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },

  // ==========================================
  // Category 6: Focus and concentration (Q051 - Q060)
  // ==========================================
  {
    id: 'Q051',
    category: 'Focus and concentration',
    question: 'How easy was it to concentrate this week?',
    answerType: 'agreement',
    options: [
      { text: 'Impossible to focus', value: 1 },
      { text: 'Very difficult', value: 2 },
      { text: 'Somewhat easy', value: 3 },
      { text: 'Easy to concentrate', value: 4 },
      { text: 'Deep, uninterrupted flow', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q052',
    category: 'Focus and concentration',
    question: 'How often were you distracted by work-related stress?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q053',
    category: 'Focus and concentration',
    question: 'How manageable was your workload mentally?',
    answerType: 'manageability',
    options: OPTIONS_MANAGEABILITY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q054',
    category: 'Focus and concentration',
    question: 'How often did you struggle to focus?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q055',
    category: 'Focus and concentration',
    question: 'Did you have enough uninterrupted work time?',
    answerType: 'agreement',
    options: [
      { text: 'Constant interruptions', value: 1 },
      { text: 'Frequent interruptions', value: 2 },
      { text: 'Some quiet blocks', value: 3 },
      { text: 'Good uninterrupted time', value: 4 },
      { text: 'Ideal deep work blocks', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q056',
    category: 'Focus and concentration',
    question: 'How clear-minded did you feel during work?',
    answerType: 'quality',
    options: [
      { text: 'Heavy brain fog', value: 1 },
      { text: 'Somewhat clouded', value: 2 },
      { text: 'Adequately clear', value: 3 },
      { text: 'Clear-minded', value: 4 },
      { text: 'Sharp and lucid clarity', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q057',
    category: 'Focus and concentration',
    question: 'How often did switching between tasks feel exhausting?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q058',
    category: 'Focus and concentration',
    question: 'How easy was it to make decisions?',
    answerType: 'agreement',
    options: [
      { text: 'Severe decision fatigue', value: 1 },
      { text: 'Difficult to decide', value: 2 },
      { text: 'Moderate effort', value: 3 },
      { text: 'Easy to make decisions', value: 4 },
      { text: 'Decisive and confident', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q059',
    category: 'Focus and concentration',
    question: 'How frequently did you feel mentally overloaded?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q060',
    category: 'Focus and concentration',
    question: 'How confident were you in completing your tasks?',
    answerType: 'agreement',
    options: [
      { text: 'Not confident at all', value: 1 },
      { text: 'Low confidence', value: 2 },
      { text: 'Moderately confident', value: 3 },
      { text: 'Confident', value: 4 },
      { text: 'Fully confident and assured', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },

  // ==========================================
  // Category 7: Team support (Q061 - Q070)
  // ==========================================
  {
    id: 'Q061',
    category: 'Team support',
    question: 'How supported did you feel by your teammates?',
    answerType: 'support',
    options: OPTIONS_SUPPORT,
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q062',
    category: 'Team support',
    question: 'How comfortable were you asking colleagues for help?',
    answerType: 'agreement',
    options: [
      { text: 'Very uncomfortable', value: 1 },
      { text: 'Somewhat uncomfortable', value: 2 },
      { text: 'Neutral', value: 3 },
      { text: 'Comfortable', value: 4 },
      { text: 'Completely comfortable without hesitation', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q063',
    category: 'Team support',
    question: 'How well did your team communicate?',
    answerType: 'quality',
    options: [
      { text: 'Poor / Chaotic communication', value: 1 },
      { text: 'Inconsistent communication', value: 2 },
      { text: 'Adequate communication', value: 3 },
      { text: 'Clear and collaborative', value: 4 },
      { text: 'Exemplary transparent communication', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q064',
    category: 'Team support',
    question: 'How often did you feel isolated at work?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q065',
    category: 'Team support',
    question: 'Did you feel respected by your teammates?',
    answerType: 'agreement',
    options: [
      { text: 'Felt disrespected', value: 1 },
      { text: 'Rarely respected', value: 2 },
      { text: 'Adequately respected', value: 3 },
      { text: 'Well respected', value: 4 },
      { text: 'Deeply valued and respected', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q066',
    category: 'Team support',
    question: 'How comfortable were you sharing work concerns?',
    answerType: 'agreement',
    options: [
      { text: 'Completely unsafe', value: 1 },
      { text: 'Hesitant to share', value: 2 },
      { text: 'Moderate comfort', value: 3 },
      { text: 'Comfortable sharing', value: 4 },
      { text: 'Total psychological safety', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q067',
    category: 'Team support',
    question: 'How often did teamwork reduce your workload?',
    answerType: 'frequency',
    options: [
      { text: 'Never helped', value: 1 },
      { text: 'Rarely helped', value: 2 },
      { text: 'Sometimes eased burden', value: 3 },
      { text: 'Often reduced stress', value: 4 },
      { text: 'Consistently great mutual help', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q068',
    category: 'Team support',
    question: 'How included did you feel in team activities?',
    answerType: 'agreement',
    options: [
      { text: 'Felt completely excluded', value: 1 },
      { text: 'Rarely included', value: 2 },
      { text: 'Somewhat included', value: 3 },
      { text: 'Well included', value: 4 },
      { text: 'Fully embraced and included', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q069',
    category: 'Team support',
    question: 'How helpful was feedback from your colleagues?',
    answerType: 'quality',
    options: [
      { text: 'Unhelpful or discouraging', value: 1 },
      { text: 'Minimally helpful', value: 2 },
      { text: 'Fairly constructive', value: 3 },
      { text: 'Helpful and supportive', value: 4 },
      { text: 'Extremely insightful and encouraging', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q070',
    category: 'Team support',
    question: 'How positive did your team interactions feel?',
    answerType: 'quality',
    options: [
      { text: 'Negative or toxic', value: 1 },
      { text: 'Strained / Tense', value: 2 },
      { text: 'Neutral / Professional', value: 3 },
      { text: 'Warm and positive', value: 4 },
      { text: 'Uplifting and energizing', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },

  // ==========================================
  // Category 8: Manager support (Q071 - Q080)
  // ==========================================
  {
    id: 'Q071',
    category: 'Manager support',
    question: 'How supported did you feel by your manager?',
    answerType: 'support',
    options: OPTIONS_SUPPORT,
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q072',
    category: 'Manager support',
    question: "How clear were your manager's expectations?",
    answerType: 'agreement',
    options: [
      { text: 'Extremely confusing', value: 1 },
      { text: 'Often unclear', value: 2 },
      { text: 'Moderately clear', value: 3 },
      { text: 'Clear and defined', value: 4 },
      { text: 'Crystal clear with realistic milestones', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q073',
    category: 'Manager support',
    question: 'How comfortable were you discussing workload concerns?',
    answerType: 'agreement',
    options: [
      { text: 'Unable to speak up', value: 1 },
      { text: 'Hesitant to mention', value: 2 },
      { text: 'Neutral', value: 3 },
      { text: 'Comfortable speaking up', value: 4 },
      { text: 'Completely open and welcomed', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q074',
    category: 'Manager support',
    question: 'How useful was the feedback you received?',
    answerType: 'quality',
    options: [
      { text: 'Not useful / Demotivating', value: 1 },
      { text: 'Vague feedback', value: 2 },
      { text: 'Adequate guidance', value: 3 },
      { text: 'Constructive and clear', value: 4 },
      { text: 'Exceptionally empowering feedback', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q075',
    category: 'Manager support',
    question: 'How often did you receive help when you needed it?',
    answerType: 'frequency',
    options: [
      { text: 'Never received help', value: 1 },
      { text: 'Rarely helped', value: 2 },
      { text: 'Sometimes helped', value: 3 },
      { text: 'Usually supported promptly', value: 4 },
      { text: 'Always received immediate assistance', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q076',
    category: 'Manager support',
    question: 'How fairly was your workload managed?',
    answerType: 'agreement',
    options: [
      { text: 'Very unfair distribution', value: 1 },
      { text: 'Somewhat unfair', value: 2 },
      { text: 'Reasonably fair', value: 3 },
      { text: 'Fairly managed', value: 4 },
      { text: 'Exemplary fairness and empathy', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q077',
    category: 'Manager support',
    question: 'How comfortable were you raising concerns?',
    answerType: 'agreement',
    options: [
      { text: 'Feared negative reaction', value: 1 },
      { text: 'Reluctant to share', value: 2 },
      { text: 'Moderate comfort', value: 3 },
      { text: 'Comfortable sharing', value: 4 },
      { text: '100% encouraged and supported', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q078',
    category: 'Manager support',
    question: 'How clearly were changes communicated?',
    answerType: 'quality',
    options: [
      { text: 'Last minute / Confusing', value: 1 },
      { text: 'Somewhat rushed', value: 2 },
      { text: 'Adequately explained', value: 3 },
      { text: 'Clear and timely', value: 4 },
      { text: 'Proactive, clear, and reassuring', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q079',
    category: 'Manager support',
    question: 'How confident were you in asking for support?',
    answerType: 'agreement',
    options: [
      { text: 'Zero confidence', value: 1 },
      { text: 'Hesitant', value: 2 },
      { text: 'Moderate confidence', value: 3 },
      { text: 'Confident', value: 4 },
      { text: 'Completely confident and backed up', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q080',
    category: 'Manager support',
    question: 'How well did your manager understand your workload?',
    answerType: 'agreement',
    options: [
      { text: 'Completely disconnected', value: 1 },
      { text: 'Limited understanding', value: 2 },
      { text: 'Basic understanding', value: 3 },
      { text: 'Understands workload well', value: 4 },
      { text: 'Deeply in tune with demands and pacing', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },

  // ==========================================
  // Category 9: Job satisfaction (Q081 - Q090)
  // ==========================================
  {
    id: 'Q081',
    category: 'Job satisfaction',
    question: 'How satisfied were you with your work this week?',
    answerType: 'agreement',
    options: [
      { text: 'Extremely dissatisfied', value: 1 },
      { text: 'Dissatisfied', value: 2 },
      { text: 'Neutral', value: 3 },
      { text: 'Satisfied', value: 4 },
      { text: 'Highly satisfied and proud', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q082',
    category: 'Job satisfaction',
    question: 'How meaningful did your tasks feel?',
    answerType: 'agreement',
    options: [
      { text: 'Pointless / Frustrating', value: 1 },
      { text: 'Little meaning', value: 2 },
      { text: 'Moderately meaningful', value: 3 },
      { text: 'Meaningful work', value: 4 },
      { text: 'Deeply impactful and purposeful', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q083',
    category: 'Job satisfaction',
    question: 'How motivated did you feel at work?',
    answerType: 'quality',
    options: [
      { text: 'Completely demotivated', value: 1 },
      { text: 'Low motivation', value: 2 },
      { text: 'Moderate motivation', value: 3 },
      { text: 'Motivated', value: 4 },
      { text: 'Highly inspired and driven', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q084',
    category: 'Job satisfaction',
    question: 'How appreciated did you feel?',
    answerType: 'agreement',
    options: [
      { text: 'Completely unappreciated', value: 1 },
      { text: 'Rarely acknowledged', value: 2 },
      { text: 'Sometimes recognized', value: 3 },
      { text: 'Well appreciated', value: 4 },
      { text: 'Deeply valued and celebrated', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q085',
    category: 'Job satisfaction',
    question: 'How positive did your work environment feel?',
    answerType: 'quality',
    options: [
      { text: 'Negative / Hostile', value: 1 },
      { text: 'Dull / Stressful', value: 2 },
      { text: 'Neutral', value: 3 },
      { text: 'Positive and welcoming', value: 4 },
      { text: 'Thriving, encouraging, and vibrant', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q086',
    category: 'Job satisfaction',
    question: 'How well did your tasks match your skills?',
    answerType: 'agreement',
    options: [
      { text: 'Poor match / Mismatched', value: 1 },
      { text: 'Sub-optimal match', value: 2 },
      { text: 'Adequate match', value: 3 },
      { text: 'Good fit for strengths', value: 4 },
      { text: 'Perfect alignment with expertise', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q087',
    category: 'Job satisfaction',
    question: 'How satisfied were you with your progress?',
    answerType: 'agreement',
    options: [
      { text: 'Very dissatisfied with pace', value: 1 },
      { text: 'Felt stuck', value: 2 },
      { text: 'Steady progress', value: 3 },
      { text: 'Satisfied with progress', value: 4 },
      { text: 'Accomplished milestones smoothly', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q088',
    category: 'Job satisfaction',
    question: 'How often did you feel frustrated by work?',
    answerType: 'frequency',
    options: OPTIONS_FREQUENCY,
    scoringDirection: 'stress_positive',
    isActive: true
  },
  {
    id: 'Q089',
    category: 'Job satisfaction',
    question: 'How much control did you feel over your tasks?',
    answerType: 'agreement',
    options: [
      { text: 'Zero control / Micromanaged', value: 1 },
      { text: 'Very little control', value: 2 },
      { text: 'Moderate autonomy', value: 3 },
      { text: 'Good ownership', value: 4 },
      { text: 'Full healthy task autonomy', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q090',
    category: 'Job satisfaction',
    question: 'How optimistic did you feel about your work?',
    answerType: 'quality',
    options: [
      { text: 'Pessimistic / Dread', value: 1 },
      { text: 'Uncertain', value: 2 },
      { text: 'Neutral', value: 3 },
      { text: 'Optimistic', value: 4 },
      { text: 'Very enthusiastic and hopeful', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },

  // ==========================================
  // Category 10: Coping and relaxation (Q091 - Q100)
  // ==========================================
  {
    id: 'Q091',
    category: 'Coping and relaxation',
    question: 'How effectively did you manage stressful moments?',
    answerType: 'agreement',
    options: [
      { text: 'Inadequately / Panicked', value: 1 },
      { text: 'Struggled to cope', value: 2 },
      { text: 'Coped reasonably', value: 3 },
      { text: 'Handled stress effectively', value: 4 },
      { text: 'Resilient and composed', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q092',
    category: 'Coping and relaxation',
    question: 'How often did you take a proper break?',
    answerType: 'frequency',
    options: [
      { text: 'Never took proper breaks', value: 1 },
      { text: 'Rarely took breaks', value: 2 },
      { text: 'Took a few breaks', value: 3 },
      { text: 'Regular healthy pauses', value: 4 },
      { text: 'Consistently honored rest intervals', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q093',
    category: 'Coping and relaxation',
    question: 'How easy was it to calm yourself after a difficult task?',
    answerType: 'agreement',
    options: [
      { text: 'Stayed agitated for hours', value: 1 },
      { text: 'Took a long time to calm', value: 2 },
      { text: 'Moderate effort to reset', value: 3 },
      { text: 'Calmed down quickly', value: 4 },
      { text: 'Reset smoothly and peacefully', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q094',
    category: 'Coping and relaxation',
    question: 'How often did you use a healthy way to manage stress?',
    answerType: 'frequency',
    options: [
      { text: 'Never', value: 1 },
      { text: 'Rarely', value: 2 },
      { text: 'Sometimes (walks, breathing)', value: 3 },
      { text: 'Often used healthy coping', value: 4 },
      { text: 'Always practiced proactive self-care', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q095',
    category: 'Coping and relaxation',
    question: 'Did you have enough opportunities to recharge?',
    answerType: 'agreement',
    options: [
      { text: 'No recharge opportunity', value: 1 },
      { text: 'Very few chances', value: 2 },
      { text: 'Occasional recharge', value: 3 },
      { text: 'Good recharge windows', value: 4 },
      { text: 'Abundant restorative time', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q096',
    category: 'Coping and relaxation',
    question: 'How comfortable were you taking breaks when needed?',
    answerType: 'agreement',
    options: [
      { text: 'Felt guilty or penalized', value: 1 },
      { text: 'Somewhat uncomfortable', value: 2 },
      { text: 'Neutral', value: 3 },
      { text: 'Comfortable stepping away', value: 4 },
      { text: 'Fully supported by workplace culture', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q097',
    category: 'Coping and relaxation',
    question: 'How often did you feel able to manage unexpected changes?',
    answerType: 'frequency',
    options: [
      { text: 'Never handled well', value: 1 },
      { text: 'Rarely adapted easily', value: 2 },
      { text: 'Adapted with some friction', value: 3 },
      { text: 'Usually adapted well', value: 4 },
      { text: 'Always embraced changes smoothly', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q098',
    category: 'Coping and relaxation',
    question: 'How confident were you in handling pressure?',
    answerType: 'agreement',
    options: [
      { text: 'Felt easily rattled', value: 1 },
      { text: 'Low confidence under strain', value: 2 },
      { text: 'Moderate confidence', value: 3 },
      { text: 'Confident handling pressure', value: 4 },
      { text: 'Calm, grounded, and steady', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q099',
    category: 'Coping and relaxation',
    question: 'How often did you make time to relax?',
    answerType: 'frequency',
    options: [
      { text: 'Never made time', value: 1 },
      { text: 'Rarely relaxed', value: 2 },
      { text: 'Sometimes took a break', value: 3 },
      { text: 'Regularly made time', value: 4 },
      { text: 'Daily intentional relaxation', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  },
  {
    id: 'Q100',
    category: 'Coping and relaxation',
    question: 'How well did you recover after a stressful day?',
    answerType: 'quality',
    options: [
      { text: 'Carried fatigue for days', value: 1 },
      { text: 'Lingering exhaustion', value: 2 },
      { text: 'Moderate recovery', value: 3 },
      { text: 'Recovered well by morning', value: 4 },
      { text: 'Completely restored and ready', value: 5 }
    ],
    scoringDirection: 'wellbeing_positive',
    isActive: true
  }
];

// Helper to select 30 unique questions without replacement
export function selectRandomQuestions(count = 30) {
  const activeQuestions = QUESTION_BANK.filter(q => q.isActive);
  if (activeQuestions.length < count) {
    throw new Error(`Insufficient active questions in bank. Required: ${count}, available: ${activeQuestions.length}`);
  }

  // Fisher-Yates shuffle
  const shuffled = [...activeQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Return first 'count' distinct questions
  return shuffled.slice(0, count);
}

// Helper to calculate scoring from responses
export function calculateWellbeingScore(responses, questionBank = QUESTION_BANK) {
  const qMap = new Map(questionBank.map(q => [q.id, q]));
  
  let totalNormalizedStress = 0;
  let scoredCount = 0;
  const categoryAccumulators = {};

  for (const [qId, resp] of Object.entries(responses)) {
    const q = qMap.get(qId);
    if (!q) continue;

    const rawScore = parseInt(resp.score, 10);
    if (isNaN(rawScore) || rawScore < 1 || rawScore > 5) continue;

    // Normalization rule:
    // If stress_positive: 1 (min stress = 0%), 5 (max stress = 100%)
    // Normalized stress contribution = ((rawScore - 1) / 4) * 100
    // If wellbeing_positive: 1 (worst wellbeing = 100% stress), 5 (best wellbeing = 0% stress)
    // Normalized stress contribution = ((5 - rawScore) / 4) * 100
    let stressContribution;
    if (q.scoringDirection === 'stress_positive') {
      stressContribution = ((rawScore - 1) / 4) * 100;
    } else {
      stressContribution = ((5 - rawScore) / 4) * 100;
    }

    totalNormalizedStress += stressContribution;
    scoredCount++;

    if (!categoryAccumulators[q.category]) {
      categoryAccumulators[q.category] = { totalStress: 0, count: 0 };
    }
    categoryAccumulators[q.category].totalStress += stressContribution;
    categoryAccumulators[q.category].count++;
  }

  if (scoredCount === 0) {
    return {
      stressIndex: null,
      indicatorCategory: 'Pending / Insufficient Responses',
      categoryScores: {}
    };
  }

  const stressIndex = Math.round(totalNormalizedStress / scoredCount);

  // Category labels based on transparent non-clinical thresholds
  let indicatorCategory;
  let indicatorColor;
  let recommendation;

  if (stressIndex <= 35) {
    indicatorCategory = 'Lower Stress Indicator';
    indicatorColor = 'text-tertiary bg-tertiary-fixed/30';
    recommendation = 'Your pacing and support indicators are healthy. Continue prioritizing restful micro-breaks.';
  } else if (stressIndex <= 65) {
    indicatorCategory = 'Moderate Stress Indicator';
    indicatorColor = 'text-primary bg-primary/10';
    recommendation = 'Workload strain is moderate. Consider blocking 15-minute focus intervals and 3-minute boxed breathing resets.';
  } else {
    indicatorCategory = 'Higher Stress Indicator';
    indicatorColor = 'text-error bg-error/10';
    recommendation = 'Workload pressure appears elevated this week. Consider speaking with your manager about deadline prioritization and recovery.';
  }

  // Category breakdown
  const categoryScores = {};
  for (const [catName, data] of Object.entries(categoryAccumulators)) {
    categoryScores[catName] = {
      averageStress: Math.round(data.totalStress / data.count),
      count: data.count
    };
  }

  return {
    stressIndex,
    indicatorCategory,
    indicatorColor,
    recommendation,
    categoryScores,
    totalScoredQuestions: scoredCount
  };
}
