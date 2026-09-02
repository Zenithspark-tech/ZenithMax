# ZenithMax V14 — Smart Social Video Platform

ZenithMax V14 upgrades V12 into a more complete social-video launch candidate while keeping the 156 original demo videos included in the project.

## New in V14

- Smarter recommendation ranking with watch-category affinity, follows, saves, engagement and freshness.
- Recommendation reasons such as “Because you watch sports” and “From a creator you follow”.
- Search suggestions and category discovery.
- Full-screen Shorts with autoplay, swipe/touch navigation, desktop wheel navigation and sound controls.
- Proper watch page with progress tracking, comments, up-next recommendations and creator links.
- Real notification center for likes, follows, comments and messages.
- Direct-message conversations and chat UI.
- Playlists with add/remove video support and playlist playback collections.
- Creator profile editing and creator messaging.
- Creator Studio analytics: views, likes, followers, comments, top videos and category performance.
- Video reporting and an admin moderation overview for the first real registered account.
- Verified badges for starter creators.
- 156 original starter/demo videos across many safe general-audience categories.
- Responsive desktop/mobile layout and PWA manifest.

## Run locally

1. Install Node.js 18 or newer.
2. Open a terminal in this project folder.
3. Run `npm install`.
4. Set a strong `JWT_SECRET` environment variable for any public deployment.
5. Run `npm start`.
6. Open `http://localhost:3000`.

## Render deployment

The project listens on `0.0.0.0` and uses `process.env.PORT`, so it is hosting-friendly. Use `npm install` as the build command and `npm start` as the start command.

The starter demo videos are source assets and are included with the app. Runtime user uploads are stored in `DATA_DIR/uploads`. On hosts with ephemeral filesystems, runtime uploads can disappear after redeploys or restarts. For a real public platform, move uploads to object storage/CDN and move the JSON database to PostgreSQL.

## Production roadmap

For a much larger real-world service, add PostgreSQL, object storage/CDN, video transcoding and thumbnail jobs, email verification/password resets, stronger rate limiting, abuse detection, content moderation workflows, realtime WebSockets, push notifications, backups, audit logs and a dedicated live-video service.

Do not copy or rehost third-party social-media videos without permission. Use creator uploads, licensed content, or official authorized platform integrations.


## V14 — Creator Business Edition
V14 adds a creator-economy architecture: earnings dashboard, demo tips, demo subscriptions, ad campaign creation/activation, ad impression accounting, monetization eligibility, and an earnings ledger. **Demo mode only:** it does not process real money or collect card details. A production launch should integrate a compliant payment provider, database, tax/accounting workflows, fraud prevention, age/guardian requirements where applicable, and proper terms/privacy policies.
