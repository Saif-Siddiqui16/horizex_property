import { z } from 'zod';

export const createTenantSchema = z.object({
  body: z.object({
    companyId: z.string().uuid().optional(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    emergencyContact: z.string().optional(),
  }),
});

export const updateTenantSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().min(10).optional(),
    emergencyContact: z.string().optional(),
  }),
});

export const createVehicleSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid('Invalid tenant ID'),
    unitId: z.string().uuid('Invalid unit ID'),
    make: z.string().min(1, 'Make is required'),
    model: z.string().min(1, 'Model is required'),
    licensePlate: z.string().min(2, 'License plate is required').toUpperCase(),
    permitNumber: z.string().optional(),
  }),
});

