import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFParse } from "pdf-parse";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ textContent: "" });
    }

    const fileType = file.type;
    const buffer = Buffer.from(await file.arrayBuffer());

    // CSV / plain text — read directly
    if (fileType === "text/csv" || fileType.startsWith("text/")) {
      return NextResponse.json({ textContent: buffer.toString("utf-8") });
    }

    // PDF — use pdf-parse v2
    if (fileType === "application/pdf") {
      const parser = new PDFParse({ data: buffer });
      try {
        const data = await parser.getText();
        return NextResponse.json({ textContent: data.text });
      } finally {
        await parser.destroy();
      }
    }

    // Images — use Gemini vision to OCR
    if (fileType.startsWith("image/")) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

      const base64 = buffer.toString("base64");
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: fileType,
            data: base64,
          },
        },
        "Extract ALL text content from this image. Include every product name, price, model number, and any other text visible. Return only the raw text, no formatting or commentary.",
      ]);

      const text = result.response.text().trim();
      return NextResponse.json({ textContent: text });
    }

    // Word/Excel — we can't easily parse these server-side without heavy deps
    // Return empty and rely on filename + tags for these
    return NextResponse.json({ textContent: "" });
  } catch (error) {
    console.error("Extract text error:", error);
    return NextResponse.json({ textContent: "" });
  }
}
