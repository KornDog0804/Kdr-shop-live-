
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.S3_KEY || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.S3_SECRET || process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "false" ? false : true,
  credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
});

export default async (req, ctx) => {
  try{
    if(req.method !== "POST"){
      return new Response("Method not allowed", { status:405 });
    }
    const { key = "content/live.json", data } = await req.json();
    if(!data) return new Response("Missing 'data' in body", { status:400 });

    const cmd = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json"
    });
    await s3.send(cmd);

    const base = process.env.PUBLIC_ASSET_BASE_URL || (process.env.S3_ENDPOINT ? `${process.env.S3_ENDPOINT.replace(/\/$/,'')}/${process.env.S3_BUCKET}` : undefined);
    const url = base ? `${base}/${key}` : undefined;

    return new Response(JSON.stringify({ ok:true, key, url }), { status:200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin":"*" } });
  }catch(err){
    return new Response(JSON.stringify({ error: err.message || "Publish failed" }), { status:500, headers: { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" } });
  }
};
