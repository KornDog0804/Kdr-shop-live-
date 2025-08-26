// netlify/functions/publish.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Accept multiple variable name styles so you don't get stuck on naming
const accessKeyId =
  process.env.S3_ACCESS_KEY_ID ||
  process.env.S3_KEY ||
  process.env.AWS_ACCESS_KEY_ID;

const secretAccessKey =
  process.env.S3_SECRET_ACCESS_KEY ||
  process.env.S3_SECRET ||
  process.env.AWS_SECRET_ACCESS_KEY;

// Build the S3 client (UpCloud is S3 compatible)
const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT, // e.g. https://jii3i.upcloudobjects.com
  // UpCloud prefers path-style; default to true unless explicitly "false"
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "false" ? false : true,
  credentials:
    accessKeyId && secretAccessKey
      ? { accessKeyId, secretAccessKey }
      : undefined,
});

const jsonResponse = (obj, init = {}) =>
  new Response(JSON.stringify(obj, null, 2), {
    headers: { "content-type": "application/json" },
    ...init,
  });

export default async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { key, data } = await req.json().catch(() => ({}));
    const Bucket = process.env.S3_BUCKET;
    if (!Bucket) {
      return jsonResponse({ ok: false, error: "Missing S3_BUCKET env var" }, { status: 500 });
    }
    const Key = key || "content/healthcheck.json";
    const Body = JSON.stringify(
      data ?? { ok: true, at: new Date().toISOString() },
      null,
      2
    );

    const cmd = new PutObjectCommand({
      Bucket,
      Key,
      Body,
      ContentType: "application/json",
    });

    await s3.send(cmd);

    const base =
      process.env.PUBLIC_ASSET_BASE_URL ||
      (process.env.S3_ENDPOINT
        ? `${process.env.S3_ENDPOINT.replace(/\/$/, "")}/${Bucket}`
        : undefined);

    const url = base ? `${base}/${Key}` : undefined;

    return jsonResponse({ ok: true, bucket: Bucket, key: Key, url });
  } catch (err) {
    return jsonResponse(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
};
