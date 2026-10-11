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


## Phase 2 — Firebase foundation

Firebase SDK scaffolding is now included on the preview branch. The dashboard continues to run in demo mode until a Firebase project is configured; no credentials are committed.

### Firebase setup

1. Open the [Firebase Console](https://console.firebase.google.com/) and create a project for Alvora.
2. In **Project settings → General**, add a **Web app** and copy its web configuration values.
3. Under **Authentication → Sign-in method**, enable **Google** and **Email/Password**. Add your Vercel preview and production hostnames under **Authentication → Settings → Authorized domains**.
4. Create a **Cloud Firestore** database. Publish the rules in `firestore.rules`. Public reads are limited to `status: "open"` or `status: "unverified"` records; only accounts with the Firebase custom claim `admin: true` can create, update, or delete opportunity documents. The client query is deliberately restricted to those same statuses.
5. Copy `.env.example` to `.env.local` for local development and fill in the `VITE_FIREBASE_*` values.
6. In Vercel → **Project Settings → Environment Variables**, set `VITE_FIREBASE_*` values for the intended deployment targets. The preview variables for `preview/phase-1` are already configured. Keep production variables separate until you're ready to release. Add the Vercel preview branch hostname to Firebase Authentication's authorized domains so Google popup sign-in can return to the site.

> Firebase web configuration values are client-side identifiers, not service-account secrets. Never put a Firebase Admin SDK service-account key in Vite variables or commit one to GitHub. Firestore security rules—not hidden client configuration—protect the data.

### Included Firebase modules

- `src/lib/firebase.ts`: safe initialization; the UI can still build before credentials are added.
- `src/lib/auth.ts`: Google sign-in, email/password sign-in and account creation, and sign-out helpers.
- `src/lib/opportunities.ts`: typed listing listener plus per-user saved-opportunity helpers.
- `firestore.rules`: public reads for published opportunities, admin-only listing writes, and owner-only user data.

### Initial Firestore data shape

- `opportunities/{opportunityId}`: title, organization, category, description, deadline, eligibility, source URL, application URL, verification timestamp, and status.
- `users/{uid}`: private profile/preferences.
- `users/{uid}/savedOpportunities/{opportunityId}`: saved listing reference and timestamp.

The dashboard is now wired to Firebase Authentication and Cloud Firestore on this preview branch. It supports Google sign-in, email/password account creation and sign-in, password reset, sign-out, live opportunity reads, and per-user saved opportunities. If Firestore has no readable open or unverified records (or reads fail), the dashboard safely falls back to clearly labeled sample listings. The production branch remains on `main` and is not changed by this work.
