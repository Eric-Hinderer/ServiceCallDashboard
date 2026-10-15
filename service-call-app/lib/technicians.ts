import { doc, onSnapshot, type Firestore } from "firebase/firestore";

// Fallback list used until Firestore responds (or if the config doc is
// missing/unreadable). The source of truth is the `config/technicians`
// document; seed it with `node scripts/seed-technicians.mjs`.
export const DEFAULT_TECHNICIANS = [
  "Kurt",
  "Chris",
  "Mike",
  "Dean",
  "Damon",
  "John",
  "Aaron",
  "Jesse",
  "Mark K",
];

export const TECHNICIANS_COLLECTION = "config";
export const TECHNICIANS_DOC_ID = "technicians";

export function normalizeTechnicianNames(data: unknown): string[] {
  const names = (data as { names?: unknown } | null | undefined)?.names;
  if (!Array.isArray(names)) return DEFAULT_TECHNICIANS;
  const cleaned = Array.from(
    new Set(
      names
        .filter((name): name is string => typeof name === "string")
        .map((name) => name.trim())
        .filter((name) => name !== "" && name !== "Select...")
    )
  );
  return cleaned.length > 0 ? cleaned : DEFAULT_TECHNICIANS;
}

export function subscribeToTechnicians(
  db: Firestore,
  onChange: (names: string[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    doc(db, TECHNICIANS_COLLECTION, TECHNICIANS_DOC_ID),
    (snapshot) => onChange(normalizeTechnicianNames(snapshot.data())),
    (error) => onError?.(error)
  );
}
