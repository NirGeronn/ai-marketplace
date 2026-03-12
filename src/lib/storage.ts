import { writeFile, mkdir } from "fs/promises";
import path from "path";

type UploadResult = {
  storagePath: string;
  url: string;
};

export async function uploadFile(
  buffer: Buffer,
  filename: string,
): Promise<UploadResult> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return {
    storagePath: `uploads/${filename}`,
    url: `/uploads/${filename}`,
  };
}
