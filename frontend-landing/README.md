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
