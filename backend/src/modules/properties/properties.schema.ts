import { z } from 'zod';

export const createPropertySchema = z.object({
  body: z.object({
    companyId: z.string().uuid().optional(), // Injected from token if omitted
    name: z.string().min(2, 'Property name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    totalUnits: z.number().int().nonnegative().optional().default(0),
  }),
});

export const updatePropertySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    totalUnits: z.number().int().nonnegative().optional(),
  }),
});

