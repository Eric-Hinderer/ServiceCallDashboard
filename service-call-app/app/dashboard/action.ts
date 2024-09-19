"use server";

import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import db from "@/lib/firebase";
import { ServiceCall } from "../(definitions)/definitions";

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

export async function deleteServiceCall(id: string) {
  try {
    const docRef = doc(db, "ServiceCalls", id);
    await deleteDoc(docRef);
    return { success: true, message: "Service call deleted successfully." };
  } catch (error) {
    console.error("Error deleting service call: ", error);
    return { success: false, message: "Error deleting service call." };
  }
}
export async function getServiceCalls() {
  try {
    const q = query(collection(db, "ServiceCalls"), orderBy("date"));
    const snapshot = await getDocs(q);

    const serviceCalls = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        date: data.date ? data.date.toDate() : null,
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
      } as ServiceCall;
    });
    return serviceCalls;
  } catch (error) {
    console.error("Error fetching service calls:", error);
    throw error;
  }

}
