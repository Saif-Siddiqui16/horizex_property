export const mockUsers = [
  {
    id: 1,
    email: 'admin@property.com',
    name: 'Admin User',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    phone: '+1 (514) 555-0100',
    title: 'Senior Property Manager',
    assignedCompanyIds: [1, 2, 3] // Super Admin - accesses all
  },
  {
    id: 6,
    email: 'acme@property.com',
    name: 'Acme Admin User',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face',
    phone: '+1 (514) 555-0106',
    title: 'Acme Portfolio Manager',
    assignedCompanyIds: [1] // Restricted Admin - Company 1 only
  },
  {
    id: 2,
    email: 'tenant@example.com',
    name: 'Tenant User',
    role: 'TENANT',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    phone: '+1 (514) 555-0199',
    title: 'Tenant occupant'
  },
  {
    id: 3,
    email: 'owner@property.com',
    name: 'Owner User',
    role: 'OWNER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    phone: '+1 (514) 555-0122',
    title: 'Real Estate Investor',
    properties: ['Sunset Towers', 'Parkview Heights'],
    companyName: 'Apex Real Estate Partners',
    totalUnits: 102,
    assignedCompanyIds: [1],
    assignedBuildingIds: [1, 2] // Landlord - restricted to Building 1 and 2
  },
  {
    id: 5,
    email: 'owner2@property.com',
    name: 'George Soros',
    role: 'OWNER',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    phone: '+1 (514) 555-0144',
    title: 'Portfolio Investor',
    properties: ['Greenfield Commons'],
    companyName: 'Soros Capital LLC',
    totalUnits: 30,
    assignedCompanyIds: [2],
    assignedBuildingIds: [3] // Landlord - restricted to Building 3
  },
  {
    id: 4,
    email: 'coworker@property.com',
    name: 'Sarah Smith',
    role: 'COWORKER',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    phone: '+1 (514) 555-0188',
    title: 'Assistant Property Manager',
    assignedCompanyIds: [1],
    assignedBuildingIds: [1] // Staff - restricted to Company 1, Building 1
  },
  {
    id: 7,
    email: 'maintenance@property.com',
    name: 'Mike Maintenance',
    role: 'COWORKER',
    avatar: 'https://images.unsplash.com/photo-1621574539437-4b7cb63120b8?w=100&h=100&fit=crop&crop=face',
    phone: '+1 (514) 555-0177',
    title: 'Maintenance Technician',
    assignedCompanyIds: [1],
    assignedBuildingIds: [2] // Maintenance - restricted to Building 2 (Sunset Towers)
  }
];

export const mockPermissions = [
  { moduleName: 'Dashboard', canView: true, canAdd: true, canEdit: true, canDelete: true },
  { moduleName: 'Properties', canView: true, canAdd: true, canEdit: true, canDelete: true },
  { moduleName: 'Tenants', canView: true, canAdd: true, canEdit: true, canDelete: true },
  { moduleName: 'Leases', canView: true, canAdd: true, canEdit: true, canDelete: true },
  { moduleName: 'Maintenance', canView: true, canAdd: true, canEdit: true, canDelete: true },
  { moduleName: 'Accounting', canView: true, canAdd: true, canEdit: true, canDelete: true },
  { moduleName: 'Settings', canView: true, canAdd: true, canEdit: true, canDelete: true }
];
