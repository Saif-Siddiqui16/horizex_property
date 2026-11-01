import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { sendSuccess } from '../../utils/apiResponse.util';
import { AppError } from '../../middlewares/errorHandler';

// Unit Types
export const listUnitTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const unitTypes = await prisma.unitType.findMany({
      orderBy: { name: 'asc' },
    });
    return sendSuccess(res, unitTypes, 200);
  } catch (err) {
    return next(err);
  }
};

// Insurance Policies
export const listInsurance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const companyId = isSuperAdmin ? undefined : req.user?.effectiveCompanyId;

    const policies = await prisma.insurancePolicy.findMany({
      where: companyId ? { property: { companyId } } : {},
      include: { property: { select: { id: true, name: true, address: true } } },
      orderBy: { expiryDate: 'asc' },
    });
    return sendSuccess(res, policies, 200);
  } catch (err) {
    return next(err);
  }
};

export const createInsurance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const policy = await prisma.insurancePolicy.create({
      data: {
        propertyId: req.body.propertyId,
        carrier: req.body.carrier,
        policyNumber: req.body.policyNumber,
        coverageAmount: req.body.coverageAmount,
        expiryDate: new Date(req.body.expiryDate),
        isCompliant: req.body.isCompliant ?? true,
      },
    });
    return sendSuccess(res, policy, 201);
  } catch (err) {
    return next(err);
  }
};

// Notes Hub
export const listNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { targetType, targetId } = req.query;
    const where: any = {};
    if (targetType) where.targetType = String(targetType);
    if (targetId) where.targetId = String(targetId);

    const notes = await prisma.note.findMany({
      where,
      include: {
        author: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, notes, 200);
  } catch (err) {
    return next(err);
  }
};

export const createNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const note = await prisma.note.create({
      data: {
        authorId: req.user.userId,
        targetType: req.body.targetType || 'GENERAL',
        targetId: req.body.targetId || '0',
        title: req.body.title,
        content: req.body.content,
      },
      include: {
        author: { select: { firstName: true, lastName: true } },
      },
    });
    return sendSuccess(res, note, 201);
  } catch (err) {
    return next(err);
  }
};

// Employee Clock-In / Clock-Out
export const listClockLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.clockLog.findMany({
      include: {
        staff: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { clockIn: 'desc' },
    });
    return sendSuccess(res, logs, 200);
  } catch (err) {
    return next(err);
  }
};

export const clockIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    let staff = await prisma.staffProfile.findFirst({
      where: { userId },
    });

    if (!staff && userId) {
      staff = await prisma.staffProfile.create({
        data: {
          userId,
          department: 'Maintenance & Operations',
        },
      });
    }

    if (!staff) {
      throw new AppError('Staff profile not found', 404, 'STAFF_NOT_FOUND');
    }

    const log = await prisma.clockLog.create({
      data: {
        staffId: staff.id,
        clockIn: new Date(),
        notes: req.body.notes,
      },
    });
    return sendSuccess(res, log, 201);
  } catch (err) {
    return next(err);
  }
};

export const clockOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const staff = await prisma.staffProfile.findFirst({
      where: { userId },
    });

    if (!staff) {
      throw new AppError('Staff profile not found', 404, 'STAFF_NOT_FOUND');
    }

    const activeLog = await prisma.clockLog.findFirst({
      where: {
        staffId: staff.id,
        clockOut: null,
      },
      orderBy: { clockIn: 'desc' },
    });

    if (!activeLog) {
      throw new AppError('No active clock-in found', 400, 'NO_ACTIVE_CLOCK_IN');
    }

    const now = new Date();
    const diffHours = (now.getTime() - new Date(activeLog.clockIn).getTime()) / (1000 * 60 * 60);

    const updated = await prisma.clockLog.update({
      where: { id: activeLog.id },
      data: {
        clockOut: now,
        totalHours: Math.round(diffHours * 100) / 100,
        notes: req.body.notes || activeLog.notes,
      },
    });
    return sendSuccess(res, updated, 200);
  } catch (err) {
    return next(err);
  }
};

