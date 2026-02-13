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
    title: z.string(),
    summary: z.string(),
    town: z.string(),
    category: z.string(),
    website: z.string().url().optional(),
    contactEmail: z.string().email().optional()
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
