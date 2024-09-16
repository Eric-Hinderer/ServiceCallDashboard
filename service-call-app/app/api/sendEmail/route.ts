import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

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

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_FROM,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const emailBody = `
    <h1>New Service Call</h1>
    <p><strong>Date:</strong> ${date}</p>
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
      from: '"Service Call Manager" <your@gmail.com>', // sender address
      to: "ericjh@iorb.com", // receiver
      subject: "New Service Call", // Subject line
      html: emailBody, // HTML body
    });

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 }
    );
  }
}
