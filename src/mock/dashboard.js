export const mockDashboardStats = {
  totalProperties: 12,
  totalUnits: 148,
  occupancy: { occupied: 138, vacant: 10 },
  projectedRevenue: 284500,
  actualRevenue: 280300,
  outstandingRent: 4200,
  outstandingDeposits: 1100,
  insuranceAlerts: { missing: 2, expired: 1, expiringSoon: 3 },
  leaseAlerts: { expired: 1, expiringSoon: 4 },
  leaseAlertList: [
    { id: 1, tenant: "John Doe", type: "Short-term", unit: "Apt 301", expiryDate: "2026-07-15T00:00:00.000Z", status: "Expires soon", daysLeft: 16 },
    { id: 2, tenant: "Jane Miller", type: "Long-term", unit: "Apt 104", expiryDate: "2026-07-28T00:00:00.000Z", status: "Expires soon", daysLeft: 29 },
    { id: 3, tenant: "Robert Dow", type: "Long-term", unit: "Apt 202", expiryDate: "2026-08-01T00:00:00.000Z", status: "Pending action", daysLeft: 33 }
  ],
  refundAlerts: [
    { id: 1, tenantId: 101, tenantName: "Alice Cooper", unitName: "Apt 410", amount: 1500, status: "Pending" },
    { id: 2, tenantId: 102, tenantName: "Mark Ruffalo", unitName: "Apt 205", amount: 1200, status: "Processing" }
  ],
  reservedUnits: [
    { id: 1, unitNumber: "Apt 502", propertyName: "Parkview Heights", reserve_firstName: "David", reserve_lastName: "Beckham", tentative_move_in_date: "2026-07-05" },
    { id: 2, unitNumber: "Apt 112", propertyName: "Sunset Towers", reserve_firstName: "Emma", reserve_lastName: "Watson", tentative_move_in_date: "2026-07-12" }
  ],
  vehicleStats: { total: 2, registered: 2, pending: 0 },
  pendingRefunds: [
    {
      id: 1,
      tenantId: 104,
      tenantName: "Sarah Connor",
      unitId: 4,
      unitNumber: "101",
      building: "Parkview Heights",
      depositAmount: 1100,
      leaseExpiryDate: "2026-06-30",
      status: "Pending"
    }
  ],
  recentActivity: [
    "Maintenance ticket #301 resolved for Apt 104",
    "Rent payment of $1,400 received from Sarah Connor",
    "New lease agreement signed for Apt 502",
    "Inspection template 'Annual Safety Check' updated"
  ]
};

export const mockRevenueAnalytics = {
  monthlyRevenue: [
    { month: "Jan", revenue: 24000, rent: 22000, other: 2000 },
    { month: "Feb", revenue: 24500, rent: 22500, other: 2000 },
    { month: "Mar", revenue: 26000, rent: 23500, other: 2500 },
    { month: "Apr", revenue: 25800, rent: 23800, other: 2000 },
    { month: "May", revenue: 27000, rent: 24500, other: 2500 },
    { month: "Jun", revenue: 28400, rent: 25800, other: 2600 }
  ],
  categoryBreakdown: [
    { name: "Residential Rent", value: 154800 },
    { name: "Commercial Rent", value: 89000 },
    { name: "Parking & Storage", value: 24200 },
    { name: "Other Fees", value: 16500 }
  ]
};
