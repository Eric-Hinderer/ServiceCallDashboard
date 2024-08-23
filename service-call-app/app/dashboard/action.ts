"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Status } from "@prisma/client"; // Ensure you are importing the enum from Prisma

export async function changeStatus(id: string, newStatus: string) {

  const status = newStatus as Status;

  // Update the status in the database
  await prisma.serviceCall.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/dashboard");

}

export async function changeTakenBy(id: string, newTakenBy: string) {
  // Update the takenBy field in the database
  await prisma.serviceCall.update({
    where: { id },
    data: { takenBy: newTakenBy },
  });

  revalidatePath("/dashboard");

}
