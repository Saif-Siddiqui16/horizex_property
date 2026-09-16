export const mockReports = [
  {
    id: 1,
    name: 'Q1 Financial Statement.pdf',
    type: 'Financial',
    url: '#',
    generatedAt: '2026-04-01T10:00:00Z'
  },
  {
    id: 2,
    name: 'Occupancy & Vacancy Report - Jun 2026.pdf',
    type: 'Occupancy',
    url: '#',
    generatedAt: '2026-06-25T16:00:00Z'
  },
  {
    id: 3,
    name: 'Year-to-Date Revenue Summary.xlsx',
    type: 'Tax & Revenue',
    url: '#',
    generatedAt: '2026-06-28T09:00:00Z'
  }
];

export const mockReportsAnalytics = {
  kpi: {
    totalRevenue: 284500,
    occupancyRate: 93,
    activeLeases: 110,
    outstandingRent: 4200,
    outstandingDeposits: 1100
  },
  monthlyRevenue: [
    { month: "Jan", amount: 24000 },
    { month: "Feb", amount: 24500 },
    { month: "Mar", amount: 26000 },
    { month: "Apr", amount: 25800 },
    { month: "May", amount: 27000 },
    { month: "Jun", amount: 28400 }
  ],
  leaseDistribution: {
    fullUnit: 80,
    bedroom: 30
  },
  topProperties: [
    { name: "Parkview Heights", revenue: 145000, occupancy: 95 },
    { name: "Sunset Towers", revenue: 120000, occupancy: 90 },
    { name: "Greenfield Commons", revenue: 19500, occupancy: 100 }
  ]
};
