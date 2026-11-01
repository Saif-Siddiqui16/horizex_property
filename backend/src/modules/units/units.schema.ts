import { z } from 'zod';

export const createUnitSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid('Invalid property ID'),
    unitTypeId: z.string().uuid().optional(),
    unitNumber: z.string().min(1, 'Unit number is required'),
    floor: z.number().int().optional().default(1),
    bedrooms: z.number().int().nonnegative().optional().default(1),
    bathrooms: z.number().positive().optional().default(1.0),
    squareFeet: z.number().int().positive().optional(),
    baseRent: z.number().positive('Base rent must be a positive number'),
  }),
});

export const updateUnitSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    unitTypeId: z.string().uuid().optional(),
    floor: z.number().int().optional(),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().positive().optional(),
    squareFeet: z.number().int().positive().optional(),
    baseRent: z.number().positive().optional(),
    status: z.enum(['OCCUPIED', 'VACANT', 'MAINTENANCE', 'TURNOVER']).optional(),
  }),
});

export const updateReadinessSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // unitId
  }),
  body: z.object({
    stage: z
      .enum([
        'NOTICE_GIVEN',
        'MOVE_OUT_INSPECTION',
        'TRASH_OUT',
        'MAINTENANCE_REPAIRS',
        'PAINTING',
        'DEEP_CLEANING',
        'FINAL_INSPECTION',
        'READY_TO_LEASE',
      ])
      .optional(),
    assignedWorker: z.string().optional(),
    turnoverDeadline: z.string().datetime().optional(),
    cleaningComplete: z.boolean().optional(),
    paintComplete: z.boolean().optional(),
    repairComplete: z.boolean().optional(),
    notes: z.string().optional(),
  }),
});

