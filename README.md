# Shadow Economy Mapper

**Turning digital traces into bankable proof of income for informal micro-businesses.**

Millions of home bakers, food delivery sellers, and street vendors across Southeast Asia run real businesses entirely through WhatsApp chats, GrabFood dashboards, and TNG e-wallets — yet they have no payslips or formal records. Shadow Economy Mapper transforms those scattered digital footprints into verifiable financial reports with a transparent credibility score that banks and NGOs can trust.

---

## Table of Contents

- [The Problem](#the-problem)
- [Solution Overview](#solution-overview)
- [Technical Architecture](#technical-architecture)
- [Implementation Details](#implementation-details)
- [Challenges Faced](#challenges-faced)
- [Future Roadmap](#future-roadmap)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Team](#team)

---

## The Problem

Informal workers form the backbone of Southeast Asian economies, yet they are locked out of financial services because they cannot prove their income. They do not have payslips, bank salary deposits, or formal invoices — but they *do* have:

- WhatsApp order threads going back years
- GrabFood / Shopee / Foodpanda CSV payout records
- TNG and bank e-wallet statements
- Screenshots of payment confirmations

These digital trails are real evidence of real income. The gap is the infrastructure to extract, normalize, and present them in a format verifiers will trust.

---

## Solution Overview

Shadow Economy Mapper is a full-stack web platform that:

1. **Ingests** raw digital evidence (chat exports, CSVs, PDFs, screenshots, voice notes)
2. **Extracts** structured transaction events from unstructured data using NLP, OCR, and regex pipelines
3. **Normalizes** all events into a canonical ledger with a unified schema
4. **Scores** the evidence with a transparent 0–100 credibility score, broken down by component
5. **Generates** a shareable PDF report with charts, narratives, and a public verification link

The output is a report a microfinance officer or NGO caseworker can open in a browser and immediately trust.

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User (Browser)                           │
│              React 18 + Vite + TypeScript + Tailwind            │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS / REST
┌───────────────────────────▼─────────────────────────────────────┐
│                    Django REST Framework                         │
│         Auth │ Upload Gateway │ Normalization │ Reports          │
└──────┬────────────────┬───────────────────┬──────────────────────┘
       │                │                   │
┌──────▼──────┐  ┌──────▼──────┐   ┌────────▼────────┐
│  Supabase   │  │  Extraction  │   │    Scoring &    │
│  (Postgres  │  │  Pipeline    │   │    Insights     │
│   + Auth    │  │  (Python)    │   │    (Python)     │
│   + Storage)│  └──────┬───────┘   └────────┬────────┘
└─────────────┘         │                    │
                ┌───────▼────────────────────▼────────┐
                │        External AI / APIs            │
                │  OpenAI Whisper │ Google Vision      │
                │  Google Gemini  │ Tesseract OCR      │
                └──────────────────────────────────────┘
```

### Monorepo Structure

```
shadow-economy-mapper/
├── apps/
│   ├── web/                  # React + Vite SPA (Frontend)
│   │   └── src/
│   │       ├── pages/        # login, dashboard, upload, ledger, reports, verify
│   │       ├── components/   # FileUpload, ScoreCard, InsightCards, EvidenceTable
│   │       └── lib/          # Supabase client, API hooks, auth context
│   └── api/                  # Django + DRF (Backend)
│       ├── core/             # Auth, business profiles, consent settings
│       ├── evidence/         # Upload gateway, ledger, scoring endpoints
│       └── reports/          # PDF generation, share tokens, public verify
├── packages/
│   ├── shared-types/         # TypeScript + Python type contracts (source of truth)
│   ├── extraction/           # Parsing pipeline
│   │   ├── chat/             # WhatsApp + Telegram parsers
│   │   ├── csv/              # GrabFood, Shopee, Foodpanda schemas
│   │   ├── pdf/              # Bank & e-wallet statement extraction
│   │   ├── ocr/              # Screenshot → text (Tesseract / Google Vision / Gemini)
│   │   └── voice/            # Voice notes → events (Whisper API)
│   └── scoring/              # Credibility engine
│       ├── credibility/      # 0–100 score computation
│       ├── anomaly/          # Spike & duplicate detection
│       ├── linking/          # Cross-source event matching
│       ├── insights/         # Peak days, trends, recommendations
│       └── narrative/        # LLM-powered report narratives (Gemini)
└── docs/                     # Full implementation guide, API contracts, DB schema
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Recharts |
| Backend | Django 5.1, Django REST Framework, Python 3.11 |
| Database | PostgreSQL via Supabase |
| Auth & Storage | Supabase Auth (JWT + OTP), Supabase Storage |
| Async Tasks | Celery + Redis |
| Extraction — Chat | Regex NLP, keyword classification (Malay + English) |
| Extraction — PDF | pdfplumber |
| Extraction — OCR | Tesseract, Google Cloud Vision, PaddleOCR, Gemini |
| Extraction — Voice | OpenAI Whisper API |
| Scoring & Narratives | NumPy, python-dateutil, Google Gemini API |
| Report Generation | ReportLab, WeasyPrint |

---

## Implementation Details

### End-to-End Data Flow

```
Upload → Queue → Extract → Normalize → Link → Score → Report → Share
```

1. **User uploads** a WhatsApp export, CSV, PDF, screenshot, or records a voice note
2. **Celery** queues the file for async processing
3. **Extraction pipeline** parses the file and emits `RawExtractedEvent[]`
4. **Normalization** writes each event to the canonical `ledger_entries` table
5. **Cross-source linking** finds matching events across channels (e.g., a WhatsApp "paid" message matching a GrabFood payout)
6. **Credibility scoring** computes a 0–100 score with a transparent breakdown
7. **Report generation** creates a PDF with charts, narratives, and a score card
8. **Share token** issues a time-limited public URL so a bank officer or NGO can verify the report without creating an account

### Credibility Score Breakdown

The score is fully transparent — every component is shown to the user and the verifier.

| Component | Max Points | What it Measures |
|-----------|-----------|-----------------|
| Activity | 30 | Active weeks + weekly transaction frequency |
| Consistency | 20 | Coefficient of variation in weekly revenue |
| Longevity | 20 | Time span from first to last transaction |
| Evidence Strength | 25 | Weighted confidence across all sources |
| Cross-Source Corroboration | 15 | Confirmed links between independent channels |
| Anomaly Penalties | −20 | Spike detection, duplicate uploads, round-number patterns |

**Confidence Levels:** LOW (< 30 or < 5 entries) · MEDIUM (< 60 or < 20 entries) · HIGH (all others)

### Extraction Pipeline

**WhatsApp Parser**
- Handles multiple timestamp formats (Android vs iOS exports, Malay vs English locale)
- Extracts `RM` amounts via regex
- Classifies intent using bilingual keywords: `paid/bayar/transfer` → payment, `order/tempah/beli` → order
- Confidence scoring: base 0.3 + 0.2 per extracted amount + keyword boosts

**CSV Parser**
- Auto-detects column names for date, amount, and status fields
- Supports GrabFood, Shopee, and Foodpanda payout schemas
- Strips commas and currency prefixes; high confidence (0.9) for structured data

**PDF Parser**
- Uses `pdfplumber` for table extraction from bank/e-wallet statements
- Falls back to raw text extraction for non-tabular layouts

**OCR Pipeline**
- Tesseract for local/dev; Google Cloud Vision for production accuracy
- PaddleOCR for enhanced multilingual recognition
- Gemini for context-aware interpretation of ambiguous text
- Preprocessing: contrast enhancement, deskewing

**Voice Parser**
- OpenAI Whisper transcribes audio
- Keyword extraction converts phrases like *"today I sold RM120"* into structured payment events

### Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| `business_profiles` | User's registered businesses (name, category, location, channels) |
| `consent_settings` | Privacy preferences (share mode, PII redaction, raw file retention) |
| `evidence` | Uploaded files and manual entries with processing status |
| `ledger_entries` | All normalized transactions (canonical schema across all sources) |
| `event_links` | Cross-source matches with similarity scores |
| `credibility_scores` | Computed scores with component breakdown and anomaly flags |
| `reports` | Generated PDFs with data snapshots |
| `share_tokens` | Time-limited public links (expiry, access count, max access) |

Evidence processing follows a state machine: `UPLOADED → QUEUED → EXTRACTED → NORMALIZED → ANALYZED → REPORTED`

### Key API Endpoints

```
POST   /api/evidence/items/upload/        Upload a file or manual entry
GET    /api/evidence/ledger/              Normalized ledger (filterable by date/channel)
POST   /api/evidence/scores/compute/      Trigger credibility score computation
GET    /api/evidence/scores/{id}/         Score details with full breakdown
POST   /api/reports/generate/             Queue PDF report generation
POST   /api/reports/{id}/share/           Create a share token
GET    /api/reports/verify/{token}/       Public: view shared report (no auth required)
```

Full specs in [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md).

---

## Challenges Faced

### 1. Unstructured, Dialect-Mixed Chat Data
WhatsApp exports vary significantly by OS version, locale, and app version — timestamps, sender formats, and line endings all differ. Business conversations in Malaysia switch between English, Malay, and romanized Malay mid-sentence. We built a multi-pattern regex engine with bilingual keyword dictionaries and a fallback confidence score to handle partial matches gracefully rather than failing silently.

### 2. Inconsistent PDF Layouts
Bank and e-wallet statements have no standard format. Maybank, CIMB, and TNG each structure their tables differently, and some statements are scanned images rather than text PDFs. We handle this with `pdfplumber` for structured tables, fall back to raw text extraction, and use Gemini as a last resort for completely unstructured layouts.

### 3. OCR Accuracy on Phone Screenshots
Screenshots taken on different devices, in varying lighting, with overlapping UI elements produce noisy OCR output. We built a preprocessing pipeline (contrast enhancement, deskewing) and cascaded three OCR engines — Tesseract for speed, Google Cloud Vision for accuracy, and Gemini for semantic correction — with the result merged by confidence.

### 4. Making the Score Feel Trustworthy
A single opaque number would be dismissed by any financial officer. We redesigned the score to be fully decomposed: every component is visible, every penalty is explained, and the underlying evidence entries are linked. Verifiers see not just the score but *why* it is what it is.

### 5. Privacy-First Data Handling
Informal workers are often in precarious situations and data misuse could cause real harm. We designed consent settings with granular controls (PII redaction, raw file retention duration, share link expiry), implemented short-lived share tokens, and made PII masking the default rather than opt-in. JWT validation was migrated from local HS256 to network verification for stronger auth security.

### 6. Parallel AI-Assisted Development
Four developers building in parallel with AI coding tools creates merge conflicts and contract drift. We enforced strict folder ownership (no cross-domain edits without a PR), defined a shared-types package as the single source of truth for all interfaces, and wrote explicit AI prompting conventions so that generated code respected domain boundaries.

---

## Future Roadmap

### Near-Term (Next 3 Months)
- **Telegram & Instagram parsers** — placeholder pipelines exist; needs channel-specific regex and API integration
- **Full PDF report generation** — report template is designed; needs final wiring to ReportLab renderer
- **Email & WhatsApp share notifications** — notify the business owner when a verifier opens their report
- **End-to-end mobile optimization** — responsive layout built; needs device testing and touch UX polish

### Medium-Term (3–6 Months)
- **Org Dashboard** — aggregate views for NGOs and microfinance institutions to manage multiple applicants in one place
- **Expanded platform support** — Lazada, Shopee Mall, GoFood, GCash, Maya parsers for the broader SEA market
- **Automated anomaly explanations** — when a penalty flag is raised, generate a natural-language explanation the user can respond to
- **Multi-language UI** — Bahasa Malaysia, Filipino, Indonesian, Vietnamese localization

### Long-Term (6–12 Months)
- **Bank API direct integration** — replace manual CSV exports with consented read-only bank feeds
- **Federated identity layer** — let verified reports persist across applications (one report, reused by multiple lenders)
- **ML-based fraud detection** — replace rule-based anomaly detection with a trained classifier on labeled datasets
- **Regulatory sandbox partnerships** — work with BNM (Malaysia), BSP (Philippines), and OJK (Indonesia) to have the report format formally recognized

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Supabase project (free tier is sufficient for development)

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd shadow-economy-mapper

# 2. Configure environment variables
cp .env.example .env
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
#          OPENAI_API_KEY, GEMINI_API_KEY, DJANGO_SECRET_KEY

# 3. Backend
cd apps/api
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver       # Runs on http://localhost:8000

# 4. Frontend (new terminal)
cd apps/web
npm install
npm run dev                      # Runs on http://localhost:5173

# 5. Extraction package (same venv as backend)
cd packages/extraction
pip install -e .

# 6. Scoring package (same venv as backend)
cd packages/scoring
pip install -e .
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (backend only) |
| `SUPABASE_DB_URL` | Direct PostgreSQL connection string |
| `DJANGO_SECRET_KEY` | Django secret key |
| `OPENAI_API_KEY` | For Whisper voice transcription |
| `GEMINI_API_KEY` | For narrative generation and OCR fallback |
| `GOOGLE_CLOUD_VISION_KEY` | For production-grade OCR |
| `VITE_API_BASE_URL` | Frontend → backend base URL |
| `VITE_SUPABASE_URL` | Frontend Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend Supabase anon key |

---

## API Reference

Full endpoint specs, request/response examples, and error codes are documented in:

- [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md) — All endpoint specs with examples
- [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) — ERD and full table definitions
- [docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md) — System components and architecture decisions
- [docs/TEAM_CONVENTIONS.md](docs/TEAM_CONVENTIONS.md) — Git workflow and contribution guide

---

## Team

| Member | Domain | Ownership |
|--------|--------|-----------|
| P1 | Frontend + Report UI | `apps/web/` |
| P2 | Backend API + Database | `apps/api/` |
| P3 | Extraction Pipeline | `packages/extraction/` |
| P4 | Scoring & Insights | `packages/scoring/` |

Shared contracts in `packages/shared-types/` require team review for any changes.

---

## License

MIT
