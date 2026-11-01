import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { createAuditLog } from '../../utils/auditLogger.util';

export class CommunicationsService {
  static async listConversations(companyId?: string | null) {
    const where: any = {};
    if (companyId) {
      where.recipient = { companyId };
    }

    const messages = await prisma.communicationMessage.findMany({
      where,
      include: {
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { sentAt: 'desc' },
    });

    // Group by recipient tenant
    const conversationsMap = new Map<string, any>();
    for (const msg of messages) {
      const tenantId = msg.recipientId;
      if (!conversationsMap.has(tenantId)) {
        conversationsMap.set(tenantId, {
          tenant: msg.recipient,
          lastMessage: msg,
          totalMessages: 1,
        });
      } else {
        conversationsMap.get(tenantId).totalMessages += 1;
      }
    }

    return Array.from(conversationsMap.values());
  }

  static async sendMessage(
    data: {
      recipientId: string;
      channel: 'EMAIL' | 'SMS';
      subject?: string;
      message: string;
    },
    senderUserId?: string
  ) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: data.recipientId },
    });

    if (!tenant) {
      throw new AppError('Recipient tenant not found', 404, 'TENANT_NOT_FOUND');
    }

    const comm = await prisma.communicationMessage.create({
      data: {
        senderId: senderUserId,
        recipientId: data.recipientId,
        channel: data.channel,
        subject: data.subject,
        message: data.message,
      },
    });

    console.log(`📨 [${data.channel}] Message sent to ${tenant.firstName} ${tenant.lastName} (${tenant.email}): "${data.message}"`);

    await createAuditLog({
      userId: senderUserId,
      action: 'SEND_COMMUNICATION',
      entityType: 'CommunicationMessage',
      entityId: comm.id,
      newData: comm,
    });

    return comm;
  }

  static async sendCampaign(
    data: {
      propertyId: string;
      channel: 'EMAIL' | 'SMS';
      subject: string;
      message: string;
    },
    companyId?: string | null,
    senderUserId?: string
  ) {
    const tenants = await prisma.tenant.findMany({
      where: {
        leases: {
          some: {
            unit: { propertyId: data.propertyId },
            status: 'ACTIVE',
            isActive: true,
          },
        },
      },
    });

    if (tenants.length === 0) {
      throw new AppError('No active tenants found for this property', 400, 'NO_TENANTS_FOUND');
    }

    const messagesToCreate = tenants.map((tenant) => ({
      senderId: senderUserId,
      recipientId: tenant.id,
      channel: data.channel,
      subject: data.subject,
      message: data.message,
    }));

    await prisma.communicationMessage.createMany({
      data: messagesToCreate,
    });

    console.log(`📢 Building-wide broadcast campaign sent to ${tenants.length} tenants of property ${data.propertyId}`);

    return {
      message: `Broadcast successfully dispatched to ${tenants.length} tenants`,
      recipientsCount: tenants.length,
    };
  }
}

