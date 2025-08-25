// netlify/functions/publish.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Accept both your names (S3_KEY/S3_SECRET) and the canonical AWS names
const accessKeyId =
  process.env.S3_ACCESS_KEY_ID ||
  process.env.S3_KEY ||
  process.env.AWS_ACCESS_KEY_ID;

const secretAccessKey =
  process.env.S3_SECRET_ACCESS_KEY ||
  process.env.S3_SECRET ||
  process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT, // e.g. https://jii3i.upcloudobjects.com
  // default to true; only turn off if you explicitly set "false"
  forcePathStyle:
    (process.env.S3_FORCE_PATH_STYLE ?? "true").toString().toLowerCase() !== "false",
  credentials: { accessKeyId, secretAccessKey },
});

// Build a public URL base to return (optional, but nice)
const PUBLIC_BASE =
  process.env.PUBLIC_ASSET_BASE_URL ||
  (process.env.S3_ENDPOINT
    ? `${process.env.S3_ENDPOINT.replace(/\/$/, "")}/${process.env.S3_BUCKET}`
    : undefined);

export default async
