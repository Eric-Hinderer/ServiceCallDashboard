import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { DateTime } from "luxon";

export async function POST(req: any) {
  const {
    date,
    location,
    whoCalled,
    machine,
    reportedProblem,
    takenBy,
    status,
    notes,
  } = await req.json();

  const parsedDate = new Date(date);
  const centralTimeString = DateTime.fromJSDate(parsedDate, { zone: "utc" })
    .setZone("America/Chicago")
    .toLocaleString(DateTime.DATETIME_FULL);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    secure: false,
    auth: {
      user: process.env.GMAIL_FROM,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const emailBody = `
    <h1>New Service Call</h1>
    <p><strong>Date:</strong> ${centralTimeString} (Central Time)</p>
    <p><strong>Location:</strong> ${location}</p>
    <p><strong>Who Called:</strong> ${whoCalled}</p>
    <p><strong>Machine:</strong> ${machine}</p>
    <p><strong>Reported Problem:</strong> ${reportedProblem}</p>
    <p><strong>Taken By:</strong> ${takenBy}</p>
    <p><strong>Status:</strong> ${status}</p>
    <p><strong>Notes:</strong> ${notes}</p>
  `;

  try {
    await transporter.sendMail({
      from: `"Service Call Manager" <${process.env.GMAIL_FROM}>`,
      to: "route@gamesales.com",
      subject: "New Service Call",
      html: emailBody,
    });

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 }
    );
  }
}
