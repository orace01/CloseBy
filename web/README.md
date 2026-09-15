# CloseBy · web

Interface de CloseBy : la landing page et l’application (14 écrans du MVP), en direction visuelle « Relecture ».

Il n’y a pas encore de backend : les données viennent de `src/lib/mock-data.ts` et les actions (approuver, envoyer, mettre en pause…) modifient un état en mémoire (`src/lib/store.tsx`). Tout est perdu au rechargement de la page.

## Lancer le projet

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
npm run lint
```

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4.

## Pages

| URL | Écran |
| --- | --- |
| `/` | Landing page |
| `/inscription`, `/connexion`, `/mot-de-passe-oublie` | Compte |
| `/bienvenue` | Onboarding en 3 étapes |
| `/tableau-de-bord` | Tableau de bord |
| `/campagnes` | Suivi des campagnes |
| `/campagnes/nouvelle` | Création de campagne (phrase → paramètres) |
| `/campagnes/[id]` | Progression de l’agent |
| `/campagnes/[id]/relecture` | Relecture, approbation et envoi des e-mails |
| `/prospects`, `/prospects/[id]` | Liste et fiche prospect |
| `/boites-mail` | Connexions Gmail / Outlook |
| `/credits` | Crédits et abonnement |
| `/reglages` | Paramètres et confidentialité |
| `/admin` | Console d’administration |

Campagne d’exemple : `/campagnes/restaurants-lyon`.

## Organisation

```
src/
  app/                  routes (groupes (app) et (auth), landing à la racine)
  components/
    ui/                 boutons, icônes, champs, libellés de statut
    app/                écrans de l’application
    auth/               formulaires de compte et onboarding
    landing/            sections de la landing page
  lib/
    types.ts            modèle de données (campagnes, prospects, faits, e-mails…)
    mock-data.ts        données fictives
    store.tsx           état en mémoire, une action par futur appel d’API
    brief.ts            lecture simulée de la phrase de campagne
```

Les couleurs et polices du design sont définies dans `src/app/globals.css` (`@theme`) : encre `ink`, papier `paper`, bureau `desk`, surligneur `marker`, etc. La classe `hl` surligne un fait vérifié.

## Brancher le backend

- Remplacer les lectures de `mock-data.ts` par des appels d’API côté serveur.
- Remplacer chaque action de `store.tsx` par l’appel correspondant (`setProspectStatus`, `sendApproved`, `toggleCampaignPause`, `toggleMailbox`, `choosePlan`, `setReplyDetection`).
- Remplacer `parseBrief` par l’analyse de l’agent.
- Ajouter l’authentification (les formulaires acceptent aujourd’hui n’importe quelle saisie).
