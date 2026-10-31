export const mockInsuranceStats = {
  missing: 2,
  expired: 1,
  expiringSoon: 1,
  active: 3
};

export const mockInsuranceCompliance = [
  {
    id: 1,
    tenantId: 101,
    tenantName: "John Doe",
    unitId: 1,
    unitName: "Apt 301",
    leaseId: 1,
    building: "Parkview Heights",
    provider: "Desjardins Insurance",
    policyNumber: "POL-772910-A",
    startDate: "2025-06-01",
    endDate: "2026-06-01",
    status: "EXPIRED",
    notes: "Requires renewal notification.",
    documentUrl: "/documents/insurance_policy_101.pdf",
    uploadedDocumentId: "doc-101"
  },
  {
    id: 2,
    tenantId: 102,
    tenantName: "Jane Miller",
    unitId: 2,
    unitName: "Apt 104",
    leaseId: 2,
    building: "Sunset Towers",
    provider: "Intact Insurance",
    policyNumber: "POL-883901-B",
    startDate: "2026-01-01",
    endDate: "2027-01-01",
    status: "ACTIVE",
    notes: "Policy valid and up to date.",
    documentUrl: "/documents/insurance_policy_102.pdf",
    uploadedDocumentId: "doc-102"
  },
  {
    id: 3,
    tenantId: 103,
    tenantName: "Robert Dow",
    unitId: 3,
    unitName: "Apt 202",
    leaseId: 3,
    building: "Sunset Towers",
    provider: "Aviva Canada",
    policyNumber: "POL-994012-C",
    startDate: "2025-08-01",
    endDate: "2026-08-01",
    status: "EXPIRING_SOON",
    notes: "Expiring in about a month.",
    documentUrl: "/documents/insurance_policy_103.pdf",
    uploadedDocumentId: "doc-103"
  },
  {
    id: 4,
    tenantId: 104,
    tenantName: "Sarah Connor",
    unitId: 4,
    unitName: "Apt 101",
    leaseId: 4,
    building: "Parkview Heights",
    provider: "",
    policyNumber: "",
    startDate: "",
    endDate: "",
    status: "MISSING",
    notes: "No insurance certificate submitted yet.",
    documentUrl: "",
    uploadedDocumentId: ""
  }
];
