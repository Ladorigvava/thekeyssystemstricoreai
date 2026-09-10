# Deploy the Tri-Core workspace

Use a Node/Docker host with HTTPS and a persistent disk, running one app process. The SQLite implementation is not suitable for stateless serverless functions or several replicas sharing a file.

## Prepare

1. Run `npm ci` and `npm run verify`.
2. Configure `.env` privately using `.env.example`. Supply fresh provider credentials, a strong `APP_ACCESS_PASSWORD` of at least 16 characters, and `APP_ORIGIN` equal to the app's exact HTTPS origin (no path).
3. Keep `DATABASE_PATH` on a persistent volume. Save an online SQLite backup before upgrades. The startup schema creation is additive.

## Docker

```bash
docker compose up --build -d
```

The compose file binds port 3000 to host loopback. Point an existing HTTPS reverse proxy at `127.0.0.1:3000`, preserve the Host header, disable response buffering for `/api/ai`, and allow at least 180 seconds for streaming requests. Set `TRUST_PROXY=1` only when exactly one trusted proxy removes untrusted forwarded headers. Set `APP_ORIGIN` to the external origin before starting. Do not place credentials in image build arguments or client-prefixed environment variables.

## Plain Node

```bash
npm ci
npm run build
NODE_ENV=production npm start
```

Use your process manager to restart on failure and terminate with SIGTERM. `HOST` defaults to loopback. Configure a protected proxy before binding to a public interface. Production startup refuses missing authentication or an invalid HTTPS origin.

## Acceptance checks

- `/api/health` returns `status: ok`.
- The sign-in page appears, and protected API endpoints return 401 before sign-in.
- Run a harmless prompt once through all three cores. Confirm text, the actual provider/model, response identifiers, and three completed statuses.
- Reload and reopen history; confirm the saved input and outputs. Restart the server and verify again.
- Test an unavailable provider: the other cores finish and the run is marked partial.
- Confirm external requests are limited to the chosen providers and server keys are absent from downloaded assets.

## Operations

Sessions expire after 12 hours. The default owner request limit is 60 per minute and eight concurrent requests. Provider limits and charges still apply. No automatic model fallback or automatic retry of a failed AI request is enabled; this keeps routing and billing explicit. The idempotency key prevents duplicate execution of the same submitted request.

Use a filesystem permission of 0700 for the database directory. Back up the entire owner data store securely and set your retention policy. The UI keeps at most 200 entries in each newly repaired history flow. The API run log requires an operator retention policy; it is not pruned automatically.

## Existing hosting

GitHub Pages serves static assets and cannot host this backend. The old Pages deployment, Heroku instructions with browser-exposed keys, and the former Vercel static configuration are superseded. Standard Heroku dyno storage is ephemeral; do not put this database there without adapting the storage layer to a durable database. Vercel deployment likewise requires a durable database adapter before enabling it.

This change does not provision a cloud resource, open billing, replace your domain, or deploy to an unidentified host.
