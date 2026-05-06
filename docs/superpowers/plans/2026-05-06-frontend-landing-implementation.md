# FlotteQ Landing (frontend-landing) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 5th React/Vite/TS/Tailwind/shadcn frontend (`frontend-landing/`) that serves a 12-section marketing landing on `https://flotteq.fr`, replacing the static HTML placeholder, and wire it into docker-compose + nginx.

**Architecture:** Single-page React 19 SPA built with Vite, served as static files by nginx (multi-stage Docker build). All content lives in TypeScript data files for easy editing. shadcn/ui composants are reused (button, card, accordion, tabs, sheet, carousel). Photos are Unsplash CDN URLs (no local bundling). Apex domain `flotteq.fr` proxies to this new container instead of serving a static volume.

**Tech Stack:** Node 20.11 / Vite 7.1 / React 19.1 / TypeScript 5.9 (strict) / Tailwind 3.4 + tailwindcss-animate / shadcn/ui (default style, baseColor slate, prefix none) / Radix UI primitives / clsx + tailwind-merge + class-variance-authority / embla-carousel-react

**Spec source:** `docs/superpowers/specs/2026-05-06-landing-flotteq-fr-design.md` (commit `fc775aa`)

---

## File Structure

New files created in this plan (all under `frontend-landing/` unless stated):

```
frontend-landing/
├── .dockerignore
├── .gitignore
├── Dockerfile                         (multi-stage, copied from frontend-client)
├── README.md                          (1-page how-to-run)
├── components.json                    (shadcn config)
├── eslint.config.js                   (copied from frontend-client)
├── index.html                         (SEO meta + JSON-LD)
├── nginx.conf                         (internal nginx config, served by container)
├── package.json
├── postcss.config.js
├── public/
│   ├── og-image.svg                   (1200x630 Open Graph card)
│   └── favicon.svg                    (FlotteQ wordmark)
├── src/
│   ├── App.tsx                        (orchestrates 12 sections)
│   ├── main.tsx                       (React entry)
│   ├── index.css                      (CSS vars + flotteq utilities, copied)
│   ├── vite-env.d.ts
│   ├── lib/
│   │   └── utils.ts                   (cn helper, copied)
│   ├── components/
│   │   ├── ui/                        (shadcn: button, card, accordion, tabs, sheet, carousel, dialog)
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
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
│   │   └── LoginOverlay.tsx
│   ├── data/
│   │   ├── audiences.ts
│   │   ├── differentiators.ts
│   │   ├── faq.ts
│   │   ├── howItWorks.ts
│   │   ├── marketStats.ts
│   │   ├── pricing.ts
│   │   ├── security.ts
│   │   └── vision.ts
│   └── icons/                         (custom inline SVG components, no lucide for our visuals)
│       ├── Hub.tsx
│       ├── Handshake.tsx
│       ├── Hexagon.tsx
│       ├── ShieldCheck.tsx
│       ├── LockTLS.tsx
│       ├── FlagFR.tsx
│       └── Backup.tsx
├── tailwind.config.ts                 (copied from frontend-client, identical tokens)
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

Existing files modified:

- `docker-compose.production.yml` — add `frontend-landing` service, add to `nginx.depends_on`
- `nginx/conf.d/apex.conf` — replace static-file serving with `proxy_pass http://frontend-landing`
- `nginx/landing/index.html` — kept in repo as historical archive but no longer mounted (compose volume removed)

---

## Phase 1 — Project Setup

### Task 1: Scaffold the directory and copy stable configs

**Files:**
- Create: `frontend-landing/` (entire dir)
- Copy from `frontend-client/`: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `postcss.config.js`, `.gitignore`, `nginx.conf`, `Dockerfile`, `src/lib/utils.ts`, `src/index.css`, `tailwind.config.ts`, `components.json`

- [ ] **Step 1: Create the dir tree**

```bash
mkdir -p frontend-landing/src/{components/ui,data,icons,lib} frontend-landing/public
```

- [ ] **Step 2: Copy the stable tooling configs verbatim from frontend-client**

```bash
cp frontend-client/tsconfig.json frontend-landing/tsconfig.json
cp frontend-client/tsconfig.app.json frontend-landing/tsconfig.app.json
cp frontend-client/tsconfig.node.json frontend-landing/tsconfig.node.json
cp frontend-client/eslint.config.js frontend-landing/eslint.config.js
cp frontend-client/postcss.config.js frontend-landing/postcss.config.js
cp frontend-client/.gitignore frontend-landing/.gitignore
cp frontend-client/nginx.conf frontend-landing/nginx.conf
cp frontend-client/Dockerfile frontend-landing/Dockerfile
cp frontend-client/components.json frontend-landing/components.json
cp frontend-client/tailwind.config.ts frontend-landing/tailwind.config.ts
cp frontend-client/src/lib/utils.ts frontend-landing/src/lib/utils.ts
cp frontend-client/src/index.css frontend-landing/src/index.css
```

- [ ] **Step 3: Strip the frontend-client Dockerfile of unused build args**

Edit `frontend-landing/Dockerfile`. Remove the `ARG VITE_STRIPE_PUBLISHABLE_KEY` line and the matching `ENV` reference (the landing has no Stripe call — it links to `app.flotteq.fr` for that). The final Dockerfile must read:

```dockerfile
# Stage 1: Builder
FROM node:20.11.0-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE
ARG VITE_PUBLIC_URL=https://flotteq.fr

COPY package*.json ./

RUN npm ci

COPY . .

ENV VITE_API_BASE=$VITE_API_BASE \
    VITE_PUBLIC_URL=$VITE_PUBLIC_URL

RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 4: Create a `.dockerignore` to keep builds fast**

Create `frontend-landing/.dockerignore`:

```
node_modules
dist
.git
.gitignore
README.md
.env
.env.local
.env.*.local
```

- [ ] **Step 5: Commit**

```bash
git add frontend-landing/
git commit -m "chore(frontend-landing): scaffold dir, copy stable tooling configs from frontend-client"
```

---

### Task 2: Write `package.json` with the minimal dependency set

**Files:**
- Create: `frontend-landing/package.json`

- [ ] **Step 1: Write `frontend-landing/package.json`**

```json
{
  "name": "frontend-landing",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-tabs": "^1.1.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "embla-carousel-react": "^8.3.0",
    "lucide-react": "^0.544.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.36.0",
    "@types/node": "^24.6.2",
    "@types/react": "^19.1.16",
    "@types/react-dom": "^19.1.9",
    "@vitejs/plugin-react": "^5.0.4",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.36.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.22",
    "globals": "^16.4.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.18",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.45.0",
    "vite": "^7.1.7"
  }
}
```

> **Note on `lucide-react`:** It is a transitive dependency of the `@radix-ui` accordion chevron and the shadcn boilerplate. We install it but DO NOT import it for our own iconography — all our visual icons live in `src/icons/` as inline SVG. This keeps the spec promise of "no generic Lucide look" while letting shadcn work out of the box.

- [ ] **Step 2: Install dependencies and verify they resolve**

```bash
cd frontend-landing && npm install
```

Expected: `added X packages` with no peer-dep errors. If npm complains about peer deps, run `npm install --legacy-peer-deps` (this is the same flag the other frontends use; if not, fix the version mismatch).

- [ ] **Step 3: Commit lock file**

```bash
git add frontend-landing/package.json frontend-landing/package-lock.json
git commit -m "chore(frontend-landing): pin dependencies (React 19 + Vite + Tailwind + shadcn)"
```

---

### Task 3: Wire up Vite + entry HTML + main.tsx

**Files:**
- Create: `frontend-landing/vite.config.ts`
- Create: `frontend-landing/index.html`
- Create: `frontend-landing/src/main.tsx`
- Create: `frontend-landing/src/App.tsx`
- Create: `frontend-landing/src/vite-env.d.ts`

- [ ] **Step 1: Write `vite.config.ts`** (no API proxy because the landing makes no API calls in dev)

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5177,
  },
});
```

> **Note:** Port 5177 chosen because 5174/5175/5176 are taken by the other dev servers. If you change it, update README.

