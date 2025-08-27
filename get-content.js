
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

function streamToString(stream){
  return new Promise((res,rej)=>{
    const c=[]; stream.on('data',d=>c.push(Buffer.from(d))); stream.on('error',rej); stream.on('end',()=>res(Buffer.concat(c).toString('utf8')));
  });
}
export default async (req)=>{
  try{
    const u=new URL(req.url); const key=u.searchParams.get('key')||'content/live.json';
    const obj=await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const txt=await streamToString(obj.Body);
    return new Response(txt, { headers:{'content-type':'application/json'} });
  }catch(e){
    return new Response(JSON.stringify({ hero:{}, sections:[] }), { headers:{'content-type':'application/json'} });
  }
}
