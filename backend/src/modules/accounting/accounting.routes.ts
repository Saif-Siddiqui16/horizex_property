import { Router } from 'express';
import {
  recordPayment,
  listInvoices,
  listPaymentsReceived,
  getOutstandingDues,
  listBankAccounts,
  createBankAccount,
} from './accounting.controller';
import { validateRequest } from '../../middlewares/validate.middleware';
import { recordPaymentSchema, createBankAccountSchema } from './accounting.schema';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

// Single Place to Collect Rent
router.post(
  '/payments',
  authorizeRoles('SUPER_ADMIN', 'COMPANY_ADMIN', 'PROPERTY_MANAGER', 'ACCOUNTANT', 'TENANT'),
  validateRequest(recordPaymentSchema),
  recordPayment
);

router.get(
  '/payments-received',
  authorizeRoles('SUPER_ADMIN', 'COMPANY_ADMIN', 'PROPERTY_MANAGER', 'ACCOUNTANT', 'OWNER'),
  listPaymentsReceived
);

router.get(
  '/payments',
  authorizeRoles('SUPER_ADMIN', 'COMPANY_ADMIN', 'PROPERTY_MANAGER', 'ACCOUNTANT', 'OWNER'),
  listPaymentsReceived
);

router.get(
  '/invoices',
  authorizeRoles('SUPER_ADMIN', 'COMPANY_ADMIN', 'PROPERTY_MANAGER', 'ACCOUNTANT', 'TENANT', 'OWNER'),
  listInvoices
);

router.get(
  '/outstanding-dues',
  authorizeRoles('SUPER_ADMIN', 'COMPANY_ADMIN', 'PROPERTY_MANAGER', 'ACCOUNTANT', 'OWNER'),
  getOutstandingDues
);

// Bank accounts
router.get(
  '/accounts',
  authorizeRoles('SUPER_ADMIN', 'COMPANY_ADMIN', 'ACCOUNTANT'),
  listBankAccounts
);

router.post(
  '/accounts',
  authorizeRoles('SUPER_ADMIN', 'COMPANY_ADMIN', 'ACCOUNTANT'),
  validateRequest(createBankAccountSchema),
  createBankAccount
);

export default router;

