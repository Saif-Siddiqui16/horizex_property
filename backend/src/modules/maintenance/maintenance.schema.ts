import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid('Invalid property ID'),
    unitId: z.string().uuid('Invalid unit ID'),
    tenantId: z.string().uuid().optional(),
    title: z.string().min(2, 'Title is required'),
    description: z.string().min(5, 'Detailed description is required'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).optional().default('MEDIUM'),
    photoUrls: z.array(z.string().url()).optional().default([]),
  }),
});

export const updateTicketStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(['SUBMITTED', 'IN_PROGRESS', 'PENDING_PARTS', 'RESOLVED', 'CLOSED']),
    resolutionNote: z.string().optional(),
    photoUrls: z.array(z.string().url()).optional(),
  }),
});

export const assignTicketSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    staffProfileId: z.string().uuid('Valid staff profile ID is required'),
  }),
});

