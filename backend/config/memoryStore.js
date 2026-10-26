const bcrypt = require('bcryptjs');

// Pre-computed hash for password 'Password123!'
const hashedPassword = bcrypt.hashSync('Password123!', 10);

const defaultUsers = [
  {
    _id: '65b210000000000000000001',
    name: 'Sarah Jenkins (HR Director)',
    email: 'hr@example.com',
    password: hashedPassword,
    role: 'hr',
    department: 'Human Resources',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    status: 'active',
    createdAt: new Date('2024-01-01')
  },
  {
    _id: '65b210000000000000000002',
    name: 'David Miller (Tech Lead & Manager)',
    email: 'manager@example.com',
    password: hashedPassword,
    role: 'manager',
    department: 'Engineering',
    phone: '+1 (555) 345-6789',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    status: 'active',
    createdAt: new Date('2024-01-05')
  },
  {
    _id: '65b210000000000000000003',
    name: 'Alex Johnson (Senior Developer)',
    email: 'alex@example.com',
    password: hashedPassword,
    role: 'employee',
    department: 'Engineering',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    status: 'active',
    createdAt: new Date('2024-01-10')
  },
  {
    _id: '65b210000000000000000004',
    name: 'Elena Rostova (UI/UX Designer)',
    email: 'elena@example.com',
    password: hashedPassword,
    role: 'employee',
    department: 'Design',
    phone: '+1 (555) 567-8901',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    status: 'active',
    createdAt: new Date('2024-02-01')
  },
  {
    _id: '65b210000000000000000005',
    name: 'Marcus Vance (Marketing Lead)',
    email: 'marcus@example.com',
    password: hashedPassword,
    role: 'manager',
    department: 'Marketing',
    phone: '+1 (555) 678-9012',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    status: 'active',
    createdAt: new Date('2024-02-15')
  }
];

