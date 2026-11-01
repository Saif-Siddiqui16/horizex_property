import { Router } from 'express';
import {
  listUnitTypes,
  listInsurance,
  createInsurance,
  listNotes,
  createNote,
  listClockLogs,
  clockIn,
  clockOut,
} from './extra.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

// Unit Types
router.get('/unit-types', listUnitTypes);

// Insurance Policies
router.get('/insurance', listInsurance);
router.post('/insurance', authorizeRoles('SUPER_ADMIN', 'COMPANY_ADMIN', 'PROPERTY_MANAGER'), createInsurance);

// Notes Hub
router.get('/notes', listNotes);
router.post('/notes', createNote);

// Clock Logs & Timesheet
router.get('/clock-logs', listClockLogs);
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);

export default router;

