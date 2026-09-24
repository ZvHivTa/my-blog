import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'

const studies = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/studies' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      kind: z.enum(['research', 'learning']).default('learning'),
      featured: z.boolean().default(false),
      order: z.number().optional(),
      image: image().optional(),
      tags: z.array(z.string()).optional(),
      authors: z.array(z.string()).optional(),
      draft: z.boolean().optional(),
    }),
})

const journal = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/journal' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      order: z.number().optional(),
      cover: image().optional(),
      coverAlt: z.string().default(''),
      tags: z.array(z.string()).default([]),
      authors: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      example: z.boolean().default(false),
    }),
})

const authors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/authors' }),
  schema: () =>
    z.object({
      name: z.string(),
      pronouns: z.string().optional(),
      avatar: z
        .string()
        .url()
        .or(z.string().startsWith('/'))
        .or(z.string().startsWith('./')),
      bio: z.string().optional(),
      mail: z.string().email().optional(),
      website: z.string().url().optional(),
      twitter: z.string().url().optional(),
      github: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      discord: z.string().url().optional(),
    }),
})

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
      image: image(),
      link: z.string().url().or(z.string().startsWith('/')),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
    }),
})

export const collections = { studies, journal, authors, projects }
