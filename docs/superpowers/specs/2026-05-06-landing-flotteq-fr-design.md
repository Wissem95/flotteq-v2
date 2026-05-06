# Landing flotteq.fr — Design Spec

- **Date** : 2026-05-06
- **Statut** : validé en brainstorming, en attente d'implémentation
- **Topic** : remplacer le placeholder statique de `flotteq.fr` (apex) par un site vitrine complet, et faire de cette landing un 5e frontend React du repo

## 1. Contexte

Phase 1 du déploiement multi-domaine flotteq.fr est terminée (commit `90af165` + fix `3bc48b9`). Aujourd'hui l'apex `https://flotteq.fr` sert un placeholder statique HTML minimaliste (`nginx/landing/index.html`) avec un overlay de redirection vers les 4 sous-domaines.

Cette spec définit la **Phase 2** : remplacer ce placeholder par une landing complète multi-audience.

### Contraintes

- **Pas de fakes** : 0 client payant, 0 témoignage, 0 logo partenaire. La landing ne doit jamais inventer de social proof.
- **Cohérence technique avec le reste du repo** : 4 frontends React 19 + Vite + Tailwind + shadcn déjà en place. La landing rejoint cette stack en tant que 5e frontend.
- **Éviter le rendu "trop IA"** : pas de glassmorphism + gradients abstraits + icônes Lucide partout. Direction visuelle Pennylane/Qonto-like + automotive editorial.

### Audiences (4 profils)

1. **Entreprises B2B** — gestionnaires de flotte, dirigeants PME (clients payants principaux)
2. **Particuliers B2C** — propriétaires de 1+ véhicule personnel
3. **Partenaires** — garages, assureurs, contrôles techniques (marketplace)
4. **Conducteurs** — employés des entreprises clientes (utilisateurs sous-rattachés)

## 2. Direction visuelle

- **Inspiration** : Pennylane / Qonto (B2B SaaS français, friendly humain) + editorial automotive (vraies photos voitures, ateliers, conducteurs)
- **Couleurs** : reprises du `tailwind.config.ts` du frontend-client
  - `flotteq-navy` `#1a3a6c` (bleu marine)
  - `flotteq-blue` `#2463b0` (bleu primaire)
  - `flotteq-teal` `#14b8a6` (turquoise/sarcelle)
  - `flotteq-turquoise` `#0ea5e9` (cyan)
  - `flotteq-light` `#f0f9ff` (bleu très pâle)
- **Gradient signature** : `from-flotteq-navy via-flotteq-blue to-flotteq-teal` (déjà défini en `flotteq-gradient` dans `index.css`)
- **Font** : Inter (300, 400, 500, 600, 700, 800) — Google Fonts
- **Border radius** : `0.75rem` (12px), aligné sur le tailwind config
- **Logo** : texte "FlotteQ" en `font-extrabold` avec `flotteq-gradient` appliqué via `bg-clip-text text-transparent`. Pas de fichier image. Reproduit le pattern du `frontend-internal/MainLayout.tsx`.

## 3. Tagline (hero)

> **Pilotez vos véhicules sereinement.**
> Entretien, conducteurs, assurances — tout est sous contrôle.

Axe émotionnel "tranquillité d'esprit" qui parle à toutes les audiences (stress du gestionnaire, oubli du contrôle technique chez le particulier, planning du conducteur, etc.).

## 4. Architecture de la page (12 blocs)

### 4.1 Header (sticky)

- Logo "FlotteQ" gauche (lien vers `/`)
- Nav centrale (desktop) : "Pour vous" / "Tarifs" / "FAQ"
- Droite : CTA "Connexion" (lien vers overlay 4 choix réutilisé du placeholder actuel) + CTA primary "Essai gratuit" (lien vers `https://app.flotteq.fr/register`)
- Mobile : burger → `Sheet` shadcn

### 4.2 Hero — onglets dynamiques

