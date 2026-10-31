import shiftService from './shiftService';
import employeeService from './employeeService';
import holidayService from './holidayService';
import payrollTimelineService from './payrollTimelineService';

const KEY = 'mock_attendance';
const CORRECTION_KEY = 'mock_attendance_corrections';

// Seed some past days (e.g. last few days of June 2026)
const getSeedAttendance = () => {
  const seeds = [
    {
      id: 1,
      employeeId: 4,
      companyId: 1,
      date: '2026-06-28',
      status: 'Present',
      clockIn: '2026-06-28T09:00:00Z',
      clockOut: '2026-06-28T17:00:00Z',
      breakStart: '2026-06-28T12:00:00Z',
      breakEnd: '2026-06-28T13:00:00Z',
      totalHours: 7.0,
      overtimeHours: 0.0,
      createdAt: '2026-06-28T17:00:00Z',
      createdBy: 'System',
      updatedAt: '2026-06-28T17:00:00Z',
      updatedBy: 'System'
    },
    {
      id: 2,
      employeeId: 4,
      companyId: 1,
      date: '2026-06-29',
      status: 'Late',
      clockIn: '2026-06-29T09:30:00Z',
      clockOut: '2026-06-29T17:00:00Z',
      breakStart: '2026-06-29T12:00:00Z',
      breakEnd: '2026-06-29T13:00:00Z',
      totalHours: 6.5,
      overtimeHours: 0.0,
      createdAt: '2026-06-29T17:00:00Z',
      createdBy: 'System',
      updatedAt: '2026-06-29T17:00:00Z',
      updatedBy: 'System'
    },
    {
      id: 3,
      employeeId: 5,
      companyId: 1,
      date: '2026-06-29',
      status: 'Present',
      clockIn: '2026-06-29T08:55:00Z',
      clockOut: '2026-06-29T18:00:00Z',
      breakStart: '2026-06-29T12:00:00Z',
      breakEnd: '2026-06-29T13:00:00Z',
      totalHours: 8.0,
      overtimeHours: 1.0,
      createdAt: '2026-06-29T18:00:00Z',
      createdBy: 'System',
      updatedAt: '2026-06-29T18:00:00Z',
      updatedBy: 'System'
    }
  ];
  return seeds;
};

const getStore = () => {
  const data = localStorage.getItem(KEY);
  if (!data) {
    const seeds = getSeedAttendance();
    localStorage.setItem(KEY, JSON.stringify(seeds));
    return seeds;
  }
  return JSON.parse(data);
};

const setStore = (val) => localStorage.setItem(KEY, JSON.stringify(val));

const getCorrectionsStore = () => {
  const data = localStorage.getItem(CORRECTION_KEY);
  if (!data) {
    const defaultCorrections = [
      {
        id: 1,
        attendanceId: 2,
        employeeId: 4,
        employeeName: 'Sarah Smith',
        companyId: 1,
        date: '2026-06-29',
        requestedClockIn: '2026-06-29T09:00:00Z',
        requestedClockOut: '2026-06-29T17:00:00Z',
        reason: 'Keycard reader failure at front entrance',
        status: 'Pending',
        createdAt: '2026-06-29T17:30:00Z',
        createdBy: 'Sarah Smith',
        updatedAt: '2026-06-29T17:30:00Z',
        updatedBy: 'Sarah Smith'
      }
    ];
    localStorage.setItem(CORRECTION_KEY, JSON.stringify(defaultCorrections));
    return defaultCorrections;
  }
  return JSON.parse(data);
};

const setCorrectionsStore = (val) => localStorage.setItem(CORRECTION_KEY, JSON.stringify(val));

