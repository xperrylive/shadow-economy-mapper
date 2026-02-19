# Shadow Economy Mapper — Implementation Guide

## What Is This Project?

The **Shadow Economy Mapper** is a platform that helps **informal micro-businesses** (think: home bakers selling via WhatsApp, Grab Food sellers, night market vendors) **prove their income** — even though they don't have payslips, formal invoices, or bank loan histories.

### The Problem It Solves

Millions of small business owners in Southeast Asia (especially Malaysia) operate through chat apps, food delivery platforms, and cash. When they need a loan, apply for government aid, or want to grow, they have **no formal financial record**. Banks reject them. Government programs can't verify them.

### How It Works (Plain English)

1. The user uploads **evidence** of their business activity — WhatsApp chat exports, GrabFood/Shopee CSV exports, e-wallet PDF statements, screenshots of orders, or even voice notes saying "today I sold RM120."
2. The system **extracts** structured data from all these messy sources (NLP for chats, OCR for images, parsers for CSVs/PDFs).
3. Everything gets **normalized** into a single unified ledger — one consistent table of transactions.
4. The system **cross-references** sources (e.g., a WhatsApp "paid" message matching a TNG e-wallet deposit) to build confidence.
5. A **credibility score** (0–100) is generated with full transparency on how it was calculated.
6. A **PDF report** is produced that the user can share with a bank, NGO, or government program via a secure link.

### End-to-End Flow

```
Upload → Extract (OCR/PDF/NLP) → Normalize Ledger → Link across sources → Quality/Anomaly Check → Score → Insights → PDF Report + Share Token → Verifier View
```

---

## The 11 System Components (Summary)

| # | Component | What It Does |
|---|-----------|-------------|
| 1 | Identity & Trust Setup | Auth, business profiles, consent settings |
| 2 | Evidence Ingestion | File uploads, manual entry, voice entry, metadata extraction |
| 3 | Extraction Pipeline | Parse chats, CSVs, PDFs, images (OCR), and voice into raw events |
| 4 | Normalization & Ledger | Unify all events into one canonical ledger table |
| 5 | Cross-Source Linking | Match events across channels, build proof graphs |
| 6 | Fraud Resistance & Data Quality | Anomaly detection, confidence propagation, gap detection |
| 7 | Credibility Scoring | Generate explainable 0–100 score |
| 8 | Insights Engine | Peak days, trends, recommendations |
| 9 | Reporting & Sharing | PDF generation, share tokens, redaction |
| 10 | Org Dashboard | NGO/Bank view with aggregate metrics |
| 11 | Privacy & Security | PII redaction, encryption, audit logs |

---

## Recommended Tech Stack

### Frontend
- **Framework:** React (with Vite) or Next.js
- **UI Library:** shadcn/ui + Tailwind CSS
- **Charts:** Recharts or Chart.js (for dashboards and report previews)
- **Mobile-friendly:** Responsive design is critical — most users will be on phones

### Backend
- **Framework:** Django 5 + Django REST Framework
- **Language:** Python 3.11+
- **Why Django:** Built-in admin panel, ORM with migrations, excellent ecosystem for data processing, and your extraction/scoring packages are already Python

### Database & Storage
- **Primary:** Supabase (PostgreSQL + Auth + Storage — all-in-one, generous free tier)
- **ORM:** Django ORM with migrations
- **File Storage:** Supabase Storage (for uploaded evidence files and generated PDFs)
- **Cache (optional):** Redis (for Celery job queues)

### Authentication
- **Supabase Auth** (phone OTP + email, JWT-based, minimal setup)
- Django validates Supabase JWTs via custom authentication backend

### Hosting / Infrastructure
- **Supabase** (DB + Auth + Storage — all-in-one)
- **Vercel** (frontend hosting)
- **Railway** or **Render** (Django backend hosting)

---

## APIs and External Services Needed

### Core (Must-Have)