- Tagline (h1) + sous-titre
- **4 onglets** dans un `Tabs` shadcn :
  - "Entreprise" — sous-titre orienté flotte pro + photo équipe en réunion / van pro
  - "Particulier" — sous-titre orienté tranquillité perso + photo personne avec sa voiture
  - "Partenaire" — sous-titre orienté business marketplace + photo intérieur de garage
  - "Conducteur" — sous-titre orienté simplicité quotidien + photo conducteur (vue intérieur)
- Au clic d'un onglet : sous-titre + image changent en place (transition CSS, pas de reload)
- 2 CTAs sous le hero : primary "Commencer gratuitement" + secondary "Comment ça marche ?" (smooth scroll vers section 6)

### 4.3 Pourquoi maintenant — carousel automatique

- Titre : "Pourquoi gérer ses véhicules autrement ?"
- **Carousel automatique** (3 slides, transition 6s, pause au hover) avec stats marché publiques :
  - "75% des PME gèrent leur flotte sur Excel — perte estimée de 8h/mois par gestionnaire" (source : à confirmer ou retirer la source)
  - "1 contrôle technique sur 4 est oublié ou dépassé en France" (source ANTS)
  - "30% du budget auto annuel = entretien sous-optimisé évitable" (étude AAA — chiffre à valider sinon retirer)
- Chaque slide : grand chiffre + texte + petite illustration SVG inline
- Indicateurs de slide en bas (dots cliquables)

> **À valider à l'implémentation** : si on ne trouve pas de sources publiques solides pour ces 3 stats, on les retire et on remplace par des arguments produit ("Tout dans une seule app", "Conformité automatique", "Réseau de pros vérifiés").

### 4.4 Pour vous — 1 bloc unifié avec accordéon

- Titre : "Pour vous, quelle que soit votre situation"
- **Accordéon shadcn** (4 panels), un seul ouvert à la fois, "Entreprise" ouvert par défaut :
  - **Entreprise**
    - Photo : réunion / responsable de flotte avec tablette
    - 4 features clés : suivi multi-véhicules, gestion conducteurs, tableaux de coûts, conformité automatique
    - CTA : "Découvrir l'offre Pro" → `https://app.flotteq.fr/register?audience=business`
  - **Particulier**
    - Photo : personne lambda avec sa voiture (pas mannequin lookbook)
    - 4 features : rappels CT/révisions, carnet d'entretien numérique, devis garage en 1 clic, suivi km
    - CTA : "Commencer gratuitement" → `https://app.flotteq.fr/register?audience=consumer`
  - **Partenaire**
    - Photo : intérieur d'atelier, mécano au travail
    - 4 features : agenda de réservations, leads qualifiés FlotteQ, gestion devis, paiements Stripe Connect
    - CTA : "Devenir partenaire" → `https://partner.flotteq.fr/register`
  - **Conducteur**
    - Photo : vue conducteur, smartphone en support sur dashboard
    - 4 features : véhicule assigné, rapports état des lieux, planning trajets, contact garage en 1 tap
    - CTA : "Découvrir l'app conducteur" → `https://driver.flotteq.fr`

### 4.5 Pourquoi FlotteQ — 3 différenciateurs

Trois cartes côte à côte (responsive : empilées sur mobile) :
1. **Tout-en-un** — illustration SVG simple "hub avec 4 satellites" : véhicules, conducteurs, partenaires, tarifs en un seul outil
2. **Marketplace intégrée** — illustration SVG "poignée de main" : réseau de garages/assureurs/CT directement dans l'app, devis et réservations en quelques clics
3. **Hébergé en France** — illustration SVG drapeau ou hexagone : données chez OVH Gravelines, RGPD natif, équipe française

### 4.6 Comment ça marche — 3 étapes

Trois étapes numérotées avec illustration SVG et description courte :
1. **Inscrivez-vous en 2 minutes** — création de compte, choix du plan
2. **Ajoutez vos véhicules** — manuel ou import CSV, ou immatriculation pour auto-remplissage (API SIV)
3. **Pilotez et gagnez du temps** — alertes proactives, marketplace de pros à portée de main

