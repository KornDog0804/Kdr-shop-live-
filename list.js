
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

export default async ()=>{
  try{
    const out=await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, MaxKeys: 1000 }));
    const base=process.env.PUBLIC_ASSET_BASE_URL || `${process.env.S3_ENDPOINT.replace(/\/$/,'')}/${BUCKET}`;
    const files=(out.Contents||[]).filter(x=>x.Key && !x.Key.endsWith('/')).map(x=>({ key:x.Key, url:`${base}/${encodeURIComponent(x.Key)}` }));
    return Response.json({ ok:true, files });
  }catch(e){ return new Response(JSON.stringify({ ok:false, error:e.message }), {status:500}); }
}
