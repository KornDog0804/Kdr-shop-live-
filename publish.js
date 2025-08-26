import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accessKeyId =
  process.env.S3_ACCESS_KEY_ID ||
  process.env.S3_KEY ||
  process.env.AWS_ACCESS_KEY_ID;

const secretAccessKey =
  process.env.S3_SECRET_ACCESS_KEY ||
  process.env.S3_SECRET ||
  process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: String(process.env.S3_FORCE_PATH_STYLE || "true").toLowerCase() !== "false",
  credentials: { accessKeyId, secretAccessKey },
});

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method not allowed" };
    }
    const body = JSON.parse(event.body || "{}");
    const key = body.key || "content/live.json";
    const data = body.data;
    if (typeof data === "undefined") {
      return { statusCode: 400, body: "Missing 'data' in request body" };
    }

    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json",
    }));

    const base = process.env.PUBLIC_ASSET_BASE_URL ||
      (process.env.S3_ENDPOINT && process.env.S3_BUCKET
        ? `${process.env.S3_ENDPOINT.replace(/\/$/, "")}/${process.env.S3_BUCKET}`
        : undefined);

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: true, key, url: base ? `${base}/${key}` : undefined })
    };
  } catch (err) {
    return { statusCode: 500, body: err?.message || "publish failed" };
  }
};
