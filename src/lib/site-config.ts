import { z } from 'zod';
import raw from '../../site.config.json';

// Parsed on import, so a typo in site.config.json stops the build instead of
// rendering an empty string into a page.

const optionalUrl = z.url().nullable();

const siteConfigSchema = z.object({
  business: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.email(),
    address: z.object({
      street: z.string(),
      city: z.string().min(1),
      state: z.string().length(2),
      zip: z.string().min(5),
    }),
    serviceArea: z.array(z.string().min(1)).min(1),
    hours: z.string().min(1),
  }),
  site: z.object({
    url: z.url(),
    tagline: z.string().min(1),
  }),
  social: z.object({
    facebook: optionalUrl,
    instagram: optionalUrl,
    googleBusinessProfile: optionalUrl,
  }),
  turnstile: z.object({ siteKey: z.string() }),
  umami: z.object({ websiteId: z.string() }),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

const parsed = siteConfigSchema.safeParse(raw);

if (!parsed.success) {
  const problems = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  throw new Error(`site.config.json does not match the shape the site expects:\n${problems}`);
}

export const site: SiteConfig = parsed.data;
