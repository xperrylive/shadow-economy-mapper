"""
Seed script: populate Supabase with mock data for businesses
  - "harsh"
  - "saad pastry"

Run from project root:
  python scripts/seed_mock_data.py
"""

import os, sys, uuid, random, json
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Load .env from project root
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

from supabase import create_client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]  # service-role for RLS bypass

sb = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── helpers ──────────────────────────────────────────────────────────
now = datetime.now(timezone.utc)

def uid():
    return str(uuid.uuid4())

def past(days_back_max=90):
    delta = timedelta(days=random.randint(1, days_back_max),
                      hours=random.randint(0, 23),
                      minutes=random.randint(0, 59))
    return (now - delta).isoformat()

def amount():
    return round(random.uniform(5.0, 500.0), 2)

# ── 1. Create auth users via admin API ──────────────────────────────
print("Creating auth users …")

def get_or_create_user(email, password="Test1234!"):
    """Create user in Supabase Auth; return user id."""
    # Try to find existing user first
    try:
        existing = sb.auth.admin.list_users()
        for u in existing:
            if u.email == email:
                print(f"  ✓ Found existing user {email} → {u.id}")
                return u.id
    except Exception:
        pass

    res = sb.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True,
    })
    print(f"  ✓ Created user {email} → {res.user.id}")
    return res.user.id

harsh_user_id = get_or_create_user("harsh@example.com")
saad_user_id  = get_or_create_user("saad@example.com")

# ── 2. Insert auth_user rows into Django's auth_user table ──────────
# Supabase Auth and Django auth are separate; we insert into the Django
# auth_user table so ForeignKey references work.
print("Ensuring Django auth_user rows …")
for uid_val, uname, email in [
    (harsh_user_id, "harsh", "harsh@example.com"),
    (saad_user_id,  "saad",  "saad@example.com"),
]:
    try:
        sb.table("auth_user").upsert({
            "id": uid_val if isinstance(uid_val, int) else hash(uid_val) % 2147483647,
            "username": uname,
            "email": email,
            "password": "!unusable",
            "is_superuser": False,
            "is_staff": False,
            "is_active": True,
            "first_name": uname.title(),
            "last_name": "",
            "date_joined": now.isoformat(),
        }, on_conflict="id").execute()
        print(f"  ✓ auth_user {uname}")
    except Exception as e:
        print(f"  ⚠ auth_user {uname}: {e}")

# We'll use integer ids for Django FK references
harsh_django_id = hash(harsh_user_id) % 2147483647
saad_django_id  = hash(saad_user_id) % 2147483647

# ── 3. Business profiles ────────────────────────────────────────────
print("Creating business profiles …")

harsh_biz_id = uid()
saad_biz_id  = uid()

businesses = [
    {
        "id": harsh_biz_id,
        "user_id": harsh_django_id,
        "name": "Harsh",
        "category": "General Trade",
        "location": "Kuala Lumpur, Malaysia",
        "channels": json.dumps(["whatsapp", "grabfood", "shopee", "bank"]),
        "created_at": past(120),
        "updated_at": now.isoformat(),
    },
    {
        "id": saad_biz_id,
        "user_id": saad_django_id,
        "name": "Saad Pastry",
        "category": "Food & Bakery",
        "location": "Penang, Malaysia",
        "channels": json.dumps(["whatsapp", "grabfood", "foodpanda", "tng", "cash"]),
        "created_at": past(180),
        "updated_at": now.isoformat(),
    },
]

for b in businesses:
    sb.table("business_profiles").upsert(b, on_conflict="id").execute()
    print(f"  ✓ {b['name']}")

# ── 4. Consent settings ─────────────────────────────────────────────
print("Creating consent settings …")
for biz_id in [harsh_biz_id, saad_biz_id]:
    sb.table("consent_settings").upsert({
        "business_id": biz_id,
        "share_mode": random.choice(["private", "token_only", "public"]),
        "redact_pii": True,
        "store_raw_files": True,
        "risk_disclosure_accepted": True,
        "updated_at": now.isoformat(),
    }, on_conflict="business_id").execute()
    print(f"  ✓ consent for {biz_id[:8]}…")


# ── 5. Evidence uploads ─────────────────────────────────────────────
print("Creating evidence uploads …")

SOURCE_TYPE_FILE_MAP = {
    "whatsapp":     {"ext": ".txt",  "prefix": "whatsapp_chat_export", "size_range": (5_000, 50_000)},
    "telegram":     {"ext": ".json", "prefix": "telegram_export",      "size_range": (8_000, 80_000)},
    "instagram":    {"ext": ".json", "prefix": "instagram_messages",   "size_range": (3_000, 30_000)},
    "csv_grab":     {"ext": ".csv",  "prefix": "grab_orders",          "size_range": (10_000, 200_000)},
    "csv_shopee":   {"ext": ".csv",  "prefix": "shopee_orders",        "size_range": (15_000, 250_000)},
    "csv_foodpanda": {"ext": ".csv", "prefix": "foodpanda_summary",    "size_range": (12_000, 180_000)},
    "pdf_bank":     {"ext": ".pdf",  "prefix": "bank_statement",       "size_range": (100_000, 2_000_000)},
    "pdf_ewallet":  {"ext": ".pdf",  "prefix": "ewallet_statement",    "size_range": (80_000, 1_500_000)},
    "screenshot":   {"ext": ".png",  "prefix": "screenshot_txn",       "size_range": (50_000, 500_000)},
    "manual":       {"ext": ".json", "prefix": "manual_entry",         "size_range": (200, 2_000)},
    "voice":        {"ext": ".ogg",  "prefix": "voice_note",           "size_range": (30_000, 300_000)},
}

STATUSES = ["UPLOADED", "QUEUED", "EXTRACTED", "NORMALIZED", "ANALYZED", "REPORTED"]

