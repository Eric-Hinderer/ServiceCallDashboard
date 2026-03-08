import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_PDF_SIZE_LIMIT = 15 * 1024 * 1024;
const MAX_TEXT_LENGTH = 50000;

const PDF_EXTRACT_PROMPT =
  "Extract ALL text content from this PDF. Include every product name, price, model number, description, and any other text visible across all pages. Return only the raw text, no formatting or commentary.";

const IMAGE_EXTRACT_PROMPT =
  "Extract ALL text content from this image. Include every product name, price, model number, and any other text visible. Return only the raw text, no formatting or commentary.";

function cleanText(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/--\s*\d+\s+of\s+\d+\s*--/g, "") // strip page separators
    .replace(/\n{3,}/g, "\n\n") // collapse excessive newlines
    .trim()
    .slice(0, MAX_TEXT_LENGTH);
}

async function extractWithGemini(
  mimeType: string,
  buffer: Buffer,
  prompt: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-04-17",
  });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: buffer.toString("base64"),
      },
    },
    prompt,
  ]);

  return cleanText(result.response.text() || "");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        { textContent: "", error: "No valid file received" },
        { status: 400 }
      );
    }

    const file = fileEntry;
    const buffer = Buffer.from(await file.arrayBuffer());

    const fileName = file.name || "";
    const fileType = file.type || "";
    const lowerName = fileName.toLowerCase();

    const isText =
      fileType === "text/csv" ||
      fileType.startsWith("text/") ||
      lowerName.endsWith(".csv") ||
      lowerName.endsWith(".txt");

    const isPdf =
      fileType === "application/pdf" || lowerName.endsWith(".pdf");

    const isImage =
      fileType.startsWith("image/") ||
      lowerName.endsWith(".png") ||
      lowerName.endsWith(".jpg") ||
      lowerName.endsWith(".jpeg") ||
      lowerName.endsWith(".webp");

    if (isText) {
      return NextResponse.json({
        textContent: cleanText(buffer.toString("utf-8")),
      });
    }

    if (isPdf) {
      try {
        const { extractText } = await import("unpdf");
        const parsed = await extractText(buffer, { mergePages: true });
        const pdfText = cleanText(parsed.text || "");

        if (pdfText) {
          return NextResponse.json({ textContent: pdfText });
        }
      } catch (err) {
        console.error("unpdf extraction failed, falling back to Gemini:", err);
      }

      if (buffer.length <= GEMINI_PDF_SIZE_LIMIT) {
        try {
          const text = await extractWithGemini(
            "application/pdf",
            buffer,
            PDF_EXTRACT_PROMPT
          );

          return NextResponse.json({ textContent: text });
        } catch (err) {
          console.error("Gemini PDF extraction failed:", err);
          return NextResponse.json(
            { textContent: "", error: "Gemini PDF extraction failed" },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({
        textContent: "",
        error: "PDF has no extractable text and is too large for Gemini inline fallback",
      });
    }

    if (isImage) {
      try {
        const mimeType = fileType || "image/jpeg";
        const text = await extractWithGemini(
          mimeType,
          buffer,
          IMAGE_EXTRACT_PROMPT
        );

        return NextResponse.json({ textContent: text });
      } catch (err) {
        console.error("Gemini image OCR failed:", err);
        return NextResponse.json(
          { textContent: "", error: "Gemini image OCR failed" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      textContent: "",
      error: `Unsupported extraction type: ${fileType || lowerName || "unknown"}`,
    });
  } catch (error) {
    console.error("Extract text error:", error);
    return NextResponse.json(
      { textContent: "", error: "Unhandled server error" },
      { status: 500 }
    );
  }
}