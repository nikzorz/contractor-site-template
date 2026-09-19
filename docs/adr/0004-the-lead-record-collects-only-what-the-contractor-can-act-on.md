# The Lead record collects only what the Contractor can act on, and never invents a value

The Lead form asks for a name, a phone number, a ZIP code, a Service and a description of the work,
and optionally an email address, a timeline, photographs and how the Homeowner heard about the
business. It does not ask for a street address, a budget band, a room type or a square footage, and
it carries no consent checkbox. A field earns its place by naming a decision the Contractor makes
next; one that yields only a number he would not act on costs completion rate and buys nothing. The
same principle governs what is stored: where a value is unknown the column holds `NULL`, never a
plausible substitute.

## Considered options

- **A street address at capture** is what the decision serves, not what it is. The question the
  field answers is "is this in my area, and how far do I drive", which a ZIP code answers
  completely. The street address is gathered in the call that follows, and collecting it up front
  puts the exact location of a house next to photographs of its interior for no operational gain.
- **A budget band** changes nothing the Contractor does. He quotes after seeing the work. It
  depresses completion and anchors the conversation before anyone has looked at the job.
- **Room type and square footage** duplicate and guess respectively. The Service, the description
  and the photographs already carry the room. Homeowners do not know their square footage, and a
  wrong number that survives into a quote is worse than no number.
- **Consent checkboxes** are a completion tax here. No consent regime reaches a single-location
  contracting business of this size in the United States, so a required tick buys no legal
  protection and costs submissions. A sentence beneath the submit button and a privacy policy that
  actually exists do the honest version of the same job. A client operating where consent is
  required, or one large enough to cross a state privacy-law threshold, reopens this.
- **"Direct" as a Lead Source** is the tempting default and the expensive one. The no-referrer
  bucket holds the truck decal, the yard sign, the neighbour's recommendation, the QR code, the
  forwarded link and the bookmark. Labelling it creates a phantom channel that reliably tops the
  chart, and the only question it provokes has no answer.

## Consequences

- A field that was never collected cannot be backfilled. Adding one later starts its history from
  that day, which is the reason this decision is worth arguing against rather than reversing
  casually.
- The five required fields are `NOT NULL`. SQLite relaxes that only by rebuilding the table, which
  is cheap at this volume and deliberately makes a shorter form a migration rather than a drift.
- `lead_source` is nullable with a closed set of values enforced by a `CHECK` constraint. Adding a
  value costs a migration, which is what keeps the set small enough to mean anything.
- What the Homeowner reports about how they heard of the business is stored separately from what
  the site detected, and never overwrites it. The two disagree often and both disagreements are
  informative.
- Photographs are optional and bounded, at five files, ten megabytes each and twenty-five megabytes
  per Lead. The upload endpoint is the one place in this design where a stranger can cause storage
  to be consumed, and object storage does not stop on its own.
