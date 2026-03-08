import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { fileName, textContent } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are an expert in arcade and amusement games. You are tagging price sheet documents for an arcade service company so they can search for them later.

The MOST important tags are the specific full product/machine names found in the document. These are things like "pac-man air hockey", "pac-man pixel bash neon", "pac-man pixel bash bistro", "ms. pacman galaga", "big bass wheel pro", "crossy road", "space invaders frenzy", etc. Extract every specific product name you can find.

Also include:
- The manufacturer/brand (e.g. "bandai namco", "bay tek", "sega", "raw thrills", "stern pinball", "ice", "elaut", "benchmark games")
- A few broad categories if applicable (e.g. "redemption", "video", "pinball", "crane", "air hockey", "merchandiser")

Prioritize specific product names over generic categories. If a document lists 10 machines, all 10 should be tags.

File name: "${fileName}"
${textContent ? `File content (first portion):\n${textContent.slice(0, 3000)}` : ""}

Return ONLY a JSON array of lowercase tag strings. No explanation, just the array.
Example: ["pac-man air hockey", "pac-man pixel bash neon", "pac-man pixel bash cabaret", "ms. pacman galaga", "bandai namco", "video", "air hockey"]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

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
