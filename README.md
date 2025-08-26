# Netlify → UpCloud (S3-compatible) JSON Publisher

Drop-in starter to upload JSON into an S3-compatible bucket (UpCloud) from a Netlify Function.

## What’s inside
- `netlify/functions/publish.js` – uploads a JSON body to your bucket
- `publish-admin/` – a simple page at `/publish-admin/` to test the function
- `netlify.toml` – points Netlify at the functions directory
- `package.json` – installs `@aws-sdk/client-s3`

## Required environment variables (Netlify → Site settings → Environment variables)
- `S3_BUCKET` – e.g. `korndog-media`
- `S3_ENDPOINT` – e.g. `https://jii3i.upcloudobjects.com`
- `S3_REGION` – any string, e.g. `us-east-1`
- `S3_FORCE_PATH_STYLE` – `true`
- One of these credential pairs (any naming works):
  - `S3_ACCESS_KEY_ID` + `S3_SECRET_ACCESS_KEY`
  - `S3_KEY` + `S3_SECRET`
  - `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`
- (optional) `PUBLIC_ASSET_BASE_URL` – e.g. `https://jii3i.upcloudobjects.com/korndog-media` to get a public URL back

## Test locally on your deployed site
1. Push this folder to GitHub and deploy on Netlify.
2. Visit `https://YOURDOMAIN/publish-admin/` and click the button. It should create `content/healthcheck.json` in your bucket.
