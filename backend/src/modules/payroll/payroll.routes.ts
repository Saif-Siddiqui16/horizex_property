import { Router } from 'express';
import {
  listShifts,
  getShift,
  createShift,
  updateShift,
  deleteShift,
  listLeaves,
  getLeave,
  createLeave,
  updateLeaveStatus,
  deleteLeave,
  listOvertime,
  getOvertime,
  createOvertime,
  updateOvertimeStatus,
  deleteOvertime,
} from './payroll.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const shiftsRouter = Router();
shiftsRouter.use(authenticate);
shiftsRouter.get('/', listShifts);
shiftsRouter.get('/:id', getShift);
shiftsRouter.post('/', createShift);
shiftsRouter.put('/:id', updateShift);
shiftsRouter.delete('/:id', deleteShift);

export const leavesRouter = Router();
leavesRouter.use(authenticate);
leavesRouter.get('/', listLeaves);
leavesRouter.get('/:id', getLeave);
leavesRouter.post('/', createLeave);
leavesRouter.put('/:id', updateLeaveStatus);
leavesRouter.patch('/:id/status', updateLeaveStatus);
leavesRouter.delete('/:id', deleteLeave);

export const overtimeRouter = Router();
overtimeRouter.use(authenticate);
overtimeRouter.get('/', listOvertime);
overtimeRouter.get('/:id', getOvertime);
overtimeRouter.post('/', createOvertime);
overtimeRouter.put('/:id', updateOvertimeStatus);
overtimeRouter.patch('/:id/status', updateOvertimeStatus);
overtimeRouter.delete('/:id', deleteOvertime);

const payrollRouter = Router();
payrollRouter.use('/shifts', shiftsRouter);
payrollRouter.use('/leaves', leavesRouter);
payrollRouter.use('/overtime', overtimeRouter);

export default payrollRouter;

