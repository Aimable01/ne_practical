import { z } from 'zod';

export const inspectionSchema = z.object({
  extinguisherId: z.string().min(1, 'Extinguisher is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
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
