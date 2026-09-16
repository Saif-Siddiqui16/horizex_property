export const mockLedgerData = {
  stats: {
    totalRent: 48500,
    totalDeposits: 5000,
    totalFees: 2400,
    totalRefunds: 1100
  },
  transactions: [
    { id: 1, date: "2026-06-01", tenant: "John Doe", type: "Invoice", amount: 1500.00, balance: 1500.00, status: "Unpaid" },
    { id: 2, date: "2026-06-05", tenant: "John Doe", type: "Payment", amount: 1500.00, balance: 0.00, status: "Paid" },
    { id: 3, date: "2026-06-10", tenant: "Jane Miller", type: "Invoice", amount: 950.00, balance: 950.00, status: "Unpaid" },
    { id: 4, date: "2026-06-12", tenant: "Jane Miller", type: "Payment", amount: 950.00, balance: 0.00, status: "Paid" },
    { id: 5, date: "2026-06-15", tenant: "Robert Dow", type: "Invoice", amount: 950.00, balance: 950.00, status: "Unpaid" },
    { id: 6, date: "2026-06-20", tenant: "Robert Dow", type: "Payment", amount: 550.00, balance: 400.00, status: "Partial" },
    { id: 7, date: "2026-06-22", tenant: "Sarah Connor", type: "Invoice", amount: 1800.00, balance: 1800.00, status: "Unpaid" },
    { id: 8, date: "2026-06-25", tenant: "Sarah Connor", type: "Payment", amount: 1800.00, balance: 0.00, status: "Paid" }
  ]
};
