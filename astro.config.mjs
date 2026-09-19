import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';

// Read as data rather than imported as a module: site.config.json is also read by
// the Worker, which must not depend on anything Astro resolves (ADR 0001).
const site = JSON.parse(
  readFileSync(new URL('./site.config.json', import.meta.url), 'utf8'),
);

export default defineConfig({
  output: 'static',
  site: site.site.url,
  build: { format: 'directory' },
});
