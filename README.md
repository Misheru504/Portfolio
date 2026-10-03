# Portfolio

Portfolio personnel construit avec [Astro](https://astro.build) : site statique, contenu en Markdown,
déploiement automatique sur GitHub Pages.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # vérifie les types et le contenu, puis génère dist/
```

Node 22.12 ou plus récent est requis.

## Ajouter un projet

1. Crée `src/content/projets/mon-projet.md` (le nom du fichier devient l'URL : `/projets/mon-projet/`).
2. Copie l'en-tête d'un projet existant et remplis-le :

```yaml
---
title: Mon projet
summary: Une ou deux phrases.
date: 2026-10-01
status: en cours          # en cours | terminé | en pause | archivé
context: perso            # perso | stage | BTS | open source
stack: [JavaScript, Vite]
tags: [sig, web]
featured: false           # true = carte sur l'accueil
moment: false             # true = grand bloc « En ce moment » sur l'accueil
github: https://github.com/…
cover: ../../assets/mon-image.png   # optionnel, image dans src/assets/
coverAlt: Description de l'image
draft: false              # true = caché
---
```

3. Écris le contenu en Markdown en dessous. C'est tout : la liste, l'accueil et les pages de tags se mettent à jour.

Si un champ manque ou a une valeur non prévue, `npm run build` s'arrête et indique le fichier et le champ.
Les règles sont dans `src/content.config.ts`.

## Images

Range les images dans `src/assets/` (par exemple `src/assets/projets/mon-projet/`).
Astro les convertit en WebP et les redimensionne au moment du build.

- **Image de la carte (accueil, liste) et du haut de page** : champ `cover` du projet,
  plus `coverAlt` (la description pour les lecteurs d'écran).
- **Image dans le texte** : syntaxe Markdown, chemin relatif au fichier `.md` :

  ```markdown
  ![Description de l'image](../../assets/projets/mon-projet/capture.png)

  *Légende facultative : une ligne en italique juste en dessous.*
  ```

## Ajouter un billet de devlog

Crée `src/content/devlog/AAAA-MM-titre.md` :

```yaml
---
title: Titre du billet
date: 2026-10-03
projet: flora-engine      # optionnel : nom du fichier projet, sans .md
tags: [3d]
---
```

Le billet apparaît dans `/devlog/` et en bas de la page du projet lié.

## Structure

```
src/
├── content.config.ts      # schéma des projets et du devlog
├── content/
│   ├── projets/           # 1 fichier = 1 projet
│   └── devlog/            # 1 fichier = 1 billet
├── data/site.ts           # nom, liens, menu : tes infos sont ici
├── lib/content.ts         # fonctions de tri / filtre / tags
├── lib/hydrocarte.ts      # code de la carte HydroCarte (îlot)
├── layouts/Base.astro     # squelette HTML commun
├── components/            # Header, Footer, ProjectCard, MomentBlock, HydroMap, TagList, BilletItem
├── pages/                 # routes : accueil, projets, devlog, tags, à propos, 404
├── styles/global.css      # thème (variables en haut du fichier)
└── assets/                # images optimisées automatiquement
public/                    # fichiers copiés tels quels (favicon)
.github/workflows/         # déploiement VPS + vérification des Pull Requests
docs/DEPLOIEMENT.md        # configuration du VPS et des secrets GitHub
```