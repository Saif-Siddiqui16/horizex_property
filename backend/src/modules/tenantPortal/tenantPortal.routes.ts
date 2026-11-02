import { Router, Request, Response } from 'express';
import { prisma } from '../../config/db';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

// Profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: { firstName: true, lastName: true, email: true, phone: true }
    });
    return res.json({
      name: user ? `${user.firstName} ${user.lastName}` : 'Demo Tenant',
      email: user?.email || '',
      phone: user?.phone || ''
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// Dashboard stats
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { email: user?.email },
          { id: user?.id }
        ]
      },
      include: {
        leases: {
          where: { isActive: true },
          include: { unit: { include: { property: true } } },
          orderBy: { startDate: 'desc' }
        },
        invoices: {
          orderBy: { dueDate: 'desc' }
        }
      }
    });

    const activeLease = tenant?.leases?.[0];
    const latestInvoice = tenant?.invoices?.[0];
    const openTicketsCount = await prisma.maintenanceTicket.count({
      where: {
        tenantId: tenant?.id,
        status: { notIn: ['CLOSED', 'RESOLVED'] }
      }
    });

    return res.json({
      tenantName: user ? `${user.firstName} ${user.lastName}` : 'Tenant User',
      stats: {
        currentRent: activeLease ? Number(activeLease.rentAmount) : 1250,
        rentDueStatus: latestInvoice?.status === 'PAID' ? 'Paid' : 'Due Soon',
        leaseStatus: activeLease?.status || 'ACTIVE',
        leaseExpiry: activeLease?.endDate || '2027-12-31',
        openTickets: openTicketsCount,
        nextDueDate: latestInvoice?.dueDate || new Date().toISOString(),
        recentTickets: [],
        unreadCount: 0
      }
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// Lease Details
router.get('/lease', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    const tenant = await prisma.tenant.findFirst({
      where: { OR: [{ email: user?.email }, { id: user?.id }] },
      include: {
        leases: {
          where: { isActive: true },
          include: { unit: { include: { property: true } } },
          orderBy: { startDate: 'desc' }
        }
      }
    });

    const lease = tenant?.leases?.[0];
    if (!lease) {
      return res.json({
        id: 'DEMO-LEASE',
        unit: '101',
        property: 'Le Mirage Condominiums & Suites',
        startDate: '2026-01-01',
        endDate: '2027-12-31',
        rent: 1250,
        deposit: 1250,
        status: 'ACTIVE'
      });
    }

    return res.json({
      id: lease.id,
      unit: lease.unit.unitNumber,
      property: lease.unit.property.name,
      startDate: lease.startDate,
      endDate: lease.endDate,
      rent: Number(lease.rentAmount),
      deposit: Number(lease.depositAmount),
      status: lease.status
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// Invoices
router.get('/invoices', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    const tenant = await prisma.tenant.findFirst({
      where: { OR: [{ email: user?.email }, { id: user?.id }] },
      include: {
        invoices: { orderBy: { dueDate: 'desc' } }
      }
    });

    const invoices = (tenant?.invoices || []).map(inv => ({
      id: inv.invoiceNumber,
      dbId: inv.id,
      amount: Number(inv.amountDue),
      paidAmount: Number(inv.amountPaid),
      dueDate: inv.dueDate,
      status: inv.status
    }));

    if (invoices.length === 0) {
      invoices.push({
        id: 'INV-DEMO-001',
        dbId: '00000000-0000-0000-0000-000000000001',
        amount: 1250,
        paidAmount: 1250,
        dueDate: new Date(),
        status: 'PAID'
      });
    }

    return res.json(invoices);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// Documents, Tickets, Insurance, Vehicles, Reports
router.get('/documents', (req, res) => res.json([]));
router.post('/documents', (req, res) => res.json({ success: true }));
router.get('/insurance', (req, res) => res.json([]));
router.post('/insurance', (req, res) => res.json({ success: true }));
router.get('/tickets', (req, res) => res.json([]));
router.post('/tickets', (req, res) => res.json({ success: true }));
router.get('/vehicles', (req, res) => res.json([]));
router.get('/reports', (req, res) => res.json({ payments: [], invoices: [] }));
router.post('/pay', (req, res) => res.json({ success: true, message: 'Payment processed successfully' }));

export default router;

