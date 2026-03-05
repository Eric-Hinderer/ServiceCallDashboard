"use server";
import { Status } from "@/app/(definitions)/definitions";
import db from "@/lib/firebase";
import { addDoc, collection, setDoc, Timestamp } from "@firebase/firestore";
import { fromZonedTime } from "date-fns-tz";

const CENTRAL_TZ = "America/Chicago";

export async function createFromForm(formData: FormData) {
  const dateString = formData.get("date") as string | null;

  const utcDate = dateString
    ? fromZonedTime(new Date(dateString), CENTRAL_TZ)
    : fromZonedTime(new Date(), CENTRAL_TZ);

  const location = formData.get("location") as string;
  const whoCalled = formData.get("whoCalled") as string;
  const machine = formData.get("machine") as string;
  const reportedProblem = formData.get("reportedProblem") as string;
  const takenBy = formData.get("takenBy") as string;
  const notes = formData.get("notes") as string;
  const status = (formData.get("status") as Status) || Status.OPEN;

  const newServiceCall = {
    date: utcDate,
    location,
    whoCalled,
    machine,
    reportedProblem,
    takenBy,
    notes,
    status,
    updatedAt: new Date(),
    id: "",
  };

  try {
    const docRef = await addDoc(collection(db, "ServiceCalls"), newServiceCall);
    await setDoc(docRef, { id: docRef.id }, { merge: true });
  } catch (err) {
    console.error("Error creating service call:", err);
  }
}

export async function emailGroup(formData: FormData) {
  const dateString = formData.get("date") as string;
  const utcDate = dateString
    ? fromZonedTime(new Date(dateString), CENTRAL_TZ)
    : fromZonedTime(new Date(), CENTRAL_TZ);
  const date = Timestamp.fromDate(utcDate);

  const location = formData.get("location") as string;
  const whoCalled = formData.get("whoCalled") as string;
  const machine = formData.get("machine") as string;
  const reportedProblem = formData.get("reportedProblem") as string;
  const takenBy = formData.get("takenBy") as string;
  const notes = formData.get("notes") as string;
  const status = (formData.get("status") as Status) || Status.OPEN;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  try {
    const res = await fetch(`${baseUrl}/api/sendEmail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: date.toDate().toISOString(),
        location,
        whoCalled,
        machine,
        reportedProblem,
        takenBy,
        status,
        notes,
      }),
    });

    if (!res.ok) {
      console.error("Failed to send email");
    }
  } catch (err) {
    console.error("Error sending email:", err);
  }
  await createFromForm(formData);
}
