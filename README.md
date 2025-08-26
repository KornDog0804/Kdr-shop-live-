# KDR Site (drop-in)

What this gives you:
- `/admin` lets you paste JSON and saves it to UpCloud as `content/live.json`
- homepage fetches `/content/live.json` and renders hero + sections
- Netlify function `publish` handles writes to your bucket
- `netlify.toml` proxies `/content/*` to your bucket so the site can read without CORS issues

## Netlify env vars (Site → Settings → Environment)
```
S3_ENDPOINT = https://jii3i.upcloudobjects.com
S3_REGION   = us-1
S3_BUCKET   = korndog-media
S3_FORCE_PATH_STYLE = true

S3_KEY    = <UpCloud access key id>
S3_SECRET = <UpCloud secret access key>
```
(If you use `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` that also works.)

## Deploy
1. Upload this folder to your GitHub repo (replace existing files) or drag-drop to a new Netlify site
2. Set the env vars above in Netlify
3. Open `/admin`, click **Save to UpCloud** once to create `content/live.json`
4. Refresh the homepage – your photos appear
