"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/lib/firebase";
import { createServiceCall } from "@/lib/service-calls/repository";
import {
  parseCreateServiceCall,
  type CreateServiceCallInput,
  type CreateServiceCallResult,
} from "@/lib/service-calls/model";
import { sendServiceCallEmail } from "@/lib/service-calls/email.server";

export async function submitServiceCall(
  formData: FormData,
): Promise<CreateServiceCallResult> {
  let input: CreateServiceCallInput;
  try {
    input = parseCreateServiceCall(formData);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof z.ZodError
          ? error.issues[0].message
          : "Enter a valid date and time.",
    };
  }

  let id: string;
  try {
    id = await createServiceCall(db, input);
  } catch (error) {
    console.error("Error creating service call:", error);
    return {
      success: false,
      message:
        "Couldn't save the service call. Your entries are still here; please try again.",
    };
  }

  // A refresh failure must not turn a committed write into a reported save failure.
  try {
    revalidatePath("/dashboard");
    revalidatePath("/technician");
    revalidatePath("/admin");
    revalidatePath("/");
  } catch (error) {
    console.error("Error refreshing service calls:", error);
  }

  if (formData.get("sendEmail") !== "true") {
    return { success: true, id, email: "not-requested" };
  }

  try {
    await sendServiceCallEmail(input);
    return { success: true, id, email: "sent" };
  } catch (error) {
    console.error("Service call saved, but notification failed:", error);
    return { success: true, id, email: "failed" };
  }
}
