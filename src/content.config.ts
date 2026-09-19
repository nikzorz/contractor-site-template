import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The current collections API only. ADR 0002: the legacy API was permitted
// without warning in Astro 5 and removed in Astro 6, and never adopting it is
// the only way to avoid that.

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      photo: image(),
      order: z.number().int().default(100),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      roomType: z.string(),
      location: z.string(),
      photo: image(),
      gallery: z.array(image()).default([]),
      completedOn: z.coerce.date().optional(),
    }),
});

export const collections = { services, projects };
