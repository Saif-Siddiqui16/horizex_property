import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { createAuditLog } from '../../utils/auditLogger.util';

export class UnitsService {
  static async listUnits(filters: {
    companyId?: string | null;
    propertyId?: string;
    status?: any;
    bedrooms?: number;
    minRent?: number;
    maxRent?: number;
  }) {
    const where: any = { isActive: true };

    if (filters.propertyId) {
      where.propertyId = filters.propertyId;
    } else if (filters.companyId) {
      where.property = { companyId: filters.companyId };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.bedrooms !== undefined) {
      where.bedrooms = filters.bedrooms;
    }

    if (filters.minRent !== undefined || filters.maxRent !== undefined) {
      where.baseRent = {};
      if (filters.minRent !== undefined) where.baseRent.gte = filters.minRent;
      if (filters.maxRent !== undefined) where.baseRent.lte = filters.maxRent;
    }

    return prisma.unit.findMany({
      where,
      include: {
        property: { select: { id: true, name: true, address: true } },
        unitType: { select: { id: true, name: true, code: true } },
        leases: {
          where: { status: 'ACTIVE', isActive: true },
          include: { tenant: { select: { id: true, firstName: true, lastName: true, phone: true } } },
        },
        readiness: true,
      },
      orderBy: [{ propertyId: 'asc' }, { unitNumber: 'asc' }],
    });
  }

  static async getUnitById(id: string, companyId?: string | null) {
    const where: any = { id, isActive: true };
    if (companyId) {
      where.property = { companyId };
    }

    const unit = await prisma.unit.findFirst({
      where,
      include: {
        property: true,
        unitType: true,
        readiness: true,
        leases: {
          where: { isActive: true },
          include: { tenant: true },
          orderBy: { startDate: 'desc' },
        },
        tickets: {
          orderBy: { createdAt: 'desc' },
        },
        vehicles: true,
        moveInspections: {
          orderBy: { inspectionDate: 'desc' },
        },
      },
    });

    if (!unit) {
      throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');
    }

    return unit;
  }

  static async createUnit(
    data: {
      propertyId: string;
      unitTypeId?: string;
      unitNumber: string;
      floor?: number;
      bedrooms?: number;
      bathrooms?: number;
      squareFeet?: number;
      baseRent: number;
    },
    companyId?: string | null,
    actorUserId?: string
  ) {
    // Validate property belongs to company
    const property = await prisma.property.findFirst({
      where: {
        id: data.propertyId,
        isActive: true,
        ...(companyId ? { companyId } : {}),
      },
    });

    if (!property) {
      throw new AppError('Property not found or access denied', 404, 'PROPERTY_NOT_FOUND');
    }

    const existing = await prisma.unit.findUnique({
      where: {
        propertyId_unitNumber: {
          propertyId: data.propertyId,
          unitNumber: data.unitNumber,
        },
      },
    });

    if (existing && existing.isActive) {
      throw new AppError(
        `Unit number ${data.unitNumber} already exists in this property`,
        409,
        'DUPLICATE_UNIT_NUMBER'
      );
    }

    const unit = await prisma.unit.create({
      data: {
        propertyId: data.propertyId,
        unitTypeId: data.unitTypeId,
        unitNumber: data.unitNumber,
        floor: data.floor ?? 1,
        bedrooms: data.bedrooms ?? 1,
        bathrooms: data.bathrooms ?? 1.0,
        squareFeet: data.squareFeet,
        baseRent: data.baseRent,
        status: 'VACANT',
        readiness: {
          create: {
            stage: 'READY_TO_LEASE',
            cleaningComplete: true,
            paintComplete: true,
            repairComplete: true,
          },
        },
      },
      include: { readiness: true },
    });

    await createAuditLog({
      userId: actorUserId,
      action: 'CREATE_UNIT',
      entityType: 'Unit',
      entityId: unit.id,
      newData: unit,
    });

    return unit;
  }

  static async updateUnit(
    id: string,
    companyId: string | null | undefined,
    data: any,
    actorUserId?: string
  ) {
    const oldUnit = await this.getUnitById(id, companyId);

    const updated = await prisma.unit.update({
      where: { id: oldUnit.id },
      data,
    });

    await createAuditLog({
      userId: actorUserId,
      action: 'UPDATE_UNIT',
      entityType: 'Unit',
      entityId: id,
      oldData: oldUnit,
      newData: updated,
    });

    return updated;
  }

