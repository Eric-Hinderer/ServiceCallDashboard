"use server";

import { collection, query, orderBy, getDocs } from "firebase/firestore";
import db from "@/lib/firebase";

export async function getLocations() {
  const q = query(collection(db, "ServiceCalls"), orderBy("location"));
  const snapshot = await getDocs(q);

  const locations = snapshot.docs.map((doc) =>
    doc.data().location?.toLowerCase().trim()
  );

  return Array.from(new Set(locations));
}

export async function getMachines() {
  const q = query(collection(db, "ServiceCalls"), orderBy("machine"));
  const snapshot = await getDocs(q);

  const machines = snapshot.docs.map((doc) =>
    doc.data().machine?.toLowerCase().trim()
  );

  return Array.from(new Set(machines));
}
