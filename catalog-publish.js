
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const client = new S3Client({
  region: "us-east-1",
  endpoint: `https://${process.env.S3_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "POST only" };
  }
  try {
    const body = event.body || "{}";
    const Key = "catalog.json";

    await client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key,
      Body: body,
      ContentType: "application/json",
      ACL: "public-read",
    }));

    const url = `https://${process.env.S3_BUCKET}.${process.env.S3_ENDPOINT}/${Key}`;
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, url }) };
  } catch (e) {
    return { statusCode: 500, body: e.toString() };
  }
};
