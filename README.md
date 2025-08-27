
# KornDog Records — complete site

This zip contains:
- Public site (`index.html`, `app.js`, `styles.css`) with purple/green gradient, 2×2 hover-flip cards, and modal popups.
- Admin (`/admin/`) to edit JSON and save to UpCloud.
- Netlify Functions: `get-content`, `publish`, `list`.
- `netlify.toml`, `package.json`.

## Environment variables (Netlify → Site settings → Environment)
```
S3_REGION=us-east-1
S3_ENDPOINT=https://jii3i.upcloudobjects.com
S3_BUCKET=korndog-media
S3_FORCE_PATH_STYLE=true
S3_KEY=YOUR_UPCLOUD_ACCESS_KEY
S3_SECRET=YOUR_UPCLOUD_SECRET
PUBLIC_ASSET_BASE_URL=https://jii3i.upcloudobjects.com/korndog-media
```

Deploy, then visit `/admin/`, click **Save to UpCloud** to write `content/live.json`.
The homepage reads it via `/.netlify/functions/get-content`.
