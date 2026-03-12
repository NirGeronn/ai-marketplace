import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { randomUUID } from "crypto";
import path from "path";
import { uploadFile } from "@/lib/storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "text/csv",
  "text/plain",
]);

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const results = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File "${file.name}" exceeds 10MB limit` },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `File type "${file.type}" is not allowed` },
        { status: 400 },
      );
    }

    const ext = path.extname(file.name);
    const uniqueName = `${randomUUID()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { storagePath, url } = await uploadFile(buffer, uniqueName);

    results.push({
      filename: file.name,
      storagePath,
      url,
      mimeType: file.type,
      size: file.size,
    });
  }

  return NextResponse.json(results);
}
