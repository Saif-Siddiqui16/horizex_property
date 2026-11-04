import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1, 'Property ID is required'),
    unitId: z.string().min(1, 'Unit ID is required').optional().nullable().or(z.literal('')),
    tenantId: z.string().optional().nullable().or(z.literal('')),
    title: z.string().min(2, 'Title is required'),
    description: z.string().min(3, 'Detailed description is required'),
    priority: z
      .preprocess(
        (val) => (typeof val === 'string' ? val.toUpperCase() : val),
        z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'])
      )
      .optional()
      .default('MEDIUM'),
    photoUrls: z.array(z.string()).optional().default([]),
  }),
});

export const updateTicketStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.preprocess(
      (val) => {
        if (typeof val !== 'string') return val;
        const upper = val.toUpperCase().replace(/\s+/g, '_');
        if (upper === 'NEW' || upper === 'SUBMITTED' || upper === 'OPEN' || upper === 'DRAFT') return 'SUBMITTED';
        if (upper === 'IN_PROGRESS' || upper === 'ASSIGNED' || upper === 'ACCEPTED') return 'IN_PROGRESS';
        if (upper === 'WAITING_PARTS' || upper === 'WAITING_VENDOR' || upper === 'PENDING_PARTS') return 'PENDING_PARTS';
        if (upper === 'COMPLETED' || upper === 'RESOLVED') return 'RESOLVED';
        if (upper === 'CLOSED' || upper === 'REJECTED') return 'CLOSED';
        return upper;
      },
      z.enum(['SUBMITTED', 'IN_PROGRESS', 'PENDING_PARTS', 'RESOLVED', 'CLOSED'])
    ),
    resolutionNote: z.string().optional().nullable(),
    photoUrls: z.array(z.string()).optional(),
  }),
});

export const assignTicketSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    staffProfileId: z.string().min(1, 'Valid staff profile ID is required'),
  }),
});

