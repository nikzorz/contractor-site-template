# Setting up a new client site

In order. Each step is finished when the thing it names is true, not when the command has run.

The repo is a snapshot: it keeps no upstream remote and shares no history with the template
(`docs/adr/0003-the-template-is-a-snapshot.md`). Nothing here reaches back.

```sh
npx degit nikzorz/contractor-site-template my-client-site
cd my-client-site && git init && npm install
```

## 1. Delete the two example content files

```sh
rm src/content/services/example-countertops.md src/content/services/example-countertops.jpg
rm src/content/projects/example-master-bath.md  src/content/projects/example-master-bath.jpg
```

They exist to show the frontmatter shape and to prove the photo check works. `npm run validate`
now passes with no Service and no Project, and starts failing again the moment one is added
without a photo.

## 2. `site.config.json`

Every value. The business name, phone, email and address as the Contractor writes them himself;
`site.url` as the final domain, including `https://`, because canonical URLs and the OG image
path are built from it. Leave `turnstile.siteKey` and `umami.websiteId` empty until steps 5
and 6 hand you the real ones, and set `social` entries to `null` rather than to an empty string
where there is no account yet.

`npm run build` fails loudly on a value of the wrong shape. That is the check working.

## 3. `src/styles/tokens.css` and `public/brand/`

Palette and type in `tokens.css`, nowhere else. Replace `public/brand/logo.svg`,
`favicon.svg` and `og.png` (1200x630) with the client's own. The placeholders are grey on
purpose — shipping them is visible, not subtle.

## 4. Provision Cloudflare, then fill the fenced block in `wrangler.jsonc`

The DNS zone has to sit in the **same Cloudflare account** as the Worker, because a Worker custom
domain requires it. Decide whose account that is before creating anything in it.

```sh
npx wrangler d1 create <client>-leads          # copy database_name and database_id
npx wrangler r2 bucket create <client>-lead-photos
```

Then, in `wrangler.jsonc`, below the PER CLIENT banner and nowhere above it: `name`, the D1
`database_name` and `database_id`, the R2 `bucket_name`. Leave `compatibility_date` alone — it
is the date this repo was cut and it stays that date.

Set an R2 storage alert while you are in the dashboard. R2 is the one service in this stack that
does not hard-stop when the free allowance runs out.

## 5. Turnstile

Create a Turnstile widget for the domain. The **site** key goes in `site.config.json`; the
**secret** key is a Worker secret and never enters the repo.

## 6. Analytics

Verify the domain in Google Search Console. Create the Umami Cloud site and put its website id in
`site.config.json`.

## 7. Secrets

`.dev.vars.example` lists every name. Copy it to `.dev.vars` for local work, and set the same
names in production:

```sh
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put PUSHOVER_APP_TOKEN
npx wrangler secret put PUSHOVER_USER_KEY
npx wrangler secret put RESEND_API_KEY
```

In the GitHub repo, add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repository secrets.
The token needs Workers, D1 and R2 edit scopes on that one account.

## 8. First deploy

```sh
npm run build
npm run deploy
npm run migrate      # creates the leads table in production D1
```

Check the `*.workers.dev` URL. If `wrangler` cannot find the database for `migrate`, pass the
`database_name` from `wrangler.jsonc` instead of `DB`.

## 9. The custom domain

Move DNS to Cloudflare and wait for the zone to go active. Add the route in `wrangler.jsonc`:

```jsonc
"routes": [{ "pattern": "theirdomain.com", "custom_domain": true }]
```

Deploy again, confirm the domain serves the site, then set `"workers_dev": false` so the same
pages are not also indexable on `workers.dev`.

## 10. Content and copy

- Real Services and Projects, each with a photo. `npm run validate` is the gate.
- `src/pages/privacy.astro` ships placeholder wording. Replace it with what this business
  actually does with a Homeowner's details before the site takes a single Lead.
- `CONTEXT.md` has an empty Business section. Fill it in: the next person to open this repo,
  human or agent, reads it first.

## 11. Repository settings

Confirm Dependabot **alerts** and **security updates** are on. `.github/dependabot.yml` only
turns version-update PRs off; it cannot turn security updates on.
