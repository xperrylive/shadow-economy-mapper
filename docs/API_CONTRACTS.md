# API Contracts

All endpoints are prefixed with `/api/`. Authentication via Supabase JWT in `Authorization: Bearer <token>` header.

## Auth / Business Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/businesses/` | List user's businesses |
| POST | `/api/auth/businesses/` | Create business profile |
| GET | `/api/auth/businesses/{id}/` | Get business details |
| PATCH | `/api/auth/businesses/{id}/` | Update business |
| GET | `/api/auth/businesses/{id}/consent/` | Get consent settings |
| PATCH | `/api/auth/businesses/{id}/consent/` | Update consent settings |

### Create Business Profile

```json
// POST /api/auth/businesses/
{
  "name": "Kak Lina's Kuih",
  "category": "food_home",
  "location": "Shah Alam, Selangor",
  "channels": ["whatsapp", "grabfood"]
}

// Response 201
{
  "id": "uuid",
  "name": "Kak Lina's Kuih",
  "category": "food_home",
  "location": "Shah Alam, Selangor",
  "channels": ["whatsapp", "grabfood"],
  "created_at": "2026-02-20T10:00:00Z",
  "updated_at": "2026-02-20T10:00:00Z"
}
```

---

## Evidence

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/evidence/items/` | List evidence for user's businesses |
| POST | `/api/evidence/items/upload/` | Upload evidence (multipart) |
| GET | `/api/evidence/items/{id}/` | Get evidence details + status |

### Upload Evidence

```
POST /api/evidence/items/upload/
Content-Type: multipart/form-data

business_id: uuid
source_type: "whatsapp" | "csv_grab" | "pdf_bank" | ...
file: <binary>
```

```json
// Response 201
{
  "evidence_id": "uuid",
  "status": "UPLOADED",
  "message": "Evidence received. Extraction will begin shortly."
}
```

### Manual Entry

```json
// POST /api/evidence/items/upload/
{
  "business_id": "uuid",
  "source_type": "manual",
  "date": "2026-02-19",
  "total_sales": 350.00,
  "order_count": 15,
  "notes": "Pasar malam Thursday"
}
```

---

## Ledger

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/evidence/ledger/` | List ledger entries (paginated) |
| GET | `/api/evidence/ledger/?business_id={id}&from={date}&to={date}` | Filter by business and date range |

```json
// Response 200
{
  "count": 142,
  "next": "/api/evidence/ledger/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "business": "uuid",
      "event_time": "2026-02-19T14:30:00Z",
      "amount": 24.00,
      "currency": "MYR",
      "channel": "whatsapp",
      "event_type": "payment",
      "source_evidence": "uuid",
      "confidence": 0.72,
      "attributes": { "sender": "Aishah" },
      "created_at": "2026-02-19T15:00:00Z"
    }
  ]
}
```

---

## Scoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/evidence/scores/` | List scores for user's businesses |
| POST | `/api/evidence/scores/compute/` | Trigger score computation |
| GET | `/api/evidence/scores/{id}/` | Get score details |

### Compute Score

```json
// POST /api/evidence/scores/compute/
{ "business_id": "uuid" }

// Response 202
{ "message": "Score computation queued.", "business_id": "uuid" }
```

### Score Response

```json
{
  "id": "uuid",
  "business": "uuid",
  "score": 72,
  "confidence_level": "MEDIUM",
  "breakdown": {
    "activity": 25.0,
    "consistency": 14.0,
    "longevity": 12.0,
    "evidence_strength": 18.0,
    "cross_source": 9.0,
    "penalties": -6.0
  },
  "flags": ["missing_period"],
  "insights": [
    {
      "type": "peak_day",
      "title": "Peak activity days",
      "description": "Your busiest days are Thursday and Saturday.",
      "data": null
    },
    {
      "type": "recommendation",
      "title": "Boost your score",
      "description": "Upload a bank statement to add a high-confidence source.",
      "data": null
    }
  ],
  "computed_at": "2026-02-20T10:30:00Z"
}
```

---

## Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/` | List reports |
| POST | `/api/reports/generate/` | Generate new report |
| POST | `/api/reports/{id}/share/` | Create share token |
| GET | `/api/reports/verify/{token}/` | Public: view shared report |

### Generate Report

```json
// POST /api/reports/generate/
{ "business_id": "uuid", "report_type": "sme" }

// Response 202
{ "message": "Report generation queued.", "business_id": "uuid" }
```

### Create Share Link

```json
// POST /api/reports/{id}/share/
{ "expires_in_hours": 72 }

// Response 200
{
  "token": "abc123...",
  "share_url": "/verify/abc123...",
  "expires_at": "2026-02-23T10:30:00Z"
}
```

---

## Error Format

All errors return:

```json
{
  "error": true,
  "message": "Human-readable error message",
  "details": { "field": ["Specific validation error"] }
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 202 | Accepted (queued for processing) |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Not found |
| 410 | Gone (expired share token) |
| 500 | Server error |
