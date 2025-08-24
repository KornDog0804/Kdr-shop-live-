
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const client = new S3Client({
  region: "us-east-1",
  endpoint: `https://${process.env.S3_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false, // virtual-hosted-style
});

exports.handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    const filename = (params.filename || `upload-${Date.now()}.bin`).replace(/\s+/g, "_");
    const contentType = params.contentType || "application/octet-stream";
    const Key = `uploads/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key,
      ContentType: contentType,
      ACL: "public-read",
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });
    const fileUrl = `https://${process.env.S3_BUCKET}.${process.env.S3_ENDPOINT}/${Key}`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadUrl, fileUrl }),
    };
  } catch (e) {
    return { statusCode: 500, body: e.toString() };
  }
};
