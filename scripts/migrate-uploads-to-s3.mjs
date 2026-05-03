/**
 * Migrate local /uploads/* files → AWS S3 and update DB paths.
 *
 * Usage:  node scripts/migrate-uploads-to-s3.mjs
 *
 * Requires env: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET, DATABASE_URL
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { lookup } from "mime-types";
import { config } from "dotenv";

config({ path: ".env.local" });

const BUCKET = process.env.AWS_S3_BUCKET || "hubify";
const REGION = process.env.AWS_REGION || "eu-north-1";
const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const prisma = new PrismaClient();

async function walkDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await walkDir(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

function localPathToKey(absPath) {
  // e.g. /home/.../public/uploads/products/123-file.jpg → products/123-file.jpg
  const rel = path.relative(UPLOAD_ROOT, absPath);
  return rel.split(path.sep).join("/"); // normalize to forward slash
}

function buildPublicUrl(key) {
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

async function main() {
  console.log("📦 Scanning", UPLOAD_ROOT);

  let files;
  try {
    files = await walkDir(UPLOAD_ROOT);
  } catch (e) {
    console.error("Upload directory not found:", UPLOAD_ROOT);
    process.exit(1);
  }

  console.log(`   Found ${files.length} files to migrate.\n`);

  const pathMap = new Map(); // old local path → new S3 URL

  for (const absPath of files) {
    const key = localPathToKey(absPath);
    const localUrl = `/uploads/${key}`;
    const s3Url = buildPublicUrl(key);

    const body = await readFile(absPath);
    const contentType = lookup(absPath) || "application/octet-stream";

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: body,
          ContentType: contentType,
        })
      );
      pathMap.set(localUrl, s3Url);
      console.log(`  ✅ ${localUrl} → ${s3Url}`);
    } catch (err) {
      console.error(`  ❌ FAILED: ${localUrl}`, err.message);
    }
  }

  // --- Update DB records ---
  console.log("\n🔄 Updating database records...\n");

  // 1. Document.fileUrl
  const docs = await prisma.document.findMany({
    where: { fileUrl: { startsWith: "/uploads/" } },
    select: { id: true, fileUrl: true },
  });

  for (const doc of docs) {
    const newUrl = pathMap.get(doc.fileUrl);
    if (newUrl) {
      await prisma.document.update({
        where: { id: doc.id },
        data: { fileUrl: newUrl },
      });
      console.log(`  📄 Document ${doc.id}: ${doc.fileUrl} → ${newUrl}`);
    }
  }

  // 2. TradeRequest.productImage
  const trades = await prisma.tradeRequest.findMany({
    where: { productImage: { startsWith: "/uploads/" } },
    select: { id: true, productImage: true },
  });

  for (const t of trades) {
    const newUrl = pathMap.get(t.productImage);
    if (newUrl) {
      await prisma.tradeRequest.update({
        where: { id: t.id },
        data: { productImage: newUrl },
      });
      console.log(`  🖼️  TradeRequest ${t.id}: ${t.productImage} → ${newUrl}`);
    }
  }

  console.log(
    `\n🎉 Done! Migrated ${pathMap.size}/${files.length} files, updated ${docs.length + trades.length} DB records.`
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
