KornDog Records — v3.2 (UpCloud Live Publish)
============================================

WHAT THIS IS
------------
Your full site with:
- 2×2 mobile grid, kitty toasts, clear cart, locked discounts (10% @ $120+, 15% @ $200+)
- Admin inline edits
- Uploads to UpCloud via Netlify functions
- "Publish Live" button writes catalog.json to your UpCloud bucket
- Storefront hydrates from that catalog.json on load

WHAT YOU MUST SET (Netlify → Environment variables)
---------------------------------------------------
S3_ENDPOINT=nyc1.upcloudobjects.com
S3_BUCKET=kdr-live
S3_ACCESS_KEY_ID=<your key>
S3_SECRET_ACCESS_KEY=<your secret>

UPCloud bucket must have CORS allowing GET/PUT from your domain and Netlify app.

DEPLOY
------
1) Put this folder in a GitHub repo (or drag to a new repo in GitHub).
2) Connect the repo to Netlify.
3) Add the 4 env vars above.
4) Deploy site.
5) Go to #/admin → unlock → upload images (file inputs) → Save Item → Publish Live.

Front-end fetches https://kdr-live.nyc1.upcloudobjects.com/catalog.json and shows your latest.
