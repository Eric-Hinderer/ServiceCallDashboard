import { NextResponse } from 'next/server';
import db from "@/lib/firebase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { collection, getDocs } from "firebase/firestore";



async function getServiceCalls() {
  const serviceCallCollection = collection(db, "ServiceCalls");
  const serviceCallSnapshot = await getDocs(serviceCallCollection);

  const serviceCalls = serviceCallSnapshot.docs.map((doc) => {
    const { createdAt, updatedAt, date, ...otherFields } = doc.data();
    return otherFields;
  });

  return serviceCalls;
}


async function generateGeminiSummary(
  serviceCalls: any[],
  question: string
) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const context = serviceCalls
    .map((call) => {
      return `Machine: ${call.machine || "N/A"}
      Problem: ${call.reportedProblem || "N/A"}
      Location: ${call.location || "N/A"}
      Notes: ${call.notes || "N/A"},
      Status: ${call.status || "N/A"},
      Taken By: ${call.takenBy || "N/A"}`;
    })
    .join("\n");

  const prompt = `
    You are a support agent. Based on the following information from the service call database:
    ${context}

    Respond to the user's question: "${question}"

    Respond in a concise and informative manner.
  `;

  const result = await model.generateContent(prompt);
  let responseText = await result.response.text();

  responseText = responseText
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<ul><li>$1</li></ul>");
  
  return responseText;
}

export async function GET() {
  try {
    const serviceCalls = await getServiceCalls();
    return NextResponse.json(serviceCalls);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch service calls' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    const serviceCalls = await getServiceCalls();
    const summary = await generateGeminiSummary(serviceCalls, question);

    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
