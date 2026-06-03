import { z } from "zod";

export const extinguisherSchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["WATER", "CO2", "FOAM", "DRY_CHEMICAL"], {
    message: "Please select a valid type",
  }),
  size: z.enum(["2.5lbs", "5lbs", "9lbs", "12lbs"], {
    message: "Please select a valid size",
  }),
  installationDate: z.string().min(1, "Installation date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  status: z.enum(
    ["ACTIVE", "EXPIRED", "MAINTENANCE_REQUIRED", "OUT_OF_SERVICE"],
    {
      message: "Please select a valid status",
    },
  ),
});

export const updateExtinguisherSchema = extinguisherSchema.partial();
