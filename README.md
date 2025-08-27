
# KDR Ultimate Mega — 2025-08-24

Everything you asked for, in one deployable folder.

## Features
- Purple→green home theme; 2×2 flip cards; image modal.
- Kitty toast bottom-left (Chibi for Funkos, Zombie for Records) with 10 blurbs each.
- Ozzy card links to `/collectables/` (red/yellow theme page).
- About page (pink/green) with both kitties and a hidden `.` link to `/admin`.
- Admin with password prompt (`fuckthehackers1!`), JSON editor, UpCloud Library, live preview.
- Netlify Functions: `publish`, `get-content`, `list`, `paypal-config`.
- Cart with Clear button + discount tiers (10% ≥ $120, 15% ≥ $200).
- Inventory: items with `trackInventory:true` and `stock` reduce on PayPal success; out-of-stock are hidden/marked SOLD; Random Records & Mystery Funkos do not sell out.
- UpCloud S3-compatible storage for content; no CORS problems (functions proxy).

## Environment variables (Netlify → Site settings → Environment)
```
S3_ENDPOINT=https://jii3i.upcloudobjects.com
S3_BUCKET=korndog-media
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true
S3_ACCESS_KEY_ID=YOUR_UPCLOUD_ACCESS_KEY
S3_SECRET_ACCESS_KEY=YOUR_UPCLOUD_SECRET
PUBLIC_ASSET_BASE_URL=https://jii3i.upcloudobjects.com/korndog-media

PAYPAL_CLIENT_ID=YOUR_PAYPAL_LIVE_CLIENT_ID
PAYPAL_CURRENCY=USD
```
Deploy, visit `/admin`, edit/Save JSON, and the homepage/collectables will reflect it.
