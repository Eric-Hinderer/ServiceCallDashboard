"use server";
import { revalidatePath } from "next/cache";
import { updateServiceCall } from "@/lib/service-calls/repository";
import { Status } from "@/lib/service-calls/model";
import db from "@/lib/firebase";

export async function changeStatus(id: string, newStatus: string) {
  await updateServiceCall(db, id, { status: newStatus as Status });

  revalidatePath("/dashboard");
}

export async function changeTakenBy(id: string, newTakenBy: string) {
  await updateServiceCall(db, id, { takenBy: newTakenBy });

  revalidatePath("/dashboard");
}
