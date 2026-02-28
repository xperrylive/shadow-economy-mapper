import sys
sys.path.insert(0, r"c:\Users\saadm\Desktop\Programming\kita-hackathon")

from packages.extraction.src import extract_evidence

with open(r"c:\Users\saadm\Desktop\Programming\kita-hackathon\mock_whatsapp_order.txt", "rb") as f:
    data = f.read()

events = extract_evidence(data, "whatsapp")
print(f"Extracted {len(events)} events")
for e in events:
    print(f"  [{e['event_type']}] RM{e['amount']} at {e['timestamp']} (conf: {e['confidence']})")