| Service | Purpose | Free Tier? |
|---------|---------|-----------|
| **Google Cloud Vision API** | OCR for screenshots/scanned PDFs | 1,000 units/month free |
| **OpenAI API** or **Google Gemini API** | NLP — classify chat messages, extract entities, generate report narratives | Pay-per-use (cheap at low volume) |
| **Supabase** | Database + Auth + File Storage | Generous free tier |
| **pdf-lib** (npm) or **pdfplumber** (Python) | PDF text/table extraction | Free, open source |
| **Tesseract.js** (or pytesseract) | Fallback/local OCR engine | Free, open source |

### Nice-to-Have

| Service | Purpose | Free Tier? |
|---------|---------|-----------|
| **Whisper API** (OpenAI) or **Google Speech-to-Text** | Voice entry transcription | Whisper: pay-per-use; Google: 60 min/month free |
| **Puppeteer** or **@react-pdf/renderer** | PDF report generation | Free, open source |
| **Resend** or **SendGrid** | Email share tokens / notifications | Free tier available |
| **ClamAV** | Virus scanning on uploads | Free, open source |

### Key pip / npm Packages

```
# Python Backend (Django + Extraction + Scoring)
django                 # Web framework
djangorestframework    # REST API
django-cors-headers    # CORS for frontend
django-filter          # Query filtering
dj-database-url        # Parse Supabase DB URL
psycopg2-binary        # PostgreSQL driver
supabase               # Supabase client (storage, auth verification)
pdfplumber             # PDF table extraction (best in class)
pytesseract            # OCR wrapper
pandas                 # CSV/data manipulation
openai                 # LLM API client (chat classification, narratives)
celery                 # Async job queue for extraction pipeline
reportlab              # PDF report generation
python-dateutil        # Date normalization
numpy                  # Stats for anomaly detection

# JavaScript Frontend
react                  # UI framework
react-router-dom       # Routing
@supabase/supabase-js  # Supabase client (auth)
recharts               # Charts for dashboard
axios                  # HTTP client
tailwindcss            # Styling
```

---

## Team of 4 — Role Split & Task Allocation

### Person 1: Frontend + Report UI
**Owns:** Components 1 (UI), 9 (report rendering), 10 (dashboard)

- Build the auth flow (login/signup screens)
- Build the upload interface (drag-and-drop, manual entry form, voice record button)
- Build the dashboard: evidence status tracker, ledger preview, score display, charts
- Build the report preview and PDF download
- Build the verifier/share-token view page
- Build the org dashboard (if time permits)

**Key skills:** React, Tailwind, Recharts, responsive design

---

### Person 2: Backend Core + Ingestion
**Owns:** Components 1 (API), 2 (ingestion), 4 (normalization), 11 (security basics)

- Set up the API server, database schema, and auth middleware
- Build the upload gateway: file type detection, metadata extraction, evidence registry
- Build the normalization layer: unify all extracted events into `ledger_entries`
- Build the deduplication logic
- Implement PII redaction (regex-based: phone numbers, addresses)
- Implement share token system (JWT or UUID-based with expiry)

**Key skills:** Node.js/Python, PostgreSQL, API design, file handling

---

### Person 3: Extraction Pipeline (the hardest part)
**Owns:** Component 3 (all sub-pipelines: chat, CSV, PDF, OCR, voice)

- **Chat parsing:** Write parsers for WhatsApp .txt format (regex for timestamps, senders, amounts)
- **CSV parsing:** Auto-detect column schemas for GrabFood/Shopee/Foodpanda exports
- **PDF extraction:** Use pdfplumber or pdf-parse to extract transaction tables from bank/e-wallet statements
- **OCR:** Preprocess images with sharp, run through Tesseract or Google Vision, parse results
- **LLM integration:** Use OpenAI/Gemini to classify chat messages (order vs. payment vs. spam) and extract entities when regex isn't enough
- **Voice (stretch):** Integrate Whisper API for speech-to-text

**Key skills:** NLP, regex, data parsing, API integration, Python recommended for this role

---

### Person 4: Scoring, Linking, & Insights
**Owns:** Components 5 (cross-source linking), 6 (data quality), 7 (scoring), 8 (insights)

