import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function buildPublicUrl(bucket: string, region: string, key: string) {
  const customBase = process.env.S3_PUBLIC_BASE_URL;
  if (customBase) {
    return `${customBase.replace(/\/$/, "")}/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function createClient() {
  return new S3Client({
    region: requiredEnv("AWS_REGION"),
    credentials: {
      accessKeyId: requiredEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("AWS_SECRET_ACCESS_KEY"),
    },
  });
}

/**
 * Upload a file — tries providers in order:
 * 1. AWS S3 (if AWS_S3_BUCKET + credentials are set)
 * 2. Vercel Blob (if BLOB_READ_WRITE_TOKEN is set — auto-set by Vercel Blob Store)
 * 3. Local filesystem fallback (only works in dev, NOT on Vercel production)
 */
export async function uploadFileToS3(file: File, folder: string) {
  const safeName = `${Date.now()}-${sanitizeFilename(file.name)}`;
  const normalizedFolder = folder.replace(/^\/+|\/+$/g, "");
  const body = Buffer.from(await file.arrayBuffer());

  // ── 1. AWS S3 ──
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  if (bucket && region && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    const key = `${normalizedFolder}/${safeName}`;
    const s3 = createClient();
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: file.type || "application/octet-stream",
      }),
    );
    return buildPublicUrl(bucket, region, key);
  }

  // ── 2. Vercel Blob ──
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blobPath = `${normalizedFolder}/${safeName}`;
    const blob = await put(blobPath, body, {
      access: "public",
      contentType: file.type || "application/octet-stream",
    });
    return blob.url;
  }

  // ── 3. Local filesystem fallback (dev only) ──
  const uploadDir = path.join(process.cwd(), "public", "uploads", normalizedFolder);
  await mkdir(uploadDir, { recursive: true });
  const fullPath = path.join(uploadDir, safeName);
  await writeFile(fullPath, body);
  return `/uploads/${normalizedFolder}/${safeName}`;
}
