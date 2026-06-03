import { z } from 'zod';

const today = () => new Date().toISOString().slice(0, 10);

export const inspectionSchema = z.object({
  extinguisherId: z.string().min(1, 'Extinguisher is required'),
  scheduledDate: z
    .string()
    .min(1, 'Scheduled date is required')
    .refine((v) => v >= today(), 'Scheduled date cannot be in the past'),
  scheduledTime: z.string().min(1, 'Scheduled time is required'),
  inspectorId: z.string().min(1, 'Inspector is required'),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'FAILED']),
  result: z.string().optional(),
  notes: z.string().optional(),
});

export const updateInspectionSchema = z.object({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'FAILED']),
  result: z.string().optional(),
  notes: z.string().optional(),
});
