# Context

The glossary for this project. Terms here are the canonical vocabulary: use them in issues,
commit messages, code identifiers, and content field names. Avoid the listed synonyms.

## Business

_Fill this in for the client this repo was cut for: the trading name, what it sells, the
service area, and any former identity still being redirected. Delete this line when you do._

## Core terms

**Lead** — an enquiry submitted through a form on the site by a prospective customer. Carries
contact details, a description of the work, optional photos, and the **Lead Source** it arrived
with. A Lead has a **Lead Status** the Contractor advances by hand as he works it.

_Avoid:_ "estimate request", "enquiry", "contact submission", "quote". A Lead is not yet a quote;
producing a quote is out of scope for this system.

**Lead Source** — where a Lead came from: organic search, a Google Business Profile listing, a
referral, a truck decal, a paid campaign. Stamped onto the Lead at capture time from referrer
and UTM parameters, plus anything the submitter tells us. The point of collecting it is to answer
"which channel produces paying work", so it is a first-class field, not analytics exhaust. A Lead
whose source cannot be determined has **no** Lead Source: absence is a legitimate value, and the
only honest one.

_Avoid:_ "Direct" or "Unknown" as a value, "attribution" for the field itself.

**Lead Status** — how far a Lead has travelled through the Contractor's pipeline: New, Contacted,
Quoted, Won, or Lost. He advances it by hand, in whatever order the work actually happens.

_Avoid:_ "stage", "state", "pipeline stage". Spam is not a Lead Status; a Lead marked as spam is
excluded from the pipeline entirely.

**Service** — a line of work the business offers and sells, listed on the site: e.g. countertops,
bathroom remodels, kitchen backsplashes, flooring. Structured content in `src/content/services/`.
A Service must have a photo to be publishable.

_Avoid:_ "offering", "category", "product".

**Project** — a completed piece of work shown in the gallery as evidence of craftsmanship.
Has a room type, a location, and photographs (ideally before and after). Structured content in
`src/content/projects/`.

_Avoid:_ "job" (that means an active engagement, which this system does not track),
"portfolio item", "gallery image" (a Project has several).

**Contractor** — the business owner, and the only person who edits content or reads Leads.
Non-technical, works from a phone, in a truck. Every admin-facing decision is judged against him.

_Avoid:_ "admin", "user" (ambiguous), "client" (ambiguous: see below).

**Homeowner** — the prospective customer who submits a Lead. Does not log in; there is no account
system for homeowners.

_Avoid:_ "client", "customer" (reserve for when a Homeowner has actually bought work).

## A note on "client"

In conversation, "client" means the Contractor, because he is the agency's client. In code and
content fields it is ambiguous enough to be banned: say **Contractor** or **Homeowner**.
