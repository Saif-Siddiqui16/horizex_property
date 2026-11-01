import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { createAuditLog } from '../../utils/auditLogger.util';

export class AccountingService {
  /**
   * THE "SINGLE PLACE TO COLLECT RENT" (BUSINESS_RULES.md Section 3)
   * Double-Entry Transaction:
   * 1. Records Payment
   * 2. Updates Invoice amountPaid & status
   * 3. Credits BankAccount balance
   * 4. Converts excess overpayment to TenantCredit
   * 5. Emits immutable AuditLog
   */
  static async recordPayment(
    data: {
      invoiceId?: string;
      tenantId: string;
      bankAccountId: string;
      amount: number;
      paymentMethod: any;
      referenceId?: string;
    },
    companyId?: string | null,
    actorUserId?: string
  ) {
    const bankAccount = await prisma.bankAccount.findFirst({
      where: {
        id: data.bankAccountId,
        isActive: true,
        ...(companyId ? { companyId } : {}),
      },
    });

    if (!bankAccount) {
      throw new AppError('Bank account not found or access denied', 404, 'BANK_ACCOUNT_NOT_FOUND');
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        id: data.tenantId,
        isActive: true,
        ...(companyId ? { companyId } : {}),
      },
    });

    if (!tenant) {
      throw new AppError('Tenant not found or access denied', 404, 'TENANT_NOT_FOUND');
    }

    let invoiceToSettle: any = null;
    if (data.invoiceId) {
      invoiceToSettle = await prisma.invoice.findUnique({
        where: { id: data.invoiceId },
      });
    } else {
      // If invoiceId not specified, find oldest unpaid/partially paid invoice
      invoiceToSettle = await prisma.invoice.findFirst({
        where: {
          tenantId: data.tenantId,
          status: { in: ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'] },
        },
        orderBy: { dueDate: 'asc' },
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          invoiceId: invoiceToSettle?.id || null,
          tenantId: data.tenantId,
          bankAccountId: data.bankAccountId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          status: 'COMPLETED',
          referenceId: data.referenceId,
          paidAt: new Date(),
        },
      });

      // 2. Credit Bank Account
      await tx.bankAccount.update({
        where: { id: data.bankAccountId },
        data: {
          balance: { increment: data.amount },
        },
      });

      // 3. Settle invoice & handle excess/credit
      if (invoiceToSettle) {
        const remainingDue = Number(invoiceToSettle.amountDue) - Number(invoiceToSettle.amountPaid);

        if (data.amount >= remainingDue) {
          // Fully paid
          await tx.invoice.update({
            where: { id: invoiceToSettle.id },
            data: {
              amountPaid: invoiceToSettle.amountDue,
              status: 'PAID',
            },
          });

          // Overpayment rule: Store excess as TenantCredit
          const excess = data.amount - remainingDue;
          if (excess > 0) {
            await tx.tenantCredit.create({
              data: {
                tenantId: data.tenantId,
                amount: excess,
                reason: `Overpayment on invoice ${invoiceToSettle.invoiceNumber}`,
              },
            });
          }
        } else {
          // Partially paid
          await tx.invoice.update({
            where: { id: invoiceToSettle.id },
            data: {
              amountPaid: { increment: data.amount },
              status: 'PARTIALLY_PAID',
            },
          });
        }
      }

      return payment;
    });

    await createAuditLog({
      userId: actorUserId,
      action: 'RECORD_PAYMENT',
      entityType: 'Payment',
      entityId: result.id,
      newData: result,
    });

    return result;
  }

  static async listInvoices(filters: {
    companyId?: string | null;
    status?: any;
    tenantId?: string;
  }) {
    const where: any = {};
    if (filters.companyId) {
      where.tenant = { companyId: filters.companyId };
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.tenantId) {
      where.tenantId = filters.tenantId;
    }

    return prisma.invoice.findMany({
      where,
      include: {
        tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
        lease: {
          include: {
            unit: {
              select: {
                unitNumber: true,
                property: { select: { id: true, name: true } },
              },
            },
          },
        },
        payments: true,
      },
      orderBy: { dueDate: 'desc' },
    });
  }

  static async listPaymentsReceived(companyId?: string | null) {
    const where: any = {};
    if (companyId) {
      where.tenant = { companyId };
    }

    return prisma.payment.findMany({
      where,
      include: {
        tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
        bankAccount: { select: { id: true, accountName: true, bankName: true } },
        invoice: { select: { id: true, invoiceNumber: true } },
      },
      orderBy: { paidAt: 'desc' },
    });
  }

  static async getOutstandingDues(companyId?: string | null) {
    const where: any = {
      status: { in: ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'] },
    };
    if (companyId) {
      where.tenant = { companyId };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        tenant: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        lease: {
          include: {
            unit: {
              select: {
                unitNumber: true,
                property: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();

    return invoices.map((inv) => {
      const balance = Number(inv.amountDue) - Number(inv.amountPaid);
      const diffTime = now.getTime() - new Date(inv.dueDate).getTime();
      const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      let agingBucket = 'CURRENT';
      if (daysOverdue > 90) agingBucket = '90+_DAYS';
      else if (daysOverdue > 60) agingBucket = '60_DAYS';
      else if (daysOverdue > 30) agingBucket = '30_DAYS';

      return {
        ...inv,
        balanceRemaining: Math.round(balance * 100) / 100,
        daysOverdue,
        agingBucket,
      };
    });
  }

  static async listBankAccounts(companyId?: string | null) {
    const where: any = { isActive: true };
    if (companyId) {
      where.companyId = companyId;
    }

    return prisma.bankAccount.findMany({
      where,
      include: {
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createBankAccount(
    data: {
      companyId: string;
      bankName: string;
      accountName: string;
      accountNumber: string;
      routingNumber?: string;
      initialBalance?: number;
    },
    actorUserId?: string
  ) {
    const account = await prisma.bankAccount.create({
      data: {
        companyId: data.companyId,
        bankName: data.bankName,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        routingNumber: data.routingNumber,
        balance: data.initialBalance ?? 0,
      },
    });

    await createAuditLog({
      userId: actorUserId,
      action: 'CREATE_BANK_ACCOUNT',
      entityType: 'BankAccount',
      entityId: account.id,
      newData: account,
    });

    return account;
  }
}

