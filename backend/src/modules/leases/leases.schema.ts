import { z } from 'zod';

export const createLeaseSchema = z.object({
  body: z.object({
    unitId: z.string().uuid('Invalid unit ID'),
    tenantId: z.string().uuid('Invalid tenant ID'),
    startDate: z.string().datetime('Valid start date is required'),
    endDate: z.string().datetime('Valid end date is required'),
    rentAmount: z.number().positive('Rent amount must be greater than 0'),
    depositAmount: z.number().nonnegative().optional().default(0),
  }),
});

export const renewLeaseSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    proposedRent: z.number().positive('Proposed rent must be positive'),
    proposedEndDate: z.string().datetime('Valid proposed end date is required'),
  }),
});

export const createMoveInspectionSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // leaseId
  }),
  body: z.object({
    type: z.enum(['MOVE_IN', 'MOVE_OUT']),
    inspectorName: z.string().min(1, 'Inspector name is required'),
    checklistJson: z.record(z.any()),
    mediaUrls: z.array(z.string().url()).optional().default([]),
    signedByTenant: z.boolean().optional().default(false),
  }),
});

