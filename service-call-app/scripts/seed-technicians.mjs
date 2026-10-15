#!/usr/bin/env node
// Writes the list of assignable technicians to Firestore (config/technicians).
//
// Usage (from service-call-app/):
//   node scripts/seed-technicians.mjs                 # add the default list
//   node scripts/seed-technicians.mjs "Jane" "Bob"    # add specific names
//   node scripts/seed-technicians.mjs --remove "Bob"  # remove names
//
// Existing names are kept; order is preserved and new names go at the end.
// Credentials: set GOOGLE_APPLICATION_CREDENTIALS to a service-account key,
// or run `gcloud auth application-default login`. The project ID comes from
// FIREBASE_PROJECT_ID / NEXT_PUBLIC_FIREBASE_PROJECT_ID / GOOGLE_CLOUD_PROJECT.
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const DEFAULT_TECHNICIANS = [
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

const args = process.argv.slice(2);
const remove = args[0] === "--remove";
const names = (remove ? args.slice(1) : args).map((n) => n.trim()).filter(Boolean);
if (remove && names.length === 0) {
  console.error("Pass at least one name to --remove.");
  process.exit(1);
}

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT;

initializeApp(projectId ? { projectId } : undefined);
const ref = getFirestore().collection("config").doc("technicians");

const updated = await getFirestore().runTransaction(async (tx) => {
  const snapshot = await tx.get(ref);
  const existing = Array.isArray(snapshot.data()?.names) ? snapshot.data().names : [];
  const next = remove
    ? existing.filter((n) => !names.includes(n))
    : [...new Set([...existing, ...(names.length ? names : DEFAULT_TECHNICIANS)])];
  tx.set(ref, { names: next, updatedAt: new Date() }, { merge: true });
  return next;
});

console.log(`config/technicians now has ${updated.length} names:`);
console.log(updated.map((n) => `  - ${n}`).join("\n"));
