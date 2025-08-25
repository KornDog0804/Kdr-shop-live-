// netlify/functions/publish.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.S3_REGION,                   // e.g. "us-1"
  endpoint: process.env.S3_ENDPOINT,               // e.g. "https://jii3i.upcloudobjects.com"
  forcePathStyle: true,                            // required for UpCloud
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

// POST { key: "content/live.json", data: {...any json...} }
export default async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { key = "content/live.json", data } = await req.json();
    if (typeof data === "undefined") {
      return new Response("Missing 'data' in JSON body", { status: 400 });
    }

    // Write JSON to the bucket
    const cmd = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,               // "korndog-media"
      Key: key,                                    // e.g. "content/live.json"
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json",
      // CacheControl: "public, max-age=60",        // optional
    });

    await s3.send(cmd);

    const base =
      process.env.PUBLIC_ASSET_BASE_URL ||
      `${process.env.S3_ENDPOINT.replace(/\/$/, "")}/${process.env.S3_BUCKET}`;

    return Response.json({ ok: true, key, url: `${base}/${key}` });
  } catch (err) {
    return new Response(err?.message || "publish error", { status: 500 });
  }
};
