# Clinova Architecture Decision Record 001 — Application Framework

**Status:** Accepted by project owner  
**Date:** 12 November 2026  
**Decision:** Adopt Next.js App Router with TypeScript as the foundation for the Clinova rebuild.

## Context

Clinova combines a search-facing institutional academy website with authenticated admissions, learner, instructor, assessor and administrative workflows. The current repository is a Vite + React + TypeScript SPA. The project requires server-rendered public catalogue pages and clear server-side boundaries for authentication, authorization, private records and privileged operations.

## Decision

The rebuild target is:

- Next.js App Router
- TypeScript with strict type checking
- React Server Components by default; Client Components only for interactive UI
- Server Actions and Route Handlers for validated server-side operations
- Supabase Auth SSR integration for session-aware server rendering
- PostgreSQL with RLS and least-privilege access
- Tailwind CSS with Clinova design tokens and accessible reusable components
- Playwright E2E tests plus unit/component tests
- Existing Clinova GitHub repository and dedicated Vercel project/team

## Consequences

- Public department, programme, CPD, faculty and news pages can be rendered server-side with route metadata and structured data.
- Private learner and staff workflows can enforce access at server and database layers.
- Existing Vite pages and components will be migrated selectively after review; this is not a blind copy.
- Existing URLs and SEO intent must be inventoried before route changes. Redirects require evidence and review.
- The current production application remains unchanged during the rebuild.
- Supabase access must be restored and the existing project inspected before any schema or auth integration is implemented.
- No production migration, deployment, domain change or live data collection is authorized by this framework decision.

## Implementation acceptance criteria

1. Strict TypeScript build passes.
2. Public routes render without client-side JavaScript dependency for primary content.
3. Protected routes reject unauthenticated and unauthorized access on the server.
4. RLS policies are tested for both allowed and denied access.
5. No service-role or secret credentials are present in client bundles.
6. Existing Clinova brand assets and approved content are preserved.
7. CI checks pass before a pull request can be considered merge-ready.
