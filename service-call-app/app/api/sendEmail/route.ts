import { NextResponse } from "next/server";
import { z } from "zod";
import { serviceCallFieldsSchema } from "@/lib/service-calls/model";
import { sendServiceCallEmail } from "@/lib/service-calls/email.server";

const emailSchema = serviceCallFieldsSchema.extend({ date: z.string().datetime().transform((date) => new Date(date)) });

export async function POST(req: Request) {
  let input;
  try {
    input = emailSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ message: "Invalid service call." }, { status: 400 });
  }
  try {
    await sendServiceCallEmail(input);
    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ message: "Failed to send email" }, { status: 500 });
  }
}
