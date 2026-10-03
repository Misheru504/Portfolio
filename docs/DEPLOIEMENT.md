# Déployer sur le VPS avec GitHub Actions

Principe : à chaque `git push` sur `main`, GitHub compile le site puis le copie
sur ton VPS par SSH (`rsync`). Ton serveur web (Caddy ou Nginx) sert simplement
le dossier de fichiers statiques. Pas de Node sur le VPS, pas de base de données.

```
git push ──► GitHub Actions : npm ci → npm run build → rsync dist/ ──SSH──► VPS : /var/www/portfolio ──► Caddy/Nginx
```

À faire **une seule fois** : 1 → 5. Ensuite, tout est automatique.

---

## 1. Sur le VPS : un utilisateur et un dossier dédiés

On crée un utilisateur `deploy` qui ne sert qu'à ça. Si sa clé fuit, il ne peut écrire
que dans le dossier du site.

```bash
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /var/www/portfolio
sudo chown deploy:deploy /var/www/portfolio
sudo apt install rsync        # souvent déjà installé
```

## 2. Une clé SSH réservée au déploiement

Sur **ton ordinateur** (pas sur le VPS), génère une paire de clés sans mot de passe :

```bash
ssh-keygen -t ed25519 -f deploy_portfolio -N "" -C "github-actions-portfolio"
```

Ça crée `deploy_portfolio` (privée, pour GitHub) et `deploy_portfolio.pub` (publique, pour le VPS).

Installe la clé publique sur le VPS :

```bash
sudo -u deploy mkdir -p -m 700 /home/deploy/.ssh
sudo -u deploy tee -a /home/deploy/.ssh/authorized_keys < deploy_portfolio.pub
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

Teste depuis ton ordinateur : `ssh -i deploy_portfolio deploy@IP_DU_VPS` doit se connecter.

## 3. L'empreinte du serveur (known_hosts)

GitHub doit pouvoir vérifier qu'il parle bien à **ton** VPS (protection contre l'usurpation).
Depuis ton ordinateur :

```bash
ssh-keyscan -p 22 IP_DU_VPS
```

Garde la sortie (plusieurs lignes) pour l'étape 4. Pour être rigoureux, compare
l'empreinte avec celle affichée sur le VPS par `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`.

## 4. Les secrets dans GitHub

Dépôt → **Settings → Secrets and variables → Actions → New repository secret** :

| Nom | Valeur |
|---|---|
| `VPS_HOST` | IP ou nom de domaine du VPS |
| `VPS_PORT` | port SSH (facultatif, 22 par défaut) |
| `VPS_USER` | `deploy` |
| `VPS_PATH` | `/var/www/portfolio` |
| `VPS_SSH_KEY` | **tout** le contenu du fichier `deploy_portfolio` (clé privée, lignes BEGIN/END comprises) |
| `VPS_KNOWN_HOSTS` | la sortie de `ssh-keyscan` de l'étape 3 |

Les secrets ne sont jamais affichés dans les logs. Une fois copiée dans GitHub,
tu peux supprimer la clé privée de ton ordinateur.

## 5. Le serveur web

### Option A : Caddy (le plus simple, HTTPS automatique)

`/etc/caddy/Caddyfile` :

```caddy
portfolio.michelange.me {
	root * /var/www/portfolio
	encode zstd gzip
	file_server

	# Les fichiers de /_astro/ ont un nom unique à chaque build : cache très long
	@assets path /_astro/*
	header @assets Cache-Control "public, max-age=31536000, immutable"

	handle_errors {
		@404 expression {err.status_code} == 404
		handle @404 {
			rewrite * /404.html
			file_server
		}
	}
}
```

Puis `sudo systemctl reload caddy`.

### Option B : Nginx (+ Certbot pour le HTTPS)

```nginx
server {
    listen 80;
    server_name portfolio.michelange.me;
    root /var/www/portfolio;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
    location /_astro/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    error_page 404 /404.html;
}
```

Puis `sudo nginx -t && sudo systemctl reload nginx` et `sudo certbot --nginx -d portfolio.michelange.me`.

> Si tes services tournent déjà en Docker derrière un reverse proxy, monte simplement
> `/var/www/portfolio` en lecture seule dans le conteneur Caddy/Nginx.

### DNS

Chez ton registrar : un enregistrement `A` `portfolio` → IP du VPS (et `AAAA` si IPv6).

---

## Tester

- Onglet **Actions** du dépôt → « Déploiement VPS » → **Run workflow**.
- Chaque étape est dépliable : en cas d'échec, l'erreur est dans la dernière étape rouge.

| Erreur | Cause probable |
|---|---|
| `Permission denied (publickey)` | clé privée mal copiée, ou clé publique absente de `authorized_keys` |
| `Host key verification failed` | `VPS_KNOWN_HOSTS` vide ou mauvais port dans `ssh-keyscan` |
| `rsync: mkdir … failed: Permission denied` | le dossier n'appartient pas à `deploy` (étape 1) |
| `rsync: command not found` | installer `rsync` sur le VPS |

## Les deux workflows

- `.github/workflows/deploy.yml` : à chaque push sur `main`, compile et déploie.
- `.github/workflows/verification.yml` : à chaque Pull Request, compile seulement.
  Si tu travailles sur une branche et ouvres une PR, tu vois avant de fusionner si le site casse.
