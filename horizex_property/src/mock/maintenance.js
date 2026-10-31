export const mockMaintenanceTickets = [
  {
    id: 301,
    ticketNumber: 'TKT-1002',
    tenantName: 'Alice Cooper',
    propertyName: 'Sunset Towers',
    unitNumber: 'Apt 201',
    title: 'Leaking kitchen faucet',
    description: 'The kitchen sink faucet has been dripping steadily for two days, and the shut-off valve underneath feels loose.',
    category: 'Plumbing',
    priority: 'Medium',
    status: 'In Progress',
    assignedTo: 'Mike Johnson',
    notes: [
      { id: 1, author: 'Alice Cooper', text: 'It started dripping on Monday.', createdAt: '2026-06-25T10:00:00Z' },
      { id: 2, author: 'Mike Johnson', text: 'Inspected the pipe, ordered a replacement cartridge.', createdAt: '2026-06-26T14:30:00Z' }
    ],
    createdAt: '2026-06-25T09:15:00Z'
  },
  {
    id: 302,
    ticketNumber: 'TKT-1003',
    tenantName: 'Sarah Connor',
    propertyName: 'Parkview Heights',
    unitNumber: 'Apt 101',
    title: 'AC unit blowing warm air',
    description: 'The wall unit in the living room is running but the air coming out is room temperature.',
    category: 'HVAC',
    priority: 'High',
    status: 'Open',
    assignedTo: 'Mike Johnson',
    notes: [],
    createdAt: '2026-06-28T11:00:00Z'
  },
  {
    id: 303,
    ticketNumber: 'TKT-1001',
    tenantName: 'John Doe',
    propertyName: 'Greenfield Commons',
    unitNumber: 'Apt 301',
    title: 'Front door lock sticking',
    description: 'Key is difficult to insert and turn in the deadbolt.',
    category: 'Locks & Keys',
    priority: 'Low',
    status: 'Resolved',
    assignedTo: 'Sarah Smith',
    notes: [
      { id: 1, author: 'Sarah Smith', text: 'Lubricated the lock tumbler with graphite powder. Works smoothly now.', createdAt: '2026-06-24T12:00:00Z' }
    ],
    createdAt: '2026-06-23T15:00:00Z'
  }
];
