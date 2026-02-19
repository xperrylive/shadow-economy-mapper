# Shadow Economy Mapper — Team Conventions & AI Dev Workflow

## The Core Problem

4 people using AI (Cursor, Copilot, Claude, etc.) to generate code **fast** = merge conflicts, broken imports, inconsistent patterns, and chaos. These conventions prevent that.

---

## Golden Rule: Own Your Domain, Share Contracts

Each person owns **specific folders and files**. You never edit someone else's files directly. You communicate through **shared interfaces (types + API contracts)**.

---

## Project Structure (Monorepo)

```
shadow-economy-mapper/
├── apps/
│   ├── web/                    # Person 1 owns this
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   └── package.json
│   │
│   └── api/                    # Person 2 owns this
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── services/
│       │   ├── db/
│       │   └── jobs/
│       └── package.json
│
├── packages/
│   ├── shared-types/           # EVERYONE reads, changes need team approval
│   │   └── src/
│   │       ├── api.ts          # API request/response types
│   │       ├── models.ts       # DB model types
│   │       └── enums.ts        # Shared enums & constants
│   │
│   ├── extraction/             # Person 3 owns this
│   │   ├── src/
│   │   │   ├── chat/
│   │   │   ├── csv/
│   │   │   ├── pdf/
│   │   │   ├── ocr/
│   │   │   └── voice/
│   │   └── package.json
│   │
│   └── scoring/                # Person 4 owns this
│       ├── src/
│       │   ├── linking/
│       │   ├── anomaly/
│       │   ├── credibility/
│       │   └── insights/
│       └── package.json
│
├── .env.example
├── docker-compose.yml
├── package.json                # Workspace root
└── README.md
```

### Why This Structure?

- **Each person works in their own folder** — minimal merge conflicts
- **shared-types** is the only cross-cutting package — it's the contract
- AI tools (Cursor, Claude) work best when you can point them at a single folder with clear boundaries

---

## File Ownership Rules

| Person | Owns | Can Read | Never Touches |
|--------|------|----------|---------------|
| P1 (Frontend) | `apps/web/` | `shared-types/` | `api/`, `extraction/`, `scoring/` |
| P2 (Backend) | `apps/api/` | `shared-types/` | `web/`, `extraction/`, `scoring/` |
| P3 (Extraction) | `packages/extraction/` | `shared-types/` | `web/`, `api/`, `scoring/` |
| P4 (Scoring) | `packages/scoring/` | `shared-types/` | `web/`, `api/`, `extraction/` |
| Everyone | reads `shared-types/` | — | edits only via PR with team review |

**If you need something from another person's domain:** don't edit their code. Open an issue or message them with what interface/function you need.

---

## The Shared Types Contract (Most Important File)

This is the **single source of truth**. Define it together on Day 1 before anyone starts coding.

```typescript
// packages/shared-types/src/models.ts

export type EvidenceStatus =
  | "UPLOADED"
  | "QUEUED"
  | "EXTRACTED"
  | "NORMALIZED"
  | "ANALYZED"
  | "REPORTED";

export type SourceType =
  | "whatsapp"
  | "telegram"
  | "instagram"
  | "csv_grab"
  | "csv_shopee"
  | "csv_foodpanda"
  | "pdf_bank"
  | "pdf_ewallet"
  | "screenshot"
  | "manual"
  | "voice";

export type EventType = "order" | "payment" | "payout" | "refund";

export type Channel =
  | "whatsapp"
  | "grabfood"
  | "shopee"
  | "foodpanda"
  | "lazada"
  | "tng"
  | "bank"
  | "cash"
  | "other";

export interface LedgerEntry {
  id: string;
  businessId: string;
  eventTime: string;          // ISO 8601
  amount: number;             // always in MYR, 2 decimal places
  currency: "MYR";
  channel: Channel;
  eventType: EventType;
  sourceEvidenceId: string;
  confidence: number;         // 0.0 - 1.0
  attributes: Record<string, unknown>;
}

export interface Evidence {
  id: string;
  businessId: string;
  sourceType: SourceType;
  fileUrl: string;
  status: EvidenceStatus;
  uploadedAt: string;
}

export interface CredibilityScore {
  score: number;              // 0-100
  confidenceLevel: "LOW" | "MEDIUM" | "HIGH";
  breakdown: {
    activity: number;
    consistency: number;
    longevity: number;
    evidenceStrength: number;
    crossSource: number;
    penalties: number;
  };
  computedAt: string;
}

// This is the extraction output contract
// Person 3 produces this, Person 2 consumes it
export interface RawExtractedEvent {
  timestamp: string | null;
  amount: number | null;
  currency: string;
  description: string;
  channel: Channel;
  eventType: EventType | null;
  confidence: number;
  rawText?: string;
  metadata?: Record<string, unknown>;
}
```