- [ ] **Step 2: Write `index.html`** with full SEO meta and JSON-LD

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#1a3a6c" />

    <title>FlotteQ — Pilotez vos véhicules sereinement</title>
    <meta name="description" content="La plateforme tout-en-un pour gérer vos véhicules : entretien, conducteurs, partenaires, assurances. Pour les entreprises et les particuliers. Hébergé en France." />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://flotteq.fr/" />
    <meta property="og:title" content="FlotteQ — Pilotez vos véhicules sereinement" />
    <meta property="og:description" content="La plateforme tout-en-un pour gérer vos véhicules. Pour entreprises, particuliers, partenaires et conducteurs." />
    <meta property="og:image" content="https://flotteq.fr/og-image.svg" />
    <meta property="og:locale" content="fr_FR" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="FlotteQ — Pilotez vos véhicules sereinement" />
    <meta name="twitter:description" content="La plateforme tout-en-un pour gérer vos véhicules." />
    <meta name="twitter:image" content="https://flotteq.fr/og-image.svg" />

    <!-- JSON-LD Organization -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "FlotteQ",
        "url": "https://flotteq.fr",
        "logo": "https://flotteq.fr/favicon.svg",
        "description": "Plateforme SaaS de gestion de flotte automobile et marketplace de services (garages, assurances, contrôles techniques)."
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Write `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 4: Write `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 5: Write a placeholder `src/App.tsx`** (we'll fill it section by section in Phase 2)

```tsx
export default function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <h1 className="p-8 text-4xl font-extrabold flotteq-gradient-text">FlotteQ — landing skeleton</h1>
      <p className="px-8 pb-8 text-muted-foreground">Sections will be added one by one.</p>
    </main>
  );
}
```

- [ ] **Step 6: Verify the dev server boots**

```bash
cd frontend-landing && npm run dev
```

Expected: `Local: http://localhost:5177/` with no errors. Open it in a browser, confirm the gradient title is visible. Stop the server (`Ctrl+C`).

- [ ] **Step 7: Verify the build works**

```bash
cd frontend-landing && npm run build
```

Expected: `dist/` directory created, `dist/index.html` exists, no TypeScript errors. Report any warning.

- [ ] **Step 8: Commit**

```bash
git add frontend-landing/vite.config.ts frontend-landing/index.html frontend-landing/src/main.tsx frontend-landing/src/App.tsx frontend-landing/src/vite-env.d.ts
git commit -m "feat(frontend-landing): bootstrap Vite + SEO meta + skeleton App"
```

---

### Task 4: Generate shadcn UI components needed by the landing

We use the shadcn CLI when possible to keep components canonical. The components needed are: `button`, `card`, `accordion`, `tabs`, `sheet`, `dialog`, `carousel`. The `cn` helper and `components.json` were already copied in Task 1.

**Files:**
- Create: `frontend-landing/src/components/ui/button.tsx`
- Create: `frontend-landing/src/components/ui/card.tsx`
- Create: `frontend-landing/src/components/ui/accordion.tsx`
- Create: `frontend-landing/src/components/ui/tabs.tsx`
- Create: `frontend-landing/src/components/ui/sheet.tsx`
- Create: `frontend-landing/src/components/ui/dialog.tsx`
- Create: `frontend-landing/src/components/ui/carousel.tsx`

- [ ] **Step 1: Try the shadcn CLI first (recommended)**

```bash
cd frontend-landing
npx shadcn@latest add button card accordion tabs sheet dialog carousel
```

Accept any prompts about overwriting `components.json` (already configured) and `lib/utils.ts` (already copied — answer "no" if asked to overwrite). Expected output: 7 component files added in `src/components/ui/`.

- [ ] **Step 2: If the CLI fails (offline / version mismatch), fall back to copying from frontend-client**

If `npx shadcn@latest add` errors out:

```bash
# button + card already in frontend-client
cp frontend-client/src/components/ui/button.tsx frontend-landing/src/components/ui/button.tsx
cp frontend-client/src/components/ui/card.tsx frontend-landing/src/components/ui/card.tsx
```

For `accordion`, `tabs`, `sheet`, `dialog`, `carousel`: search if any sibling frontend has them. Run:

```bash
for c in accordion tabs sheet dialog carousel; do
  echo "--- $c ---"
  find frontend-* -path '*/components/ui/'$c'.tsx' 2>/dev/null
done
```

Copy any that exist; for the missing ones, fetch the official source from https://ui.shadcn.com/docs/components/<name> and create the file manually. Do not invent code — use the official shadcn source.

- [ ] **Step 3: Verify TypeScript still compiles**

```bash
cd frontend-landing && npm run build
```

Expected: build succeeds. If a shadcn component complains about a missing peer (e.g. `@radix-ui/react-tabs`), add it to `package.json` and `npm install` — every shadcn primitive uses one Radix package.

- [ ] **Step 4: Commit**

```bash
git add frontend-landing/src/components/ui/
git commit -m "feat(frontend-landing): add shadcn ui primitives (button, card, accordion, tabs, sheet, dialog, carousel)"
```

---

### Task 5: Write the static data files (single source of truth for landing content)

**Files:**
- Create: `frontend-landing/src/data/audiences.ts`
- Create: `frontend-landing/src/data/differentiators.ts`
- Create: `frontend-landing/src/data/faq.ts`
- Create: `frontend-landing/src/data/howItWorks.ts`
- Create: `frontend-landing/src/data/marketStats.ts`
- Create: `frontend-landing/src/data/pricing.ts`
- Create: `frontend-landing/src/data/security.ts`
- Create: `frontend-landing/src/data/vision.ts`

- [ ] **Step 1: Write `src/data/audiences.ts`**

```ts
export type AudienceKey = 'business' | 'consumer' | 'partner' | 'driver';

export interface Audience {
  key: AudienceKey;
  label: string;
  heroSubtitle: string;
  heroImageUrl: string;
  accordionTitle: string;
  accordionImageUrl: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
}

export const audiences: Audience[] = [
  {
    key: 'business',
    label: 'Entreprise',
    heroSubtitle:
      'Centralisez tous vos véhicules pros, vos conducteurs et vos partenaires dans un seul outil — gagnez 8h par mois sur Excel.',
    heroImageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop',
    accordionTitle: 'Pour les entreprises avec une flotte',
    accordionImageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&q=80&auto=format&fit=crop',
    features: [
      'Suivi multi-véhicules en temps réel',
      'Gestion des conducteurs et trajets',
      'Tableaux de bord coûts et budgets',
      'Conformité automatique (CT, assurance, révisions)',
    ],
    ctaLabel: "Découvrir l'offre Pro",
    ctaHref: 'https://app.flotteq.fr/register?audience=business',
  },
  {
    key: 'consumer',
    label: 'Particulier',
    heroSubtitle:
      "Oubliez le stress du contrôle technique, des révisions et de l'assurance — FlotteQ vous prévient au bon moment.",
    heroImageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80&auto=format&fit=crop',
    accordionTitle: 'Pour les particuliers',
    accordionImageUrl: 'https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=900&q=80&auto=format&fit=crop',
    features: [
      'Rappels automatiques CT, révisions, assurance',
      "Carnet d'entretien numérique",
      'Devis garage en 1 clic via la marketplace',
      'Suivi kilométrage et budget auto',
    ],
    ctaLabel: 'Commencer gratuitement',
    ctaHref: 'https://app.flotteq.fr/register?audience=consumer',
  },
  {
    key: 'partner',
    label: 'Partenaire',
    heroSubtitle:
      'Rejoignez le réseau FlotteQ : recevez des clients qualifiés, gérez vos rendez-vous et vos paiements depuis une seule app.',
    heroImageUrl: 'https://images.unsplash.com/photo-1632823471565-1ecdf2b3a13b?w=1200&q=80&auto=format&fit=crop',
    accordionTitle: 'Pour les garages, assureurs, contrôles techniques',
    accordionImageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=900&q=80&auto=format&fit=crop',
    features: [
      'Agenda de réservations en ligne',
      'Leads qualifiés depuis FlotteQ',
      'Gestion des devis et factures',
      'Paiements sécurisés via Stripe Connect',
    ],
    ctaLabel: 'Devenir partenaire',
    ctaHref: 'https://partner.flotteq.fr/register',
  },
  {
    key: 'driver',
    label: 'Conducteur',
    heroSubtitle:
      "Votre véhicule pro à portée de main : trajets, état des lieux, contact garage — tout sans paperasse.",
    heroImageUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=80&auto=format&fit=crop',
    accordionTitle: 'Pour les conducteurs en entreprise',
    accordionImageUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&q=80&auto=format&fit=crop',
    features: [
      'Véhicule assigné en un coup d\'œil',
      "Rapports d'état des lieux photo",
      'Planning des trajets',
      'Contact garage en 1 tap',
    ],
    ctaLabel: 'Découvrir l\'app conducteur',
    ctaHref: 'https://driver.flotteq.fr',
  },
];
```

> **Image URLs note:** All photos use Unsplash CDN with on-the-fly resize parameters (`w=`, `q=`, `auto=format`). The exact photo IDs above are placeholder picks — verify each one before final ship by visiting the URL. If any returns 404, browse https://unsplash.com/s/photos/fleet-management or `garage` and pick a similar one. Update the URL but keep the params.

- [ ] **Step 2: Write `src/data/marketStats.ts`**

```ts
export interface MarketStat {
  big: string;
  text: string;
}

export const marketStats: MarketStat[] = [
  {
    big: '75%',
    text: 'des PME gèrent leur flotte sur Excel — et y perdent en moyenne 8 heures par mois par gestionnaire.',
  },
  {
    big: '1 sur 4',
    text: 'contrôles techniques sont oubliés ou dépassés en France. Coût d\'une amende : 135 €.',
  },
  {
    big: '30%',
    text: "du budget d'entretien d'un véhicule est sur-dépensé faute de comparer les devis.",
  },
];
```

> **Source disclaimer:** These figures are directional, not from a single peer-reviewed source. To stay credible without overclaiming, the section title is *"Pourquoi gérer ses véhicules autrement ?"* — framed as common pain points rather than a research citation. If at review the team prefers harder sourcing, swap to product arguments instead (see spec §4.3 fallback).

- [ ] **Step 3: Write `src/data/differentiators.ts`**

```ts
export interface Differentiator {
  iconKey: 'hub' | 'handshake' | 'hexagon';
  title: string;
  description: string;
}

export const differentiators: Differentiator[] = [
  {
    iconKey: 'hub',
    title: 'Tout-en-un',
    description:
      'Véhicules, conducteurs, partenaires et coûts : un seul outil au lieu de cinq. Plus de copier-coller, plus de tableurs perdus.',
  },
  {
    iconKey: 'handshake',
    title: 'Marketplace intégrée',
    description:
      'Garages, assureurs et contrôles techniques directement dans l\'app. Devis, réservations et paiements en quelques clics.',
  },
  {
    iconKey: 'hexagon',
    title: 'Hébergé en France',
    description:
      'Données chez OVH Gravelines, RGPD natif, équipe basée en France. Aucune donnée ne quitte l\'Union européenne.',
  },
];
```

- [ ] **Step 4: Write `src/data/howItWorks.ts`**

```ts
export interface Step {
  number: number;
  title: string;
  description: string;
}

export const steps: Step[] = [
  {
    number: 1,
    title: 'Inscrivez-vous en 2 minutes',
    description: 'Choisissez votre profil et votre plan. Aucune carte bancaire pour commencer.',
  },
  {
    number: 2,
    title: 'Ajoutez vos véhicules',
    description:
      "Saisissez votre immatriculation : la fiche du véhicule se remplit automatiquement. Ou importez une liste depuis Excel.",
  },
  {
    number: 3,
    title: 'Pilotez et gagnez du temps',
    description:
      "Recevez les bonnes alertes au bon moment. Trouvez le bon partenaire en deux clics. Suivez vos coûts en temps réel.",
  },
];
```

- [ ] **Step 5: Write `src/data/pricing.ts`**

```ts
export interface Plan {
  key: 'starter' | 'pro' | 'business' | 'enterprise';
  name: string;
  priceLabel: string;
  priceSuffix?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlight?: boolean;
}

// Prices below are placeholders to validate against the live Stripe dashboard before ship.
// See spec §4.7 open question. Backend seeds: backend/src/seeds/seed.ts
export const plans: Plan[] = [
  {
    key: 'starter',
    name: 'Starter',
    priceLabel: 'Gratuit',
    description: 'Pour démarrer ou pour les particuliers avec 1 à 3 véhicules.',
    features: ['Jusqu\'à 3 véhicules', 'Rappels d\'entretien', 'Marketplace en lecture', 'Support communautaire'],
    ctaLabel: 'Commencer',
    ctaHref: 'https://app.flotteq.fr/register?plan=starter',
  },
  {
    key: 'pro',
    name: 'Pro',
    priceLabel: '29 €',
    priceSuffix: '/mois',
    description: 'Pour les TPE et les particuliers exigeants.',
    features: ['Jusqu\'à 10 véhicules', 'Toutes les features Starter', 'Réservations marketplace', 'Support email 48h'],
    ctaLabel: 'Choisir Pro',
    ctaHref: 'https://app.flotteq.fr/register?plan=pro',
    highlight: true,
  },
  {
    key: 'business',
    name: 'Business',
    priceLabel: '79 €',
    priceSuffix: '/mois',
    description: 'Pour les PME multi-conducteurs.',
    features: ['Jusqu\'à 50 véhicules', 'Multi-utilisateurs', 'Reporting avancé', 'Support prioritaire 24h'],
    ctaLabel: 'Choisir Business',
    ctaHref: 'https://app.flotteq.fr/register?plan=business',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    priceLabel: 'Sur devis',
    description: 'Pour les flottes >50 véhicules avec besoins spécifiques.',
    features: ['Véhicules illimités', 'SLA personnalisé', 'Intégrations sur mesure', 'Account manager dédié'],
    ctaLabel: 'Nous contacter',
    ctaHref: 'mailto:contact@flotteq.fr?subject=Demande%20Enterprise',
  },
];
```

- [ ] **Step 6: Write `src/data/vision.ts`**

```ts
export interface VisionCard {
  title: string;
  text: string;
}

export const visionCards: VisionCard[] = [
  {
    title: 'Pourquoi on construit FlotteQ',
    text: "Parce qu'aucune entreprise ne devrait perdre 8 heures par mois sur Excel, et qu'aucun particulier ne devrait recevoir une amende pour un contrôle technique oublié.",
  },
  {
    title: 'Pour qui',
    text: 'Pour les PME, les particuliers, les garages, les assureurs et les conducteurs — tous ceux qui font vivre la mobilité automobile et veulent reprendre du temps.',
  },
  {
    title: 'Notre engagement',
    text: 'RGPD natif, hébergement France, support humain, export de vos données à tout moment. Pas de lock-in, pas de revente de données.',
  },
];
```

- [ ] **Step 7: Write `src/data/security.ts`**

```ts
export interface SecurityItem {
  iconKey: 'shield' | 'lock' | 'flag' | 'backup';
  label: string;
  description: string;
}

export const securityItems: SecurityItem[] = [
  { iconKey: 'shield', label: 'RGPD', description: 'Conformité native, données en France.' },
  { iconKey: 'lock', label: 'TLS 1.3', description: 'Connexions chiffrées de bout en bout.' },
  { iconKey: 'flag', label: 'Hébergé en France', description: 'OVH Gravelines, jamais hors UE.' },
  { iconKey: 'backup', label: 'Sauvegardes', description: 'Quotidiennes, restoration jusqu\'à J-30.' },
];
```

- [ ] **Step 8: Write `src/data/faq.ts`**

```ts
export interface FAQEntry {
  question: string;
  answer: string;
}

export const faq: FAQEntry[] = [
  {
    question: 'Puis-je migrer mes données depuis Excel ?',
    answer:
      'Oui. Importez votre liste de véhicules en CSV en quelques secondes. Vous pouvez aussi simplement saisir les immatriculations : les fiches se remplissent automatiquement.',
  },
  {
    question: 'Combien de véhicules puis-je gérer ?',
    answer:
      'De 1 à illimité selon votre plan. Starter va jusqu\'à 3, Pro jusqu\'à 10, Business jusqu\'à 50, Enterprise sans limite.',
  },
  {
    question: 'Comment se connectent les partenaires (garages, assureurs) ?',
    answer:
      "Les partenaires ont leur propre espace sur partner.flotteq.fr : ils gèrent leur agenda, reçoivent vos demandes de devis et sont payés via Stripe Connect.",
  },
  {
    question: 'La marketplace est-elle obligatoire ?',
    answer: 'Non. Vous pouvez utiliser FlotteQ uniquement pour la gestion interne. La marketplace est un service complémentaire.',
  },
  {
    question: 'Comment je résilie ?',
    answer:
      'En 1 clic depuis votre espace, sans engagement et sans pénalité. Vos données restent exportables 30 jours après la résiliation.',
  },
  {
    question: 'Mes données sont-elles vraiment protégées (RGPD) ?',
    answer:
      'Oui. Hébergement OVH Gravelines (France), chiffrement TLS 1.3, accès strictement contrôlé, exports utilisateurs disponibles à tout moment.',
  },
  {
    question: 'Y a-t-il une app mobile ?',
    answer:
      'L\'interface est entièrement responsive et fonctionne parfaitement sur mobile. Une app native iOS/Android est dans la roadmap.',
  },
  {
    question: 'Comment fonctionne le support ?',
    answer:
      'Email pour tous les plans, support prioritaire pour Business et Enterprise, account manager dédié pour Enterprise.',
  },
];
```

- [ ] **Step 9: Verify TypeScript compiles**

```bash
cd frontend-landing && npm run build
```

Expected: build OK, no type errors. The skeleton App still renders the placeholder.

- [ ] **Step 10: Commit**

```bash
git add frontend-landing/src/data/
git commit -m "feat(frontend-landing): add static content data (audiences, pricing, faq, vision, etc.)"
```

---

## Phase 2 — Components and Layout

> **Important convention:** Every component file is `~150 lines max`. If a component grows past that, split it into a parent + sub-components in the same file or a sibling file. We prioritise files that fit in one screen of context.

### Task 6: Inline SVG icons

Custom icons live in `src/icons/` so we never reach for Lucide for visual elements. The shadcn primitives keep their default Lucide chevrons (Accordion, etc.) — that's fine, those are utility chevrons not brand icons.

**Files:**
- Create: `frontend-landing/src/icons/Hub.tsx`
- Create: `frontend-landing/src/icons/Handshake.tsx`
- Create: `frontend-landing/src/icons/Hexagon.tsx`
- Create: `frontend-landing/src/icons/ShieldCheck.tsx`
- Create: `frontend-landing/src/icons/LockTLS.tsx`
- Create: `frontend-landing/src/icons/FlagFR.tsx`
- Create: `frontend-landing/src/icons/Backup.tsx`

- [ ] **Step 1: Create the 7 SVG components, each in its own file**

Each follows the exact same pattern. Example `src/icons/Hub.tsx`:

```tsx
import type { SVGProps } from 'react';

export function Hub(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="40" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="40" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="40" cy="40" r="3" stroke="currentColor" strokeWidth="2" />
      <line x1="11" y1="11" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="37" y1="11" x2="28" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="37" x2="20" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="37" y1="37" x2="28" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
```

`Handshake.tsx`:

```tsx
import type { SVGProps } from 'react';

export function Handshake(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M6 28L14 20L20 26L26 20L34 26L42 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 20L18 16M34 26L38 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 26L24 30L28 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

`Hexagon.tsx`:

```tsx
import type { SVGProps } from 'react';

export function Hexagon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M18 20H30M18 26H30M22 32H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
```

`ShieldCheck.tsx`:

```tsx
import type { SVGProps } from 'react';

export function ShieldCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M24 4L40 10V24C40 33 33 40 24 44C15 40 8 33 8 24V10L24 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M16 24L22 30L34 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

`LockTLS.tsx`:

```tsx
import type { SVGProps } from 'react';

export function LockTLS(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="10" y="22" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M16 22V14C16 9.58 19.58 6 24 6C28.42 6 32 9.58 32 14V22" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="32" r="2" fill="currentColor" />
    </svg>
  );
}
```

`FlagFR.tsx`:

```tsx
import type { SVGProps } from 'react';

export function FlagFR(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="6" y="10" width="12" height="28" fill="#0055A4" />
      <rect x="18" y="10" width="12" height="28" fill="white" stroke="currentColor" strokeWidth="0.5" />
      <rect x="30" y="10" width="12" height="28" fill="#EF4135" />
    </svg>
  );
}
```

`Backup.tsx`:

```tsx
import type { SVGProps } from 'react';

export function Backup(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse cx="24" cy="12" rx="14" ry="4" stroke="currentColor" strokeWidth="2" />
      <path d="M10 12V24C10 26.21 16.27 28 24 28C31.73 28 38 26.21 38 24V12" stroke="currentColor" strokeWidth="2" />
      <path d="M10 24V36C10 38.21 16.27 40 24 40C31.73 40 38 38.21 38 36V24" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
```

- [ ] **Step 2: Verify the build**

```bash
cd frontend-landing && npm run build
```

Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add frontend-landing/src/icons/
git commit -m "feat(frontend-landing): add custom inline SVG icons (no lucide for brand visuals)"
```

---

### Task 7: Header component

**Files:**
- Create: `frontend-landing/src/components/Header.tsx`
- Modify: `frontend-landing/src/App.tsx`

- [ ] **Step 1: Write `src/components/Header.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '#audiences', label: 'Pour vous' },
  { href: '#pricing', label: 'Tarifs' },
  { href: '#faq', label: 'FAQ' },
];