const defaultEmployees = [
  {
    _id: '65b220000000000000000001',
    userId: '65b210000000000000000001',
    employeeId: 'EMP-001',
    department: 'Human Resources',
    designation: 'Head of Human Resources',
    dateOfJoining: new Date('2023-01-15'),
    managerId: null,
    salary: 95000,
    leaveBalance: { annual: 20, sick: 10, casual: 10 },
    address: { street: '100 HR Blvd', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94105' },
    emergencyContact: { name: 'Mark Jenkins', relation: 'Spouse', phone: '+1 555-901-2345' },
    skills: ['Talent Acquisition', 'Labor Relations', 'Strategic HR', 'Policy Development'],
    performanceRating: 4.9
  },
  {
    _id: '65b220000000000000000002',
    userId: '65b210000000000000000002',
    employeeId: 'EMP-002',
    department: 'Engineering',
    designation: 'Engineering Manager',
    dateOfJoining: new Date('2023-03-01'),
    managerId: '65b210000000000000000001',
    salary: 120000,
    leaveBalance: { annual: 18, sick: 9, casual: 8 },
    address: { street: '220 Tech Park Rd', city: 'San Jose', state: 'CA', country: 'USA', zipCode: '95112' },
    emergencyContact: { name: 'Claire Miller', relation: 'Sister', phone: '+1 555-888-2233' },
    skills: ['Node.js', 'React', 'Cloud Architecture', 'Agile Leadership', 'System Design'],
    performanceRating: 4.8
  },
  {
    _id: '65b220000000000000000003',
    userId: '65b210000000000000000003',
    employeeId: 'EMP-003',
    department: 'Engineering',
    designation: 'Senior Full Stack Developer',
    dateOfJoining: new Date('2023-06-15'),
    managerId: '65b210000000000000000002',
    salary: 92000,
    leaveBalance: { annual: 14, sick: 8, casual: 6 },
    address: { street: '45 Mission St', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94103' },
    emergencyContact: { name: 'Emily Johnson', relation: 'Mother', phone: '+1 555-777-3344' },
    skills: ['JavaScript', 'TypeScript', 'React.js', 'Express', 'MongoDB', 'REST APIs'],
    performanceRating: 4.7
  },
  {
    _id: '65b220000000000000000004',
    userId: '65b210000000000000000004',
    employeeId: 'EMP-004',
    department: 'Design',
    designation: 'Senior UI/UX Designer',
    dateOfJoining: new Date('2023-09-01'),
    managerId: '65b210000000000000000002',
    salary: 86000,
    leaveBalance: { annual: 15, sick: 10, casual: 8 },
    address: { street: '78 Berkeley Way', city: 'Oakland', state: 'CA', country: 'USA', zipCode: '94607' },
    emergencyContact: { name: 'Dmitri Rostov', relation: 'Father', phone: '+1 555-666-4455' },
    skills: ['Figma', 'UI Prototyping', 'User Research', 'Design Systems', 'CSS/SCSS'],
    performanceRating: 4.6
  },
  {
    _id: '65b220000000000000000005',
    userId: '65b210000000000000000005',
    employeeId: 'EMP-005',
    department: 'Marketing',
    designation: 'Marketing Director',
    dateOfJoining: new Date('2023-04-10'),
    managerId: '65b210000000000000000001',
    salary: 98000,
    leaveBalance: { annual: 16, sick: 10, casual: 7 },
    address: { street: '512 Market St', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94105' },
    emergencyContact: { name: 'Samantha Vance', relation: 'Spouse', phone: '+1 555-555-1122' },
    skills: ['Growth Marketing', 'Brand Strategy', 'SEO/SEM', 'Content Strategy'],
    performanceRating: 4.5
  }
];

const defaultManagers = [
  {
    _id: '65b230000000000000000001',
    userId: '65b210000000000000000002',
    department: 'Engineering',
    teamMembers: ['65b210000000000000000003', '65b210000000000000000004'],
    projectAssignments: [
      { projectName: 'NextGen Core HRM Platform', description: 'Enterprise HR automation migration', status: 'in-progress' },
      { projectName: 'Design System 2.0', description: 'Accessibility & unified component tokens', status: 'completed' }
    ]
  },
  {
    _id: '65b230000000000000000002',
    userId: '65b210000000000000000005',
    department: 'Marketing',
    teamMembers: [],
    projectAssignments: [
      { projectName: 'Q4 Product Launch Campaign', description: 'Global digital rollout', status: 'in-progress' }
    ]
  }
];

const todayStr = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const defaultAttendance = [
  {
    _id: '65b240000000000000000001',
    userId: '65b210000000000000000003', // Alex
    date: todayStr,
    clockIn: new Date(Date.now() - 3600000 * 4),
    clockOut: null,
    totalHours: 4,
    status: 'present',
    notes: 'Clocked in from office workstation'
  },
  {
    _id: '65b240000000000000000002',
    userId: '65b210000000000000000003', // Alex yesterday
    date: yesterday,
    clockIn: new Date(new Date(yesterday).setHours(9, 0, 0, 0)),
    clockOut: new Date(new Date(yesterday).setHours(17, 30, 0, 0)),
    totalHours: 8.5,
    status: 'present',
    notes: 'Regular work day'
  },
  {
    _id: '65b240000000000000000003',
    userId: '65b210000000000000000004', // Elena
    date: todayStr,
    clockIn: new Date(Date.now() - 3600000 * 3),
    clockOut: null,
    totalHours: 3,
    status: 'present',
    notes: 'Remote clock-in'
  },
  {
    _id: '65b240000000000000000004',
    userId: '65b210000000000000000002', // David
    date: todayStr,
    clockIn: new Date(Date.now() - 3600000 * 5),
    clockOut: null,
    totalHours: 5,
    status: 'present',
    notes: 'Office headquarters'
  }
];

const defaultLeaves = [
  {
    _id: '65b250000000000000000001',
    userId: '65b210000000000000000003', // Alex
    leaveType: 'annual',
    startDate: new Date('2026-11-10'),
    endDate: new Date('2026-11-14'),
    totalDays: 5,
    reason: 'Family vacation scheduled well in advance.',
    status: 'pending',
    reviewedBy: null,
    reviewComment: '',
    reviewedAt: null,
    createdAt: new Date()
  },
  {
    _id: '65b250000000000000000002',
    userId: '65b210000000000000000004', // Elena
    leaveType: 'sick',
    startDate: new Date('2026-10-15'),
    endDate: new Date('2026-10-16'),
    totalDays: 2,
    reason: 'Severe migraine and doctor visit.',
    status: 'approved',
    reviewedBy: '65b210000000000000000002',
    reviewComment: 'Approved. Get well soon!',
    reviewedAt: new Date('2026-10-15T10:00:00Z'),
    createdAt: new Date('2026-10-15T08:30:00Z')
  }
];

const defaultAnnouncements = [
  {
    _id: '65b260000000000000000001',
    title: 'Annual Performance Review & Growth Cycle Announced',
    content: 'The Q4 performance reviews will commence next Monday. All employees and team leads should complete their self-assessments by end of week.',
    priority: 'high',
    targetAudience: 'all',
    createdBy: '65b210000000000000000001',
    isPinned: true,
    createdAt: new Date(Date.now() - 86400000 * 2)
  },
  {
    _id: '65b260000000000000000002',
    title: 'Quarterly Town Hall & Innovation Awards',
    content: 'Join us in the Main Auditorium or on Zoom for our quarterly town hall celebrating team achievements and product milestones.',
    priority: 'medium',
    targetAudience: 'all',
    createdBy: '65b210000000000000000001',
    isPinned: true,
    createdAt: new Date(Date.now() - 86400000 * 5)
  },
  {
    _id: '65b260000000000000000003',
    title: 'Engineering Hackathon 2026: AI & Automation',
    content: 'Registration is now open for our 48-hour internal hackathon. Prizes include sponsored tech conference tickets and gadgets.',
    priority: 'high',
    targetAudience: 'engineering',
    createdBy: '65b210000000000000000002',
    isPinned: false,
    createdAt: new Date(Date.now() - 86400000 * 7)
  }
];

const defaultTrainings = [
  {
    _id: '65b270000000000000000001',
    title: 'Advanced Microservices & Node.js Architecture',
    description: 'Deep dive into event-driven patterns, Redis caching, message queues, and high-concurrency Node.js microservices.',
    category: 'Technical',
    instructor: 'Dr. Gregory Chen, Cloud Architect',
    durationHours: 16,
    maxCapacity: 25,
    startDate: new Date('2026-11-01'),
    endDate: new Date('2026-11-20'),
    status: 'upcoming',
    enrolledEmployees: [
      { userId: '65b210000000000000000003', progress: 40, status: 'in-progress', score: 88 }
    ],
    createdBy: '65b210000000000000000002'
  },
  {
    _id: '65b270000000000000000002',
    title: 'Cybersecurity & Data Privacy Compliance 2026',
    description: 'Mandatory annual training covering GDPR, SOC-2 compliance, phishing defense, and cryptographic key management.',
    category: 'Compliance',
    instructor: 'Samantha Ross, Security Officer',
    durationHours: 6,
    maxCapacity: 100,
    startDate: new Date('2026-10-01'),
    endDate: new Date('2026-11-30'),
    status: 'active',
    enrolledEmployees: [
      { userId: '65b210000000000000000003', progress: 100, status: 'completed', score: 96 },
      { userId: '65b210000000000000000004', progress: 80, status: 'in-progress', score: 90 }
    ],
    createdBy: '65b210000000000000000001'
  },
  {
    _id: '65b270000000000000000003',
    title: 'Empathetic Leadership & High-Performing Teams',
    description: 'Workshop for managers on psychological safety, one-on-one coaching, constructive feedback, and conflict resolution.',
    category: 'Leadership',
    instructor: 'David Miller',
    durationHours: 10,
    maxCapacity: 15,
    startDate: new Date('2026-11-15'),
    endDate: new Date('2026-11-28'),
    status: 'upcoming',
    enrolledEmployees: [],
    createdBy: '65b210000000000000000001'
  }
];

const defaultNotifications = [
  {
    _id: '65b280000000000000000001',
    recipient: '65b210000000000000000003', // Alex
    title: 'Training Progress',
    message: 'You have completed the Cybersecurity Compliance 2026 module with 96% score!',
    type: 'training',
    link: '/trainings',
    isRead: false,
    createdAt: new Date()
  },
  {
    _id: '65b280000000000000000002',
    recipient: '65b210000000000000000002', // David
    title: 'New Leave Request',
    message: 'Alex Johnson requested 5 days of Annual Leave from Nov 10 to Nov 14.',
    type: 'leave',
    link: '/leaves',
    isRead: false,
    createdAt: new Date()
  }
];

const memoryStore = {
  users: JSON.parse(JSON.stringify(defaultUsers)),
  employees: JSON.parse(JSON.stringify(defaultEmployees)),
  managers: JSON.parse(JSON.stringify(defaultManagers)),
  attendance: JSON.parse(JSON.stringify(defaultAttendance)),
  leaves: JSON.parse(JSON.stringify(defaultLeaves)),
  announcements: JSON.parse(JSON.stringify(defaultAnnouncements)),
  trainings: JSON.parse(JSON.stringify(defaultTrainings)),
  notifications: JSON.parse(JSON.stringify(defaultNotifications))
};

const resetMemoryStore = () => {
  memoryStore.users = JSON.parse(JSON.stringify(defaultUsers));
  memoryStore.employees = JSON.parse(JSON.stringify(defaultEmployees));
  memoryStore.managers = JSON.parse(JSON.stringify(defaultManagers));
  memoryStore.attendance = JSON.parse(JSON.stringify(defaultAttendance));
  memoryStore.leaves = JSON.parse(JSON.stringify(defaultLeaves));
  memoryStore.announcements = JSON.parse(JSON.stringify(defaultAnnouncements));
  memoryStore.trainings = JSON.parse(JSON.stringify(defaultTrainings));
  memoryStore.notifications = JSON.parse(JSON.stringify(defaultNotifications));
};

module.exports = {
  memoryStore,
  resetMemoryStore,
  defaultUsers,
  defaultEmployees,
  defaultManagers,
  defaultAttendance,
  defaultLeaves,
  defaultAnnouncements,
  defaultTrainings,
  defaultNotifications
};
