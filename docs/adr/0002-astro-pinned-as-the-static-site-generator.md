# Astro, pinned, as the static site generator

Astro 7 generates the site, in its default `output: 'static'` mode, per
[ADR 0001](./0001-framework-runs-at-build-time-only.md). Every dependency is pinned to an exact
version with the lockfile committed, and we expect to stay on Astro 7 for the life of the project.

Astro loses the one axis that matters most to a three-year bet and wins every other. It shipped
four majors in three years, has never shipped a codemod, and is not honouring security-only
support for the previous major. Against that it has a first-class typed content layer, build-time
image optimisation in core, an active contributor base rather than a single maintainer, and it is
the only non-React framework with a first-class path from the CMS candidates under consideration.
ADR 0001 is what makes the churn acceptable: the blast radius of a bad Astro release is a build,
not a running site.

## Considered options

- **Eleventy 3** is the named fallback, and it is a genuine one. Its single major in the same
  window was the gentlest upgrade of any candidate and its minimal install pulls no native
  binaries. It loses on a contributor base that collapsed to one person, three changes of funding
  home in three years, a major that has been in alpha for over a year with a stated release date
  inside our window and no upgrade helper, image optimisation that is a plugin rather than core,
  and no typed content layer for an agent to read.
- **Plain Vite** is the floor if both of the above fail. Routing, static generation, the content
  layer and the image markup would all be hand-written glue, which the repo-template goal cannot
  afford.
- **Next.js** is ruled out on the churn its App Router transition caused, on being React-primary
  where the target is zero JavaScript by default, and on its image optimisation being a runtime
  service rather than a build step.
- **SvelteKit** is ruled out on a major in release candidate that removes `$app/stores`, renames
  `$lib` and abolishes `svelte.config.js`.

## Consequences

- Content collections use the current API only, never the legacy one. Astro 5 allowed the legacy
  API with no warning and Astro 6 removed it, and that failure mode is only avoidable by never
  adopting it.
- Pinning means running a major that Astro is not security-patching for most of the period. This is
  acceptable only because the generator runs in CI and never serves a request. It would not be
  acceptable under a framework that ran in production.
- A major version bump is a deliberate project with a visual diff of rendered output, not routine
  maintenance. Astro 7 changed default whitespace handling and the default Markdown processor, so
  upgrades can change output without changing source.
- React is permitted as opt-in islands and is expected to stay unused. Adding one is a per-component
  decision, not a default.
- `sharp` runs at build time only. It cannot decode the HEVC-compressed HEIC that iPhones write, by
  a permanent licensing decision upstream, so HEIC is converted on the client before upload and
  never in CI.
