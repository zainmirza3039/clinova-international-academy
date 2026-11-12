# Clinova — Architecture Decision Record 001: Relational Data Model

**Status:** Accepted design decision; implementation blocked pending database read access.  
**Date:** 2026-11-12  
**Applies to:** Clinova International Academy rebuild  
**Repository branch:** docs/clinova-rebuild-architecture

## Decisions

### 1. Database model

Use the existing Clinova Supabase project (ssxpmcbqfdggfsoqbxac) as the preferred PostgreSQL system of record, subject to a successful inventory and compatibility review. Do not create a replacement project or reset the existing project.

Use a normalized relational model. Each independently managed entity is represented by its own relation and each entity instance by a row. Connect records using primary keys, foreign keys, unique constraints and explicit join relations for many-to-many relationships.

Do not interpret “rows instead of tables” as a non-relational or schemaless database. PostgreSQL tables remain the storage primitive; the design requirement is row-oriented, entity-specific records rather than giant JSON documents or duplicated nested structures.

### 2. Domain boundaries

Organize the logical model into bounded domains:
- **Identity and access:** profiles, role assignments, permissions and consent records.
- **Institutional catalogue:** departments, programme types, programmes, programme versions, faculty and faculty assignments.
- **Admissions:** applications, document metadata, reviews, decisions and applicant communications.
- **CPD learning:** courses, course versions, modules, lessons, cohorts, enrolments, progress, assessments, attempts, completion decisions and CPD credentials.
- **Professional certification:** schemes, scheme versions, standards, candidate applications, evidence, eligibility reviews, assessor assignments, assessment records, impartiality reviews, certification decisions and professional credentials.
- **Governance and operations:** audit events, controlled documents, complaints, appeals, corrective actions, notifications and payment records.

These are logical boundaries. The physical schema layout (separate PostgreSQL schemas versus carefully named tables within a smaller number of schemas) must be chosen after inspecting the current database, API exposure settings, migration history and operational access patterns. Do not create schemas speculatively.

### 3. Integrity and lifecycle rules

- Use UUID primary keys for externally referenced records; use human-readable reference codes only as separate unique display identifiers.
- Use explicit foreign keys and deliberate ON DELETE behavior. Prefer archival/status transitions over hard deletion for academic, financial, assessment and credential records.
- Use timestamptz for event timestamps and store canonical instants in UTC.
- Use check constraints and enumerated/reference tables for controlled states; avoid free-form status strings.
- Version course, programme, scheme and assessment rules. Enrolments and decisions must retain the version against which they were made.
- Store uploaded files in private Supabase Storage buckets; store file metadata and ownership/access relationships in PostgreSQL.
- Use JSONB only for genuinely variable, non-relational metadata where a stable relational model is inappropriate. Do not use it for learner, course, enrolment, assessment, payment or credential entities.
- Maintain append-only audit events for security-sensitive and regulated workflow transitions. Correct a record through a new event rather than silently rewriting history.

### 4. Authorization and data protection

- Enable RLS on every table in an exposed schema.
- Define policies by domain and action, with explicit ownership, assignment, cohort, partner and role predicates. Authentication alone is not authorization.
- Keep role grants in trusted server-controlled records or app metadata. Never authorize from user-editable user metadata.
- Never expose service-role or secret API keys to browser code.
- Separate CPD completion credentials from professional competency credentials at the data-model, permission and public-verification levels.
- Keep private application documents, candidate evidence, assessment notes and internal decisions inaccessible to public verification endpoints.
- Avoid broad public grants. Newly created public-schema tables are not automatically exposed to the Supabase Data API under current platform defaults; explicitly decide exposure and grants for each required API relation.

### 5. Migration and release discipline

1. Obtain reliable read access to the current project.
2. Inventory schemas, tables, columns, constraints, indexes, policies, grants, functions, triggers, extensions, storage buckets, Auth configuration and migration history.
3. Map existing data and dependencies to the proposed domains. Identify legacy data to preserve, migrate, archive or leave untouched.
4. Produce an ERD and reviewed migration plan.
5. Implement and test migrations against an isolated non-production database with synthetic data.
6. Run schema, constraint, RLS negative-access, performance and Supabase advisor checks.
7. Apply to production only after a separate explicit approval and verified backup/rollback plan.

No DDL, migration, data write, reset, destructive change, role change, storage change or production configuration change is authorized by this ADR.

## Accepted application architecture decisions

- Next.js App Router + TypeScript is approved as the target application architecture.
- The admin and LMS data model remains relational; “rows” means independent records/entities, not a move to a document database.
- The user has approved row-oriented data organization at the database concept level.
- The existing Clinova Supabase project remains the preferred database target, not yet verified for schema compatibility or accessible for inventory.

## Current blocker

The Supabase Clinova account connection can list the active project and confirms PostgreSQL 17.11. However, database inspection calls currently fail with PostgreSQL authentication errors for the connector's read-only database user (SQL inspection) and the postgres role (migration listing). This is not evidence that the project is unhealthy; the project API reports ACTIVE_HEALTHY. It means the database inventory cannot yet be verified. Do not attempt password resets or secret rotation as a workaround.

The owner has stated that Supabase access is authorized. The connected database credential path still needs to be repaired/re-authorized before database inspection or implementation can proceed safely.

## Platform compatibility note (checked 2026-11-12)

Supabase's current changelog records:
- Supabase CLI v3 is local-first by default; hosted database commands now require explicit remote targeting and hosted mutations require confirmation. Any future CLI automation must be reviewed against the v3 migration guide.
- New public-schema tables are not automatically exposed through the Data API by default. API exposure and grants must be explicit, alongside RLS.
- The connected project reports PostgreSQL 17.11.

Sources:
- https://supabase.com/changelog?types=breaking-change
- https://supabase.com/docs/guides/database/postgres/row-level-security