### 4.7 Tarifs — 4 plans Stripe

Quatre cartes côte à côte (responsive : empilées sur mobile, 2x2 sur tablette) :
- **Starter** — gratuit ou très bas prix — pour 1-3 véhicules — features de base
- **Pro** — prix mensuel — jusqu'à 10 véhicules — toutes features + marketplace
- **Business** — prix mensuel supérieur — jusqu'à 50 véhicules — features Pro + multi-utilisateurs + reporting avancé
- **Enterprise** — "Nous contacter" — illimité — features Business + SLA + intégrations sur mesure

Plan recommandé (Pro ou Business) mis en avant visuellement (border `flotteq-teal` + badge "Le plus populaire").

> **À valider à l'implémentation** : récupérer les vrais prix Stripe (les 4 plans existent déjà côté backend, voir `backend/src/seeds/seed.ts`). La spec liste les noms et structure, mais les prix exacts viennent de la DB / Stripe.

### 4.8 Notre vision — manifesto (3 cards)

Remplace les "témoignages" qu'on n'a pas. Trois cartes :
1. **Pourquoi on construit FlotteQ** — phrase courte sur la mission (ex: "Parce qu'aucune PME ne devrait perdre 8h par mois sur Excel pour gérer ses véhicules")
2. **Pour qui on construit** — phrase qui parle des 4 audiences (PME, particuliers, partenaires, conducteurs)
3. **Notre engagement** — RGPD, hébergement France, support humain, pas de lock-in (export CSV des données à tout moment)

