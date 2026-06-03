import { z } from 'zod';

const today = () => new Date().toISOString().slice(0, 10);

export const maintenanceSchema = z.object({
  extinguisherId: z.string().min(1, 'Extinguisher is required'),
  inspectorId: z.string().min(1, 'Inspector is required'),
  actionsTaken: z.string().min(10, 'Actions taken must be at least 10 characters'),
  dateOfAction: z
    .string()
    .min(1, 'Date of action is required')
    .refine((v) => v >= today(), 'Date of action cannot be in the past'),
  conditionsNoted: z.string().min(10, 'Conditions noted must be at least 10 characters'),
});
