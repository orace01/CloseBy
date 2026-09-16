# CloseBy · web

Interface de CloseBy (landing page et application) avec comptes utilisateurs réels.

- **Comptes** : inscription, confirmation de l’adresse e-mail, onboarding, connexion, déconnexion et mot de passe oublié fonctionnent avec une vraie base PostgreSQL.
- **Campagnes et prospects** : encore des données fictives (`src/lib/mock-data.ts`) en attendant l’agent.

## Prérequis

- Node.js 20.9 ou plus
- Docker (pour PostgreSQL en local)

## Démarrer

```bash
cp .env.example .env.local        # puis renseigner BETTER_AUTH_SECRET
npm install
npm run db:up                     # lance PostgreSQL (docker compose)
npm run db:migrate                # crée les tables
npm run dev                       # http://localhost:3000
```

Pour générer un secret : `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`

## Variables d’environnement

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Connexion PostgreSQL |
| `BETTER_AUTH_SECRET` | Secret de signature des sessions |
| `BETTER_AUTH_URL` | URL publique de l’application (liens des e-mails) |
| `ADMIN_EMAILS` | Adresses autorisées sur `/admin`, séparées par des virgules |
| `GEMINI_API_KEY` | Clé Google AI Studio utilisée par l’agent |
| `GEMINI_MODELS` | Modèles Gemini essayés dans l’ordre (le suivant prend le relais quand le quota du jour est épuisé) |
| `AGENT_WEB_SEARCH` | `true` pour chercher sur Google les e-mails des entreprises sans site (facturation Gemini requise) |
| `AGENT_MAX_PROSPECTS` | Prospects maximum par campagne (10 par défaut) |
| `AGENT_MAX_CAMPAIGNS_PER_DAY` | Campagnes maximum par compte sur 24 h (3 par défaut) |
| `GOOGLE_MAPS_API_KEY` | Clé Google Maps Platform avec « Places API (New) ». Sans elle, l’agent cherche sur OpenStreetMap |

## Déploiement (Vercel + Supabase)

1. **Supabase** : créer un projet en région Europe (Francfort). Dans *Connect*, récupérer :
   - l’URL **Transaction pooler** (port 6543) → pour Vercel ;
   - l’URL **Session pooler** (port 5432) → pour les migrations.
2. **Migrations**, depuis `web/` sur ta machine :
   ```bash
   DATABASE_URL_MIGRATIONS="<url session pooler>" npm run db:migrate
   ```
3. **Vercel** (projet dont le *Root Directory* est `web`), onglet *Settings → Environment Variables* :

   | Variable | Valeur |
   | --- | --- |
   | `DATABASE_URL` | URL transaction pooler (port 6543) |
   | `BETTER_AUTH_SECRET` | secret généré (différent de celui du local) |
   | `BETTER_AUTH_URL` | URL de production, ex. `https://closeby.vercel.app` |
   | `AUTH_REQUIRE_EMAIL_VERIFICATION` | `false` tant qu’aucun service d’e-mail n’est branché |
   | `ADMIN_EMAILS` | ton adresse |
   | `GEMINI_API_KEY` | clé Google AI Studio |
   | `GEMINI_MODELS` | laisser vide pour la liste par défaut |
   | `GOOGLE_MAPS_API_KEY` | clé Google Maps Platform (facultative) |

4. Pousser sur `main` : Vercel redéploie.

Ne jamais committer `.env.local` ni coller ces URL dans le code.

## Comptes et e-mails

Aucun service d’envoi n’est encore branché : les e-mails de confirmation et de réinitialisation s’affichent **dans le terminal** de `npm run dev`. Ouvrez le lien affiché pour continuer.

Parcours : `/inscription` → e-mail de confirmation → `/bienvenue` (onboarding) → `/tableau-de-bord`.

Les pages de l’application sont protégées à deux niveaux : `src/proxy.ts` redirige vers `/connexion` sans cookie de session, puis chaque page vérifie la session en base via `src/lib/dal.ts`.

## L’agent

Code dans `src/lib/agent/`. Une campagne suit ces étapes :

