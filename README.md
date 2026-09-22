# ZenithMax V17

ZenithMax V17 is the upgraded full-stack ZenithMax project built from the uploaded V13/V16-era codebase.

## What changed

- Persistent sign-in sessions with a short access token plus a long refresh token.
- User profile photos with avatar upload and public creator avatars.
- Automatic follower rank calculation: Beginners, Start, Entrance, Big, Bronze, Silver, Gold, Kings, Lords.
- Resumeable video uploads in 2 MB chunks. Interrupted uploads keep their byte offset and can continue when the same file is selected again.
- Starter demo videos now contain audio streams. The bundled clips are starter/demo media, while real external stock-video discovery is available through the Pexels API adapter.
- Music page with artist profile, track upload, album metadata, cover art, and international song discovery through the iTunes Search API. External commercial tracks are not copied into the server.
- Chat with text/image/video/audio attachments.
- WebRTC voice/video call UI with WebSocket signaling, including multi-peer rooms up to the configured client limit. A production deployment should add a TURN server.
- Zenith AI page with a server-side OpenAI-compatible provider connector. No API key is shipped in the repo.
- Browser download center that remembers downloaded items. A browser cannot silently choose an arbitrary OS file-system path; the browser/phone controls the real Downloads folder.
- Public developer page with privacy-safe developer information.
- Security hardening via Helmet and compression.
- Render production config with a persistent disk for durable local uploads/data.
- `/api/health` health check and Render Blueprint config.

## Important production architecture note

The current V17 package uses local storage under `DATA_DIR`. For reliable production uploads on Render, the included `render.yaml` uses a paid Render web service with a persistent disk mounted at `/var/data`. Free Render web services use an ephemeral filesystem, so uploaded files and local JSON data can disappear after restarts/redeploys/spin-downs.

For a large-scale ZenithMax, the next architecture step is PostgreSQL + object storage/CDN + a background media-processing service. The current upload API is deliberately chunked so it can later be moved behind object storage without changing the creator UI.

## Environment variables

Required in production:

- `JWT_SECRET`
- `REFRESH_SECRET`
- `DATA_DIR=/var/data`

Optional:

- `PEXELS_API_KEY` for live real stock video discovery.
- `AI_API_URL`, `AI_API_KEY`, `AI_MODEL` for live Zenith AI responses.
- `UPLOAD_CHUNK_SIZE` to change the default chunk size.

Never put AI/provider secrets in browser code or commit them to GitHub.

## Local run

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Render deployment

1. Push this project folder to a GitHub repository.
2. In Render, create **New → Blueprint** or **New → Web Service** and connect the repository.
3. Use the included `render.yaml`, which starts `npm start`, uses `/api/health`, and mounts the persistent disk at `/var/data`.
4. Confirm the generated `JWT_SECRET` and `REFRESH_SECRET` values exist.
5. Add `PEXELS_API_KEY` if you want the Discover page to show real stock videos.
6. Add the AI provider variables when you are ready for live model-backed Zenith AI.
7. Deploy and open the generated `onrender.com` URL.

## Music rights

Do not copy commercial songs from YouTube Music, Spotify, Audiomack, or other services into ZenithMax without the rights to distribute them. V17 uses external catalog discovery and short promotional previews where the provider permits them, and gives creators a path to upload music they own or have permission to publish.

## Android Studio / Google Play next

The recommended Android packaging approach is a native Android Studio shell around the HTTPS ZenithMax web app, with file chooser support, downloads, microphone/camera permissions, and WebView deep-link handling. The Play submission must target the API level currently required by Google Play at submission time; as of August 31, 2026, new apps and updates are required to target Android 16 / API 36 or higher.

## Validation

Run:

```bash
./scripts/extreme-scan.sh
```

The V17 validator runs 34 in-process JavaScript parse passes, then validates the main JSON/config files and shell script syntax. The bundle also includes 156 starter MP4s, and the final media audit confirmed an audio stream in all 156.
