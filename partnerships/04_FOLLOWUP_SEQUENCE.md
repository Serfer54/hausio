# 5-Email Follow-Up Sequence

Sent if the prospect doesn't reply to the first cold email (Variant A/B/C).

**Cadence:** Day 0 (initial), Day 4, Day 9, Day 16, Day 30. Then drop until quarterly check-in.

**Stop rule:** any reply (even "no") halts the sequence.

---

## EMAIL 1 — Day 0 (initial cold email)

Use templates in `03_COLD_EMAIL_TEMPLATES.md`. Track sent date.

---

## EMAIL 2 — Day 4 — "Lighter touch"

**Subject:** `Re: 20% commission on every {borough} EoT clean — no setup`
*(reply to your own thread — same subject, just "Re:")*

```
Hi {first_name},

Following up briefly — I imagine you're knee-deep in {month} listings.

One quick clarification I should have included last week: the 5-clean trial at 25% commission is paid out the same as the standard rate (BACS, by the 5th of the month). It's not a goodwill credit — actual money in your branch account so you can validate the volume before any decision.

If a 15-minute call doesn't fit, would a one-page summary of the top 3 things our partner branches save be more useful?

Best,
Serhii
+44 7304 330 614
```

---

## EMAIL 3 — Day 9 — "Insight share"

**Subject:** `Quick stat from {borough} EoT cleaning data`

```
Hi {first_name},

Sharing one number that landed with our other London branch partners:

The average tenant spends 11 days from move-out to dispute resolution when their EoT clean is flagged by the inventory clerk. The deposit is locked in TDS for that whole window, the tenant chases your branch, and the case ends up on someone's desk.

We track our re-clean rate at <2.5% (industry typical: 8–12%). The 72-hour free re-clean fixes the rare cases without your branch having to coordinate.

The 20% commission is the obvious headline, but the real saving is that 11-day cycle time on flagged cleans never happens.

Worth a 15-minute call this week? I'm free Tue 10:00, Wed 11:00, Thu 14:00.

Best,
Serhii
+44 7304 330 614
hausio.co.uk
```

---

## EMAIL 4 — Day 16 — "Borough-specific anchor"

**Subject:** `Hausio in {borough} — 5 cleans completed this week`

```
Hi {first_name},

Sharing live local proof — this past week in {borough}:
- {N} EoT cleans completed
- 0 flagged by inventory clerks
- 100% same-day or next-day delivery
- {service_specific_detail — e.g. "3 included sash window dusting at no extra charge in NW3 listed properties"}

If your branch had referred those {N} jobs, the commission this week alone would be ~£{calc: N × £52 avg × 20%}.

I won't keep emailing — final follow-up next week, then I'll leave you in peace.

If a 15-minute call fits any time before then: +44 7304 330 614 / hello@hausio.co.uk

Best,
Serhii
```

> Replace `{N}` and `{service_specific_detail}` with real numbers / specifics weekly. If you don't have real data yet, skip Email 4 and jump to Email 5 on Day 16.

---

## EMAIL 5 — Day 30 — "Door-closing, soft re-open"

**Subject:** `Last note from Hausio — door stays open`

```
Hi {first_name},

Last email from me on this — I appreciate you may not be the right person, the timing might be off, or {branch_name} may already have a partner that works.

Either way, three things stay open:

1. Our booking link works ad-hoc — no formal partnership needed. Send tenants to **hausio.co.uk/book** any time.
2. Our number is **+44 7304 330 614** — feel free to call if a tenancy has a tricky brief (listed building, mansion-block, conservation area, embassy-adjacent).
3. The 20% commission stays available whenever you want to switch on a referral relationship — just reply.

I'll check in once a quarter unless I hear from you sooner.

All the best for the rest of the year.

Serhii Perepechaiev
CMO, Hausio Ltd
+44 7304 330 614
hausio.co.uk
hello@hausio.co.uk
```

---

## QUARTERLY RE-ENGAGEMENT (after Day 30)

90 days after Email 5, send one more — only if industry context has shifted (new property tax, regulation, market trend, your own milestone):

**Subject:** `Hausio — {milestone or event} update for {branch_name}`

```
Hi {first_name},

Quick re-engagement — last time we connected was {month}. Since then on our side: {milestone — e.g. "we crossed 200 EoT cleans/month across London", "added gardening to the service mix", "launched in {new borough}"}.

Reason I'm sharing: {reason linked to their branch — e.g. "Camden HMOs are a growing share of our volume — your branch's typical tenancy mix would line up well", "we now cover end-of-tenancy + man-and-van + handyman as a single contract — saves your team coordinating 3 vendors"}.

If timing has changed, the 20% commission offer is still on the table. 15-minute call?

Best,
Serhii
+44 7304 330 614
```

---

## FOLLOW-UP TRACKER FORMAT

Keep this CSV alongside cold-email sends. Update on every send and reply.

| field | example |
|-------|---------|
| date_email_1 | 2026-05-05 |
| date_email_2 | 2026-05-09 |
| date_email_3 | 2026-05-14 |
| date_email_4 | 2026-05-21 |
| date_email_5 | 2026-06-04 |
| reply_received_date | 2026-05-09 |
| reply_outcome | Meeting booked / Not interested / No response / Pitch requested |
| meeting_booked_date | 2026-05-12 |
| trial_started_date | 2026-05-19 |
| status | New / Engaged / Trial / Active partner / Lost / Quarterly nurture |

See `05_COMMISSION_TRACKER.csv` for the active-partner ledger once a branch starts referring.

---

*Sequence design: 4-touch outreach + 1 closer = 75% of typical B2B outreach response. Anything more starts looking like spam to property professionals.*
