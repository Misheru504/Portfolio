import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * PROJETS — un fichier Markdown = un projet.
 * Ajoute un fichier dans src/content/projets/ et il apparaît partout
 * (accueil, liste, page détail, pages de tags). Si un champ obligatoire
 * manque ou est mal écrit, `npm run build` échoue et te dit lequel.
 */
const projets = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projets' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().max(200, 'Le résumé doit tenir en une ou deux phrases'),
      date: z.coerce.date(),                       // date de début
      updated: z.coerce.date().optional(),         // dernière mise à jour
      status: z.enum(['en cours', 'terminé', 'en pause', 'archivé']),
      context: z.enum(['perso', 'stage', 'BTS', 'open source']),
      stack: z.array(z.string()).min(1),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),        // mis en avant sur l'accueil
      order: z.number().default(100),              // ordre parmi les projets mis en avant
      moment: z.boolean().default(false),          // true = bloc « En ce moment » sur l'accueil
      github: z.url().optional(),
      demo: z.url().optional(),
      cover: image().optional(),                   // image dans src/assets/
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),           // true = caché du site
    }),
});

/**
 * DEVLOG — des billets courts, éventuellement rattachés à un projet.
 */
const devlog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/devlog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    projet: reference('projets').optional(),       // nom du fichier projet, sans .md
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projets, devlog };
