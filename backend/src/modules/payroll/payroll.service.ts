import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';

export class PayrollService {
  private static async getSystemAdminId(): Promise<string> {
    const admin = await prisma.user.findFirst({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] as any } },
    });
    if (admin) return admin.id;
    const anyUser = await prisma.user.findFirst();
    return anyUser ? anyUser.id : '00000000-0000-0000-0000-000000000000';
  }

  // -------------------------------------------------------------
  // SHIFTS
  // -------------------------------------------------------------
  private static async ensureDefaultShifts() {
    try {
      const existing = await prisma.note.count({
        where: { targetType: 'PAYROLL_SHIFT' },
      });
      if (existing > 0) return;

      const adminId = await PayrollService.getSystemAdminId();
      const defaults = [
        { id: 1, name: 'Morning', startTime: '09:00', endTime: '17:00', graceTime: 15, breakDuration: 60, weeklyOff: [0, 6], rotation: 'Fixed Schedule' },
        { id: 2, name: 'Evening', startTime: '17:00', endTime: '01:00', graceTime: 15, breakDuration: 60, weeklyOff: [0, 1], rotation: 'Fixed Schedule' },
        { id: 3, name: 'Night', startTime: '01:00', endTime: '09:00', graceTime: 15, breakDuration: 60, weeklyOff: [5, 6], rotation: 'Bi-weekly Rotation' },
        { id: 4, name: 'Flexible', startTime: '00:00', endTime: '24:00', graceTime: 30, breakDuration: 60, weeklyOff: [0], rotation: 'No Rotation' },
      ];

      for (const sh of defaults) {
        await prisma.note.create({
          data: {
            authorId: adminId,
            targetType: 'PAYROLL_SHIFT',
            targetId: String(sh.id),
            title: sh.name,
            content: JSON.stringify({
              ...sh,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          },
        });
      }
    } catch (err) {
      console.warn('Could not auto-seed default shifts:', err);
    }
  }

  static async listShifts() {
    await PayrollService.ensureDefaultShifts();
    const notes = await prisma.note.findMany({
      where: { targetType: 'PAYROLL_SHIFT' },
      orderBy: { createdAt: 'asc' },
    });

    return notes.map(n => {
      try {
        const parsed = JSON.parse(n.content);
        return {
          id: Number(n.targetId) || n.targetId,
          noteId: n.id,
          ...parsed,
          name: n.title || parsed.name,
        };
      } catch (e) {
        return { id: n.targetId, noteId: n.id, name: n.title };
      }
    });
  }

  static async getShiftById(id: string | number) {
    await PayrollService.ensureDefaultShifts();
    const note = await prisma.note.findFirst({
      where: { targetType: 'PAYROLL_SHIFT', targetId: String(id) },
    });
    if (!note) throw new AppError('Shift not found', 404, 'SHIFT_NOT_FOUND');
    const parsed = JSON.parse(note.content);
    return { id: Number(note.targetId) || note.targetId, noteId: note.id, ...parsed };
  }

  static async createShift(data: any) {
    const list = await PayrollService.listShifts();
    const numIds = list.map(s => Number(s.id)).filter(n => !isNaN(n));
    const nextId = numIds.length ? Math.max(...numIds) + 1 : 1;

    const shiftData = {
      id: nextId,
      name: data.name,
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '17:00',
      graceTime: parseInt(data.graceTime, 10) || 15,
      breakDuration: parseInt(data.breakDuration, 10) || 60,
      weeklyOff: data.weeklyOff || [0, 6],
      rotation: data.rotation || 'Fixed Schedule',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin User',
    };

    const adminId = await PayrollService.getSystemAdminId();
    const note = await prisma.note.create({
      data: {
        authorId: adminId,
        targetType: 'PAYROLL_SHIFT',
        targetId: String(nextId),
        title: shiftData.name,
        content: JSON.stringify(shiftData),
      },
    });

    return { ...shiftData, noteId: note.id };
  }

  static async updateShift(id: string | number, data: any) {
    const note = await prisma.note.findFirst({
      where: { targetType: 'PAYROLL_SHIFT', targetId: String(id) },
    });
    if (!note) throw new AppError('Shift not found', 404, 'SHIFT_NOT_FOUND');

    let current = {};
    try {
      current = JSON.parse(note.content);
    } catch (e) {
      current = {};
    }

    const updated = {
      ...current,
      ...data,
      graceTime: data.graceTime !== undefined ? parseInt(data.graceTime, 10) : (current as any).graceTime,
      breakDuration: data.breakDuration !== undefined ? parseInt(data.breakDuration, 10) : (current as any).breakDuration,
      weeklyOff: data.weeklyOff || (current as any).weeklyOff,
      updatedAt: new Date().toISOString(),
    };

    await prisma.note.update({
      where: { id: note.id },
      data: {
        title: updated.name || note.title,
        content: JSON.stringify(updated),
      },
    });

    return { id: Number(id) || id, noteId: note.id, ...updated };
  }

  static async deleteShift(id: string | number) {
    const note = await prisma.note.findFirst({
      where: { targetType: 'PAYROLL_SHIFT', targetId: String(id) },
    });
    if (note) {
      await prisma.note.delete({ where: { id: note.id } });
    }
    return { success: true, message: 'Shift deleted successfully' };
  }

  // -------------------------------------------------------------
  // HELPER: RESOLVE EMPLOYEE DETAILS
  // -------------------------------------------------------------
  private static async resolveEmployee(employeeId: any) {
    const idStr = String(employeeId);
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: idStr },
          { email: idStr },
          { staffProfile: { id: idStr } },
        ],
      },
      include: { staffProfile: true },
    });

    if (user) {
      return {
        id: user.id,
        employeeName: `${user.firstName} ${user.lastName}`.trim(),
        employeeNo: user.email ? `EMP-${user.email.slice(0, 4).toUpperCase()}` : '',
        department: user.staffProfile?.department || 'Operations',
        companyId: user.companyId || 1,
      };
    }

    // Static fallback for standard seeded IDs (4, 5, 6, 7, 8)
    if (idStr === '4' || idStr.toLowerCase().includes('sarah.smith')) {
      return { id: 4, employeeName: 'Sarah Smith', employeeNo: 'EMP-APEX-2026-00004', department: 'Operations', companyId: 1 };
    }
    if (idStr === '5' || idStr.toLowerCase().includes('mike')) {
      return { id: 5, employeeName: 'Mike Johnson', employeeNo: 'EMP-APEX-2026-00005', department: 'Maintenance', companyId: 1 };
    }
    if (idStr === '6' || idStr.toLowerCase().includes('jenkins')) {
      return { id: 6, employeeName: 'Sarah Jenkins', employeeNo: 'EMP-APEX-2026-00006', department: 'Sales & Leasing', companyId: 1 };
    }
    if (idStr === '7' || idStr.toLowerCase().includes('john')) {
      return { id: 7, employeeName: 'John  Doe', employeeNo: 'EMP-APEX-2026-00007', department: 'Maintenance', companyId: 1 };
    }
    if (idStr === '8' || idStr.toLowerCase() === 'as') {
      return { id: 8, employeeName: 'a s', employeeNo: 'EMP-APEX-2026-00008', department: 'Accounting', companyId: 1 };
    }

    return {
      id: employeeId,
      employeeName: `Employee #${employeeId}`,
      employeeNo: `EMP-${employeeId}`,
      department: 'Operations',
      companyId: 1,
    };
  }

  // -------------------------------------------------------------
  // LEAVES
  // -------------------------------------------------------------
  private static async ensureDefaultLeaves() {
    try {
      const existing = await prisma.note.count({
        where: { targetType: 'PAYROLL_LEAVE' },
      });
      if (existing > 0) return;

      const defaults = [
        {
          id: 1,
          employeeId: 4,
          employeeName: 'Sarah Smith',
          employeeNo: 'EMP-APEX-2026-00004',
          department: 'Operations',
          companyId: 1,
          leaveType: 'Sick',
          startDate: '2026-06-15',
          endDate: '2026-06-15',
          reason: 'Medical checkup',
          status: 'Approved',
          createdAt: '2026-06-14T09:00:00Z',
          updatedAt: '2026-06-14T11:00:00Z',
        },
        {
          id: 2,
          employeeId: 5,
          employeeName: 'Mike Johnson',
          employeeNo: 'EMP-APEX-2026-00005',
          department: 'Maintenance',
          companyId: 1,
          leaveType: 'Annual',
          startDate: '2026-07-10',
          endDate: '2026-07-15',
          reason: 'Family summer vacation',
          status: 'Pending',
          createdAt: '2026-06-25T10:00:00Z',
          updatedAt: '2026-06-25T10:00:00Z',
        },
      ];

      const adminId = await PayrollService.getSystemAdminId();
      for (const lv of defaults) {
        await prisma.note.create({
          data: {
            authorId: adminId,
            targetType: 'PAYROLL_LEAVE',
            targetId: String(lv.id),
            title: `${lv.leaveType} - ${lv.employeeName}`,
            content: JSON.stringify(lv),
          },
        });
      }
    } catch (err) {
      console.warn('Could not auto-seed default leaves:', err);
    }
  }

  static async listLeaves(filters: any = {}) {
    await PayrollService.ensureDefaultLeaves();
    const notes = await prisma.note.findMany({
      where: { targetType: 'PAYROLL_LEAVE' },
      orderBy: { createdAt: 'desc' },
    });

    let list = notes.map(n => {
      try {
        const parsed = JSON.parse(n.content);
        return {
          id: Number(n.targetId) || n.targetId,
          noteId: n.id,
          ...parsed,
        };
      } catch (e) {
        return { id: n.targetId, noteId: n.id, reason: n.title };
      }
    });

    if (filters.companyId) {
      list = list.filter(item => String(item.companyId) === String(filters.companyId));
    }
    if (filters.employeeId) {
      list = list.filter(item => String(item.employeeId) === String(filters.employeeId));
    }
    if (filters.status) {
      list = list.filter(item => item.status === filters.status);
    }
    if (filters.leaveType) {
      list = list.filter(item => item.leaveType === filters.leaveType);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(item =>
        (item.employeeName && item.employeeName.toLowerCase().includes(q)) ||
        (item.employeeNo && item.employeeNo.toLowerCase().includes(q)) ||
        (item.reason && item.reason.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  static async getLeaveById(id: string | number) {
    await PayrollService.ensureDefaultLeaves();
    const note = await prisma.note.findFirst({
      where: { targetType: 'PAYROLL_LEAVE', targetId: String(id) },
    });
    if (!note) throw new AppError('Leave record not found', 404, 'LEAVE_NOT_FOUND');
    const parsed = JSON.parse(note.content);
    return { id: Number(note.targetId) || note.targetId, noteId: note.id, ...parsed };
  }

  static async createLeave(data: any, authorName = 'Admin User') {
    const list = await PayrollService.listLeaves();
    const numIds = list.map(l => Number(l.id)).filter(n => !isNaN(n));
    const nextId = numIds.length ? Math.max(...numIds) + 1 : 1;

    const emp = await PayrollService.resolveEmployee(data.employeeId);

    const leaveData = {
      id: nextId,
      employeeId: data.employeeId,
      employeeName: emp.employeeName,
      employeeNo: emp.employeeNo,
      department: emp.department,
      companyId: emp.companyId || data.companyId || 1,
      leaveType: data.leaveType || 'Annual',
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason || '',
      status: data.status || 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: authorName,
    };

    const adminId = await PayrollService.getSystemAdminId();
    const note = await prisma.note.create({
      data: {
        authorId: adminId,
        targetType: 'PAYROLL_LEAVE',
        targetId: String(nextId),
        title: `${leaveData.leaveType} - ${leaveData.employeeName}`,
        content: JSON.stringify(leaveData),
      },
    });

    return { ...leaveData, noteId: note.id };
  }

  static async updateLeaveStatus(id: string | number, status: string, rejectionReason?: string) {
    const note = await prisma.note.findFirst({
      where: { targetType: 'PAYROLL_LEAVE', targetId: String(id) },
    });
    if (!note) throw new AppError('Leave record not found', 404, 'LEAVE_NOT_FOUND');

    let current = {};
    try {
      current = JSON.parse(note.content);
    } catch (e) {
      current = {};
    }

    const updated = {
      ...current,
      status,
      rejectionReason: rejectionReason || (current as any).rejectionReason,
      updatedAt: new Date().toISOString(),
    };

    await prisma.note.update({
      where: { id: note.id },
      data: {
        content: JSON.stringify(updated),
      },
    });

    return { id: Number(id) || id, noteId: note.id, ...updated };
  }

  static async deleteLeave(id: string | number) {
    const note = await prisma.note.findFirst({
      where: { targetType: 'PAYROLL_LEAVE', targetId: String(id) },
    });
    if (note) {
      await prisma.note.delete({ where: { id: note.id } });
    }
    return { success: true, message: 'Leave record deleted successfully' };
  }

  // -------------------------------------------------------------
  // OVERTIME
  // -------------------------------------------------------------
  private static async ensureDefaultOvertime() {
    try {
      const existing = await prisma.note.count({
        where: { targetType: 'PAYROLL_OVERTIME' },
      });
      if (existing > 0) return;

      const defaults = [
        {
          id: 1,
          employeeId: 4,
          employeeName: 'Sarah Smith',
          employeeNo: 'EMP-APEX-2026-00004',
          department: 'Operations',
          companyId: 1,
          date: '2026-06-28',
          hours: 2,
          hourlyWage: 28.13,
          overtimeRate: 42.19,
          cost: 84.38,
          status: 'Approved',
          paidStatus: 'Unpaid',
          createdAt: '2026-06-28T17:30:00Z',
          updatedAt: '2026-06-28T18:00:00Z',
        },
        {
          id: 2,
          employeeId: 5,
          employeeName: 'Mike Johnson',
          employeeNo: 'EMP-APEX-2026-00005',
          department: 'Maintenance',
          companyId: 1,
          date: '2026-06-29',
          hours: 1.5,
          hourlyWage: 26.25,
          overtimeRate: 39.38,
          cost: 59.07,
          status: 'Pending',
          paidStatus: 'Unpaid',
          createdAt: '2026-06-29T18:15:00Z',
          updatedAt: '2026-06-29T18:15:00Z',
        },
      ];

      const adminId = await PayrollService.getSystemAdminId();
      for (const ot of defaults) {
        await prisma.note.create({
          data: {
            authorId: adminId,
            targetType: 'PAYROLL_OVERTIME',
            targetId: String(ot.id),
            title: `${ot.employeeName} - ${ot.hours} hrs`,
            content: JSON.stringify(ot),
          },
        });
      }
    } catch (err) {
      console.warn('Could not auto-seed default overtime:', err);
    }
  }

  static async listOvertime(filters: any = {}) {
    await PayrollService.ensureDefaultOvertime();
    const notes = await prisma.note.findMany({
      where: { targetType: 'PAYROLL_OVERTIME' },
      orderBy: { createdAt: 'desc' },
    });

    let list = notes.map(n => {
      try {
        const parsed = JSON.parse(n.content);
        return {
          id: Number(n.targetId) || n.targetId,
          noteId: n.id,
          ...parsed,
        };
      } catch (e) {
        return { id: n.targetId, noteId: n.id, title: n.title };
      }
    });

    if (filters.companyId) {
      list = list.filter(item => String(item.companyId) === String(filters.companyId));
    }
    if (filters.employeeId) {
      list = list.filter(item => String(item.employeeId) === String(filters.employeeId));
    }
    if (filters.status) {
      list = list.filter(item => item.status === filters.status);
    }
    if (filters.paidStatus) {
      list = list.filter(item => item.paidStatus === filters.paidStatus);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(item =>
        (item.employeeName && item.employeeName.toLowerCase().includes(q)) ||
        (item.employeeNo && item.employeeNo.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getOvertimeById(id: string | number) {
    await PayrollService.ensureDefaultOvertime();
    const note = await prisma.note.findFirst({
      where: { targetType: 'PAYROLL_OVERTIME', targetId: String(id) },
    });
    if (!note) throw new AppError('Overtime record not found', 404, 'OVERTIME_NOT_FOUND');
    const parsed = JSON.parse(note.content);
    return { id: Number(note.targetId) || note.targetId, noteId: note.id, ...parsed };
  }

  static async createOvertime(data: any, authorName = 'Admin User') {
    const list = await PayrollService.listOvertime();
    const numIds = list.map(l => Number(l.id)).filter(n => !isNaN(n));
    const nextId = numIds.length ? Math.max(...numIds) + 1 : 1;

    const emp = await PayrollService.resolveEmployee(data.employeeId);
    const salary = (emp as any).salary || 4000;
    const hourlyWage = parseFloat((salary / 160).toFixed(2));
    const multiplier = 1.5;
    const overtimeRate = parseFloat((hourlyWage * multiplier).toFixed(2));
    const hours = parseFloat(data.hours) || 1;
    const cost = parseFloat((hours * overtimeRate).toFixed(2));

    const overtimeData = {
      id: nextId,
      employeeId: data.employeeId,
      employeeName: emp.employeeName,
      employeeNo: emp.employeeNo,
      department: emp.department,
      companyId: emp.companyId || data.companyId || 1,
      date: data.date || new Date().toISOString().split('T')[0],
      hours,
      hourlyWage,
      overtimeRate,
      cost,
      status: data.status || 'Pending',
      paidStatus: data.paidStatus || 'Unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: authorName,
    };

    const adminId = await PayrollService.getSystemAdminId();
    const note = await prisma.note.create({
      data: {
        authorId: adminId,
        targetType: 'PAYROLL_OVERTIME',
        targetId: String(nextId),
        title: `${overtimeData.employeeName} - ${overtimeData.hours} hrs`,
        content: JSON.stringify(overtimeData),
      },
    });

    return { ...overtimeData, noteId: note.id };
  }

  static async updateOvertimeStatus(id: string | number, status: string, paidStatus?: string) {
    const note = await prisma.note.findFirst({
      where: { targetType: 'PAYROLL_OVERTIME', targetId: String(id) },
    });
    if (!note) throw new AppError('Overtime record not found', 404, 'OVERTIME_NOT_FOUND');

    let current = {};
    try {
      current = JSON.parse(note.content);
    } catch (e) {
      current = {};
    }

    const updated = {
      ...current,
      status: status || (current as any).status,
      paidStatus: paidStatus || (current as any).paidStatus,
      updatedAt: new Date().toISOString(),
    };

    await prisma.note.update({
      where: { id: note.id },
      data: {
        content: JSON.stringify(updated),
      },
    });

    return { id: Number(id) || id, noteId: note.id, ...updated };
  }

  static async deleteOvertime(id: string | number) {
    const note = await prisma.note.findFirst({
      where: { targetType: 'PAYROLL_OVERTIME', targetId: String(id) },
    });
    if (note) {
      await prisma.note.delete({ where: { id: note.id } });
    }
    return { success: true, message: 'Overtime record deleted successfully' };
  }
}
