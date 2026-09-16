# Vision orchestration and data boundary

## Runtime flow

1. The browser runs the local ONNX ViT companion and the deterministic CABI rules where possible.
2. If cloud confirmation is needed, the browser sends a signed request to `/api/diagnose`.
3. The server validates and limits the request, then runs providers sequentially under one deadline.
4. The default order is Gemini, OpenRouter free routing, Groq text, text fallbacks, and the emergency CABI response.
5. A missing key, provider failure, rate limit, timeout, or free-tier cap skips to the next safe route.

Only one provider attempt runs at a time. This is deliberate: parallel attempts increase cost and quota pressure and do not improve safety for a field diagnosis.

## Free-tier policy

Configure these server-only variables in Vercel:

- `AI_MAX_ATTEMPTS` — maximum provider attempts per request.
- `AI_MAX_REQUESTS_PER_DAY` — per serverless-instance daily request guard.
- `AI_MAX_VISION_REQUESTS_PER_DAY` — daily image-request guard.
- `AI_MAX_OUTPUT_TOKENS` — maximum response tokens sent to supported providers.
- `AI_MAX_IMAGE_BYTES` — maximum sanitized base64 image payload.
- `AI_REQUEST_TIMEOUT_MS` — total provider deadline.
These are application safeguards, not a billing guarantee. Provider quotas and pricing can change independently.

## Image privacy boundary

User-uploaded images are transient inference input. They must never be:

- written to Turso, local files, object storage, or email;
- included in logs, analytics, feedback, or diagnosis records;
- cached by the service worker or browser as an API response;
- hashed or converted into a persistent identifier.

The API may record bounded technical metadata such as image count and payload byte count. It may compare a transient image with the existing packaged reference-image library, but must not add the user image to that library.

Persisted diagnosis data is allowlisted and minimized: crop, diagnosis, confidence, recommendations, provider/model metadata, timestamps, and bounded operational metrics. Raw prompts and provider payloads are excluded.

## Adding a provider

Add a route adapter in `api/diagnose.js` only when it has:

- an explicit `enabled` check for its environment key;
- a bounded timeout inherited from the orchestrator;
- a free-tier model or an explicit paid-route policy check;
- normalized `{ text, provider, structured, content }` output;
- no logging of request bodies or response bodies.

Add the route after the preferred vision route and before text-only degradation. Keep it sequential.

## Monitoring and database access

`/api/metrics` accepts signed `POST` requests and returns bounded in-memory policy usage and route counts. It does not return prompts, images, diagnosis text, or provider payloads. Diagnosis-history `GET` requests are also signature-protected in production so crop records are not publicly enumerable.

Turso credentials should be scoped to this application and rotated through the deployment environment. Diagnosis retention and deletion should be handled through an approved operational procedure rather than ad-hoc queries.

## Troubleshooting

- `413` means the sanitized image payload exceeds `AI_MAX_IMAGE_BYTES`; resize/compress in the browser.
- `Emergency CABI fallback (free-tier cap)` means the local daily guard blocked cloud calls.
- A response with `degraded: true` used a text-only or emergency path.
- Provider failures are represented in the bounded `attempts` list and structured server logs; secrets and image payloads are intentionally omitted.
- Turso diagnosis records contain metadata/results only. If a schema or retention change is needed, use an idempotent migration in `api/_lib/turso.js`.

Formal regulatory compliance requires a project-specific privacy and legal review; this document describes technical data-minimization controls only.
