"use server";
import { ServiceCall } from "@/app/(definitions)/definitions";
import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createFromForm(formData: FormData) {

  const dateString = formData.get("date") as string;
  const date = dateString ? new Date(dateString) : new Date();
  const location = (formData.get("location") as string) || undefined;
  const whoCalled = (formData.get("whoCalled") as string) || undefined;
  const machine = (formData.get("machine") as string) || undefined;
  const reportedProblem =
    (formData.get("reportedProblem") as string) || undefined;
  const takenBy = (formData.get("takenBy") as string) || undefined;
  const notes = (formData.get("notes") as string) || undefined;
  const status = (formData.get("status") as Status) || Status.OPEN;

  const newServiceCall: ServiceCall = {
    date,
    location,
    whoCalled,
    machine,
    reportedProblem,
    takenBy,
    status,
    notes,
  };

  await prisma.serviceCall.create({ data: newServiceCall });
  revalidatePath("/dashboard");
  revalidatePath("/");
  redirect("/dashboard");
}

export async function emailGroup(formData: FormData) {

  const date = formData.get("date");
  const location = formData.get("location");
  const whoCalled = formData.get("whoCalled");
  const machine = formData.get("machine");
  const reportedProblem = formData.get("reportedProblem");
  const takenBy = formData.get("takenBy");
  const status = formData.get("status");
  const notes = formData.get("notes");

  // Construct the full URL (adjust as needed if using serverless or hosted environments)
  const baseUrl = "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/sendEmail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date,
        location,
        whoCalled,
        machine,
        reportedProblem,
        takenBy,
        status,
        notes,
      }),
    });

    if (res.ok) {
      console.log("Email sent successfully");
    } else {
      console.error("Failed to send email");
    }
  } catch (err) {
    console.error("Error sending email:", err);
  }
  await createFromForm(formData);
}