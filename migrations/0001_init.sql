-- The Lead record, with only the columns the Contractor acts on. The fields a
-- Homeowner submits arrive in a later migration; this one exists so the
-- migration mechanism is proven rather than promised.
--
-- What the form does not ask for, and why, is in
-- docs/adr/0004-the-lead-record-collects-only-what-the-contractor-can-act-on.md.
-- The omissions are the part this file cannot express.

CREATE TABLE leads (
  id TEXT PRIMARY KEY,

  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

  -- Advanced by hand, in whatever order the work actually happens: a one-man
  -- pipeline skips 'quoted' and re-opens 'lost'. No transition is enforced.
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),

  notes TEXT,

  -- A closed set, so adding a value costs a migration and nobody invents one.
  -- NULL is the honest answer when there is no campaign tag and no external
  -- referrer: never 'direct', never 'unknown', and there is no 'other' bucket.
  lead_source TEXT
    CHECK (lead_source IS NULL OR lead_source IN (
      'organic-search', 'paid-search', 'paid-social', 'social',
      'referral', 'print', 'gbp'
    )),

  -- First touch wins in lead_source; the last touch is kept beside it rather
  -- than overwriting the answer to "which channel produces paying work".
  lead_source_last TEXT
    CHECK (lead_source_last IS NULL OR lead_source_last IN (
      'organic-search', 'paid-search', 'paid-social', 'social',
      'referral', 'print', 'gbp'
    ))
);

CREATE INDEX leads_status_created_at ON leads (status, created_at DESC);