evidence_rows = []

# -- Harsh: 8 uploads, diverse types
harsh_sources = ["whatsapp", "csv_grab", "csv_shopee", "pdf_bank", "screenshot", "screenshot", "manual", "voice"]
for src in harsh_sources:
    info = SOURCE_TYPE_FILE_MAP[src]
    eid = uid()
    fname = f"{info['prefix']}_{random.randint(1000,9999)}{info['ext']}"
    evidence_rows.append({
        "id": eid,
        "business_id": harsh_biz_id,
        "source_type": src,
        "file_url": f"https://lpmhwveeejfizxwiegnq.supabase.co/storage/v1/object/public/evidence/{harsh_biz_id}/{fname}",
        "original_filename": fname,
        "file_size": random.randint(*info["size_range"]),
        "status": random.choice(STATUSES),
        "error_message": "",
        "metadata": json.dumps({"month": random.choice(["2025-10", "2025-11", "2025-12", "2026-01", "2026-02"])}),
        "uploaded_at": past(60),
    })

# -- Saad Pastry: 12 uploads, heavy on food-platform CSVs and WhatsApp
saad_sources = [
    "whatsapp", "whatsapp", "whatsapp",
    "csv_grab", "csv_grab",
    "csv_foodpanda", "csv_foodpanda",
    "pdf_bank", "pdf_ewallet",
    "screenshot", "screenshot",
    "voice",
]
for src in saad_sources:
    info = SOURCE_TYPE_FILE_MAP[src]
    eid = uid()
    fname = f"{info['prefix']}_{random.randint(1000,9999)}{info['ext']}"
    evidence_rows.append({
        "id": eid,
        "business_id": saad_biz_id,
        "source_type": src,
        "file_url": f"https://lpmhwveeejfizxwiegnq.supabase.co/storage/v1/object/public/evidence/{saad_biz_id}/{fname}",
        "original_filename": fname,
        "file_size": random.randint(*info["size_range"]),
        "status": random.choice(STATUSES),
        "error_message": "",
        "metadata": json.dumps({"month": random.choice(["2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02"])}),
        "uploaded_at": past(90),
    })

for ev in evidence_rows:
    sb.table("evidence").upsert(ev, on_conflict="id").execute()
    print(f"  ✓ {ev['source_type']:15s} {ev['original_filename']}")


# ── 6. Ledger entries (transactions) ────────────────────────────────
print("Creating ledger entries …")

CHANNEL_MAP = {
    "whatsapp": "whatsapp",
    "csv_grab": "grabfood",
    "csv_shopee": "shopee",
    "csv_foodpanda": "foodpanda",
    "pdf_bank": "bank",
    "pdf_ewallet": "tng",
    "screenshot": random.choice(["tng", "bank", "cash"]),
    "manual": "cash",
    "voice": "whatsapp",
}

ledger_rows = []
for ev in evidence_rows:
    n_entries = random.randint(3, 12)
    channel = CHANNEL_MAP.get(ev["source_type"], "other")
    for _ in range(n_entries):
        ledger_rows.append({
            "id": uid(),
            "business_id": ev["business_id"],
            "event_time": past(60),
            "amount": amount(),
            "currency": "MYR",
            "channel": channel,
            "event_type": random.choice(["order", "payment", "payout", "refund"]),
            "source_evidence_id": ev["id"],
            "confidence": round(random.uniform(0.55, 0.99), 2),
            "attributes": json.dumps({
                "customer": f"Customer_{random.randint(100,999)}",
                "item_count": random.randint(1, 8),
            }),
            "created_at": now.isoformat(),
        })

# Insert in batches of 50
for i in range(0, len(ledger_rows), 50):
    batch = ledger_rows[i:i+50]
    sb.table("ledger_entries").upsert(batch, on_conflict="id").execute()
print(f"  ✓ {len(ledger_rows)} ledger entries")


# ── 7. Credibility scores ───────────────────────────────────────────
print("Creating credibility scores …")

for biz_id, biz_name, score_val in [
    (harsh_biz_id, "Harsh", 62),
    (saad_biz_id, "Saad Pastry", 78),
]:
    sb.table("credibility_scores").upsert({
        "id": uid(),
        "business_id": biz_id,
        "score": score_val,
        "confidence_level": "MEDIUM" if score_val < 70 else "HIGH",
        "breakdown": json.dumps({
            "activity_volume": random.randint(40, 95),
            "cross_channel_consistency": random.randint(30, 90),
            "longevity": random.randint(20, 80),
            "data_quality": random.randint(50, 95),
            "anomaly_penalty": random.randint(0, 15),
        }),
        "flags": json.dumps(
            random.sample([
                "low_bank_statement_coverage",
                "single_channel_dominant",
                "high_cash_ratio",
                "consistent_monthly_activity",
                "cross_platform_match_found",
            ], k=random.randint(1, 3))
        ),
        "insights": json.dumps([
            {"title": "Most active channel", "value": "WhatsApp", "type": "stat"},
            {"title": "Monthly avg revenue", "value": f"RM {random.randint(800, 5000)}", "type": "stat"},
            {"title": "Data sources", "value": f"{random.randint(3, 6)} connected", "type": "stat"},
        ]),
        "computed_at": now.isoformat(),
    }, on_conflict="id").execute()
    print(f"  ✓ Score {score_val} for {biz_name}")

print("\n✅ Mock data seeded successfully!")
print(f"   Harsh       → {len([e for e in evidence_rows if e['business_id'] == harsh_biz_id])} uploads")
print(f"   Saad Pastry → {len([e for e in evidence_rows if e['business_id'] == saad_biz_id])} uploads")
print(f"   Total ledger entries: {len(ledger_rows)}")