1. **Demande** : Gemini extrait l’offre, la cible et la zone de la phrase de l’utilisateur (`ai.ts`).
2. **Recherche** :
   - avec `GOOGLE_MAPS_API_KEY` : Google Places (Text Search) autour de la zone, **avec ou sans site web**, avec téléphone, fiche Maps et note (`google-places.ts`) ;
   - sinon : Nominatim + Overpass (OpenStreetMap), uniquement les établissements qui ont un site (`places.ts`).

   Les entreprises déjà prospectées ou exclues sont retirées.
3. **Lecture** : si l’entreprise a un site, l’accueil et jusqu’à 3 pages utiles (contact, à propos, mentions…), dans le respect de `robots.txt` (`site.ts`).
4. **Adresse** : d’abord une adresse publiée sur le site. Sans site, ou sans adresse dessus, Gemini cherche l’entreprise sur Google (`findOnWeb`) ; une adresse n’est retenue que si elle figure sur une des pages citées, qu’elle n’appartient pas à un annuaire et que son domaine reçoit du courrier. Sinon le prospect passe en « Sans e-mail » et garde son téléphone.
5. **Faits** : Gemini note la pertinence et relève des faits avec leur citation exacte. Le code garde seulement les citations réellement présentes sur la page.
6. **Rédaction** : Gemini rédige l’e-mail à partir de ces faits ; la signature est ajoutée par le code. 1 crédit est débité à ce moment-là, jamais avant.
7. **Relecture** : l’utilisateur approuve, modifie ou rejette. L’envoi n’est pas encore branché.

**Exécution** (`runner.ts`) : l’agent travaille par tranches d’environ 3 minutes. Chaque tranche prend un verrou sur la campagne en base, puis passe la main à la suivante via `/api/agent/run` (appel signé). Si ce relais se perd, la page de la campagne relance l’agent. Quand un service est surchargé (Gemini, OpenStreetMap), l’agent réessaie, puis met la campagne en pause avec un message.

**Recherche Google via Gemini** (« grounding ») : non incluse dans l’offre gratuite, donc désactivée par défaut (`AGENT_WEB_SEARCH`).

**Quota** : l’offre gratuite de Gemini est limitée par jour et par modèle (20 requêtes par jour pour `gemini-3.6-flash` au moment des tests). Il faut compter environ 2 requêtes par prospect. Chaque modèle ayant son propre quota, l’agent passe au modèle suivant de `GEMINI_MODELS` ; quand tous sont épuisés, la campagne se met en pause. Les limites `AGENT_MAX_PROSPECTS` et `AGENT_MAX_CAMPAIGNS_PER_DAY` évitent qu’un seul compte consomme tout. Activer la facturation lève ces contraintes.

## Base de données

Schéma Drizzle dans `src/db/` :

- `auth-schema.ts` : tables de Better Auth (`user`, `session`, `account`, `verification`)
- `app-schema.ts` : `workspace`, `workspace_member`, `mail_identity`, `campaign`, `prospect`, `fact`, `message`, `send_event`, `credit_ledger`, `suppression`, `audit_event`

Chaque inscription crée automatiquement un workspace (plan Starter, 150 crédits).

Après une modification du schéma :

```bash
npm run db:generate   # crée une migration dans drizzle/
npm run db:migrate    # l’applique
npm run db:studio     # explorer les données
```

## Organisation

```
src/
  app/                  routes : landing, (auth), (app), bienvenue, admin, api/auth, api/agent
  components/           ui, app, auth, landing
  db/                   client Drizzle et schéma
  lib/
    auth.ts             configuration Better Auth
    dal.ts              accès aux données : session, workspace, admin
    agent/              l’agent : Gemini, OpenStreetMap, lecture des sites, exécution
    campaigns.ts        lecture des campagnes et prospects pour les écrans
    actions/            server actions (comptes, onboarding, campagnes)
    mailer.ts           envoi d’e-mails (console en développement)
    mock-data.ts        données fictives (offres, boîtes mail, admin)
    store.tsx           état en mémoire des écrans pas encore reliés à la base
  proxy.ts              protection des routes
```

## Scripts

```bash
npm run dev       npm run build     npm run lint
npm run db:up     npm run db:generate     npm run db:migrate     npm run db:studio
```
