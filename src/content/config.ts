import { defineCollection, z } from "astro:content";

const events = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    town: z.string(),
    category: z.string(),
    venue: z.string().optional(),
    externalUrl: z.string().url().optional()
  })
});

const directory = defineCollection({
  schema: z.object({
    name: z.string(),
    town: z.string(),
    region: z.string(),
    isHighlandsBased: z.boolean(),
    servesHighlands: z.boolean(),
    categories: z.array(z.string()).min(1),
    tags: z.array(z.string()).default([]),
    website: z.string().url(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    shortDescription: z.string(),
    longDescription: z.string().optional(),
    featured: z.boolean().default(false),
    lastVerified: z.coerce.date(),
    internalSources: z.array(z.string().url()).optional()
  })
});

const funding = defineCollection({
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    amount: z.string().optional(),
    deadline: z.coerce.date().optional(),
    link: z.string().url().optional()
  })
});

export const collections = { events, directory, funding };
