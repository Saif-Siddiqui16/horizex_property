export const technicianService = {
  getAll: () => {
    let techs = JSON.parse(localStorage.getItem('mock_technicians') || '[]');
    if (techs.length === 0) {
      techs = [
        {
          id: 'tech-1',
          name: 'Jean Dupuis',
          email: 'j.dupuis@horizex.com',
          role: 'Plumber',
          status: 'Active',
          clockedIn: true,
          clockInTime: '2026-07-01T08:00:00Z',
          rating: 4.8,
          gpsLocation: { lat: 45.5017, lng: -73.5673, address: '1240 Rue Stanley, Montreal' }
        },
        {
          id: 'tech-2',
          name: 'Marc-Andre Levesque',
          email: 'm.levesque@horizex.com',
          role: 'HVAC Specialist',
          status: 'Active',
          clockedIn: false,
          clockInTime: '',
          rating: 4.5,
          gpsLocation: { lat: 45.5088, lng: -73.5540, address: '500 Place d’Armes, Montreal' }
        },
        {
          id: 'tech-3',
          name: 'Sylvie Tremblay',
          email: 's.tremblay@horizex.com',
          role: 'Electrician',
          status: 'Active',
          clockedIn: false,
          clockInTime: '',
          rating: 4.9,
          gpsLocation: { lat: 45.4950, lng: -73.5780, address: '1455 Boulevard de Maisonneuve O' }
        }
      ];
      localStorage.setItem('mock_technicians', JSON.stringify(techs));
    }
    return techs;
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
