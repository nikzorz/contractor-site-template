# Working in this repo

A static contractor site. Astro generates `dist/` at build time and never runs in production;
a hand-written Cloudflare Worker serves that directory and owns the two dynamic routes. Read
`docs/adr/` before changing anything structural — the three decisions there are load-bearing and
this file only restates their consequences.

Read `CONTEXT.md` for the vocabulary. **Lead**, **Lead Source**, **Lead Status**, **Service**,
**Project**, **Contractor**, **Homeowner** mean specific things here; use those words.

## What is deliberately missing

Two holes, both named on purpose so that "missing" is distinguishable from "not done yet".

**The editing surface.** Content is Markdown with frontmatter in `src/content/`, and that is
settled. How the Contractor edits it is not: a `tina/` directory, a `public/admin/` config, or a
Worker-served page are all live options, and shipping all three would carry two dead vendors in
every client repo forever. Whichever lands, it reads and writes the same files, so nothing else
in the repo moves.

**The Lead pipeline.** `worker/index.ts` is a route table with every binding wired, and
`/api/lead` and `/admin` answer 501. Turnstile, the honeypot, the time-trap, the rate limit,
magic-byte photo checks, the R2 stream, the D1 insert, and the Pushover and Resend fan-out are
all unwritten, and so is the Lead Source capture script on the site side. `/contact` therefore
carries a phone number and no form: a form posting to a 501 is a broken promise on a page a
Homeowner actually reaches.

## The Worker boundary

Nothing under `worker/` may import from `astro` or from `src/`. The Worker reaches shared values
through `site.config.json` by relative path, which is the whole reason that file is plain JSON
rather than TypeScript.

This is what keeps the site generator swappable, so it is checked rather than requested:
`scripts/validate.mjs` fails the build on any such import, and `worker/tsconfig.json` carries no
`paths` alias. A rule that lives only in prose is the first one to get broken.

## Pins

Exact versions, no ranges, lockfile committed, **npm** rather than pnpm. Node is written down
once, in `.nvmrc`, and CI reads that file rather than naming a version a second time; `engines`
and `packageManager` repeat it for humans and for npm's own warning.

Dependabot security updates are on and version-update PRs are off. A bump is a deliberate
project with a look at the rendered output, not maintenance — Astro has changed default
whitespace handling and the default Markdown processor in a major before, so output can move
without the source moving. The same applies to `compatibility_date` in `wrangler.jsonc`.

## Where configuration lives

Four locations, and only these four, may differ between one client's repo and another's. Anything
that varies has to become data in one of them; a requirement that can only be met by editing
shared code is a signal to change the template rather than the client.

| Location | Holds |
|---|---|
| `site.config.json` | business facts, the domain, the Turnstile site key, the Umami website id |
| `src/styles/tokens.css` and `public/brand/` | palette, type, logo, favicon, OG image |
| the fenced block in `wrangler.jsonc` | Cloudflare account, Worker name, D1 database, R2 bucket, routes |
| Worker secrets and GitHub repo secrets | never committed; `.dev.vars.example` lists the names |

`site.config.json` is parsed against a zod schema in `src/lib/site-config.ts` on import, so a typo
stops the build instead of rendering an empty string into a page. Add a field to the schema and
the JSON together.

## Adding a Service

1. Put the photo in `src/content/services/` next to the Markdown file that will use it.
2. Add `src/content/services/<slug>.md`. The file name is the URL. Frontmatter takes `title`,
   `summary`, `photo` and an optional `order`; the body is the page copy.
3. `npm run validate`.

A Service with no photo, or with a `photo:` line naming a file that is not in that folder, fails
the build. It is not quietly hidden: a Service that silently does not appear is exactly the
failure nobody notices for a year.

## Adding a Project

The same, in `src/content/projects/`. Frontmatter takes `title`, `roomType`, `location`, `photo`,
an optional `gallery` list of more photos in the same folder, and an optional `completedOn`.

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Astro's dev server. The Worker is not in front of it. |
| `npm run validate` | Photo check and Worker boundary check. No Astro import. |
| `npm run build` | `validate`, then `astro build` into `dist/`. |
| `npm run preview` | `wrangler dev`: the built `dist/` behind the real Worker. |
| `npm run deploy` | `wrangler deploy`. CI runs this on `main`. |
| `npm run migrate` | Applies `migrations/` to the production D1 database. |
