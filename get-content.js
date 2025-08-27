
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.S3_KEY || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.S3_SECRET || process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "false" ? false : true,
  credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
});

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

export default async (req, ctx) => {
  try{
    const url = new URL(req.url);
    const key = url.searchParams.get("key") || "content/live.json";

    const out = await s3.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    const body = await streamToString(out.Body);
    const json = JSON.parse(body);

    return new Response(JSON.stringify(json), { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin":"*" } });
  }catch(err){
    return new Response(JSON.stringify({ error: err.message || "Failed to get content" }), { status: 500, headers: { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" } });
  }
};
