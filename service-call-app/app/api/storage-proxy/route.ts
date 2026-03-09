import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

if (getApps().length === 0) {
  initializeApp({
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export async function GET(req: NextRequest) {
  const storagePath = req.nextUrl.searchParams.get("path");
  if (!storagePath) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  try {
    const bucket = getStorage().bucket();
    const file = bucket.file(storagePath);
    const [buffer] = await file.download();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Storage proxy error:", err);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
