const KEY = 'mock_dashboard_layout';

const DEFAULT_LAYOUT = [
  { id: 'ExecutiveKPICards', visible: true, order: 1, w: 12 },
  { id: 'RevenueTrendWidget', visible: true, order: 2, w: 8 },
  { id: 'OccupancyWidget', visible: true, order: 3, w: 4 },
  { id: 'OutstandingBalanceWidget', visible: true, order: 4, w: 6 },
  { id: 'RenewalWidget', visible: true, order: 5, w: 6 },
  { id: 'LegalCasesWidget', visible: true, order: 6, w: 6 },
  { id: 'AttendanceWidget', visible: true, order: 7, w: 6 },
  { id: 'PayrollWidget', visible: true, order: 8, w: 6 },
  { id: 'VacancyWidget', visible: true, order: 9, w: 6 },
  { id: 'ListingStatusWidget', visible: true, order: 10, w: 6 },
  { id: 'UpcomingTasksWidget', visible: true, order: 11, w: 6 }
];

export const dashboardLayoutService = {
  getLayout() {
    const data = localStorage.getItem(KEY);
    if (!data) {
      localStorage.setItem(KEY, JSON.stringify(DEFAULT_LAYOUT));
      return DEFAULT_LAYOUT;
    }
    return JSON.parse(data);
  },

  updateLayout(newLayout) {
    localStorage.setItem(KEY, JSON.stringify(newLayout));
    return newLayout;
  },

  toggleWidget(id, isVisible) {
    const layout = this.getLayout();
    const idx = layout.findIndex(w => w.id === id);
    if (idx !== -1) {
      layout[idx].visible = isVisible;
      this.updateLayout(layout);
      return layout;
    }
    return layout;
  },

  resetLayout() {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_LAYOUT));
    return DEFAULT_LAYOUT;
  }
};

export default dashboardLayoutService;
