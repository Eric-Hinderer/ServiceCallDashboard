import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { fileName, textContent } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are an expert in arcade and amusement games, including redemption games, video games, pinball machines, cranes/claws, merchandisers, kiddie rides, and coin-op equipment.

Given the following price sheet file information, suggest relevant tags. Include:
- Specific game/machine names and models (e.g. "big bass wheel", "crossy road", "space invaders frenzy")
- Manufacturers/brands (e.g. "bay tek", "sega", "raw thrills", "stern pinball", "ice", "elaut")
- Categories (e.g. "redemption", "video", "pinball", "crane", "merchandiser", "kiddie ride", "sport", "videmption")
- Themes if identifiable

File name: "${fileName}"
${textContent ? `File content (first portion):\n${textContent.slice(0, 3000)}` : ""}

Return ONLY a JSON array of lowercase tag strings. No explanation, just the array.
Example: ["big bass wheel", "bay tek", "redemption", "wheel game"]`;

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
