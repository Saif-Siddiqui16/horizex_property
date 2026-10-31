export const mockReadinessSettings = [
  { id: 1, key: 'gc_to_deficiencies', days: 2 },
  { id: 2, key: 'deficiencies_to_cleaned', days: 2 },
  { id: 3, key: 'cleaned_to_ffe', days: 4 },
  { id: 4, key: 'ffe_to_final', days: 3 },
  { id: 5, key: 'final_to_ose', days: 1 },
  { id: 6, key: 'ose_to_ready', days: 2 }
];

export const mockReadinessHolidays = [
  { id: 1, name: "New Year's Day", date: "2026-01-01" },
  { id: 2, name: "National Day", date: "2026-06-24" },
  { id: 3, name: "Canada Day", date: "2026-07-01" }
];

export const mockReadinessUnits = [
  {
    id: 1,
    building: "Parkview Heights",
    unitNumber: "Apt 301",
    unitType: "1 Bedroom",
    isPriority: true,
    reserved: true,
    reservedBy: "John Doe",
    moveInDate: "2026-07-15",
    daysLate: 0,
    marketAge: 4,
    isActive: true,
    stage: "Ops Clean In Progress",
    completion: {
      gc_delivered: true,
      gc_delivered_at: "2026-06-10",
      gc_deficiencies: true,
      gc_deficiencies_at: "2026-06-12",
      gc_cleaned: true,
      gc_cleaned_at: "2026-06-14",
      ffe_installed: true,
      ffe_installed_at: "2026-06-20",
      final_cleaning: false,
      final_cleaning_at: null,
      ose_installed: false,
      ose_installed_at: null,
      unit_ready: false,
      unit_ready_at: null
    }
  },
  {
    id: 2,
    building: "Sunset Towers",
    unitNumber: "Apt 104",
    unitType: "2 Bedrooms",
    isPriority: false,
    reserved: false,
    reservedBy: "",
    moveInDate: "",
    daysLate: 2,
    marketAge: 12,
    isActive: true,
    stage: "On Schedule",
    completion: {
      gc_delivered: true,
      gc_delivered_at: "2026-06-05",
      gc_deficiencies: true,
      gc_deficiencies_at: "2026-06-08",
      gc_cleaned: true,
      gc_cleaned_at: "2026-06-10",
      ffe_installed: true,
      ffe_installed_at: "2026-06-15",
      final_cleaning: true,
      final_cleaning_at: "2026-06-18",
      ose_installed: false,
      ose_installed_at: null,
      unit_ready: false,
      unit_ready_at: null
    }
  },
  {
    id: 3,
    building: "Sunset Towers",
    unitNumber: "Apt 105",
    unitType: "1 Bedroom",
    isPriority: true,
    reserved: true,
    reservedBy: "Jane Miller",
    moveInDate: "2026-07-28",
    daysLate: 5,
    marketAge: 0,
    isActive: false,
    stage: "GC Deficiencies Pending",
    completion: {
      gc_delivered: true,
      gc_delivered_at: "2026-06-10",
      gc_deficiencies: false,
      gc_deficiencies_at: null,
      gc_cleaned: false,
      gc_cleaned_at: null,
      ffe_installed: false,
      ffe_installed_at: null,
      final_cleaning: false,
      final_cleaning_at: null,
      ose_installed: false,
      ose_installed_at: null,
      unit_ready: false,
      unit_ready_at: null
    }
  },
  {
    id: 4,
    building: "Greenfield Commons",
    unitNumber: "Apt 202",
    unitType: "3 Bedrooms",
    isPriority: false,
    reserved: true,
    reservedBy: "Robert Dow",
    moveInDate: "2026-08-01",
    daysLate: 0,
    marketAge: 8,
    isActive: true,
    stage: "On Schedule",
    completion: {
      gc_delivered: true,
      gc_delivered_at: "2026-06-01",
      gc_deficiencies: true,
      gc_deficiencies_at: "2026-06-03",
      gc_cleaned: true,
      gc_cleaned_at: "2026-06-05",
      ffe_installed: true,
      ffe_installed_at: "2026-06-10",
      final_cleaning: true,
      final_cleaning_at: "2026-06-12",
      ose_installed: true,
      ose_installed_at: "2026-06-15",
      unit_ready: true,
      unit_ready_at: "2026-06-16"
    }
  }
];