Pas de signature/photo équipe (l'utilisateur a explicitement refusé).

### 4.9 Sécurité & Conformité — bandeau 4 icônes

Bandeau plein largeur, fond `flotteq-light`, 4 colonnes avec icône SVG + label court :
- **RGPD** : conformité native, données en France
- **Chiffrement TLS 1.3** : connexions sécurisées de bout en bout
- **Hébergé en France (OVH Gravelines)** : aucun transfert hors UE
- **Sauvegardes quotidiennes** : restoration possible J-30

> **À retirer si pas vrai** : "ISO 27001" était mentionné en brainstorming mais OVH datacenter est ISO certifié, pas FlotteQ en tant qu'éditeur. On reste honnête : on liste des garanties qui sont vraies (RGPD, TLS, OVH France, backups), pas de label qu'on ne possède pas.

### 4.10 FAQ — accordéon

Accordéon shadcn, multi-ouverture possible. 8 questions :
1. Puis-je migrer mes données depuis Excel ?
2. Combien de véhicules je peux gérer ?
3. Comment se connectent les partenaires (garages, assureurs) ?
4. La marketplace est-elle obligatoire ?
5. Comment je résilie ?
6. Les données sont-elles RGPD ?
7. Y a-t-il une app mobile ?
8. Comment fonctionne le support ?

Réponses brèves (2-4 lignes max), wording rassurant, sans jargon technique.

### 4.11 CTA final — bandeau plein largeur

- Fond `flotteq-gradient`
- Texte blanc grand : "Prêt à reprendre le contrôle de vos véhicules ?"
- Sous-texte : "Inscription en 2 min, sans engagement, gratuit pour démarrer."
- 2 CTAs : primary "Commencer gratuitement" + secondary "Voir les tarifs" (smooth scroll vers section Tarifs)

### 4.12 Footer — 4 colonnes

- **Produit** : Pour les entreprises / Pour les particuliers / Pour les partenaires / Pour les conducteurs / Tarifs
- **Ressources** : FAQ / Documentation (lien future) / Statut / Sécurité
- **Légal** : Mentions légales / CGU / CGV / RGPD / Cookies
- **Contact** : email contact@flotteq.fr / lien vers les sous-domaines (4 portails)
- En bas : copyright `© 2026 FlotteQ. Tous droits réservés.` + mention "Hébergé en France" + petits liens sociaux (LinkedIn si compte créé, sinon retirer)

> **À créer plus tard si pas existant** : pages `/mentions-legales`, `/cgu`, `/cgv`, `/rgpd`, `/cookies`. Pour la première mise en ligne, ces liens peuvent pointer vers des stubs ou être désactivés. À traiter dans une PR de follow-up.

## 5. Stack technique

### 5.1 Nouveau frontend `frontend-landing/`

Aligné sur les 4 frontends existants :
- **Vite** (template `react-ts`)
- **React 19** (même version que les autres frontends)
- **TypeScript** (strict mode)
- **Tailwind CSS 3.4+** + `tailwindcss-animate`
- **shadcn/ui** : composants `button`, `card`, `accordion`, `tabs`, `sheet` (mobile menu), `carousel` (pour la section 4.3)
- **react-router-dom** : **non utilisé** (single page) — éventuellement pour `/legal/*` futur
- **lucide-react** : **non utilisé** (à éviter pour ne pas avoir le look IA générique). Préférer SVG inline custom et icônes spécifiques contextualisées.
- Fonts : Inter via Google Fonts (déjà importée dans les autres frontends)

### 5.2 Structure du dossier

```
frontend-landing/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Hero.tsx                  (avec Tabs)
│   │   ├── MarketStatsCarousel.tsx
│   │   ├── AudienceAccordion.tsx
│   │   ├── Differentiators.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Pricing.tsx
│   │   ├── Vision.tsx
│   │   ├── SecurityBanner.tsx
│   │   ├── FAQ.tsx
│   │   ├── CTASection.tsx
│   │   ├── Footer.tsx
│   │   ├── LoginOverlay.tsx          (overlay 4 choix réutilisé du placeholder)
│   │   └── ui/                        (shadcn : button, card, accordion, tabs, sheet, carousel)
│   ├── lib/
│   │   └── utils.ts                   (cn helper shadcn)
│   ├── assets/
│   │   ├── illustrations/             (SVG custom : hub, handshake, hexagon-france, etc.)
│   │   └── photos/                    (URLs Unsplash, pas de bundling local sauf hero)
│   ├── data/
│   │   ├── audiences.ts               (contenu sections 4.4 — features par profil)
│   │   ├── pricing.ts                 (4 plans, à synchroniser avec Stripe live)
│   │   └── faq.ts                     (8 questions/réponses)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                      (variables CSS + utilities flotteq-gradient identiques aux autres frontends)
├── public/
│   └── og-image.jpg                   (image Open Graph 1200x630)
├── index.html                         (meta SEO + Open Graph + Twitter card + JSON-LD)
├── tailwind.config.ts                 (copié du frontend-client, avec les tokens flotteq)
├── postcss.config.cjs
├── tsconfig.json
├── vite.config.ts
├── package.json
├── Dockerfile                         (multi-stage : build node + serve nginx, copié des autres frontends)
├── nginx.conf                         (config nginx interne du container, identique aux autres)
└── components.json                    (config shadcn)
```

### 5.3 Intégration au repo existant

#### Dockerfile
Calqué sur `frontend-client/Dockerfile` : multi-stage `node:20-alpine` builder + `nginx:alpine` runtime, avec les mêmes ARG `VITE_API_BASE`. Comme la landing n'appelle pas l'API, l'arg n'est pas vraiment utilisé, mais on le garde pour cohérence et build-time SEO (Open Graph absolu).

#### docker-compose.production.yml
Ajouter un service `frontend-landing` :

```yaml
frontend-landing:
  build:
    context: ./frontend-landing
    dockerfile: Dockerfile
    args:
      VITE_API_BASE: ${VITE_API_BASE:-https://api.flotteq.fr}
  container_name: flotteq_frontend_landing_prod
  restart: always
  networks:
    - flotteq_network
  healthcheck:
    test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
    interval: 30s
    timeout: 3s
    retries: 3
```

Et l'ajouter à `depends_on` de nginx.

#### nginx/conf.d/apex.conf
Modifier le bloc HTTPS de l'apex `flotteq.fr` pour proxy vers `frontend-landing` au lieu de servir des fichiers statiques :

```nginx
upstream frontend_landing {
    server frontend-landing:80;
}

server {
    listen 443 ssl http2;
    server_name flotteq.fr;
    # ... ssl config ...

    location / {
        limit_req zone=general_limit burst=50 nodelay;
        proxy_pass http://frontend_landing;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Le volume `./nginx/landing:/var/www/landing:ro` pourra être retiré du compose ; le dossier `nginx/landing/` peut être conservé (gitignored ou supprimé) — à décider.

## 6. Stratégie images

- **Pas d'images générées par IA**. Pas de stock générique "mains qui tapent sur clavier".
- **Source principale** : Unsplash (photos haute résolution, licence libre commerciale)
- **5 photos clés à sourcer** :
  - Hero : véhicule pro avec branding subtil (van utilitaire, voiture de société) ou parking/flotte vue aérienne
  - Section Entreprise (accordéon) : équipe en réunion ou responsable de flotte avec tablette
  - Section Particulier : personne avec sa voiture, lumière naturelle, pas mannequin
  - Section Partenaire : intérieur d'un garage, mécano au travail, ambiance authentique
  - Section Conducteur : vue conducteur, smartphone en support sur dashboard
- **Optimisation** : conversion en WebP avec fallback JPEG via balise `<picture>`. Lazy-loading natif (`loading="lazy"` sur toutes sauf le hero qui est `eager`). Tailles responsive (`srcset`).
- **À l'implémentation** : URLs Unsplash directes via `images.unsplash.com/photo-XXXX?w=1200&q=80&fm=webp` pour bénéficier du CDN Unsplash et du redimensionnement à la volée. Pas de bundling local (sauf l'image OG).
- **Illustrations SVG custom** : 5-7 SVG inline simples (icônes différenciateurs, étapes "comment ça marche"). Style trait fin (stroke 1.5-2), couleurs `flotteq-blue` + `flotteq-teal`. Pas de set d'icônes générique.

## 7. SEO & meta

`index.html` doit inclure :
- `<title>FlotteQ — Pilotez vos véhicules sereinement</title>`
- `<meta name="description" content="..."`
- Open Graph : `og:title`, `og:description`, `og:image` (1200x630), `og:url`, `og:type=website`
- Twitter card : `twitter:card=summary_large_image`
- JSON-LD : `Organization` (name, url, logo, sameAs) + `Product` (name, description, brand, offers avec les 4 plans)
- `lang="fr"`, `<html lang="fr">`
- Favicon (réutiliser celui de frontend-client ou en créer un avec le wordmark FlotteQ — à voir à l'implémentation)
- `robots.txt` (allow all) et `sitemap.xml` (1 URL pour le moment)

## 8. Performance

- **Lighthouse target** : 95+ sur Performance, Accessibility, Best Practices, SEO
- **Bundle JS** : <150 kB gzippé (React 19 + shadcn + page = atteignable)
- **First Contentful Paint** : <1.5s en 4G (hero photo critique en `<link rel=preload>` ou inline placeholder)
- **CLS** : 0 (toutes les images avec `width`/`height` explicites)

## 9. Responsive

- Mobile first (breakpoint xs `375px`)
- Hamburger menu via `Sheet` shadcn sur < `md` (`768px`)
- Hero : onglets en `Tabs` horizontaux scrollables sur mobile
- Pricing : empilé sur mobile, 2x2 sur tablette, 4 colonnes sur desktop
- Footer : 1 colonne mobile, 4 colonnes desktop
- Aucune fixed dimension qui casse en portrait étroit (xs `375px`)

## 10. Hors scope (explicitement exclu de cette spec)

- Pas de témoignages clients (0 client payant disponible)
- Pas de logos clients ("Ils nous font confiance")
- Pas de stats produit ("X véhicules gérés")
- Pas de logos partenaires ("Norauto", "Allianz")
- Pas de photo équipe / page À propos
- Pas de blog
- Pas de carrières
- Pas de page de connexion (le bouton "Connexion" header ouvre l'overlay 4 choix qui redirige vers les sous-domaines)
- Pas de formulaire de contact (lien `mailto:contact@flotteq.fr`)
- Pas de newsletter form
- Pas de pages légales (placeholders ou liens désactivés en attendant la PR follow-up)
- Pas d'i18n (français uniquement pour le moment)
- Pas de mode dark (la landing reste en clair, contrairement aux apps)
- Pas d'animation `framer-motion` (transitions Tailwind/CSS suffisantes pour ce scope)

## 11. Open questions à résoudre à l'implémentation

1. **Sources des stats marché** (section 4.3) : valider 3 stats publiques sourcées, ou retirer la section et la remplacer par des arguments produit
2. **Prix exacts des 4 plans Stripe** : récupérer les valeurs réelles depuis la DB / dashboard Stripe (le seed `backend/src/seeds/seed.ts` peut donner une base mais les prix Stripe live sont la vérité)
3. **Compte LinkedIn / Twitter / autre social** existant pour le footer ? Si non, retirer la colonne réseaux sociaux
4. **Email réel** `contact@flotteq.fr` : à créer dans OVH MX Plan avant la mise en ligne (dépend du chantier SMTP du point B mentionné dans la conversation parent)
5. **Pages légales** : décider si on les crée (mêmes 5 pages stub) ou si on désactive les liens dans cette PR
6. **Image Open Graph** : à designer (1200x630 avec wordmark FlotteQ + tagline) — peut être généré via Figma / Canva ou en SVG converti

## 12. Critères de succès (definition of done)

- [ ] `https://flotteq.fr` sert la nouvelle landing en HTTPS via le service `frontend-landing`
- [ ] Les 12 sections sont implémentées et responsive (xs → 2xl)
- [ ] Les onglets dynamiques du hero fonctionnent (changement visuel + texte sans reload)
- [ ] Le carousel "Pourquoi maintenant" tourne automatiquement et peut être contrôlé manuellement
- [ ] L'accordéon "Pour vous" ouvre Entreprise par défaut, switch en 1 clic
- [ ] Les 4 plans Stripe sont affichés avec les prix actuels et les bons CTA
- [ ] Les 5 photos Unsplash sont en WebP, lazy-loaded, responsive (`srcset`)
- [ ] Les illustrations SVG custom sont inline, pas d'icônes Lucide
- [ ] Le placeholder actuel `nginx/landing/` est retiré du compose (ou conservé en archive sous un autre nom)
- [ ] Lighthouse score >= 90 sur les 4 critères
- [ ] Mobile testé sur xs (`375px`) et sur safari iOS (notch / safe area)
- [ ] Le site fonctionne en cas de coupure d'API (pas de dépendance backend)
- [ ] Les CTAs pointent vers les bons sous-domaines avec query params d'audience le cas échéant

## 13. Changelog post-décision

- Section "logos clients" / "témoignages" / "stats produit" → **remplacées par "Notre vision" + carousel stats marché** (pas de fakes)
- Sections audiences (4×1) → **fusionnées en 1 bloc accordéon** (gain visuel + scroll)
- Stack technique → **5e frontend React** (au lieu d'un HTML statique), pour cohérence avec les 4 autres frontends du repo
- Tailwind via CDN abandonné → **Tailwind via build Vite** (cohérence)
- Pas d'ISO 27001 mentionné (ne pas mentir sur les certifications)
- Pas de "Intégrations" section (pas pertinent à ce stade, à ajouter plus tard si on a vraiment des intégrations à montrer)
- "Newsletter" du brainstorming initial retiré (pas dans le scope MVP, peut s'ajouter en footer plus tard)
