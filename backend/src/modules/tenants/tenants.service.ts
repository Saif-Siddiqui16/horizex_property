import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { createAuditLog } from '../../utils/auditLogger.util';

export class TenantsService {
  static async listTenants(companyId?: string | null, search?: string) {
    const where: any = { isActive: true };
    if (companyId) {
      where.companyId = companyId;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        leases: {
          where: { status: 'ACTIVE', isActive: true },
          include: {
            unit: {
              include: {
                property: { select: { id: true, name: true } },
              },
            },
          },
        },
        invoices: {
          where: { status: { in: ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'] } },
          select: { amountDue: true, amountPaid: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tenants.map((tenant) => {
      const activeLease = tenant.leases[0] || null;
      const totalBalanceDue = tenant.invoices.reduce(
        (sum, inv) => sum + (Number(inv.amountDue) - Number(inv.amountPaid)),
        0
      );

      return {
        id: tenant.id,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        phone: tenant.phone,
        emergencyContact: tenant.emergencyContact,
        activeUnit: activeLease ? `${activeLease.unit.property.name} - Unit ${activeLease.unit.unitNumber}` : 'No Active Lease',
        activeLeaseId: activeLease?.id || null,
        balanceDue: Math.round(totalBalanceDue * 100) / 100,
        createdAt: tenant.createdAt,
      };
    });
  }

  static async getTenantById(id: string, companyId?: string | null) {
    const where: any = { id, isActive: true };
    if (companyId) {
      where.companyId = companyId;
    }

    const tenant = await prisma.tenant.findFirst({
      where,
      include: {
        leases: {
          where: { isActive: true },
          include: {
            unit: { include: { property: true } },
          },
          orderBy: { startDate: 'desc' },
        },
        invoices: {
          orderBy: { dueDate: 'desc' },
          include: { payments: true },
        },
        payments: {
          orderBy: { paidAt: 'desc' },
        },
        vehicles: {
          include: { unit: true },
        },
        credits: true,
      },
    });

    if (!tenant) {
      throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
    }

    return tenant;
  }

  static async createTenant(
    data: {
      companyId: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      emergencyContact?: string;
    },
    actorUserId?: string
  ) {
    const existing = await prisma.tenant.findUnique({
      where: { email: data.email },
    });

    if (existing && existing.isActive) {
      throw new AppError('Tenant with this email already exists', 409, 'DUPLICATE_TENANT_EMAIL');
    }

    const tenant = await prisma.tenant.create({ data });

    await createAuditLog({
      userId: actorUserId,
      action: 'CREATE_TENANT',
      entityType: 'Tenant',
      entityId: tenant.id,
      newData: tenant,
    });

    return tenant;
  }

  static async updateTenant(
    id: string,
    companyId: string | null | undefined,
    data: any,
    actorUserId?: string
  ) {
    const oldTenant = await this.getTenantById(id, companyId);

    const updated = await prisma.tenant.update({
      where: { id: oldTenant.id },
      data,
    });

    await createAuditLog({
      userId: actorUserId,
      action: 'UPDATE_TENANT',
      entityType: 'Tenant',
      entityId: id,
      oldData: oldTenant,
      newData: updated,
    });

    return updated;
  }

  static async listVehicles(companyId?: string | null) {
    const where: any = {};
    if (companyId) {
      where.tenant = { companyId };
    }

    return prisma.vehicle.findMany({
      where,
      include: {
        tenant: { select: { id: true, firstName: true, lastName: true, phone: true } },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            property: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createVehicle(
    data: {
      tenantId: string;
      unitId: string;
      make: string;
      model: string;
      licensePlate: string;
      permitNumber?: string;
    },
    actorUserId?: string
  ) {
    const existing = await prisma.vehicle.findUnique({
      where: { licensePlate: data.licensePlate },
    });

    if (existing) {
      throw new AppError('Vehicle with this license plate already registered', 409, 'DUPLICATE_LICENSE_PLATE');
    }

    const vehicle = await prisma.vehicle.create({ data });

    await createAuditLog({
      userId: actorUserId,
      action: 'REGISTER_VEHICLE',
      entityType: 'Vehicle',
      entityId: vehicle.id,
      newData: vehicle,
    });

    return vehicle;
  }
}

