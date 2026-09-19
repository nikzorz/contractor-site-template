# contractor-site-template

A small marketing site for a trade contractor, plus the beginnings of a Lead inbox. Astro
generates static HTML at build time; a hand-written Cloudflare Worker serves it and owns the two
dynamic routes. No framework adapter, no server to patch, $0/month at this traffic.

Cut a client site from it:

```sh
npx degit nikzorz/contractor-site-template my-client-site
```

Then work through **[SETUP.md](./SETUP.md)** in order.

- **[AGENTS.md](./AGENTS.md)** — the conventions, the two deliberate holes, how to add a Service
  or a Project.
- **[CONTEXT.md](./CONTEXT.md)** — the vocabulary. Lead, Lead Source, Service, Project,
  Contractor, Homeowner.
- **[docs/adr/](./docs/adr/)** — why the framework never runs in production, why Astro, why a
  client repo is a snapshot rather than a fork, and what the Lead record does and does not ask for.

## What it is not, yet

`/api/lead` and `/admin` answer 501. The Worker is a route table with every binding wired and no
pipeline behind it; the Lead form is not on `/contact`. Both holes are named in AGENTS.md.

## Licence

MIT. It holds no client data by design, which is what lets it be public and reachable by `degit`
without credentials.