export const attendanceService = {
  getAll(filters = {}) {
    let list = getStore();
    const employees = employeeService.getAll();
    
    // Map employee names for rendering
    list = list.map(item => {
      const emp = employees.find(e => String(e.id) === String(item.employeeId));
      return {
        ...item,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${item.employeeId}`,
        employeeNo: emp ? emp.employeeNo : '',
        department: emp ? emp.department : '',
        designation: emp ? emp.designation : '',
        companyId: emp ? emp.companyId : item.companyId,
        buildingId: emp ? emp.buildingId : null
      };
    });

    if (filters.companyId) {
      list = list.filter(item => String(item.companyId) === String(filters.companyId));
    }
    if (filters.buildingId) {
      list = list.filter(item => String(item.buildingId) === String(filters.buildingId));
    }
    if (filters.department) {
      list = list.filter(item => item.department === filters.department);
    }
    if (filters.employeeId) {
      list = list.filter(item => String(item.employeeId) === String(filters.employeeId));
    }
    if (filters.status) {
      list = list.filter(item => item.status === filters.status);
    }
    if (filters.date) {
      list = list.filter(item => item.date === filters.date);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(item => 
        item.employeeName.toLowerCase().includes(q) ||
        item.employeeNo.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  getById(id) {
    const list = this.getAll();
    return list.find(item => String(item.id) === String(id)) || null;
  },

  calculateHours(clockIn, clockOut, breakStart, breakEnd, shiftBreakDuration = 60) {
    if (!clockIn || !clockOut) return { totalHours: 0, overtimeHours: 0 };
    
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    let diffMs = end - start;
    
    // Deduct break duration
    let breakMs = shiftBreakDuration * 60 * 1000;
    if (breakStart && breakEnd) {
      breakMs = new Date(breakEnd) - new Date(breakStart);
    }
    
    let workingMs = diffMs - breakMs;
    if (workingMs < 0) workingMs = 0;
    
    const totalHours = parseFloat((workingMs / (1000 * 60 * 60)).toFixed(2));
    const overtimeHours = totalHours > 8.0 ? parseFloat((totalHours - 8.0).toFixed(2)) : 0.0;
    
    return { totalHours, overtimeHours };
  },

  clockIn(employeeId) {
    const list = getStore();
    const emp = employeeService.getById(employeeId);
    if (!emp) throw new Error('Employee not found');

    const todayStr = new Date().toISOString().split('T')[0];
    
    // Check if already clocked in today
    const exists = list.find(item => String(item.employeeId) === String(employeeId) && item.date === todayStr);
    if (exists && exists.clockIn) {
      return exists;
    }

    const shift = shiftService.getById(emp.shiftId) || { startTime: '09:00', graceTime: 15 };
    const now = new Date();
    
    // Calculate late status
    const [shiftHour, shiftMin] = shift.startTime.split(':').map(Number);
    const shiftTimeToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), shiftHour, shiftMin, 0);
    const graceTimeMs = shift.graceTime * 60 * 1000;
    
    let status = 'Present';
    if (now - shiftTimeToday > graceTimeMs) {
      status = 'Late';
    }

    const newId = list.length ? Math.max(...list.map(a => a.id)) + 1 : 1;
    const item = {
      id: newId,
      employeeId: parseInt(employeeId),
      companyId: emp.companyId,
      date: todayStr,
      status,
      clockIn: now.toISOString(),
      clockOut: null,
      breakStart: null,
      breakEnd: null,
      totalHours: 0.0,
      overtimeHours: 0.0,
      createdAt: now.toISOString(),
      createdBy: `${emp.firstName} ${emp.lastName}`,
      updatedAt: now.toISOString(),
      updatedBy: `${emp.firstName} ${emp.lastName}`
    };

    list.push(item);
    setStore(list);
    
    // Sync with legacy clock logs to preserve compatibility
    this._syncLegacyClockLog(item, emp);

    payrollTimelineService.append(
      'Attendance Updated',
      `${emp.firstName} ${emp.lastName} clocked in at ${now.toLocaleTimeString()}`,
      { employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}`, companyId: emp.companyId }
    );

    return item;
  },

  clockOut(employeeId) {
    const list = getStore();
    const emp = employeeService.getById(employeeId);
    if (!emp) throw new Error('Employee not found');

    const todayStr = new Date().toISOString().split('T')[0];
    const item = list.find(item => String(item.employeeId) === String(employeeId) && item.date === todayStr);
    if (!item || !item.clockIn) {
      throw new Error('No active clock-in found for today');
    }

    if (item.clockOut) {
      return item;
    }

    const now = new Date();
    item.clockOut = now.toISOString();
    
    const shift = shiftService.getById(emp.shiftId) || { breakDuration: 60 };
    const { totalHours, overtimeHours } = this.calculateHours(item.clockIn, item.clockOut, item.breakStart, item.breakEnd, shift.breakDuration);
    
    item.totalHours = totalHours;
    item.overtimeHours = overtimeHours;
    item.updatedAt = now.toISOString();
    item.updatedBy = `${emp.firstName} ${emp.lastName}`;

    setStore(list);
    
    // Sync legacy
    this._syncLegacyClockLog(item, emp);

    payrollTimelineService.append(
      'Attendance Updated',
      `${emp.firstName} ${emp.lastName} clocked out at ${now.toLocaleTimeString()}. Total hours: ${totalHours}`,
      { employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}`, companyId: emp.companyId }
    );

    return item;
  },

  breakStart(employeeId) {
    const list = getStore();
    const todayStr = new Date().toISOString().split('T')[0];
    const item = list.find(item => String(item.employeeId) === String(employeeId) && item.date === todayStr);
    if (!item || !item.clockIn || item.clockOut) {
      throw new Error('Cannot start break; not clocked in or already clocked out');
    }
    
    item.breakStart = new Date().toISOString();
    item.breakEnd = null;
    item.updatedAt = new Date().toISOString();
    setStore(list);
    return item;
  },

  breakEnd(employeeId) {
    const list = getStore();
    const todayStr = new Date().toISOString().split('T')[0];
    const item = list.find(item => String(item.employeeId) === String(employeeId) && item.date === todayStr);
    if (!item || !item.breakStart || item.clockOut) {
      throw new Error('Cannot end break; break not started or already clocked out');
    }
    
    item.breakEnd = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    setStore(list);
    return item;
  },

  updateAttendance(id, data) {
    const list = getStore();
    const idx = list.findIndex(item => String(item.id) === String(id));
    if (idx === -1) return null;

    const current = list[idx];
    const emp = employeeService.getById(current.employeeId);
    const shift = shiftService.getById(emp ? emp.shiftId : 1) || { breakDuration: 60 };

    const updated = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin User'
    };

    const { totalHours, overtimeHours } = this.calculateHours(updated.clockIn, updated.clockOut, updated.breakStart, updated.breakEnd, shift.breakDuration);
    updated.totalHours = totalHours;
    updated.overtimeHours = overtimeHours;

    list[idx] = updated;
    setStore(list);

    if (emp) {
      this._syncLegacyClockLog(updated, emp);
      payrollTimelineService.append(
        'Attendance Updated',
        `Attendance record manual override for ${emp.firstName} ${emp.lastName} on ${updated.date}`,
        { employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}`, companyId: emp.companyId }
      );
    }

    return updated;
  },

  // --- CORRECTIONS WORKFLOW ---
  getCorrections(filters = {}) {
    let list = getCorrectionsStore();
    const employees = employeeService.getAll();

    list = list.map(item => {
      const emp = employees.find(e => String(e.id) === String(item.employeeId));
      return {
        ...item,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : item.employeeName,
        companyId: emp ? emp.companyId : item.companyId
      };
    });

    if (filters.companyId) {
      list = list.filter(c => String(c.companyId) === String(filters.companyId));
    }
    if (filters.status) {
      list = list.filter(c => c.status === filters.status);
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  submitCorrection(attendanceId, requestedData) {
    const list = getCorrectionsStore();
    const att = this.getById(attendanceId);
    if (!att) throw new Error('Attendance log not found');
    const emp = employeeService.getById(att.employeeId);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const author = user.name || 'Employee';

    const newId = list.length ? Math.max(...list.map(c => c.id)) + 1 : 1;
    const correction = {
      id: newId,
      attendanceId: parseInt(attendanceId),
      employeeId: att.employeeId,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Employee',
      companyId: att.companyId,
      date: att.date,
      requestedClockIn: requestedData.clockIn || null,
      requestedClockOut: requestedData.clockOut || null,
      requestedBreakStart: requestedData.breakStart || null,
      requestedBreakEnd: requestedData.breakEnd || null,
      reason: requestedData.reason || '',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      createdBy: author,
      updatedAt: new Date().toISOString(),
      updatedBy: author
    };

    list.push(correction);
    setCorrectionsStore(list);
    return correction;
  },

  approveCorrection(correctionId) {
    const list = getCorrectionsStore();
    const idx = list.findIndex(c => String(c.id) === String(correctionId));
    if (idx === -1) throw new Error('Correction request not found');
    
    const corr = list[idx];
    if (corr.status !== 'Pending') throw new Error('Correction is already processed');

    corr.status = 'Approved';
    corr.updatedAt = new Date().toISOString();
    corr.updatedBy = 'Admin User';
    setCorrectionsStore(list);

    // Apply correction to attendance record
    const att = this.getById(corr.attendanceId);
    if (att) {
      this.updateAttendance(corr.attendanceId, {
        clockIn: corr.requestedClockIn,
        clockOut: corr.requestedClockOut,
        breakStart: corr.requestedBreakStart,
        breakEnd: corr.requestedBreakEnd
      });
    }

    return corr;
  },

  rejectCorrection(correctionId, rejectReason = '') {
    const list = getCorrectionsStore();
    const idx = list.findIndex(c => String(c.id) === String(correctionId));
    if (idx === -1) throw new Error('Correction request not found');

    const corr = list[idx];
    if (corr.status !== 'Pending') throw new Error('Correction is already processed');

    corr.status = 'Rejected';
    corr.rejectReason = rejectReason;
    corr.updatedAt = new Date().toISOString();
    corr.updatedBy = 'Admin User';
    setCorrectionsStore(list);

    const emp = employeeService.getById(corr.employeeId);
    if (emp) {
      payrollTimelineService.append(
        'Attendance Updated',
        `Correction request rejected for ${emp.firstName} ${emp.lastName} for ${corr.date}`,
        { employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}`, companyId: emp.companyId }
      );
    }

    return corr;
  },

  // Legacy sync helper
  _syncLegacyClockLog(item, emp) {
    try {
      const logs = JSON.parse(localStorage.getItem('mock_clock_logs') || '[]');
      const logIdx = logs.findIndex(l => String(l.userId) === String(item.employeeId) && l.clockIn && l.clockIn.startsWith(item.date));
      const syncData = {
        userId: item.employeeId,
        userName: `${emp.firstName} ${emp.lastName}`,
        clockIn: item.clockIn,
        clockOut: item.clockOut,
        hoursWorked: item.totalHours
      };
      
      if (logIdx !== -1) {
        logs[logIdx] = { ...logs[logIdx], ...syncData };
      } else {
        const nextId = logs.length ? Math.max(...logs.map(l => l.id)) + 1 : 1;
        logs.push({ id: nextId, ...syncData });
      }
      localStorage.setItem('mock_clock_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to sync legacy clock logs', e);
    }
  }
};

export default attendanceService;
