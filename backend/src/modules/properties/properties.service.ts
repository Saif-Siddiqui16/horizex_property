import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { createAuditLog } from '../../utils/auditLogger.util';

export class PropertiesService {
  static async listProperties(companyId?: string | null, search?: string) {
    const where: any = { isActive: true };
    if (companyId) {
      where.companyId = companyId;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        units: {
          where: { isActive: true },
          select: { id: true, status: true, baseRent: true },
        },
        _count: {
          select: {
            units: { where: { isActive: true } },
            tickets: { where: { status: { notIn: ['CLOSED', 'RESOLVED'] } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return properties.map((prop) => {
      const totalUnits = prop.units.length;
      const occupiedUnits = prop.units.filter((u) => u.status === 'OCCUPIED').length;
      const vacantUnits = prop.units.filter((u) => u.status === 'VACANT').length;
      const turnoverUnits = prop.units.filter((u) => u.status === 'TURNOVER').length;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      return {
        ...prop,
        analytics: {
          totalUnits,
          occupiedUnits,
          vacantUnits,
          turnoverUnits,
          occupancyRate: Math.round(occupancyRate * 10) / 10,
        },
      };
    });
  }

  static async getPropertyById(id: string, companyId?: string | null) {
    const where: any = { id, isActive: true };
    if (companyId) {
      where.companyId = companyId;
    }

    const property = await prisma.property.findFirst({
      where,
      include: {
        units: {
          where: { isActive: true },
          include: {
            leases: {
              where: { status: 'ACTIVE', isActive: true },
              include: { tenant: true },
            },
            readiness: true,
          },
        },
        insurance: { where: { isCompliant: true } },
      },
    });

    if (!property) {
      throw new AppError('Property not found', 404, 'PROPERTY_NOT_FOUND');
    }

    return property;
  }

  static async createProperty(
    data: {
      companyId: string;
      name: string;
      address: string;
      city: string;
      state: string;
      postalCode: string;
      totalUnits?: number;
    },
    actorUserId?: string
  ) {
    const property = await prisma.property.create({ data });

    await createAuditLog({
      userId: actorUserId,
      action: 'CREATE_PROPERTY',
      entityType: 'Property',
      entityId: property.id,
      newData: property,
    });

    return property;
  }

  static async updateProperty(
    id: string,
    companyId: string | null | undefined,
    data: Partial<{
      name: string;
      address: string;
      city: string;
      state: string;
      postalCode: string;
      totalUnits: number;
    }>,
    actorUserId?: string
  ) {
    const oldData = await this.getPropertyById(id, companyId);

    const updated = await prisma.property.update({
      where: { id: oldData.id },
      data,
    });

    await createAuditLog({
      userId: actorUserId,
      action: 'UPDATE_PROPERTY',
      entityType: 'Property',
      entityId: id,
      oldData,
      newData: updated,
    });

    return updated;
  }

  static async softDeleteProperty(id: string, companyId: string | null | undefined, actorUserId?: string) {
    const property = await this.getPropertyById(id, companyId);

    // Business rule: cannot delete if active leases exist!
    const activeLeases = await prisma.lease.count({
      where: {
        unit: { propertyId: property.id },
        status: 'ACTIVE',
        isActive: true,
      },
    });

    if (activeLeases > 0) {
      throw new AppError(
        'Cannot deactivate property with active leases. Terminate or transfer all leases first.',
        400,
        'ACTIVE_LEASES_EXIST'
      );
    }

    const updated = await prisma.property.update({
      where: { id },
      data: { isActive: false },
    });

    await createAuditLog({
      userId: actorUserId,
      action: 'SOFT_DELETE_PROPERTY',
      entityType: 'Property',
      entityId: id,
      oldData: property,
      newData: updated,
    });

    return { message: 'Property deactivated successfully' };
  }
}

