export const technicianService = {
  getAll: () => {
    const list = JSON.parse(localStorage.getItem('mock_technicians') || '[]');
    return list.filter(t => !['tech-1', 'tech-2', 'tech-3'].includes(t.id) && !['Jean Dupuis', 'Marc-Andre Levesque', 'Sylvie Tremblay'].includes(t.name));
  },

  toggleClock: (id) => {
    const list = JSON.parse(localStorage.getItem('mock_technicians') || '[]');
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) return null;

    const isClockedIn = list[idx].clockedIn;
    list[idx].clockedIn = !isClockedIn;
    list[idx].clockInTime = !isClockedIn ? new Date().toISOString() : '';
    
    // Simulate slight movement in GPS coordinates on clock events
    if (!isClockedIn) {
      list[idx].gpsLocation = {
        lat: 45.5017 + (Math.random() - 0.5) * 0.02,
        lng: -73.5673 + (Math.random() - 0.5) * 0.02,
        address: 'Dynamic Jobsite Address, Montreal'
      };
    }

    localStorage.setItem('mock_technicians', JSON.stringify(list));
    return list[idx];
  },

  getPayrollHours: (technicianId) => {
    const wos = JSON.parse(localStorage.getItem('mock_work_orders') || '[]');
    return wos
      .filter(w => w.technicianId === technicianId)
      .reduce((sum, w) => sum + (w.hoursWorked || 0), 0);
  },

  getPerformanceMetrics: (technicianId) => {
    const requests = JSON.parse(localStorage.getItem('mock_maintenance_requests') || '[]');
    const wos = JSON.parse(localStorage.getItem('mock_work_orders') || '[]');
    
    const assigned = requests.filter(r => r.assignedTechnicianId === technicianId);
    const completed = assigned.filter(r => r.status === 'Completed' || r.status === 'Closed');
    const pending = assigned.filter(r => r.status !== 'Completed' && r.status !== 'Closed' && r.status !== 'Rejected');
    
    const techWos = wos.filter(w => w.technicianId === technicianId);
    const totalHours = techWos.reduce((sum, w) => sum + (w.hoursWorked || 0), 0);
    
    return {
      assignedCount: assigned.length,
      completedCount: completed.length,
      pendingCount: pending.length,
      totalHours
    };
  }
};
