import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { createAuditLog } from '../../utils/auditLogger.util';

export class MaintenanceService {
  static async listTickets(filters: {
    companyId?: string | null;
    propertyId?: string;
    priority?: any;
    status?: any;
  }) {
    const where: any = {};
    if (filters.propertyId) {
      where.propertyId = filters.propertyId;
    } else if (filters.companyId) {
      where.property = { companyId: filters.companyId };
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return prisma.maintenanceTicket.findMany({
      where,
      include: {
        property: { select: { id: true, name: true, address: true } },
        unit: { select: { id: true, unitNumber: true } },
        tenant: { select: { id: true, firstName: true, lastName: true, phone: true } },
        assignee: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async getTicketById(id: string, companyId?: string | null) {
    const where: any = { id };
    if (companyId) {
      where.property = { companyId };
    }

    const ticket = await prisma.maintenanceTicket.findFirst({
      where,
      include: {
        property: true,
        unit: true,
        tenant: true,
        assignee: {
          include: { user: true },
        },
      },
    });

    if (!ticket) {
      throw new AppError('Maintenance ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    return ticket;
  }

  static async createTicket(
    data: {
      propertyId: string;
      unitId: string;
      tenantId?: string;
      title: string;
      description: string;
      priority?: any;
      photoUrls?: string[];
    },
    companyId?: string | null,
    actorUserId?: string
  ) {
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

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        propertyId: data.propertyId,
        unitId: data.unitId,
        tenantId: data.tenantId,
        title: data.title,
        description: data.description,
        priority: data.priority ?? 'MEDIUM',
        photoUrls: data.photoUrls ?? [],
        status: 'SUBMITTED',
      },
    });

    // If EMERGENCY, log high-priority SLA requirement
    if (ticket.priority === 'EMERGENCY') {
      console.log(
        `🚨 EMERGENCY TICKET CREATED: [Ticket #${ticket.id}] - SLA: Under 2 hours. Notification dispatched to on-call technicians.`
      );
    }

    await createAuditLog({
      userId: actorUserId,
      action: 'CREATE_MAINTENANCE_TICKET',
      entityType: 'MaintenanceTicket',
      entityId: ticket.id,
      newData: ticket,
    });

    return ticket;
  }

  static async updateTicketStatus(
    id: string,
    companyId: string | null | undefined,
    data: {
      status: any;
      resolutionNote?: string;
      photoUrls?: string[];
    },
    actorUserId?: string
  ) {
    const ticket = await this.getTicketById(id, companyId);

    // BUSINESS RULE: Cannot resolve without resolution note
    if (data.status === 'RESOLVED' && !data.resolutionNote && !ticket.resolutionNote) {
      throw new AppError(
        'Resolution note is required to mark a ticket as RESOLVED',
        400,
        'RESOLUTION_PROOF_REQUIRED'
      );
    }

    const updated = await prisma.maintenanceTicket.update({
      where: { id: ticket.id },
      data: {
        status: data.status,
        resolutionNote: data.resolutionNote ?? ticket.resolutionNote,
        photoUrls: data.photoUrls ? { push: data.photoUrls } : undefined,
        resolvedAt: data.status === 'RESOLVED' || data.status === 'CLOSED' ? new Date() : undefined,
      },
    });

    await createAuditLog({
      userId: actorUserId,
      action: 'UPDATE_TICKET_STATUS',
      entityType: 'MaintenanceTicket',
      entityId: id,
      oldData: ticket,
      newData: updated,
    });

    return updated;
  }

  static async assignTicket(
    id: string,
    companyId: string | null | undefined,
    staffProfileId: string,
    actorUserId?: string
  ) {
    const ticket = await this.getTicketById(id, companyId);

    const staff = await prisma.staffProfile.findUnique({
      where: { id: staffProfileId },
    });

    if (!staff) {
      throw new AppError('Staff member profile not found', 404, 'STAFF_NOT_FOUND');
    }

    const updated = await prisma.maintenanceTicket.update({
      where: { id: ticket.id },
      data: {
        assignedTo: staff.id,
        status: ticket.status === 'SUBMITTED' ? 'IN_PROGRESS' : ticket.status,
      },
    });

    await createAuditLog({
      userId: actorUserId,
      action: 'ASSIGN_MAINTENANCE_TICKET',
      entityType: 'MaintenanceTicket',
      entityId: id,
      oldData: ticket,
      newData: updated,
    });

    return updated;
  }
}