export function Header({ onLoginClick }: { onLoginClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-40 transition-all',
        scrolled ? 'bg-white/90 backdrop-blur border-b border-slate-100' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="/" className="text-xl font-extrabold tracking-tight flotteq-gradient-text">
          FlotteQ
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-flotteq-blue transition-colors">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" onClick={onLoginClick}>
            Connexion
          </Button>
          <Button asChild className="bg-flotteq-blue hover:bg-flotteq-navy text-white">
            <a href="https://app.flotteq.fr/register">Essai gratuit</a>
          </Button>
        </div>

        {/* Mobile burger */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col gap-4 mt-8">
              {NAV_ITEMS.map((item) => (
                <a key={item.href} href={item.href} className="text-lg font-medium text-slate-700">
                  {item.label}
                </a>
              ))}
              <hr className="my-4" />
              <Button variant="outline" onClick={onLoginClick}>Connexion</Button>
              <Button asChild className="bg-flotteq-blue text-white hover:bg-flotteq-navy">
                <a href="https://app.flotteq.fr/register">Essai gratuit</a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Wire it in `App.tsx`** (we'll fully overhaul `App.tsx` later — keep header for now)

```tsx
import { useState } from 'react';
import { Header } from './components/Header';

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header onLoginClick={() => setLoginOpen(true)} />
      <div className="pt-16 p-8">
        <h1 className="text-4xl font-extrabold flotteq-gradient-text">Header skeleton OK</h1>
        {loginOpen && <p>Login overlay would open here</p>}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Run dev, visually verify the header**

```bash
cd frontend-landing && npm run dev
```

Open http://localhost:5177 in browser. Expected: gradient "FlotteQ" wordmark left, nav center, two buttons right. Resize to mobile: nav collapses to a burger that opens a drawer. Scroll a few pixels: header grows a white background.

- [ ] **Step 4: Commit**

```bash
git add frontend-landing/src/components/Header.tsx frontend-landing/src/App.tsx
git commit -m "feat(frontend-landing): header with sticky scroll + mobile sheet"
```

---

### Task 8: Hero with dynamic audience tabs

**Files:**
- Create: `frontend-landing/src/components/Hero.tsx`
- Modify: `frontend-landing/src/App.tsx`

- [ ] **Step 1: Write `src/components/Hero.tsx`**

```tsx
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { audiences, type AudienceKey } from '@/data/audiences';

export function Hero() {
  const [activeKey, setActiveKey] = useState<AudienceKey>('business');
  const active = audiences.find((a) => a.key === activeKey)!;

  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-flotteq-navy leading-[1.05]">
            Pilotez vos véhicules <span className="flotteq-gradient-text">sereinement.</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-slate-600 max-w-xl">
            Entretien, conducteurs, assurances — tout est sous contrôle.
          </p>

          <Tabs value={activeKey} onValueChange={(v) => setActiveKey(v as AudienceKey)} className="mt-8">
            <TabsList className="bg-flotteq-light p-1 h-auto flex-wrap">
              {audiences.map((a) => (
                <TabsTrigger
                  key={a.key}
                  value={a.key}
                  className="data-[state=active]:bg-white data-[state=active]:text-flotteq-navy data-[state=active]:shadow text-sm md:text-base"
                >
                  {a.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <p className="mt-6 text-base text-slate-700 leading-relaxed max-w-lg" key={active.key}>
            {active.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button asChild className="bg-flotteq-blue hover:bg-flotteq-navy text-white" size="lg">
              <a href={active.ctaHref}>Commencer gratuitement</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#how">Comment ça marche ?</a>
            </Button>
          </div>
        </div>

        <div className="relative">
          <img
            src={active.heroImageUrl}
            alt={`Illustration : ${active.label}`}
            width={1200}
            height={900}
            loading="eager"
            decoding="async"
            className="w-full aspect-[4/3] object-cover rounded-2xl shadow-xl border border-slate-100"
            key={active.key}
          />
          <div className="absolute -inset-2 -z-10 rounded-2xl flotteq-gradient opacity-10 blur-xl" />
        </div>
      </div>
    </section>
  );
}
```

> **Note:** The `key` prop on `<p>` and `<img>` forces React to remount on tab change — this gives a tiny CSS-default fade with no extra animation library.

- [ ] **Step 2: Add Hero to App.tsx**

Replace the temporary content block in `src/App.tsx` with:

```tsx
import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header onLoginClick={() => setLoginOpen(true)} />
      <Hero />
      {loginOpen && <p className="hidden">{/* placeholder until LoginOverlay */}</p>}
    </main>
  );
}
```

- [ ] **Step 3: Visual verification**

Run `npm run dev`. Open http://localhost:5177. Confirm: tagline visible, 4 tabs (Entreprise selected by default), photo right side. Click each tab — subtitle text + image should swap. Resize mobile: image goes below text, tabs scroll horizontally if needed.

- [ ] **Step 4: Commit**

```bash
git add frontend-landing/src/components/Hero.tsx frontend-landing/src/App.tsx
git commit -m "feat(frontend-landing): hero with dynamic audience tabs"
```

---

### Task 9: Market stats carousel

**Files:**
- Create: `frontend-landing/src/components/MarketStatsCarousel.tsx`
- Modify: `frontend-landing/src/App.tsx`

- [ ] **Step 1: Write `src/components/MarketStatsCarousel.tsx`**

```tsx
import { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { marketStats } from '@/data/marketStats';
import { cn } from '@/lib/utils';

const AUTOPLAY_MS = 6000;

export function MarketStatsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const id = setInterval(() => emblaApi.scrollNext(), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [emblaApi]);

  return (
    <section id="why-now" className="py-16 md:py-24 bg-flotteq-light">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-flotteq-navy">
          Pourquoi gérer ses véhicules autrement ?
        </h2>
        <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
          Les chiffres parlent d'eux-mêmes — et ce sont les vôtres qui sont en jeu.
        </p>

        <div className="mt-10 overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {marketStats.map((s, i) => (
              <div key={i} className="min-w-0 flex-[0_0_100%] px-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-10 md:p-14 text-center max-w-3xl mx-auto shadow-sm">
                  <div className="text-6xl md:text-7xl font-extrabold flotteq-gradient-text">{s.big}</div>
                  <p className="mt-4 text-lg md:text-xl text-slate-700 leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {marketStats.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Aller à la stat ${i + 1}`}
              className={cn(
                'h-2 rounded-full transition-all',
                i === selected ? 'w-8 bg-flotteq-blue' : 'w-2 bg-slate-300'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to App.tsx**

```tsx
import { MarketStatsCarousel } from './components/MarketStatsCarousel';
// ...
<Hero />
<MarketStatsCarousel />
```

- [ ] **Step 3: Visual verification**

Run dev. Confirm carousel auto-advances every 6s, dots reflect current slide, click on dot scrolls to slide.

- [ ] **Step 4: Commit**

```bash
git add frontend-landing/src/components/MarketStatsCarousel.tsx frontend-landing/src/App.tsx
git commit -m "feat(frontend-landing): market stats carousel with autoplay (6s)"
```

---

### Task 10: Audience accordion

**Files:**
- Create: `frontend-landing/src/components/AudienceAccordion.tsx`
- Modify: `frontend-landing/src/App.tsx`

- [ ] **Step 1: Write `src/components/AudienceAccordion.tsx`**

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { audiences } from '@/data/audiences';

export function AudienceAccordion() {
  return (
    <section id="audiences" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-flotteq-navy">
          Pour vous, quelle que soit votre situation
        </h2>
        <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
          Quatre profils, une seule plateforme. Cliquez pour découvrir le vôtre.
        </p>

        <div className="mt-10 max-w-4xl mx-auto">
          <Accordion type="single" collapsible defaultValue="business" className="space-y-4">
            {audiences.map((a) => (
              <AccordionItem
                key={a.key}
                value={a.key}
                className="bg-white rounded-2xl border border-slate-100 px-6 shadow-sm data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-lg md:text-xl font-bold text-flotteq-navy hover:no-underline py-5">
                  {a.accordionTitle}
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="grid md:grid-cols-2 gap-6 items-start">
                    <img
                      src={a.accordionImageUrl}
                      alt={`Photo : ${a.label}`}
                      width={900}
                      height={600}
                      loading="lazy"
                      decoding="async"
                      className="w-full aspect-[3/2] object-cover rounded-xl"
                    />
                    <div>
                      <ul className="space-y-3">
                        {a.features.map((f) => (
                          <li key={f} className="flex gap-3 text-slate-700">
                            <span className="mt-1 h-2 w-2 rounded-full bg-flotteq-teal flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Button asChild className="mt-6 bg-flotteq-blue hover:bg-flotteq-navy text-white">
                        <a href={a.ctaHref}>{a.ctaLabel}</a>
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to App.tsx**

```tsx
import { AudienceAccordion } from './components/AudienceAccordion';
// ...
<MarketStatsCarousel />
<AudienceAccordion />
```

- [ ] **Step 3: Visual check**

Run dev. Open accordion sections — `business` should be open by default. Clicking another auto-closes the previous one (`type="single"`).

- [ ] **Step 4: Commit**

```bash
git add frontend-landing/src/components/AudienceAccordion.tsx frontend-landing/src/App.tsx
git commit -m "feat(frontend-landing): unified audience accordion (4 profiles)"
```

---

### Task 11: Differentiators section

**Files:**
- Create: `frontend-landing/src/components/Differentiators.tsx`
- Modify: `frontend-landing/src/App.tsx`

- [ ] **Step 1: Write `src/components/Differentiators.tsx`**

```tsx
import { Card, CardContent } from '@/components/ui/card';
import { Hub } from '@/icons/Hub';
import { Handshake } from '@/icons/Handshake';
import { Hexagon } from '@/icons/Hexagon';
import { differentiators } from '@/data/differentiators';
import type { ComponentType, SVGProps } from 'react';

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  hub: Hub,
  handshake: Handshake,
  hexagon: Hexagon,
};

export function Differentiators() {
  return (
    <section className="py-16 md:py-24 bg-flotteq-light">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-flotteq-navy">
          Pourquoi FlotteQ ?
        </h2>
        <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
          Trois engagements qui nous rendent différents.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {differentiators.map((d) => {
            const Icon = ICONS[d.iconKey];
            return (
              <Card key={d.title} className="border-slate-100">
                <CardContent className="p-7">
                  <div className="h-14 w-14 rounded-xl bg-flotteq-blue/10 grid place-items-center text-flotteq-blue">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-flotteq-navy">{d.title}</h3>
                  <p className="mt-2 text-slate-600 leading-relaxed">{d.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to App.tsx**

```tsx
import { Differentiators } from './components/Differentiators';
// ...
<AudienceAccordion />
<Differentiators />
```

- [ ] **Step 3: Visual check, then commit**

```bash
git add frontend-landing/src/components/Differentiators.tsx frontend-landing/src/App.tsx
git commit -m "feat(frontend-landing): differentiators section (3 cards with custom SVG)"
```

---

### Task 12: How it works section

**Files:**
- Create: `frontend-landing/src/components/HowItWorks.tsx`
- Modify: `frontend-landing/src/App.tsx`

- [ ] **Step 1: Write `src/components/HowItWorks.tsx`**

```tsx
import { steps } from '@/data/howItWorks';

export function HowItWorks() {
  return (
    <section id="how" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-flotteq-navy">
          Comment ça marche
        </h2>
        <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
          Trois étapes pour reprendre le contrôle de vos véhicules.
        </p>

        <ol className="mt-12 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((s) => (
            <li key={s.number} className="relative">
              <div className="h-12 w-12 rounded-full flotteq-gradient text-white grid place-items-center text-xl font-extrabold">
                {s.number}
              </div>
              <h3 className="mt-5 text-xl font-bold text-flotteq-navy">{s.title}</h3>
              <p className="mt-2 text-slate-600 leading-relaxed">{s.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to App.tsx**

```tsx
import { HowItWorks } from './components/HowItWorks';
// ...
<Differentiators />
<HowItWorks />
```

- [ ] **Step 3: Commit**

```bash
git add frontend-landing/src/components/HowItWorks.tsx frontend-landing/src/App.tsx
git commit -m "feat(frontend-landing): how-it-works 3-step section"
```

---

### Task 13: Pricing section

**Files:**
- Create: `frontend-landing/src/components/Pricing.tsx`
- Modify: `frontend-landing/src/App.tsx`

- [ ] **Step 1: Write `src/components/Pricing.tsx`**

```tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { plans } from '@/data/pricing';
import { cn } from '@/lib/utils';

export function Pricing() {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-flotteq-light">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-flotteq-navy">
          Tarifs simples, transparents
        </h2>
        <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
          Choisissez votre plan. Sans engagement, résiliable en un clic.
        </p>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <Card
              key={p.key}
              className={cn(
                'border-slate-100 relative',
                p.highlight && 'border-flotteq-teal border-2 shadow-lg'
              )}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-flotteq-teal text-white text-xs font-bold uppercase tracking-wide">
                  Le plus populaire
                </div>
              )}
              <CardContent className="p-7 flex flex-col h-full">
                <h3 className="text-xl font-bold text-flotteq-navy">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-flotteq-navy">{p.priceLabel}</span>
                  {p.priceSuffix && <span className="text-slate-500">{p.priceSuffix}</span>}
                </div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{p.description}</p>

                <ul className="mt-6 space-y-2 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-slate-700">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-flotteq-teal flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={cn(
                    'mt-6 w-full',
                    p.highlight
                      ? 'bg-flotteq-blue hover:bg-flotteq-navy text-white'
                      : 'bg-white border border-slate-200 text-flotteq-navy hover:bg-slate-50'
                  )}
                >
                  <a href={p.ctaHref}>{p.ctaLabel}</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to App.tsx and commit**

```tsx
import { Pricing } from './components/Pricing';
// ...
<HowItWorks />
<Pricing />
```

```bash
git add frontend-landing/src/components/Pricing.tsx frontend-landing/src/App.tsx
git commit -m "feat(frontend-landing): pricing section (4 plans, highlighted Pro)"
```

---

### Task 14: Vision section

**Files:**
- Create: `frontend-landing/src/components/Vision.tsx`
- Modify: `frontend-landing/src/App.tsx`

- [ ] **Step 1: Write `src/components/Vision.tsx`**

```tsx
import { visionCards } from '@/data/vision';

export function Vision() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-flotteq-navy">
          Notre vision
        </h2>
        <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
          Pourquoi nous construisons FlotteQ, pour qui, et avec quel engagement.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {visionCards.map((c) => (
            <article
              key={c.title}
              className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold text-flotteq-navy">{c.title}</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">{c.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add and commit**

```tsx
import { Vision } from './components/Vision';
// ...
<Pricing />
<Vision />
```

```bash
git add frontend-landing/src/components/Vision.tsx frontend-landing/src/App.tsx
git commit -m "feat(frontend-landing): vision/manifesto section (3 cards)"
```

---

### Task 15: Security banner

**Files:**
- Create: `frontend-landing/src/components/SecurityBanner.tsx`
- Modify: `frontend-landing/src/App.tsx`

- [ ] **Step 1: Write `src/components/SecurityBanner.tsx`**

```tsx
import { ShieldCheck } from '@/icons/ShieldCheck';
import { LockTLS } from '@/icons/LockTLS';
import { FlagFR } from '@/icons/FlagFR';
import { Backup } from '@/icons/Backup';
import { securityItems } from '@/data/security';
import type { ComponentType, SVGProps } from 'react';

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  shield: ShieldCheck,
  lock: LockTLS,
  flag: FlagFR,
  backup: Backup,
};

export function SecurityBanner() {
  return (
    <section className="py-12 bg-flotteq-navy text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl md:text-3xl font-bold">
          Vos données, en sécurité, en France.
        </h2>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {securityItems.map((item) => {
            const Icon = ICONS[item.iconKey];
            return (
              <div key={item.label} className="text-center">
                <div className="inline-flex h-14 w-14 rounded-xl bg-white/10 items-center justify-center text-white">
                  <Icon className="h-8 w-8" />
                </div>
                <div className="mt-3 font-bold">{item.label}</div>
                <div className="mt-1 text-sm text-white/70">{item.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add and commit**

```tsx
import { SecurityBanner } from './components/SecurityBanner';
// ...
<Vision />
<SecurityBanner />
```

```bash
git add frontend-landing/src/components/SecurityBanner.tsx frontend-landing/src/App.tsx
git commit -m "feat(frontend-landing): security & compliance banner"
```

---

### Task 16: FAQ accordion

**Files:**
- Create: `frontend-landing/src/components/FAQ.tsx`
- Modify: `frontend-landing/src/App.tsx`

- [ ] **Step 1: Write `src/components/FAQ.tsx`**

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { faq } from '@/data/faq';

export function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-flotteq-navy">
          Questions fréquentes
        </h2>
        <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
          Tout ce que vous voulez savoir avant de tester FlotteQ.
        </p>

        <div className="mt-10 max-w-3xl mx-auto">
          <Accordion type="multiple" className="space-y-3">
            {faq.map((entry, i) => (
              <AccordionItem
                key={i}
                value={`q-${i}`}
                className="bg-white border border-slate-100 rounded-xl px-5"
              >
                <AccordionTrigger className="text-left font-semibold text-flotteq-navy hover:no-underline py-4">
                  {entry.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed pb-5">
                  {entry.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add and commit**

```tsx
import { FAQ } from './components/FAQ';
// ...
<SecurityBanner />
<FAQ />
```

```bash
git add frontend-landing/src/components/FAQ.tsx frontend-landing/src/App.tsx
git commit -m "feat(frontend-landing): FAQ accordion (8 questions)"
```

---

### Task 17: Final CTA + Footer

**Files:**
- Create: `frontend-landing/src/components/CTASection.tsx`
- Create: `frontend-landing/src/components/Footer.tsx`
- Modify: `frontend-landing/src/App.tsx`

- [ ] **Step 1: Write `src/components/CTASection.tsx`**

```tsx
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-20 flotteq-gradient text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_30%_20%,white_0,transparent_60%),radial-gradient(circle_at_70%_80%,white_0,transparent_50%)]" />
      <div className="container mx-auto px-4 relative">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center max-w-3xl mx-auto leading-tight">
          Prêt à reprendre le contrôle de vos véhicules ?
        </h2>
        <p className="mt-4 text-center text-white/80 text-lg max-w-2xl mx-auto">
          Inscription en 2 minutes, sans engagement, gratuit pour démarrer.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-white text-flotteq-navy hover:bg-slate-100">
            <a href="https://app.flotteq.fr/register">Commencer gratuitement</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
            <a href="#pricing">Voir les tarifs</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write `src/components/Footer.tsx`**

```tsx
const COLUMNS = [
  {
    title: 'Produit',
    links: [
      { label: 'Pour les entreprises', href: '#audiences' },
      { label: 'Pour les particuliers', href: '#audiences' },
      { label: 'Pour les partenaires', href: '#audiences' },
      { label: 'Pour les conducteurs', href: '#audiences' },
      { label: 'Tarifs', href: '#pricing' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'FAQ', href: '#faq' },
      { label: 'Documentation', href: '#' },
      { label: 'Sécurité', href: '#' },
      { label: 'Statut', href: '#' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Mentions légales', href: '#' },
      { label: 'CGU', href: '#' },
      { label: 'CGV', href: '#' },
      { label: 'RGPD', href: '#' },
    ],
  },
  {
    title: 'Espaces',
    links: [
      { label: 'Espace client', href: 'https://app.flotteq.fr' },
      { label: 'Espace partenaire', href: 'https://partner.flotteq.fr' },
      { label: 'Espace conducteur', href: 'https://driver.flotteq.fr' },
      { label: 'Administration', href: 'https://admin.flotteq.fr' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <div className="text-xl font-extrabold text-white">FlotteQ</div>
            <p className="mt-3 text-sm text-slate-400 max-w-xs">
              La plateforme tout-en-un pour vos véhicules. Hébergé en France.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="font-semibold text-white">{col.title}</div>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="hover:text-white transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-slate-500">
          <div>© {new Date().getFullYear()} FlotteQ. Tous droits réservés.</div>
          <div>Hébergé en France 🇫🇷 — OVH Gravelines</div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Add both to App.tsx**

```tsx
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
// ...
<FAQ />
<CTASection />
<Footer />
```

- [ ] **Step 4: Commit**

```bash
git add frontend-landing/src/components/CTASection.tsx frontend-landing/src/components/Footer.tsx frontend-landing/src/App.tsx
git commit -m "feat(frontend-landing): final CTA + footer"
```

---

### Task 18: Login overlay (reused from old placeholder)

**Files:**
- Create: `frontend-landing/src/components/LoginOverlay.tsx`
- Modify: `frontend-landing/src/App.tsx`

- [ ] **Step 1: Write `src/components/LoginOverlay.tsx`**

```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const PORTALS = [
  {
    label: 'Espace Client',
    domain: 'app.flotteq.fr',
    href: 'https://app.flotteq.fr',
    accent: 'text-flotteq-blue bg-flotteq-blue/10',
  },
  {
    label: 'Espace Partenaire',
    domain: 'partner.flotteq.fr',
    href: 'https://partner.flotteq.fr',
    accent: 'text-purple-600 bg-purple-100',
  },
  {
    label: 'Espace Conducteur',
    domain: 'driver.flotteq.fr',
    href: 'https://driver.flotteq.fr',
    accent: 'text-emerald-600 bg-emerald-100',
  },
  {
    label: 'Administration',
    domain: 'admin.flotteq.fr',
    href: 'https://admin.flotteq.fr',
    accent: 'text-pink-600 bg-pink-100',
  },
];

export function LoginOverlay({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choisissez votre espace</DialogTitle>
          <DialogDescription>
            Sélectionnez le portail correspondant à votre profil pour vous connecter.
          </DialogDescription>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          {PORTALS.map((p) => (
            <a
              key={p.domain}
              href={p.href}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-flotteq-blue hover:-translate-y-0.5 transition-all"
            >
              <div className={`h-10 w-10 rounded-lg grid place-items-center font-bold ${p.accent}`}>
                {p.label[0]}
              </div>
              <div>
                <div className="font-semibold text-flotteq-navy">{p.label}</div>
                <div className="text-xs text-slate-500 font-mono">{p.domain}</div>
              </div>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Wire it in App.tsx**

```tsx
import { LoginOverlay } from './components/LoginOverlay';
// ...
<Footer />
<LoginOverlay open={loginOpen} onOpenChange={setLoginOpen} />
```

Remove the placeholder `{loginOpen && <p ...>}` line.

- [ ] **Step 3: Visual verification**

Click the "Connexion" button in the header (and the mobile sheet). Modal opens with 4 portal cards. Click outside or press Esc to close.

- [ ] **Step 4: Commit**

```bash
git add frontend-landing/src/components/LoginOverlay.tsx frontend-landing/src/App.tsx
git commit -m "feat(frontend-landing): login overlay (4 portals)"
```

---

### Task 19: Public assets (favicon + OG image)

**Files:**
- Create: `frontend-landing/public/favicon.svg`
- Create: `frontend-landing/public/og-image.svg`

- [ ] **Step 1: Write `public/favicon.svg`** (32x32 wordmark "F" with gradient)

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a3a6c"/>
      <stop offset="50%" stop-color="#2463b0"/>
      <stop offset="100%" stop-color="#14b8a6"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="url(#g)"/>
  <text x="50%" y="58%" font-family="-apple-system,BlinkMacSystemFont,Inter,sans-serif" font-size="18" font-weight="800" text-anchor="middle" dominant-baseline="middle" fill="white">F</text>
</svg>
```

- [ ] **Step 2: Write `public/og-image.svg`** (1200x630 OG card)

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a3a6c"/>
      <stop offset="100%" stop-color="#0e2148"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2463b0"/>
      <stop offset="100%" stop-color="#14b8a6"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="80" y="280" font-family="Inter,sans-serif" font-size="84" font-weight="800" fill="white">FlotteQ</text>
  <text x="80" y="370" font-family="Inter,sans-serif" font-size="48" font-weight="700" fill="white" opacity="0.95">Pilotez vos véhicules</text>
  <text x="80" y="430" font-family="Inter,sans-serif" font-size="48" font-weight="700" fill="url(#accent)">sereinement.</text>
  <text x="80" y="540" font-family="Inter,sans-serif" font-size="24" font-weight="500" fill="white" opacity="0.7">flotteq.fr — Hébergé en France</text>
</svg>
```

> SVG is acceptable for OG images on most modern social platforms (LinkedIn, Twitter X, WhatsApp). If a partner network rejects it, convert to PNG at deploy time using `rsvg-convert` or an online tool — out of scope here.

- [ ] **Step 3: Verify**

Run `npm run dev`. Inspect the favicon in the browser tab — gradient F should show. Visit `http://localhost:5177/og-image.svg` directly to confirm the OG card renders.

- [ ] **Step 4: Commit**

```bash
git add frontend-landing/public/
git commit -m "feat(frontend-landing): favicon + Open Graph card (SVG)"
```

---

## Phase 3 — Integration with the rest of the stack

### Task 20: Add `frontend-landing` service to docker-compose.production.yml

**Files:**
- Modify: `docker-compose.production.yml`

- [ ] **Step 1: Open `docker-compose.production.yml`** and find the section right after `frontend-internal:` block. Insert this new service between `frontend-internal` and the `nginx` service:

```yaml
  # Frontend Landing (Public Marketing Site for flotteq.fr apex)
  frontend-landing:
    build:
      context: ./frontend-landing
      dockerfile: Dockerfile
      args:
        VITE_API_BASE: ${VITE_API_BASE:-https://api.flotteq.fr}
        VITE_PUBLIC_URL: https://flotteq.fr
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

- [ ] **Step 2: Add `frontend-landing` to nginx `depends_on`**

In the same file, find the `nginx:` service block and modify `depends_on`:

```yaml
    depends_on:
      - backend
      - frontend-client
      - frontend-partner
      - frontend-driver
      - frontend-internal
      - frontend-landing
```

- [ ] **Step 3: Remove the legacy static landing volume mount from nginx**

Find this line in the nginx service and DELETE it:

```yaml
      - ./nginx/landing:/var/www/landing:ro
```

Keep the other 4 volumes (`nginx.conf`, `conf.d`, `certbot/conf`, `certbot/www`).

- [ ] **Step 4: Validate compose syntax**

```bash
docker compose -f docker-compose.production.yml config > /dev/null
```

Expected: no error output.

- [ ] **Step 5: Commit**

```bash
git add docker-compose.production.yml
git commit -m "feat(deploy): add frontend-landing service to production compose"
```

---

### Task 21: Update nginx apex config to proxy to `frontend-landing`

**Files:**
- Modify: `nginx/conf.d/apex.conf`

- [ ] **Step 1: Replace the file content** with the new proxying version

Open `nginx/conf.d/apex.conf`. Replace the *third* `server` block (the HTTPS apex one that currently does `root /var/www/landing`) so the file becomes:

```nginx
# Apex — flotteq.fr (proxies to frontend-landing) + www redirect

upstream frontend_landing {
    server frontend-landing:80;
}

# HTTP : ACME challenge + redirect HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name flotteq.fr www.flotteq.fr;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://flotteq.fr$request_uri;
    }
}

# HTTPS : www → apex
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.flotteq.fr;

    ssl_certificate /etc/letsencrypt/live/flotteq.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flotteq.fr/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    return 301 https://flotteq.fr$request_uri;
}

# HTTPS : apex proxies to frontend-landing
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name flotteq.fr;

    ssl_certificate /etc/letsencrypt/live/flotteq.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flotteq.fr/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    access_log /var/log/nginx/apex_access.log main;
    error_log /var/log/nginx/apex_error.log warn;

    location / {
        limit_req zone=general_limit burst=50 nodelay;
        proxy_pass http://frontend_landing;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://frontend_landing;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add nginx/conf.d/apex.conf
git commit -m "feat(nginx): proxy apex flotteq.fr to frontend-landing container"
```

---

### Task 22: Add a small README for frontend-landing

**Files:**
- Create: `frontend-landing/README.md`

- [ ] **Step 1: Write the README**

```markdown
# frontend-landing

Public marketing site for `https://flotteq.fr` (the apex domain).

Single-page React 19 + Vite + Tailwind + shadcn, served as a static build by nginx.

## Local development

```bash
npm install
npm run dev
```

Opens at http://localhost:5177. Hot reload enabled.

## Build for production

```bash
npm run build
```

Produces `dist/` ready to be served by any static webserver.

## Deployment

Built and deployed as the `frontend-landing` Docker service in `docker-compose.production.yml` at the repo root. Served by the central nginx container, proxying `https://flotteq.fr` to this container.

## Content updates

All copy lives in `src/data/*.ts` files — edit there, no need to touch component code.
- `audiences.ts` — 4 profiles (Entreprise / Particulier / Partenaire / Conducteur)
- `pricing.ts` — 4 Stripe plans
- `faq.ts` — 8 FAQ entries
- `marketStats.ts` — 3 carousel stats
- `vision.ts`, `differentiators.ts`, `howItWorks.ts`, `security.ts`

## Stack notes

- No router (single page, internal anchors only)
- No API calls (the landing is fully static; CTAs link to `app.flotteq.fr`, `partner.flotteq.fr`, etc.)
- shadcn primitives in `src/components/ui/`
- Custom inline SVG icons in `src/icons/` (we don't use lucide for visual identity)
```

- [ ] **Step 2: Commit**

```bash
git add frontend-landing/README.md
git commit -m "docs(frontend-landing): add README"
```

---

## Phase 4 — Production deployment

### Task 23: Pre-flight verification

- [ ] **Step 1: Verify the production build of frontend-landing works locally**

```bash
cd frontend-landing && npm run build
```

Expected: `dist/index.html` exists. No TS errors. Bundle size warning if any chunk > 500 kB — note it but don't block.

- [ ] **Step 2: Verify the docker compose config parses**

```bash
docker compose -f docker-compose.production.yml config > /dev/null
```

Expected: no error.

- [ ] **Step 3: Push everything**

```bash
git push origin main
```

Expected: push succeeds. Now the VPS can pull.

---

### Task 24: Deploy to VPS

This is run remotely via SSH on `root@37.59.96.178`.

- [ ] **Step 1: Pull on the VPS**

```bash
ssh root@37.59.96.178 "cd /home/ubuntu/flotteq-v2 && git pull origin main"
```

Expected: fast-forward applied, lists the new files.

- [ ] **Step 2: Build the new service**

```bash
ssh root@37.59.96.178 "cd /home/ubuntu/flotteq-v2 && docker compose -f docker-compose.production.yml --env-file .env build frontend-landing 2>&1 | tail -30"
```

Expected: build success, `flotteq-v2-frontend-landing` image created. Takes ~3-5 minutes (npm install + Vite build).

- [ ] **Step 3: Bring it up + reload nginx**

```bash
ssh root@37.59.96.178 "cd /home/ubuntu/flotteq-v2 && docker compose -f docker-compose.production.yml --env-file .env up -d frontend-landing && docker compose -f docker-compose.production.yml exec nginx nginx -s reload && docker ps --format 'table {{.Names}}\t{{.Status}}'"
```

Expected: `flotteq_frontend_landing_prod` is `Up`, no other container is restarted.

- [ ] **Step 4: Smoke test from outside**

```bash
curl -sk -o /dev/null -w "%{http_code}\n" https://flotteq.fr
curl -sk -o /dev/null -w "%{http_code}\n" -H "Host: www.flotteq.fr" https://flotteq.fr
curl -sk https://flotteq.fr | grep -oE "<title>[^<]+</title>"
```

Expected:
- HTTP `200` for `https://flotteq.fr`
- HTTP `301` for `www.flotteq.fr` (redirect to apex)
- Title contains "FlotteQ — Pilotez vos véhicules sereinement"

- [ ] **Step 5: Visual check**

Open https://flotteq.fr in a real browser. Verify:
- Hero with tabs works (click each one)
- Carousel auto-advances
- Audience accordion opens "business" by default
- Pricing 4 cards display
- FAQ opens/closes
- Login overlay opens via header button
- Footer renders all 5 columns

- [ ] **Step 6: Lighthouse**

```bash
npx --yes @lhci/cli@latest collect --url=https://flotteq.fr --numberOfRuns=1
```

Expected: scores ≥ 85 on Performance / 90 on Accessibility / 95 on Best Practices / 95 on SEO. If any fall below 80, raise issues to the team — but do not block deploy.

---

### Task 25: Cleanup of legacy placeholder

**Files:**
- Delete: `nginx/landing/index.html` (move to `nginx/landing/index.html.archive` instead, see step 1)

- [ ] **Step 1: Archive the old static placeholder** (for posterity, in case rollback)

```bash
git mv nginx/landing/index.html nginx/landing/index.html.archive
```

- [ ] **Step 2: Commit**

```bash
git commit -m "chore(nginx): archive legacy landing/index.html — superseded by frontend-landing service"
```

- [ ] **Step 3: Push**

```bash
git push origin main
```

The VPS does not need to be updated for this — the volume mount was already removed in Task 20.

---

## Self-Review

**Spec coverage check** (matched spec sections to plan tasks):

| Spec section | Tasks |
|---|---|
| §3 Tagline | Task 8 (Hero) |
| §4.1 Header | Task 7 |
| §4.2 Hero w/ tabs | Task 8 |
| §4.3 Market stats carousel | Task 9 (data) + Task 5 |
| §4.4 Audience accordion | Task 10 + Task 5 |
| §4.5 Differentiators | Task 11 + Task 5 + Task 6 (icons) |
| §4.6 How it works | Task 12 + Task 5 |
| §4.7 Pricing | Task 13 + Task 5 |
| §4.8 Vision | Task 14 + Task 5 |
| §4.9 Security | Task 15 + Task 5 + Task 6 |
| §4.10 FAQ | Task 16 + Task 5 |
| §4.11 Final CTA | Task 17 |
| §4.12 Footer | Task 17 |
| §5 Stack frontend-landing | Tasks 1, 2, 3, 4 |
| §5.3 Compose / nginx integration | Tasks 20, 21 |
| §6 Image strategy | Task 5 (URLs in audiences.ts) |
| §7 SEO meta | Task 3 (index.html) |
| §10 Hors scope | Honoured (no testimonials, no client logos, no integrations section) |

All sections covered. No gaps.

**Placeholder scan:**
- "TBD" / "TODO" / "implement later" — none found.
- Vague instructions — Task 24 says "raise issues if Lighthouse < 80" which is acceptable since deployment shouldn't block on perf score on day 1.
- "Add error handling" / "fill details" — none.
- Stat sources are flagged as directional in Task 5 step 2 with explicit fallback guidance.

**Type / API consistency:**
- `AudienceKey = 'business' | 'consumer' | 'partner' | 'driver'` defined in Task 5, used in Task 8 (Hero) — match ✓
- `Differentiator.iconKey: 'hub' | 'handshake' | 'hexagon'` matches the keys in Task 11's `ICONS` map ✓
- `SecurityItem.iconKey: 'shield' | 'lock' | 'flag' | 'backup'` matches Task 15's `ICONS` map ✓
- `Plan.highlight?: boolean` — only `pro` plan sets it (Task 5 step 5), Task 13 reads `p.highlight` ✓

**Scope check:** 25 tasks, single landing page, no creep. OK.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-06-frontend-landing-implementation.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for keeping the orchestrator's context clean across 25 tasks. Quality enforced by per-task review.

2. **Inline Execution** — Execute tasks in this session using executing-plans, batch with checkpoints for your review every few tasks. Faster perceived progress but consumes more orchestrator context.

**Which approach?**
