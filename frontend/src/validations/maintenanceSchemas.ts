import { z } from 'zod';

export const maintenanceSchema = z.object({
  extinguisherId: z.string().min(1, 'Extinguisher is required'),
  inspectorId: z.string().min(1, 'Inspector is required'),
  actionsTaken: z.string().min(10, 'Actions taken must be at least 10 characters'),
  dateOfAction: z.string().min(1, 'Date of action is required'),
  conditionsNoted: z.string().min(10, 'Conditions noted must be at least 10 characters'),
});
