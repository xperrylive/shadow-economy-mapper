# Database Schema

All tables are managed by Django migrations. Supabase PostgreSQL is the database.

Run migrations: `cd apps/api && python manage.py migrate`

---

## Entity Relationship

```
users (Django built-in)
  │
  ├── business_profiles (1:many)
  │     │
  │     ├── consent_settings (1:1)
  │     │
  │     ├── evidence (1:many)
  │     │     │
  │     │     └── ledger_entries (1:many)
  │     │           │
  │     │           └── event_links (many:many via entry_a/entry_b)
  │     │
  │     ├── credibility_scores (1:many, latest is current)
  │     │
  │     └── reports (1:many)
  │           │
  │           └── share_tokens (1:many)
  │
  └── organization_members (many:many via Organization)
```

---

## Tables

### business_profiles

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, auto-generated |
| user_id | FK → auth_user | Owner |
| name | VARCHAR(255) | Business name |
| category | VARCHAR(100) | e.g., "food_home", "retail" |
| location | VARCHAR(255) | City/state |
| channels | JSONB | List of active channels |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

### consent_settings

| Column | Type | Notes |
|--------|------|-------|
| business_id | FK → business_profiles | OneToOne |
| share_mode | VARCHAR(20) | "private", "token_only", "public" |
| redact_pii | BOOLEAN | Default true |
| store_raw_files | BOOLEAN | Default true |
| risk_disclosure_accepted | BOOLEAN | Default false |

### evidence

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| business_id | FK → business_profiles | |
| source_type | VARCHAR(20) | See SourceType enum |
| file_url | VARCHAR(500) | Supabase Storage URL |
| original_filename | VARCHAR(255) | |
| file_size | INT | Bytes |
| status | VARCHAR(20) | UPLOADED → QUEUED → EXTRACTED → NORMALIZED → ANALYZED → REPORTED |
| error_message | TEXT | If FAILED |
| metadata | JSONB | File metadata (pages, dimensions, etc.) |
| uploaded_at | TIMESTAMP | |
| processed_at | TIMESTAMP | Nullable |

### ledger_entries

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| business_id | FK → business_profiles | |
| event_time | TIMESTAMP | When the event occurred |
| amount | DECIMAL(12,2) | Always in MYR |
| currency | VARCHAR(3) | Default "MYR" |
| channel | VARCHAR(20) | See Channel enum |
| event_type | VARCHAR(20) | order, payment, payout, refund |
| source_evidence_id | FK → evidence | Which evidence this came from |
| confidence | FLOAT | 0.0 - 1.0 |
| attributes | JSONB | Extra data (items, order_id, fees, etc.) |
| created_at | TIMESTAMP | |

**Indexes:** (business_id, event_time), (business_id, channel)

### event_links

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| entry_a_id | FK → ledger_entries | |
| entry_b_id | FK → ledger_entries | |
| link_type | VARCHAR(20) | amount_match, time_match, keyword_match, cross_channel |
| similarity_score | FLOAT | 0.0 - 1.0 |
| created_at | TIMESTAMP | |

**Unique:** (entry_a_id, entry_b_id)

### credibility_scores

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| business_id | FK → business_profiles | |
| score | INT | 0-100 |
| confidence_level | VARCHAR(10) | LOW, MEDIUM, HIGH |
| breakdown | JSONB | { activity, consistency, longevity, evidence_strength, cross_source, penalties } |
| flags | JSONB | List of flag strings |
| insights | JSONB | List of InsightCard objects |
| computed_at | TIMESTAMP | |

### reports

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| business_id | FK → business_profiles | |
| report_type | VARCHAR(20) | "sme" or "verifier" |
| pdf_url | VARCHAR(500) | Supabase Storage URL |
| data_snapshot | JSONB | Score + insights at time of generation |
| created_at | TIMESTAMP | |

### share_tokens

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| report_id | FK → reports | |
| token | VARCHAR(64) | Unique, URL-safe |
| expires_at | TIMESTAMP | |
| access_count | INT | Default 0 |
| max_access | INT | Default 10 |
| created_at | TIMESTAMP | |

### organizations (stretch goal)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR(255) | |
| org_type | VARCHAR(50) | ngo, bank, government |
| created_at | TIMESTAMP | |

### organization_members (stretch goal)

| Column | Type | Notes |
|--------|------|-------|
| user_id | FK → auth_user | |
| organization_id | FK → organizations | |
| role | VARCHAR(20) | admin, reviewer, viewer |
| joined_at | TIMESTAMP | |

---

## Enum Values Reference

**SourceType:** whatsapp, telegram, instagram, csv_grab, csv_shopee, csv_foodpanda, pdf_bank, pdf_ewallet, screenshot, manual, voice

**Channel:** whatsapp, grabfood, shopee, foodpanda, lazada, tng, bank, cash, other

**EventType:** order, payment, payout, refund

**EvidenceStatus:** UPLOADED, QUEUED, EXTRACTED, NORMALIZED, ANALYZED, REPORTED, FAILED

**ConfidenceLevel:** LOW, MEDIUM, HIGH
