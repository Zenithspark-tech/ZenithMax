# ZenithMax V17 — Render deployment guide

## Why the included Render service is paid

ZenithMax now supports durable, resumeable uploads. Render Free web services have an ephemeral filesystem, so local uploads/data are lost when the service restarts, redeploys, or spins down. The included production Blueprint therefore mounts `/var/data` on a paid web service.

## GitHub

Create a repository and push the project contents, including:

- `package.json`
- `server/`
- `client/`
- `render.yaml`
- `.env.example`
- `scripts/extreme-scan.sh`

Do **not** commit real secrets.

## Render

1. Open Render Dashboard.
2. Choose **New → Blueprint** if you want Render to read `render.yaml` automatically, or create a Web Service manually.
3. Connect the GitHub repository.
4. Confirm Node runtime.
5. Build command: `npm install`.
6. Start command: `npm start`.
7. Health check: `/api/health`.
8. Confirm the disk mount is `/var/data`.
9. Confirm `JWT_SECRET` and `REFRESH_SECRET` are generated.
10. Add `PEXELS_API_KEY` when you have your Pexels key.
11. Add `AI_API_URL`, `AI_API_KEY`, and `AI_MODEL` only after choosing your AI provider.
12. Deploy.

## After deployment

Open:

`https://YOUR-SERVICE.onrender.com/api/health`

You should receive JSON showing `ok: true` and the V17 version.

Then open the main site and test, in this order:

1. Register.
2. Reload the browser and confirm the session remains active.
3. Upload a profile photo.
4. Create a short video upload and interrupt it; select the same file again and resume.
5. Publish a video and play it with sound.
6. Follow the creator and confirm the rank/follower count updates.
7. Open Music, save the artist profile, upload a track, and search the external catalog.
8. Send a message with a media attachment.
9. Start a voice/video call and share the generated invite link.
10. Download a media item and verify it appears in the browser/phone Downloads area.
11. Open Zenith AI; with no provider configured it should return the safe offline response, and with a provider configured it should return model-backed responses.

## Production upgrades before a public-scale launch

The V17 package is a strong deployment build, but a global-scale social platform should next move persistent records to PostgreSQL, user media to S3/R2-style object storage, media processing to a background worker, and calls to a TURN-backed WebRTC service. Add a CDN before serving large amounts of video traffic.