  static async getReadinessDashboard(companyId?: string | null) {
    const where: any = {
      isActive: true,
      status: 'TURNOVER',
    };
    if (companyId) {
      where.property = { companyId };
    }

    const unitsInTurnover = await prisma.unit.findMany({
      where,
      include: {
        property: { select: { id: true, name: true } },
        readiness: true,
        tickets: {
          where: { status: { notIn: ['CLOSED', 'RESOLVED'] } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Group units into Kanban stages
    const stages: Record<string, any[]> = {
      NOTICE_GIVEN: [],
      MOVE_OUT_INSPECTION: [],
      TRASH_OUT: [],
      MAINTENANCE_REPAIRS: [],
      PAINTING: [],
      DEEP_CLEANING: [],
      FINAL_INSPECTION: [],
      READY_TO_LEASE: [],
    };

    for (const unit of unitsInTurnover) {
      const stage = unit.readiness?.stage || 'NOTICE_GIVEN';
      if (stages[stage]) {
        stages[stage].push(unit);
      }
    }

    return {
      totalInTurnover: unitsInTurnover.length,
      stages,
    };
  }

  static async updateUnitReadiness(
    unitId: string,
    companyId: string | null | undefined,
    data: {
      stage?: any;
      assignedWorker?: string;
      turnoverDeadline?: string;
      cleaningComplete?: boolean;
      paintComplete?: boolean;
      repairComplete?: boolean;
      notes?: string;
    },
    actorUserId?: string
  ) {
    const unit = await this.getUnitById(unitId, companyId);

    // GATEKEEPER BUSINESS RULE:
    // If attempting to mark READY_TO_LEASE, verify no open repair tickets exist
    if (data.stage === 'READY_TO_LEASE') {
      const openTicketsCount = await prisma.maintenanceTicket.count({
        where: {
          unitId: unit.id,
          status: { notIn: ['RESOLVED', 'CLOSED'] },
        },
      });

      if (openTicketsCount > 0) {
        throw new AppError(
          `Cannot mark unit READY_TO_LEASE. There are ${openTicketsCount} open maintenance tickets pending resolution.`,
          400,
          'OPEN_REPAIRS_EXIST'
        );
      }
    }

    const updatedReadiness = await prisma.unitReadiness.upsert({
      where: { unitId: unit.id },
      update: {
        stage: data.stage,
        assignedWorker: data.assignedWorker,
        turnoverDeadline: data.turnoverDeadline ? new Date(data.turnoverDeadline) : undefined,
        cleaningComplete: data.cleaningComplete,
        paintComplete: data.paintComplete,
        repairComplete: data.repairComplete,
        notes: data.notes,
      },
      create: {
        unitId: unit.id,
        stage: data.stage ?? 'NOTICE_GIVEN',
        assignedWorker: data.assignedWorker,
        turnoverDeadline: data.turnoverDeadline ? new Date(data.turnoverDeadline) : undefined,
        cleaningComplete: data.cleaningComplete ?? false,
        paintComplete: data.paintComplete ?? false,
        repairComplete: data.repairComplete ?? false,
        notes: data.notes,
      },
    });

    // When marked READY_TO_LEASE, unit automatically transitions back to VACANT
    if (data.stage === 'READY_TO_LEASE') {
      await prisma.unit.update({
        where: { id: unit.id },
        data: { status: 'VACANT' },
      });
    }

    await createAuditLog({
      userId: actorUserId,
      action: 'UPDATE_UNIT_READINESS',
      entityType: 'UnitReadiness',
      entityId: updatedReadiness.id,
      oldData: unit.readiness,
      newData: updatedReadiness,
    });

    return updatedReadiness;
  }

  static async getReadinessBuildings(companyId?: string | null) {
    const where: any = { isActive: true };
    if (companyId) where.companyId = companyId;
    return prisma.property.findMany({
      where,
      select: { id: true, name: true, address: true, totalUnits: true },
      orderBy: { name: 'asc' },
    });
  }

  static async getReadinessStats(companyId?: string | null) {
    const where: any = { isActive: true };
    if (companyId) where.property = { companyId };

    const [totalTurnover, readyToLease, inProgress] = await Promise.all([
      prisma.unit.count({ where: { ...where, status: 'TURNOVER' } }),
      prisma.unit.count({ where: { ...where, readiness: { stage: 'READY_TO_LEASE' } } }),
      prisma.unit.count({
        where: { ...where, status: 'TURNOVER', readiness: { stage: { not: 'READY_TO_LEASE' } } },
      }),
    ]);

    return {
      totalTurnover,
      readyToLease,
      inProgress,
    };
  }
}

