# ZenithMax V9 — Launch candidate

V9 includes V7 + V8 plus:
- Trending/discovery ranking
- Content reporting endpoint
- Admin overview endpoint
- Admin creator promotion endpoint
- PWA manifest
- Hosting-friendly PORT/DATA_DIR configuration
- Persistent local upload storage support

## Local run
npm install
npm start
Open http://localhost:3000

The first account registered becomes the local admin account.

## Public launch
This project can be deployed as a Node/Express Web Service. Set:
JWT_SECRET=<long-random-secret>
DATA_DIR=/var/data

If using Render with a persistent disk, mount the disk at `/var/data`. Render documents that normal service filesystems are ephemeral and that persistent disks preserve filesystem changes across restarts/deploys. See the deployment notes supplied with this project.

## Production upgrades still recommended before a large public audience
- PostgreSQL for core data
- Object storage + CDN for videos
- Video transcoding and thumbnails
- Rate limiting, CSRF protection where applicable, stronger validation
- Automated content moderation and reporting workflows
- Email verification/password reset
- Realtime messaging/live infrastructure
- Backups, monitoring and abuse prevention
