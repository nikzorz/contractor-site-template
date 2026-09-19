# The framework runs at build time only

The site is hosted on Cloudflare Workers with static assets. Every framework we considered ships a
Cloudflare adapter that puts the framework's own server into workerd. We deliberately use none of
them: the site generator emits a plain directory of static files, `wrangler.jsonc` serves that
directory through the assets binding, and a hand-written Worker script owns the dynamic routes
(the Lead submission endpoint and the admin page). No framework adapter is installed.

The governing constraint is that this stack survives three years without maintenance. A framework
that never runs in production cannot break in production. A bad upgrade becomes a CI failure we
choose when to pay, while the deployed site keeps serving static files either way. The host
adapter is also the fastest-churning dependency in this class, and this removes it entirely.

## Consequences

- The framework is swappable. Content is Markdown in the repo, and the Worker contains nothing
  framework-shaped. Replacing the generator does not touch the handler.
- We own the Worker handler rather than generating it, which keeps the admin page consistent with
  its own constraint of server-rendered HTML, no client framework, no build step.
- Local development serves built assets through `wrangler dev`, not the framework's dev server
  proxying an API route. Two build steps in CI.
- On-demand routes, server islands, sessions, framework actions and live content collections are
  all unavailable without an adapter. A prerendered content site needs none of them.
- `run_worker_first` must stay off asset routes. It converts free asset requests into billable
  Worker invocations that rate-limit on the free plan.
- Any future model call in the Lead pipeline belongs to the Worker, not the framework, so the
  framework choice is insulated from it.
