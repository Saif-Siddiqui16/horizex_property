export const mockGeneralSettings = {
  settings: {
    enableEmailAlerts: "true",
    enableSmsAlerts: "false",
    enableMaintenanceEscalation: "true",
    taxRate: "15.0",
    invoiceDueDays: "30"
  },
  stats: {
    systemStatus: "Healthy & Active"
  }
};

export const mockServiceItems = [
  { id: 1, name: "Late Rent Penalty", amount: 50.00 },
  { id: 2, name: "Key Replacement Fee", amount: 25.00 },
  { id: 3, name: "Cleaning Fee Deposit", amount: 150.00 },
  { id: 4, name: "Parking Access Permit", amount: 60.00 }
];
