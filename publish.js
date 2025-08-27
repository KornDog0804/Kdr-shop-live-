
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const accessKeyId =
  process.env.S3_ACCESS_KEY_ID || process.env.S3_KEY || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey =
  process.env.S3_SECRET_ACCESS_KEY || process.env.S3_SECRET || process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: String(process.env.S3_FORCE_PATH_STYLE||"true")!=="false",
  credentials: { accessKeyId, secretAccessKey }
});
const BUCKET = process.env.S3_BUCKET;

export default async (req) => {
  try{
    if(req.method!=='POST') return new Response('Method not allowed', {status:405});
    const { key='content/live.json', data } = await req.json();
    if(!data) return new Response('Missing data', {status:400});
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET, Key: key,
      Body: JSON.stringify(data,null,2),
      ContentType: 'application/json', CacheControl: 'no-cache'
    }));
    const base = process.env.PUBLIC_ASSET_BASE_URL || `${process.env.S3_ENDPOINT.replace(/\/$/,'')}/${BUCKET}`;
    return Response.json({ ok:true, key, url: `${base}/${key}` });
  }catch(e){ return new Response(JSON.stringify({ ok:false, error: e.message }), {status:500}); }
}
