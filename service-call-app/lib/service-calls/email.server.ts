import nodemailer from "nodemailer";
import { DateTime } from "luxon";
import type { CreateServiceCallInput } from "./model";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!,
  );
}

export async function sendServiceCallEmail({
  date,
  location,
  whoCalled,
  machine,
  reportedProblem,
  takenBy,
  status,
  notes,
}: CreateServiceCallInput) {
  const parsedDate = date;
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
    <p><strong>Location:</strong> ${escapeHtml(location)}</p>
    <p><strong>Who Called:</strong> ${escapeHtml(whoCalled)}</p>
    <p><strong>Machine:</strong> ${escapeHtml(machine)}</p>
    <p><strong>Reported Problem:</strong> ${escapeHtml(reportedProblem)}</p>
    <p><strong>Taken By:</strong> ${escapeHtml(takenBy)}</p>
    <p><strong>Status:</strong> ${escapeHtml(status)}</p>
    <p><strong>Notes:</strong> ${escapeHtml(notes)}</p>
  `;

  await transporter.sendMail({
    from: `"Service Call Manager" <${process.env.GMAIL_FROM}>`,
    to: "route@gamesales.com",
    subject: "New Service Call",
    html: emailBody,
  });
}
