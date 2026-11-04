import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid('Invalid property ID'),
    unitId: z.string().uuid('Invalid unit ID').optional().or(z.literal('')),
    unit: z.string().optional(),
    unitNumber: z.string().optional(),
    aptNumber: z.string().optional(),
    tenantId: z.string().uuid().optional().nullable().or(z.literal('')),
    tenant: z.string().optional(),
    tenantName: z.string().optional(),
    building: z.string().optional(),
    propertyName: z.string().optional(),
    email: z.string().optional(),
    title: z.string().min(1, 'Title is required').optional(),
    subject: z.string().optional(),
    description: z.string().min(1, 'Detailed description is required').optional(),
    desc: z.string().optional(),
    priority: z.preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase() : val),
      z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).optional().default('MEDIUM')
    ),
    photoUrls: z.array(z.string()).optional().default([]),
    status: z.string().optional(),
  }).passthrough(),
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

export const updateTicketSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID'),
  }),
  body: z.object({
    title: z.string().optional(),
    subject: z.string().optional(),
    description: z.string().optional(),
    desc: z.string().optional(),
    priority: z.preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase() : val),
      z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).optional()
    ),
    status: z.enum(['SUBMITTED', 'IN_REVIEW', 'SCHEDULED', 'IN_PROGRESS', 'PENDING_PARTS', 'RESOLVED', 'CLOSED', 'CANCELLED']).optional(),
    propertyId: z.string().uuid().optional().nullable().or(z.literal('')),
    unitId: z.string().uuid().optional().nullable().or(z.literal('')),
    tenantId: z.string().uuid().optional().nullable().or(z.literal('')),
    photoUrls: z.array(z.string()).optional(),
  }).passthrough(),
});
