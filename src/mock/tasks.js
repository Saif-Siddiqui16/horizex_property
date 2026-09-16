export const mockMoveIns = [
  {
    id: 1,
    leaseId: 1,
    tenantName: 'David Beckham',
    unitId: 5,
    unitNumber: 'Apt 202',
    propertyName: 'Sunset Towers',
    moveInDate: '2026-07-05',
    status: 'Awaiting Documents',
    requirements: [
      { id: 101, name: 'Signed Lease', status: 'Completed' },
      { id: 102, name: 'Security Deposit Paid', status: 'Pending' },
      { id: 103, name: 'Tenant Insurance Proof', status: 'Pending' },
      { id: 104, name: 'Welcome Package Signed', status: 'Pending' }
    ]
  },
  {
    id: 2,
    leaseId: 2,
    tenantName: 'Emma Watson',
    unitId: 2,
    unitNumber: 'Apt 112',
    propertyName: 'Sunset Towers',
    moveInDate: '2026-07-12',
    status: 'Ready',
    requirements: [
      { id: 101, name: 'Signed Lease', status: 'Completed' },
      { id: 102, name: 'Security Deposit Paid', status: 'Completed' },
      { id: 103, name: 'Tenant Insurance Proof', status: 'Completed' },
      { id: 104, name: 'Welcome Package Signed', status: 'Completed' }
    ]
  }
];

export const mockMoveOuts = [
  {
    id: 1,
    leaseId: 3,
    tenantName: 'John Doe',
    unitId: 6,
    unitNumber: 'Apt 301',
    propertyName: 'Greenfield Commons',
    moveOutDate: '2026-06-30',
    status: 'Scheduled Final',
    finalInspectionDate: '2026-06-29T10:00:00Z'
  },
  {
    id: 2,
    leaseId: 2,
    tenantName: 'Alice Cooper',
    unitId: 4,
    unitNumber: 'Apt 201',
    propertyName: 'Sunset Towers',
    moveOutDate: '2026-07-31',
    status: 'Upcoming',
    finalInspectionDate: null
  }
];

export const mockPrepUnits = [
  {
    id: 1,
    unitId: 6,
    unitNumber: 'Apt 301',
    propertyName: 'Greenfield Commons',
    current_stage: 'PENDING_TICKETS',
    moveOutDate: '2026-06-30',
    moveInDate: '2026-07-15',
    assignedTo: 'Mike Johnson'
  },
  {
    id: 2,
    unitId: 2,
    unitNumber: 'Apt 102',
    propertyName: 'Parkview Heights',
    current_stage: 'READY_FOR_CLEANING',
    moveOutDate: '2026-06-15',
    moveInDate: '2026-07-10',
    assignedTo: 'Sarah Smith'
  }
];

export const mockInspections = [
  {
    id: 1,
    title: 'Move-in Inspection - Apt 202',
    inspectorName: 'Mike Johnson',
    inspectorId: 5,
    unitId: 5,
    unitNumber: 'Apt 202',
    propertyName: 'Sunset Towers',
    status: 'Scheduled',
    scheduledDate: '2026-07-04',
    completedDate: null,
    templateId: 1,
    templateName: 'Move-In Checklist Standard',
    tickets: [],
    structure: {
      rooms: [
        {
          id: 'room-1',
          name: 'Kitchen',
          questions: [
            { id: 'q-1', questionText: 'Are all stove burners working?', answered: false, answer: '', comments: '', photos: [] },
            { id: 'q-2', questionText: 'Refrigerator clean and cold?', answered: false, answer: '', comments: '', photos: [] }
          ]
        },
        {
          id: 'room-2',
          name: 'Living Room',
          questions: [
            { id: 'q-3', questionText: 'Walls clean and free of damage?', answered: false, answer: '', comments: '', photos: [] }
          ]
        }
      ]
    }
  },
  {
    id: 2,
    title: 'Annual Safety Walk - Apt 101',
    inspectorName: 'Sarah Smith',
    inspectorId: 4,
    unitId: 1,
    unitNumber: 'Apt 101',
    propertyName: 'Parkview Heights',
    status: 'Completed',
    scheduledDate: '2026-06-25',
    completedDate: '2026-06-25T11:30:00Z',
    templateId: 2,
    templateName: 'Safety Check',
    tickets: [],
    structure: {
      rooms: [
        {
          id: 'room-1',
          name: 'Entire Unit',
          questions: [
            { id: 'q-4', questionText: 'Smoke detector working?', answered: true, answer: 'Yes', comments: 'Tested OK', photos: [] },
            { id: 'q-5', questionText: 'Fire extinguisher inspected?', answered: true, answer: 'Yes', comments: 'Pressure green', photos: [] }
          ]
        }
      ]
    }
  }
];

export const mockInspectionTemplates = [
  {
    id: 1,
    name: 'Move-In Checklist Standard',
    structure: {
      rooms: [
        {
          id: 'room-1',
          name: 'Kitchen',
          questions: [
            { id: 'q-1', questionText: 'Are all stove burners working?' },
            { id: 'q-2', questionText: 'Refrigerator clean and cold?' }
          ]
        },
        {
          id: 'room-2',
          name: 'Living Room',
          questions: [
            { id: 'q-3', questionText: 'Walls clean and free of damage?' }
          ]
        }
      ]
    }
  },
  {
    id: 2,
    name: 'Safety Check',
    structure: {
      rooms: [
        {
          id: 'room-1',
          name: 'Entire Unit',
          questions: [
            { id: 'q-4', questionText: 'Smoke detector working?' },
            { id: 'q-5', questionText: 'Fire extinguisher inspected?' }
          ]
        }
      ]
    }
  }
];

export const mockResponseGroups = [
  { id: 1, name: 'Yes/No', responses: ['Yes', 'No'] },
  { id: 2, name: 'Pass/Fail/NA', responses: ['Pass', 'Fail', 'N/A'] },
  { id: 3, name: 'Good/Fair/Poor', responses: ['Good', 'Fair', 'Poor'] }
];
export const mockResponseSeries = mockResponseGroups; // Aliased if page uses either name
