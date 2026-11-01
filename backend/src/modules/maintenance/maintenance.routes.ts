import { Router } from 'express';
import {
  listTickets,
  getTicket,
  createTicket,
  updateTicketStatus,
  assignTicket,
} from './maintenance.controller';
import { validateRequest } from '../../middlewares/validate.middleware';
import {
  createTicketSchema,
  updateTicketStatusSchema,
  assignTicketSchema,
} from './maintenance.schema';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorizeRoles('SUPER_ADMIN', 'COMPANY_ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_STAFF', 'TENANT', 'OWNER'),
  listTickets
);

router.post(
  '/',
  authorizeRoles('SUPER_ADMIN', 'COMPANY_ADMIN', 'PROPERTY_MANAGER', 'TENANT'),
  validateRequest(createTicketSchema),
  createTicket
);

router.get(
  '/:id',
  authorizeRoles('SUPER_ADMIN', 'COMPANY_ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_STAFF', 'TENANT', 'OWNER'),
  getTicket
);

router.put(
  '/:id/status',
  authorizeRoles('SUPER_ADMIN', 'COMPANY_ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_STAFF'),
  validateRequest(updateTicketStatusSchema),
  updateTicketStatus
);

router.put(
  '/:id/assign',
  authorizeRoles('SUPER_ADMIN', 'COMPANY_ADMIN', 'PROPERTY_MANAGER'),
  validateRequest(assignTicketSchema),
  assignTicket
);

export default router;