- Build the cross-source matching engine: compare events by time proximity, amount similarity, keyword overlap
- Build the anomaly detection: spike detection (z-score), round-number detection, gap detection
- Build the credibility scoring formula (weighted sum with penalties)
- Build the insights engine: peak days, trend analysis, improvement suggestions
- Generate the score breakdown (transparent, explainable)
- Write the report narrative generator (can use LLM for this)

**Key skills:** Data analysis, algorithms, statistics basics, LLM prompting

---

## Database Schema (Core Tables)

```sql
-- Users & businesses
users (id, email, phone, password_hash, created_at)
business_profiles (id, user_id, name, category, location, channels[])
consent_settings (business_id, share_mode, redact_pii, store_raw)

-- Evidence tracking
evidence (id, business_id, source_type, file_url, status, uploaded_at)
-- status: UPLOADED → QUEUED → EXTRACTED → NORMALIZED → ANALYZED → REPORTED

-- Unified ledger
ledger_entries (id, business_id, event_time, amount, currency, channel,
               event_type, source_evidence_id, confidence, attributes_json)

-- Cross-source linking
event_links (id, entry_a_id, entry_b_id, link_type, similarity_score)

-- Scoring & reports
credibility_scores (id, business_id, score, confidence_level, breakdown_json, computed_at)
reports (id, business_id, report_type, pdf_url, created_at)
share_tokens (id, report_id, token, expires_at, access_mode)

-- Audit
audit_log (id, actor_id, action, target, timestamp)
```

---

## Suggested Timeline (4-Week Sprint)

| Week | Focus | Deliverable |
|------|-------|-------------|
| **Week 1** | Setup & Core | DB schema, auth flow, upload UI, file storage, basic API routes |
| **Week 2** | Extraction | Chat parser, CSV parser, PDF extractor, OCR pipeline, normalization |
| **Week 3** | Intelligence | Cross-source linking, anomaly detection, scoring engine, insights |
| **Week 4** | Polish | PDF report generation, share system, dashboard charts, testing, demo prep |

---

## MVP Scope (What to Build First)

If time is tight, prioritize this minimal viable path:

1. **Auth + business profile** (Supabase Auth, simple form)
2. **Upload + CSV extraction** (easiest, highest confidence data)
3. **WhatsApp chat parsing** (most impactful — this is the unique value)
4. **Normalization into ledger**
5. **Basic credibility score** (even a simple weighted formula)
6. **PDF report generation** with score + chart
7. **Share link** with token

**Cut if needed:** Voice entry, OCR screenshots, org dashboard, anomaly detection, cross-source linking (these can all be stubbed or shown as mockups in a demo).

---

## Useful Resources

- [WhatsApp chat export format](https://faq.whatsapp.com/1180414079177245/) — understand the .txt structure
- [pdfplumber docs](https://github.com/jsvine/pdfplumber) — best Python PDF table extractor
- [Tesseract.js](https://github.com/naptha/tesseract.js) — browser/Node OCR
- [Google Cloud Vision API](https://cloud.google.com/vision/docs) — production OCR
- [OpenAI API docs](https://platform.openai.com/docs) — for NLP classification and narrative generation
- [Supabase docs](https://supabase.com/docs) — DB + Auth + Storage quickstart
- [pdf-lib](https://pdf-lib.js.org/) — create/modify PDFs in JavaScript
- [Recharts](https://recharts.org/) — React charting library
- [BullMQ](https://docs.bullmq.io/) — job queue for async extraction pipeline

---

## Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| WhatsApp format varies by language/OS | Build flexible regex, test with multiple sample exports |
| PDF statement layouts are inconsistent | Start with 2-3 known formats (Maybank, TNG), use LLM as fallback parser |
| OCR accuracy is low on phone screenshots | Preprocess images aggressively (contrast, deskew); use Google Vision over Tesseract for production |
| Scoring formula feels arbitrary | Make it fully transparent — show the breakdown, let verifiers see the evidence |
| Privacy/data sensitivity | Redact PII by default, encrypt at rest, short retention on raw files |

---

*Good luck building! The core innovation here is turning informal digital traces into a verifiable financial story. Focus on the extraction pipeline — that's where the magic happens.*
