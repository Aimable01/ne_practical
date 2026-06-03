/**
 * Helpers for safely reading Mongoose populated fields.
 *
 * Mongoose .populate() replaces e.g. `extinguisherId` (a string ObjectId) with the
 * full document object in-place. The frontend type still says it's a `string`, but
 * at runtime it's an object. These helpers handle both cases transparently.
 */

export function getExtinguisherDisplay(record: any): {
  serial: string;
  location: string | null;
} {
  // populated field lives on extinguisherId (the actual DB field name)
  const raw = record.extinguisher ?? record.extinguisherId;
  if (raw && typeof raw === "object") {
    return {
      serial: raw.serialNumber ?? "—",
      location: raw.location ?? null,
    };
  }
  // unpopulated — just a raw ID string; nothing useful to display beyond it
  return { serial: String(raw ?? "—"), location: null };
}

export function getInspectorName(record: any): string {
  const raw = record.inspector ?? record.inspectorId;
  if (raw && typeof raw === "object") {
    return `${raw.firstName ?? ""} ${raw.lastName ?? ""}`.trim() || "—";
  }
  return "—";
}

export function getRecordId(record: any): string {
  return (
    record.id ?? record._id?.toString() ?? String(Math.random())
  );
}
