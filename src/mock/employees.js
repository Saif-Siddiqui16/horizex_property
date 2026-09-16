export const mockEmployees = [
  {
    id: 4,
    firstName: 'Sarah',
    lastName: 'Smith',
    email: 'sarah.smith@property.com',
    phone: '+1 (514) 555-0188',
    role: 'COWORKER',
    status: 'Active',
    title: 'Assistant Property Manager',
    createdAt: '2025-01-10T09:00:00Z',
    permissions: [
      { moduleName: 'Dashboard', canView: true, canAdd: false, canEdit: false, canDelete: false },
      { moduleName: 'Properties', canView: true, canAdd: true, canEdit: true, canDelete: false },
      { moduleName: 'Tenants', canView: true, canAdd: true, canEdit: true, canDelete: false },
      { moduleName: 'Leases', canView: true, canAdd: true, canEdit: true, canDelete: false },
      { moduleName: 'TAL Cases', canView: true, canAdd: true, canEdit: true, canDelete: false },
      { moduleName: 'Notes Hub', canView: true, canAdd: true, canEdit: true, canDelete: false },
      { moduleName: 'Maintenance', canView: true, canAdd: true, canEdit: true, canDelete: true },
      { moduleName: 'Accounting', canView: false, canAdd: false, canEdit: false, canDelete: false },
      { moduleName: 'Settings', canView: false, canAdd: false, canEdit: false, canDelete: false }
    ]
  },
  {
    id: 5,
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@property.com',
    phone: '+1 (514) 555-0189',
    role: 'COWORKER',
    status: 'Active',
    title: 'Maintenance Supervisor',
    createdAt: '2025-02-15T09:00:00Z',
    permissions: [
      { moduleName: 'Dashboard', canView: true, canAdd: false, canEdit: false, canDelete: false },
      { moduleName: 'Properties', canView: true, canAdd: false, canEdit: false, canDelete: false },
      { moduleName: 'Tenants', canView: false, canAdd: false, canEdit: false, canDelete: false },
      { moduleName: 'Leases', canView: false, canAdd: false, canEdit: false, canDelete: false },
      { moduleName: 'Maintenance', canView: true, canAdd: true, canEdit: true, canDelete: true },
      { moduleName: 'Accounting', canView: false, canAdd: false, canEdit: false, canDelete: false },
      { moduleName: 'Settings', canView: false, canAdd: false, canEdit: false, canDelete: false }
    ]
  }
];

export const mockClockLogs = [
  {
    id: 1,
    userId: 4,
    userName: 'Sarah Smith',
    clockIn: '2026-06-28T09:00:00Z',
    clockOut: '2026-06-28T17:00:00Z',
    hoursWorked: 8.0
  },
  {
    id: 2,
    userId: 4,
    userName: 'Sarah Smith',
    clockIn: '2026-06-29T09:00:00Z',
    clockOut: null,
    hoursWorked: 0.0
  }
];
