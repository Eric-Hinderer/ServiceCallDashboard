"use server";

import { revalidatePath } from "next/cache";
import { doc, Timestamp, updateDoc } from "firebase/firestore"; // Firestore functions for updating documents
import db from "@/lib/firebase";

export async function changeStatus(id: string, newStatus: string) {
  // Define the document reference in the "ServiceCalls" collection
  const serviceCallRef = doc(db, "ServiceCalls", id);

  // Update the status field in Firestore
  await updateDoc(serviceCallRef, {
    status: newStatus,
    updatedAt: Timestamp.now(),
  });

  // Revalidate the cache for the dashboard page
  revalidatePath("/dashboard");
}

export async function changeTakenBy(id: string, newTakenBy: string) {
  // Update the takenBy field in the database
  const serviceCallRef = doc(db, "ServiceCalls", id);

  // Update the status field in Firestore
  await updateDoc(serviceCallRef, {
    takenBy: newTakenBy,
    updatedAt: Timestamp.now(),
  });

  revalidatePath("/dashboard");
}
