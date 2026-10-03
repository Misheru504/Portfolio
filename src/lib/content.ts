import { getCollection, type CollectionEntry } from 'astro:content';

export type Projet = CollectionEntry<'projets'>;
export type Billet = CollectionEntry<'devlog'>;

/** Projets publiés, du plus récent au plus ancien. */
export async function getProjets(): Promise<Projet[]> {
  const all = await getCollection('projets', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Projets mis en avant sur l'accueil, triés par `order`. */
export async function getFeatured(): Promise<Projet[]> {
  return (await getProjets())
    .filter((p) => p.data.featured)
    .sort((a, b) => a.data.order - b.data.order);
}

/** Projets « du moment » (champ `moment: true`), triés par `order`. */
export async function getMoment(): Promise<Projet[]> {
  return (await getProjets())
    .filter((p) => p.data.moment)
    .sort((a, b) => a.data.order - b.data.order);
}

/** Billets de devlog publiés, du plus récent au plus ancien. */
export async function getBillets(): Promise<Billet[]> {
  const all = await getCollection('devlog', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Tous les tags des projets et du devlog, sans doublon. */
export async function getAllTags(): Promise<string[]> {
  const [p, d] = await Promise.all([getProjets(), getBillets()]);
  return [...new Set([...p, ...d].flatMap((e) => e.data.tags))].sort((a, b) => a.localeCompare(b, 'fr'));
}

export const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const formatDate = (d: Date, opts: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }) =>
  d.toLocaleDateString('fr-FR', opts);
