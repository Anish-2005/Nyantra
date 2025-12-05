// Script to populate sample reports in Firestore
// Run this in the browser console or as a Node.js script

const sampleReports = [
  {
    name: 'Monthly Applications Report',
    type: 'applications',
    category: 'statistical',
    frequency: 'monthly',
    status: 'completed',
    fileSize: '2.5 MB',
    fileFormat: 'PDF',
    generatedDate: new Date('2024-12-01'),
    generatedBy: 'System',
    lastRun: new Date('2024-12-01'),
    nextRun: new Date('2025-01-01'),
    recordCount: 150,
    description: 'Comprehensive report of all applications submitted in the current month',
    parameters: { month: 'December', year: 2024 },
    downloadCount: 5,
    isScheduled: true,
    recipients: ['admin@nyantara.com'],
    columns: ['id', 'name', 'status', 'amount', 'date'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Beneficiary Disbursement Summary',
    type: 'disbursements',
    category: 'financial',
    frequency: 'weekly',
    status: 'completed',
    fileSize: '1.8 MB',
    fileFormat: 'PDF',
    generatedDate: new Date('2024-11-25'),
    generatedBy: 'System',
    lastRun: new Date('2024-11-25'),
    nextRun: new Date('2024-12-02'),
    recordCount: 89,
    description: 'Weekly summary of all disbursements made to beneficiaries',
    parameters: { week: '48', year: 2024 },
    downloadCount: 3,
    isScheduled: true,
    recipients: ['finance@nyantara.com'],
    columns: ['beneficiaryId', 'amount', 'date', 'status'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Grievance Resolution Report',
    type: 'grievances',
    category: 'performance',
    frequency: 'quarterly',
    status: 'processing',
    fileSize: null,
    fileFormat: 'PDF',
    generatedDate: null,
    generatedBy: 'System',
    lastRun: null,
    nextRun: new Date('2025-01-01'),
    recordCount: null,
    description: 'Analysis of grievance resolution times and effectiveness',
    parameters: { quarter: 'Q4', year: 2024 },
    downloadCount: 0,
    isScheduled: true,
    recipients: ['support@nyantara.com'],
    columns: ['id', 'type', 'status', 'resolutionTime'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'User Feedback Analysis',
    type: 'feedback',
    category: 'analytical',
    frequency: 'monthly',
    status: 'scheduled',
    fileSize: null,
    fileFormat: 'PDF',
    generatedDate: null,
    generatedBy: 'System',
    lastRun: null,
    nextRun: new Date('2024-12-15'),
    recordCount: null,
    description: 'Analysis of user feedback and satisfaction metrics',
    parameters: { month: 'December', year: 2024 },
    downloadCount: 0,
    isScheduled: true,
    recipients: ['ux@nyantara.com'],
    columns: ['rating', 'category', 'comments', 'date'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'System Performance Report',
    type: 'technical',
    category: 'technical',
    frequency: 'daily',
    status: 'completed',
    fileSize: '500 KB',
    fileFormat: 'PDF',
    generatedDate: new Date('2024-12-04'),
    generatedBy: 'System',
    lastRun: new Date('2024-12-04'),
    nextRun: new Date('2024-12-05'),
    recordCount: 24,
    description: 'Daily system performance metrics and uptime statistics',
    parameters: { date: '2024-12-04' },
    downloadCount: 1,
    isScheduled: true,
    recipients: ['tech@nyantara.com'],
    columns: ['metric', 'value', 'timestamp'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Function to add sample reports to Firestore
async function populateSampleReports() {
  const { collection, addDoc } = await import('firebase/firestore');
  const { db } = await import('../src/lib/firebase.js');

  console.log('Adding sample reports to Firestore...');

  for (const report of sampleReports) {
    try {
      const docRef = await addDoc(collection(db, 'reports'), report);
      console.log(`Added report: ${report.name} with ID: ${docRef.id}`);
    } catch (error) {
      console.error(`Error adding report ${report.name}:`, error);
    }
  }

  console.log('Sample reports population completed!');
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { populateSampleReports, sampleReports };
} else {
  // Browser environment
  window.populateSampleReports = populateSampleReports;
}