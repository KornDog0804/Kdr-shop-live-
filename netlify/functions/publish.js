// netlify/functions/publish.js
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// Accept any of your variable names:
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
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: String(process.env.S3_FORCE_PATH_STYLE || "true") === "true",
  credentials: { accessKeyId, secretAccessKey },
});

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method not allowed" };
    }

    const body = JSON.parse(event.body || "{}"); // expects { key, data }
    const { key, data } = body;
    if (!key || typeof data === "undefined") {
      return { statusCode: 400, body: "Missing 'key' or 'data' in body" };
    }

    // Write JSON to your UpCloud bucket
    const cmd = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json"
    });
    await s3.send(cmd);

    // Optional public URL to show in the response
    const base =
      process.env.PUBLIC_ASSET_BASE_URL ||
      (process.env.S3_ENDPOINT
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
