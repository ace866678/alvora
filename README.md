# Alvora

**Discover what's possible.**

Alvora is a Philippines-first opportunity discovery platform concept for people looking for scholarships, internships, hackathons, competitions, grants, and technology events.

## Phase 1 — Foundation

This phase establishes the responsive dashboard and core front-end experience using demo listings only.

### Planned experience
- Search and filter the opportunity catalogue
- Browse by opportunity category
- Save and unsave opportunities locally in the current session
- Switch between recommended, closing-soon, and newest views
- Read a listing summary in a detail dialog
- Responsive layout for mobile, tablet, and desktop

> **Data notice:** Listings in the first phase are illustrative demo content, not verified live opportunities. Real-source ingestion, eligibility matching, persistent accounts, and deadline verification are planned for later phases.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build

```bash
npm run build
npm run preview
```

## Technology

- React
- TypeScript
- Vite
- Lucide React icons
- Custom responsive CSS

## Roadmap

1. **Foundation:** dashboard, catalogue UI, responsive design
2. **Discovery:** real search providers and source citations
3. **Data layer:** opportunity records and user saves
4. **Personalization:** interest and eligibility matching
5. **Trust:** freshness checks, source verification, and deadline monitoring
6. **Launch:** deployment, testing, and pilot feedback

## Project status

Early development prototype. No authentication, backend persistence, or live opportunity feed is enabled yet.


## Preview branch

This branch is reserved for safe preview testing. Production remains on `main`.
