
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

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
    const r = await s3.send(new ListObjectsV2Command({ Bucket: process.env.S3_BUCKET }));
    const base = process.env.PUBLIC_ASSET_BASE_URL || (process.env.S3_ENDPOINT ? `${process.env.S3_ENDPOINT.replace(/\/$/,'')}/${process.env.S3_BUCKET}` : undefined);
    const objects = (r.Contents || []).map(o => base ? `${base}/${encodeURIComponent(o.Key)}` : o.Key);
    return new Response(JSON.stringify({ objects }), { status:200, headers: { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" } });
  }catch(err){
    return new Response(JSON.stringify({ error: err.message }), { status:500, headers: { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" } });
  }
};
