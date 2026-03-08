import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFParse } from "pdf-parse";

const GEMINI_PDF_SIZE_LIMIT = 15 * 1024 * 1024; // 15 MB — safe threshold for inline base64

const PDF_EXTRACT_PROMPT =
  "Extract ALL text content from this PDF. Include every product name, price, model number, description, and any other text visible across all pages. Return only the raw text, no formatting or commentary.";

const IMAGE_EXTRACT_PROMPT =
  "Extract ALL text content from this image. Include every product name, price, model number, and any other text visible. Return only the raw text, no formatting or commentary.";

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

    // PDF — use pdf-parse for text-based PDFs; fall back to Gemini for scanned PDFs
    if (fileType === "application/pdf") {
      let pdfText = "";
      const parser = new PDFParse({ data: buffer });
      try {
        const data = await parser.getText();
        pdfText = data.text.trim();
      } catch (parseErr) {
        console.warn("pdf-parse failed, will try Gemini fallback:", parseErr);
      } finally {
        await parser.destroy();
      }

      if (pdfText) {
        return NextResponse.json({ textContent: pdfText });
      }

      // pdf-parse returned no text — likely a scanned PDF; try Gemini as fallback
      if (buffer.length <= GEMINI_PDF_SIZE_LIMIT) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });

          const base64 = buffer.toString("base64");
          const result = await model.generateContent([
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64,
              },
            },
            PDF_EXTRACT_PROMPT,
          ]);

          const text = result.response.text().trim();
          return NextResponse.json({ textContent: text });
        }
      }

      return NextResponse.json({ textContent: "" });
    }

    // Images — use Gemini vision to OCR
    if (fileType.startsWith("image/")) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("GEMINI_API_KEY is not configured");
        return NextResponse.json({ textContent: "" });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });

      const base64 = buffer.toString("base64");
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: fileType,
            data: base64,
          },
        },
        IMAGE_EXTRACT_PROMPT,
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
