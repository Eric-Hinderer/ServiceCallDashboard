"use server";

import app from "@/lib/firebaseConfig";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { collection, getDocs, getFirestore } from "firebase/firestore";

export async function getServiceCalls() {
  const db = getFirestore(app);
  const serviceCallCollection = collection(db, "ServiceCalls");
  const serviceCallSnapshot = await getDocs(serviceCallCollection);

  const serviceCalls = serviceCallSnapshot.docs.map((doc) => {
    const call = doc.data();
    return {
      date: call.date.toDate(),
      machine: call.machine,
      reportedProblem: call.reportedProblem,
      location: call.location,
      notes: call.notes,
      status: call.status,
      takenBy: call.takenBy,
    };
  });

  return serviceCalls;
}

export async function generateGeminiSummary(
  serviceCalls: any[],
  question: string
) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const context = serviceCalls
    .map((call) => {
      return `Date: ${ call.date|| "N/A"},
      Day: ${call.date.getDay() || "N/A"},
      Machine: ${call.machine || "N/A"},
      Problem: ${call.reportedProblem || "N/A"},
      Location: ${call.location || "N/A"},
      Notes: ${call.notes || "N/A"},
      Status: ${call.status || "N/A"},
      Taken By: ${call.takenBy || "N/A"}`;
    })
    .join("\n");

  const prompt = `
    You are a support agent. Based on the following information from the service call database:
    ${context}

    Respond to the user's question: "${question}"
  `;

  const result = await model.generateContent(prompt);
  let responseText = await result.response.text();

  responseText = responseText
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") // Bold text
    .replace(/\*(.+?)\*/g, "<ul><li>$1</li></ul>");
  return responseText;
}
