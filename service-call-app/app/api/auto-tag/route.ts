import { NextResponse } from "next/server";
import db from "@/lib/firebase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { collection, getDocs } from "firebase/firestore";

async function getMachineNames(): Promise<string[]> {
  const snapshot = await getDocs(collection(db, "ServiceCalls"));
  const machines = snapshot.docs
    .map((doc) => doc.data().machine?.trim())
    .filter(Boolean);
  return Array.from(new Set(machines));
}

export async function POST(req: Request) {
  try {
    const { fileName, textContent } = await req.json();

    const machines = await getMachineNames();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are helping tag price sheets for an arcade/amusement game service company.

Given the following file information, suggest relevant tags (game names, manufacturers, categories like "redemption", "video", "pinball", etc).

File name: "${fileName}"
${textContent ? `File content (first portion):\n${textContent.slice(0, 3000)}` : ""}

Here are known machine/game names from our database for reference:
${machines.join(", ")}

Return ONLY a JSON array of lowercase tag strings. No explanation, just the array.
Example: ["skee-ball", "redemption", "bay tek"]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Parse the JSON array from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ tags: [] });
    }

    const tags: string[] = JSON.parse(jsonMatch[0]).map((t: string) =>
      t.toLowerCase().trim()
    ).filter(Boolean);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Auto-tag error:", error);
    return NextResponse.json({ tags: [] });
  }
}
