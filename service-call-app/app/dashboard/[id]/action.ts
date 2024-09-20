"use server";
import { revalidatePath } from "next/cache";
import { doc, Timestamp, updateDoc } from "firebase/firestore";
import db from "@/lib/firebase";

export async function changeStatus(id: string, newStatus: string) {
  const serviceCallRef = doc(db, "ServiceCalls", id);

  await updateDoc(serviceCallRef, {
    status: newStatus,
    updatedAt: Timestamp.now(),
  });

  revalidatePath("/dashboard");
}

export async function changeTakenBy(id: string, newTakenBy: string) {
  const serviceCallRef = doc(db, "ServiceCalls", id);

  await updateDoc(serviceCallRef, {
    takenBy: newTakenBy,
    updatedAt: Timestamp.now(),
  });

  revalidatePath("/dashboard");
}
