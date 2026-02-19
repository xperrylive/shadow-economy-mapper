# Shadow Economy Mapper

A platform that helps informal micro-businesses prove their income by transforming digital traces (WhatsApp chats, platform CSVs, e-wallet statements, screenshots) into verifiable financial reports.

## Architecture

```
apps/
  web/          → React + Vite + TypeScript (Person 1)
  api/          → Django + DRF + Supabase (Person 2)
packages/
  shared-types/ → TypeScript interfaces (shared contract)
  extraction/   → Parsing pipeline: chat, CSV, PDF, OCR, voice (Person 3)
  scoring/      → Credibility scoring, linking, insights (Person 4)
docs/           → Project documentation & conventions
scripts/        → Setup & utility scripts
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional, for local Supabase)

### Setup

```bash
# 1. Clone and enter project
git clone <repo-url>
cd shadow-economy-mapper

# 2. Copy env file
cp .env.example .env
# Fill in your Supabase and API keys

# 3. Backend setup
cd apps/api
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# 4. Frontend setup (new terminal)
cd apps/web
npm install
npm run dev

# 5. Extraction package (new terminal, same venv as backend)
cd packages/extraction
pip install -r requirements.txt

# 6. Scoring package
cd packages/scoring
pip install -r requirements.txt
```

## Documentation

- [Implementation Guide](docs/IMPLEMENTATION_GUIDE.md) — What the project is, tech stack, APIs needed
- [Team Conventions](docs/TEAM_CONVENTIONS.md) — Folder ownership, git workflow, AI prompts
- [API Contracts](docs/API_CONTRACTS.md) — All endpoint specs
- [Database Schema](docs/DATABASE_SCHEMA.md) — Full ERD and table definitions

## Team

| Person | Domain | Folder |
|--------|--------|--------|
| P1 | Frontend + Report UI | `apps/web/` |
| P2 | Backend API + DB | `apps/api/` |
| P3 | Extraction Pipeline | `packages/extraction/` |
| P4 | Scoring & Insights | `packages/scoring/` |

## License

MIT