```typescript
// packages/shared-types/src/api.ts
// API contracts — Person 1 calls these, Person 2 implements them

export interface UploadEvidenceRequest {
  businessId: string;
  sourceType: SourceType;
  file: File;
}

export interface UploadEvidenceResponse {
  evidenceId: string;
  status: EvidenceStatus;
}

export interface GetLedgerRequest {
  businessId: string;
  from?: string;
  to?: string;
  channel?: Channel;
}

export interface GetLedgerResponse {
  entries: LedgerEntry[];
  total: number;
}

export interface GetScoreResponse {
  score: CredibilityScore;
  insights: InsightCard[];
}

export interface InsightCard {
  type: "peak_day" | "trend" | "recommendation" | "coverage";
  title: string;
  description: string;
  data?: Record<string, unknown>;
}

export interface GenerateReportResponse {
  reportId: string;
  pdfUrl: string;
  shareToken: string;
  expiresAt: string;
}
```

### Rules for Shared Types

1. **Define them together on Day 1** — spend 1-2 hours on this before coding
2. **Changes require a PR** that all 4 people approve (or at minimum, anyone affected)
3. **Add, don't change** — if you need a new field, add it as optional (`field?: type`). Don't rename or remove existing fields without team approval
4. **Every function that crosses domain boundaries uses these types** — no ad-hoc `any` objects

---

## Git Workflow

### Branch Strategy

```
main                    # always deployable, protected
├── dev                 # integration branch, merge here daily
├── p1/feature-name     # Person 1's feature branches
├── p2/feature-name     # Person 2's feature branches
├── p3/feature-name     # Person 3's feature branches
└── p4/feature-name     # Person 4's feature branches
```

### Rules

1. **Never push directly to `main` or `dev`**
2. **Branch from `dev`**, name it `p1/upload-ui`, `p3/whatsapp-parser`, etc.
3. **Pull from `dev` every morning** before starting work
4. **PR into `dev`** when a feature is done — at least 1 other person reviews
5. **Merge `dev` → `main`** at end of each week (or milestone)
6. **Small, frequent PRs** — don't accumulate 3 days of work then dump it

### Commit Messages

```
feat(extraction): add whatsapp chat parser
fix(api): handle null timestamps in ledger query
chore(web): update dashboard chart colors
types: add InsightCard interface to shared-types
```

Format: `type(scope): description`
- Types: `feat`, `fix`, `chore`, `types`, `docs`, `refactor`
- Scope: `web`, `api`, `extraction`, `scoring`, `types`

---

## AI-Specific Conventions

### When Prompting AI (Cursor / Claude / Copilot)

Always include these in your prompts or system instructions:

```
CONTEXT FOR AI:
- Project: Shadow Economy Mapper (monorepo, TypeScript)
- My role: [Person 1/2/3/4]
- I only edit files in: [my folder path]
- Shared types are in: packages/shared-types/src/
- Use named exports, not default exports
- Use async/await, not .then() chains
- Error handling: always return typed error responses, never throw unhandled
- Use zod for runtime validation of external inputs
- All amounts in MYR as numbers with 2 decimal places
- All timestamps in ISO 8601 (UTC)
```

### AI Code Generation Rules (Everyone Follows)

| Rule | Why |
|------|-----|
| **Named exports only** (`export function`, `export const`) | Default exports cause inconsistent import names across AI sessions |
| **No `any` type** | AI loves `any` — always specify the real type or use `unknown` |
| **Use zod for all external input validation** | AI-generated parsers often skip edge cases; zod catches them at runtime |
| **Functions must have JSDoc with @param and @returns** | AI reads these when generating code that calls your functions |
| **One function per file for complex logic** | Easier for AI to read, edit, and test one file at a time |
| **Max 150 lines per file** | AI context windows work better with focused files |
| **All env vars go through a single config.ts** | Prevents AI from scattering `process.env.X` everywhere |
| **No magic strings** — use the shared enums | AI will invent its own strings ("Whatsapp" vs "whatsapp" vs "WHATSAPP") |

### Config File Pattern (Every Package)

```typescript
// src/config.ts — single source for all env vars
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  OPENAI_API_KEY: z.string().optional(),
  GCP_VISION_KEY: z.string().optional(),
  SUPABASE_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
});

export const config = envSchema.parse(process.env);
```

---

## How Domains Connect (Integration Points)

```
Person 1 (Frontend)
    │
    │  HTTP calls (uses shared API types)
    ▼
Person 2 (Backend API)
    │
    │  calls extraction.parse(file) — returns RawExtractedEvent[]
    ▼
Person 3 (Extraction)        Person 4 (Scoring)
    │                             ▲
    │  writes to ledger_entries   │  reads ledger_entries
    └─────────────────────────────┘
              via Person 2's DB layer
```

### Integration Contracts

**P2 → P3:** Person 2 calls Person 3's extraction functions. Agree on this interface Day 1:

```typescript
// packages/extraction/src/index.ts (Person 3 exports this)
export async function extractEvidence(
  fileBuffer: Buffer,
  sourceType: SourceType,
): Promise<RawExtractedEvent[]>;
```

**P2 → P4:** Person 2 calls Person 4's scoring functions. Agree on this:

```typescript
// packages/scoring/src/index.ts (Person 4 exports this)
export async function computeScore(
  entries: LedgerEntry[],
): Promise<CredibilityScore>;

export async function generateInsights(
  entries: LedgerEntry[],
): Promise<InsightCard[]>;
```

**P1 → P2:** Frontend only talks to backend via the API types defined in `shared-types/src/api.ts`.

### Mock Everything Early

- **Person 1** should mock API responses from Day 1 (use MSW or just static JSON) — don't wait for Person 2
- **Person 2** should mock extraction results until Person 3's parsers are ready
- **Person 4** should mock ledger data until the real pipeline flows

```typescript
// Example mock for Person 1
export const mockScore: CredibilityScore = {
  score: 72,
  confidenceLevel: "MEDIUM",
  breakdown: {
    activity: 25,
    consistency: 18,
    longevity: 12,
    evidenceStrength: 20,
    crossSource: 7,
    penalties: -10,
  },
  computedAt: new Date().toISOString(),
};
```

---

## Testing Convention

| Person | What to Test | Tool |
|--------|-------------|------|
| P1 | Component rendering, user flows | Vitest + Testing Library |
| P2 | API routes, DB queries | Vitest + Supertest |
| P3 | Parser accuracy on sample files | Vitest + fixture files |
| P4 | Score calculation correctness | Vitest + snapshot tests |

### Test File Location

```
src/
  chat/
    whatsapp-parser.ts
    whatsapp-parser.test.ts     # co-located
    fixtures/
      sample-chat-01.txt        # real test data
      sample-chat-02.txt
```

### Person 3: Collect Real Test Data ASAP

Export your own WhatsApp chats, download sample GrabFood CSVs, screenshot some order pages. These fixtures are worth more than any amount of AI-generated test data.

---

## Daily Workflow

```
Morning (15 min sync call):
  - What I finished yesterday
  - What I'm building today
  - Am I blocked on someone else's interface?

During the day:
  - Work in your branch
  - Pull from dev before starting
  - PR when feature is complete
  - Review at least 1 teammate's PR

End of day:
  - Push your branch (even if WIP)
  - Update the team chat with status
```

---

## Quick Reference: What To Tell Your AI

### Person 1 — Copy this into Cursor/Claude
```
I'm building the frontend for Shadow Economy Mapper.
Stack: React + Vite + TypeScript + Tailwind + shadcn/ui + Recharts
My files: apps/web/src/
API types: packages/shared-types/src/api.ts
I call the backend at /api/* endpoints.
I mock all API calls until backend is ready.
Named exports only. No default exports. No "any" types.
Use shared types for all data — import from @shared-types/*.
```

### Person 2 — Copy this into Cursor/Claude
```
I'm building the backend API for Shadow Economy Mapper.
Stack: Django 5 + Django REST Framework + PostgreSQL (Supabase) + Celery
My files: apps/api/
Django apps: core/, evidence/, reports/, organizations/
Shared types: packages/shared-types/src/models.ts (reference for API contracts)
I import extraction functions from packages/extraction/ and scoring from packages/scoring/.
All views return DRF Response objects matching the API contracts in docs/API_CONTRACTS.md.
Use DRF serializers for validation. Follow Django conventions.
```

### Person 3 — Copy this into Cursor/Claude
```
I'm building the extraction pipeline for Shadow Economy Mapper.
Stack: Python 3.11+, pdfplumber, pytesseract, pandas, openai
My files: packages/extraction/src/
I export one main function: extract_evidence(file_bytes, source_type) -> list[RawExtractedEvent]
RawExtractedEvent is defined in packages/extraction/src/types.py.
Each parser is its own file in its own subfolder (chat/, csv/, pdf/, ocr/, voice/).
All amounts in MYR. All timestamps in ISO 8601 UTC.
Include unit tests in packages/extraction/tests/.
```

### Person 4 — Copy this into Cursor/Claude
```
I'm building the scoring and insights engine for Shadow Economy Mapper.
Stack: Python 3.11+, numpy, python-dateutil
My files: packages/scoring/src/
I export: compute_score(entries) -> CredibilityScore and generate_insights(entries) -> list[InsightCard]
Both types are in packages/scoring/src/types.py.
Score is 0-100, breakdown must be transparent and explainable.
All functions are pure (no DB calls) — I receive data, return results.
Include unit tests in packages/scoring/tests/.
```

---

## Summary

| Convention | Rule |
|-----------|------|
| Structure | Monorepo with clear folder ownership |
| Contracts | shared-types package, agreed on Day 1 |
| Git | Feature branches per person, PR into dev |
| AI prompts | Always include your role, folder, and stack context |
| Code style | Named exports, no `any`, zod validation, JSDoc |
| Files | Max 150 lines, one concern per file |
| Integration | Mock early, connect later |
| Communication | 15-min daily sync, async chat updates |

**The #1 rule: If everyone respects folder ownership and shared types, 4 people with AI can build in parallel without breaking each other's code.**
