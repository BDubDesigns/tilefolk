# Tilefolk Deployment

Tilefolk's first deployment target is Coolify on the existing Hetzner VPS.

The production app runs as one Node/Express container:

```txt
https://tf.qcfailed.com/              -> built React client
https://tf.qcfailed.com/api/health    -> Express API
https://tf.qcfailed.com/api/...       -> Express API routes
```

This keeps the client and API on the same origin, so the existing `fetch('/api/...')` calls work without a separate API domain or CORS setup.

## DNS

Use Cloudflare to point:

```txt
tf.qcfailed.com
```

at the Coolify/Hetzner server.

Do not create `api.tf.qcfailed.com` for the first deployment. A separate API domain can come later if the client and API become separate services.

## Coolify App Settings

Use the repository as a Dockerfile app.

```txt
Build Pack: Dockerfile
Base Directory: /
Dockerfile: ./Dockerfile
Port: 4000
Domain: https://tf.qcfailed.com
```

The Dockerfile installs workspace dependencies, builds shared/client/server, prunes dev dependencies, and starts:

```bash
npm run start -w apps/server
```

## Required Environment Variables

Set these in Coolify, not in the client and not in GitHub.

```txt
NODE_ENV=production
PORT=4000

TILEFOLK_ADMIN_TOKEN=<secret admin token>
TILEFOLK_DEFAULT_CONTROLLER=deterministic
TILEFOLK_USE_SAMPLE_CONTROLLER_ASSIGNMENTS=false

CEREBRAS_API_KEY=<secret key>
CEREBRAS_MODEL=gpt-oss-120b

OPENCODE_GO_API_KEY=
OPENCODE_GO_MODEL=deepseek-v4-flash

GOOGLE_AI_API_KEY=
GOOGLE_AI_MODEL=gemma-4-26b-a4b-it

OPENROUTER_API_KEY=
OPENROUTER_MODEL=poolside/laguna-xs.2:free
```

For the first public deploy, a conservative setup is:

```txt
TILEFOLK_DEFAULT_CONTROLLER=deterministic
TILEFOLK_USE_SAMPLE_CONTROLLER_ASSIGNMENTS=false
```

After the page is reachable and protected actions work, switch to sample assignments if you want live LLM-controlled NPCs:

```txt
TILEFOLK_USE_SAMPLE_CONTROLLER_ASSIGNMENTS=true
```

## Local Production Check

Before deploying, verify the production shape locally:

```bash
npm run build
npm run start -w apps/server
```

Then open:

```txt
http://localhost:4000
http://localhost:4000/api/health
```

Expected:

- `/` serves the React app.
- `/api/health` returns JSON.
- `/api/worlds/default` returns world JSON.
- Step and Reset require the admin token when `TILEFOLK_ADMIN_TOKEN` is configured.

## Docker Check

Build the image:

```bash
docker build -t tilefolk:deployment-prep .
```

Run it locally:

```bash
docker run --rm -p 4001:4000 tilefolk:deployment-prep
```

Then check:

```txt
http://localhost:4001
http://localhost:4001/api/health
```

## Smoke Test After Deploy

After Coolify deploys:

1. Visit `https://tf.qcfailed.com`.
2. Confirm the world loads for a public visitor.
3. Confirm `https://tf.qcfailed.com/api/health` returns `{ "status": "ok" }`.
4. Try Step without an admin token and confirm it is rejected.
5. Enter the admin token in the UI.
6. Confirm Step works.
7. Confirm Reset works.
8. If sample assignments are enabled, confirm event log controller labels include the expected provider/model.

## Notes

- API keys must stay server-side in Coolify env vars.
- Do not add provider keys to Vite env vars.
- The current world is in memory, so redeploying or restarting the container resets it.
- Persistence should be a later deployment-hardening slice.
