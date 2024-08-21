"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Status } from "@prisma/client"; // Ensure you are importing the enum from Prisma

export async function changeStatus(id: string, newStatus: string) {
  // Convert the newStatus string to the Status enum type
  const status = newStatus as Status;

  // Update the status in the database
  await prisma.serviceCall.update({
    where: { id },
    data: { status },
  });

  // Revalidate the dashboard page to reflect the new status
  revalidatePath("/dashboard");
}

export async function changeTakenBy(id: string, newTakenBy: string) {
  // Update the takenBy field in the database
  await prisma.serviceCall.update({
    where: { id },
    data: { takenBy: newTakenBy },
  });

  // Revalidate the dashboard page to reflect the new takenBy value
  revalidatePath("/dashboard");
}
