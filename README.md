# Korndog – Simple Git‑based Admin (Decap CMS)

This adds a zero‑backend admin at `/admin` that edits two JSON files in your repo:
- `content/hero.json`
- `content/records.json`

Uploaded images are committed to `static/uploads/`.

## Quick install on Netlify
1) Commit the `admin/`, `content/`, and `static/uploads/` folders to the root of your repo.  
   (Optional: keep `index.html`, `app.js`, `styles.css` if you want the demo page.)

2) In Netlify:
   - **Site settings → Identity → Enable Identity** (registration: *Invite only*).
   - **Identity → Services → Enable Git Gateway**.
   - **Identity → Users → Invite user** (your email). Accept the invite.

3) Visit `/admin`, log in, and edit content. Saving creates a Git commit → Netlify redeploys.

### Where images go
- The CMS saves images to `static/uploads` and uses `/static/uploads/...` paths in JSON.
- Your frontend should use those paths directly.

### Demo page
If you keep `index.html` + `app.js` + `styles.css`, the homepage will render the hero and inventory from the JSON files. You can also delete them and use your own site—just fetch:
```
/content/hero.json
/content/records.json
```

## Notes
- Backend is `git-gateway` so you don’t need any API keys.
- Branch assumed: `main`. If your default branch is different, update `admin/config.yml`.