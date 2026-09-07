# Task List

1. ✅ Scaffold SvelteKit + Fastify project in /app

2. ✅ DB schema + idempotent seed (13 tables)
Verified idempotent across restart
3. ✅ Fastify API: all endpoints
79/79 contract checks pass, ownership verified against DB rows
4. ✅ SMTP mail via Mailpit (3 transitions)
Correct subjects/bodies, single recipient, no cc/bcc
5. ✅ Front-end: 19 routes, design system, reactor, islands

6. ✅ Fix SSR loader (SvelteKit fetch bypassed Fastify)
Now addresses internal listener; real DB content in first paint
7. ✅ Fix EnquiryForm reactivity bug found in browser walk
Helper fn broke Svelte dependency tracking
8. ✅ Playwright walk of 5 journeys + screenshots
44/44 pass, 8 screenshots saved
9. ✅ Dockerfile verified by simulating runtime stage
prod-only deps, 79/79 pass in isolated sim
10. ✅ USER_README.md, .dockerignore, .gitignore, detached server

