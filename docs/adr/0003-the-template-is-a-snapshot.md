# The template is a snapshot, and per-client difference is confined to four files

The site generator and the Worker are reused across Contractors from a public template repository,
`contractor-site-template`, copied with `degit`. A client repository keeps no upstream remote and
shares no history with the template. A fix made after a client is cut does not reach that client on
its own; someone carries it across by hand.

That is affordable only because divergence is kept structurally small. Exactly four locations may
differ between a client repository and the template: `site.config.json`, holding business facts, the
domain and public third-party identifiers; `src/styles/tokens.css` together with `public/brand/`,
holding the palette, the type and the imagery; a fenced block in `wrangler.jsonc` holding the
Cloudflare account, Worker, D1 and R2 identifiers; and the secrets, which are never committed. Every
other file stays byte-identical, so a later `diff` against the template reads as the list of drifts
even with no common ancestor.

## Considered options

- **A fork with an `upstream` remote** turns a fix into a cherry-pick. It costs a shared history and
  a merge conflict on every file a client has edited, which buys little at two or three clients.
- **Extracting the Worker into a private package** turns a fix into a version bump, and is rejected
  on two counts. It contradicts [ADR 0001](./0001-framework-runs-at-build-time-only.md), which owns
  the handler rather than generating it, and it removes the handler from the repository an agent
  reads, which is the one place it has to be legible.

## Consequences

- Per-client setup is a checklist against four known locations rather than a hunt, and that
  checklist is the template's own `SETUP.md`.
- Anything that varies has to be expressible as data in one of those four locations. A requirement
  that can only be met by editing shared code is a signal to change the template, not the client.
- The template holds no client data by construction, which is what lets it be public and therefore
  reachable by `degit` without credentials.
- Revisit at the third client. Copying a snapshot is a defensible answer for two and a poor one for
  ten.
