# Hausio — Google Ads Search Launch Guide
## 3 Search campaigns × £1,000/month × London

**Created:** 2026-04-27
**Phase:** 1 (Search only — Meta / PMax / Display blocked until 30+ conversions)

---

## 0. WHAT YOU GET

3 Search campaigns ready to import:

| # | Campaign | Budget/mo | Daily | Bidding | Ad groups |
|---|---|---|---|---|---|
| 1 | Cleaning — London | £500 | £16.67 | Manual CPC, max £4.00 | EOT · Deep · Regular |
| 2 | Removals — London | £300 | £10.00 | Manual CPC, max £3.50 | Man & Van · House Removals |
| 3 | Handyman — London | £200 | £6.67 | Manual CPC, max £3.00 | General · Specific Tasks |

Each campaign: ~15 keywords (mixed exact + phrase), shared 60-term negatives list, 3 RSAs per ad group, all extensions, geotargeting on Greater London with +30% bid on premium boroughs.

---

## 1. PREREQUISITES (do once before import)

### 1.1 Google Ads account in Expert Mode
- Open `ads.google.com` → "Switch to Expert Mode" if you see Smart Mode
- Add billing (UK card, GBP currency)
- Account ID format `123-456-7890` — share with me when done

### 1.2 Conversion action `Booking_Submitted`
**Tools (top right) → Conversions → New conversion action → Website**

Settings:
- **Goal & action category:** Submit lead form
- **Conversion name:** `Booking_Submitted`
- **Value:** Use a default value · `150` GBP (avg first-month AOV)
- **Count:** Every (each booking = 1 conversion)
- **Click-through conversion window:** 30 days
- **View-through window:** 1 day
- **Attribution model:** Data-driven (or Last click if data-driven greyed out)
- **Include in Conversions:** Yes (so Smart Bidding optimises towards it)

After saving, Google shows the **Conversion ID** (`AW-XXXXXXXXXX`) and **Label** (`abcDEF123-`). Send me both — I'll wire them into GTM.

### 1.3 Google Business Profile (separate task, in parallel)
- `business.google.com` → Manage your business → Add business
- Type: **Service-area business** (no public storefront)
- Service area: 5-mile radius from Westminster, Camden, Islington, Hammersmith, Wandsworth (or Greater London if simpler)
- Categories: Cleaning service, Removalist, Handyman
- Phone: +44 7304 330 614, Website: hausio.co.uk
- Verification: Postcard or video (takes 5-14 days). Doesn't block Search ads, but unlocks Local Services Ads + location asset.

---

## 2. CAMPAIGN 1 — CLEANING (£500/mo)

### 2.1 Settings

| Field | Value |
|---|---|
| Campaign name | `Cleaning · London · Search` |
| Type | Search |
| Goal | Leads |
| Networks | Google Search **only** (uncheck Search Partners + Display) |
| Locations | **United Kingdom → Greater London** |
| Location options | Presence: People in or regularly in your locations |
| Languages | English |
| Audience segments | (skip — add later when retargeting pool exists) |
| Budget | £16.67/day |
| Bidding | **Manual CPC** (uncheck "Help maximise clicks") |
| Default max CPC | £4.00 |
| Ad rotation | Optimize: Prefer best-performing ads |
| Ad schedule | Mon-Sun 08:00–22:00 |
| Devices | Mobile +20%, Tablet 0%, Desktop 0%, TV 0% |

**Location bid adjustments (after creation, in Locations tab):**
- Westminster `+30%`
- Kensington & Chelsea `+30%`
- Camden `+25%`
- Islington `+20%`
- Hammersmith & Fulham `+20%`
- Wandsworth `+15%`

### 2.2 Ad Group 1 — End-of-Tenancy

**Daily budget allocation:** ~£7/day (highest priority — best CR)

**Keywords (paste into Editor's keyword tool):**

| Keyword | Match | Max CPC |
|---|---|---|
| `[end of tenancy cleaning london]` | Exact | £4.00 |
| `[end of tenancy clean london]` | Exact | £4.00 |
| `[move out cleaning london]` | Exact | £4.00 |
| `[end of lease cleaning london]` | Exact | £4.00 |
| `"end of tenancy cleaning"` | Phrase | £3.50 |
| `"move out cleaning"` | Phrase | £3.50 |
| `"end of tenancy clean"` | Phrase | £3.50 |
| `"check out cleaning"` | Phrase | £3.20 |
| `"tenancy clean"` | Phrase | £3.20 |
| `"professional end of tenancy"` | Phrase | £3.50 |

**Final URL:** `https://hausio.co.uk/book.html?service=cleaning`

### 2.3 Ad Group 2 — Deep Clean

**Daily allocation:** ~£5/day

| Keyword | Match | Max CPC |
|---|---|---|
| `[deep clean london]` | Exact | £3.50 |
| `[deep cleaning london]` | Exact | £3.50 |
| `[deep cleaning service london]` | Exact | £3.50 |
| `[spring cleaning london]` | Exact | £3.20 |
| `"deep clean"` | Phrase | £3.00 |
| `"deep cleaning service"` | Phrase | £3.00 |
| `"professional deep clean"` | Phrase | £3.20 |
| `"one off deep clean"` | Phrase | £3.00 |
| `"after builders cleaning"` | Phrase | £3.20 |
| `"post construction cleaning"` | Phrase | £3.00 |

**Final URL:** `https://hausio.co.uk/book.html?service=cleaning`

### 2.4 Ad Group 3 — Regular Cleaning

**Daily allocation:** ~£4.50/day

| Keyword | Match | Max CPC |
|---|---|---|
| `[house cleaning london]` | Exact | £3.20 |
| `[domestic cleaning london]` | Exact | £3.20 |
| `[weekly cleaner london]` | Exact | £3.00 |
| `[regular cleaner london]` | Exact | £3.00 |
| `[cleaner london]` | Exact | £3.00 |
| `"house cleaning service"` | Phrase | £2.80 |
| `"domestic cleaner"` | Phrase | £2.80 |
| `"weekly cleaning"` | Phrase | £2.50 |
| `"home cleaning service"` | Phrase | £2.80 |
| `"vetted cleaner"` | Phrase | £2.80 |

**Final URL:** `https://hausio.co.uk/book.html?service=cleaning`

---

## 3. CAMPAIGN 2 — REMOVALS (£300/mo)

### 3.1 Settings

Same as Cleaning campaign settings except:
- **Campaign name:** `Removals · London · Search`
- **Budget:** £10/day
- **Default max CPC:** £3.50

### 3.2 Ad Group 1 — Man & Van

**Daily allocation:** ~£6/day

| Keyword | Match | Max CPC |
|---|---|---|
| `[man and van london]` | Exact | £3.50 |
| `[man with a van london]` | Exact | £3.50 |
| `[van and man hire london]` | Exact | £3.20 |
| `[single item delivery london]` | Exact | £3.00 |
| `[ikea delivery london]` | Exact | £3.00 |
| `"man and van"` | Phrase | £3.00 |
| `"man with a van"` | Phrase | £3.00 |
| `"van hire with driver"` | Phrase | £2.80 |
| `"single item move"` | Phrase | £2.50 |
| `"furniture delivery service"` | Phrase | £2.80 |

**Final URL:** `https://hausio.co.uk/book.html?service=removals`

### 3.3 Ad Group 2 — House & Flat Removals

**Daily allocation:** ~£4/day

| Keyword | Match | Max CPC |
|---|---|---|
| `[house removals london]` | Exact | £3.50 |
| `[flat removals london]` | Exact | £3.20 |
| `[moving company london]` | Exact | £3.50 |
| `[removals service london]` | Exact | £3.20 |
| `"house removals"` | Phrase | £3.00 |
| `"flat removals"` | Phrase | £2.80 |
| `"moving service london"` | Phrase | £3.00 |
| `"removal company"` | Phrase | £2.80 |
| `"home removal"` | Phrase | £2.80 |
| `"office removal"` | Phrase | £3.00 |

**Final URL:** `https://hausio.co.uk/book.html?service=removals`

---

## 4. CAMPAIGN 3 — HANDYMAN (£200/mo)

### 4.1 Settings

Same as Cleaning except:
- **Campaign name:** `Handyman · London · Search`
- **Budget:** £6.67/day
- **Default max CPC:** £3.00

### 4.2 Ad Group 1 — General Handyman

**Daily allocation:** ~£3.50/day

| Keyword | Match | Max CPC |
|---|---|---|
| `[handyman london]` | Exact | £3.00 |
| `[handyman service london]` | Exact | £3.00 |
| `[local handyman london]` | Exact | £2.80 |
| `[odd jobs london]` | Exact | £2.80 |
| `"handyman service"` | Phrase | £2.50 |
| `"local handyman"` | Phrase | £2.50 |
| `"odd jobs"` | Phrase | £2.30 |
| `"home repairs london"` | Phrase | £2.50 |
| `"general repairs"` | Phrase | £2.30 |
| `"property maintenance"` | Phrase | £2.50 |

**Final URL:** `https://hausio.co.uk/book.html?service=handyman`

### 4.3 Ad Group 2 — Specific Tasks (Assembly, Mounting, Small Jobs)

**Daily allocation:** ~£3/day

| Keyword | Match | Max CPC |
|---|---|---|
| `[furniture assembly london]` | Exact | £2.80 |
| `[ikea assembly london]` | Exact | £2.80 |
| `[tv mounting london]` | Exact | £2.80 |
| `[shelf installation london]` | Exact | £2.50 |
| `[flatpack assembly london]` | Exact | £2.50 |
| `"furniture assembly"` | Phrase | £2.30 |
| `"ikea assembly"` | Phrase | £2.30 |
| `"tv wall mounting"` | Phrase | £2.50 |
| `"flatpack assembly"` | Phrase | £2.30 |
| `"picture hanging service"` | Phrase | £2.30 |

**Final URL:** `https://hausio.co.uk/book.html?service=handyman`

---

## 5. NEGATIVE KEYWORDS (shared across all 3 campaigns)

Add these as **shared library negative list** (Tools → Shared library → Negative keyword lists → Create), then attach the list to all 3 campaigns.

**List name:** `Hausio · Master Negatives`

### Job/Career exclusions (we're not hiring)
```
-jobs
-job
-career
-careers
-hiring
-recruit
-recruitment
-vacancy
-vacancies
-salary
-wage
-cv
-resume
-apprenticeship
-training course
-training courses
```

### DIY / Information exclusions
```
-diy
-tutorial
-how to
-guide
-tips
-youtube
-reddit
-forum
-blog
-wikipedia
-template
-checklist free
-quote calculator
```

### Cheap / free seekers (low-quality leads)
```
-free
-cheap
-cheapest
-discount only
-coupon
-voucher only
-£10
-£15
-£20 hour
-budget
-low cost
```

### Wrong-vertical exclusions
```
-carpet cleaning
-window cleaning only
-gutter cleaning
-oven cleaning only
-dry cleaning
-laundry service
-car cleaning
-car wash
-jet wash
-pressure wash
-international removals
-shipping container
-storage abroad
-moving abroad
-self storage
-construction company
-builder needed
-architect
-electrician fully qualified
-plumber emergency
-gas safe engineer
```

### Branded competitors (to bid OFF, not on)
```
-fantastic services
-anyvan
-pickfords
-britannia movers
-domestic cleaning agency
-time to clean
-housekeep
-handy
-tasker
-airtasker
```

---

## 6. RESPONSIVE SEARCH ADS (RSAs)

3 ads per ad group, each with 15 headlines + 4 descriptions + display path. Pin Headline 1 + Headline 2 to position 1 + 2 (locks the brand promise) and let the rest rotate.

### 6.1 Cleaning · End-of-Tenancy

**Display path:** `/cleaning` and `/end-of-tenancy`

**Headlines (15):**
1. `End-of-Tenancy Cleaning London` 📌 Position 1
2. `Get Your Full Deposit Back` 📌 Position 2
3. `Insured · DBS-Checked Team`
4. `Same-Day Slots Available`
5. `From £32/hr · Fixed Quote`
6. `Online Booking in 60 Seconds`
7. `Agency Checklists Followed`
8. `5% Off First Booking` *(if you ever re-add the promo)*
9. `Vetted London Cleaners`
10. `Book Today, Done Tomorrow`
11. `Pay After The Job · No Deposit`
12. `Trusted by 100+ Households` *(remove if not yet true)*
13. `No Hidden Fees`
14. `Eco-Friendly Products`
15. `Pay After the Job is Complete`

**Descriptions (4):**
1. `Move-out cleaning that meets every agency checklist. Fully insured, DBS-checked, fixed pricing — no surprises on the invoice.`
2. `Online booking in 60 seconds. £0 today — pay after the job is done. Same-day London availability.`
3. `Eco-friendly products, 2-hour minimum, fully equipped team. Free re-clean if your landlord disputes the standard.`
4. `Get the deposit back without the stress. Tenancy-ready clean, photo report, agency-grade finish. Book online today.`

### 6.2 Cleaning · Deep Clean

**Display path:** `/cleaning` and `/deep-clean`

**Headlines (15):**
1. `Deep House Cleaning London` 📌 Position 1
2. `Top-to-Bottom · Vetted Team` 📌 Position 2
3. `From £28/hr · No Hidden Fees`
4. `Same-Day Slots Available`
5. `Online Booking in 60 Seconds`
6. `Insured · DBS-Checked Cleaners`
7. `Eco-Friendly Products`
8. `Bathroom & Kitchen Specialists`
9. `Inside Oven & Fridge Add-ons`
10. `Fixed Quote · No Surprises`
11. `Pay After the Job is Done`
12. `Move-In Ready in 1 Visit`
13. `Spring Clean · Pre-Event Clean`
14. `2-Hour Minimum`
15. `Free Re-Clean Guarantee`

**Descriptions (4):**
1. `Top-to-bottom deep clean by London's most-vetted team. Eco-friendly products, fixed pricing, free re-clean guarantee.`
2. `Whether it's a spring refresh or a pre-event scrub, we go where regular cleans don't. Book online in 60 seconds.`
3. `Vetted, DBS-checked cleaners. £2M public liability insurance. £0 today — pay after the job is complete.`
4. `Specialists in bathroom limescale, oven grease, fridge interiors, behind-furniture dust. Add-ons available.`

### 6.3 Cleaning · Regular Cleaning

**Display path:** `/cleaning` and `/regular-clean`

**Headlines (15):**
1. `Regular Home Cleaning London` 📌 Position 1
2. `Same Trusted Cleaner Each Visit` 📌 Position 2
3. `From £22/hr · No Lock-In`
4. `Weekly · Fortnightly · Monthly`
5. `Vetted DBS-Checked Team`
6. `Eco-Friendly Products Included`
7. `Online Booking in 60 Seconds`
8. `Cancel Free Until Noon Day Before`
9. `Same-Day Slots Available`
10. `£2M Insured · Fully Vetted`
11. `Fixed Quote · No Hidden Fees`
12. `Pay After the Job is Complete`
13. `Save Time for What Matters`
14. `Background-Checked Cleaners`
15. `Trusted Across London`

**Descriptions (4):**
1. `Weekly or fortnightly cleaning by the same vetted, DBS-checked cleaner each visit. No contracts, cancel free until noon the day before.`
2. `Reclaim your weekends. Eco-friendly products included, fully insured team, fixed pricing — no nasty surprises.`
3. `Book online in 60 seconds. £0 today — your first slot is confirmed instantly, you pay after the job is done.`
4. `Same trusted cleaner every visit. Get to know your team, never explain the apartment twice. Background-checked, insured, friendly.`

### 6.4 Removals · Man & Van

**Display path:** `/removals` and `/man-and-van`

**Headlines (15):**
1. `Man & Van London — From £55/hr` 📌 Position 1
2. `Same-Day · Fully Insured` 📌 Position 2
3. `Online Booking in 60 Seconds`
4. `Single-Item to Full Flat`
5. `IKEA & Furniture Delivery`
6. `2 Movers · 3 Movers · Luton Van`
7. `£2M Public Liability Cover`
8. `DBS-Checked & Vetted Team`
9. `No Hidden Fees · Fixed Quote`
10. `Pay After the Job is Complete`
11. `7-Day Availability`
12. `Pickup & Dropoff Anywhere London`
13. `Packing Service Available`
14. `Dismantle & Reassemble`
15. `Trusted London Movers`

**Descriptions (4):**
1. `Reliable man-and-van service across London. From single-item delivery to full-flat moves — vetted team, insured van, fixed pricing.`
2. `Book online in 60 seconds. £0 today, pay after the move is done. No surprise fees.`
3. `Need IKEA or furniture delivered? Need a flat moved this weekend? We do both. Choose 1, 2, or 3 movers + a Luton van.`
4. `Add packing, dismantle/reassemble, or boxes & materials at booking. £2M public liability insurance covers your move.`

### 6.5 Removals · House & Flat

**Display path:** `/removals` and `/house-removals`

**Headlines (15):**
1. `House & Flat Removals London` 📌 Position 1
2. `Vetted Team · £2M Insured` 📌 Position 2
3. `Pickup + Dropoff Anywhere`
4. `From £85/hr · Fixed Quote`
5. `Online Booking in 60 Seconds`
6. `Same-Day Slots Available`
7. `Packing Service Available`
8. `Dismantle & Reassemble Included`
9. `2 or 3 Movers · Luton Van`
10. `7-Day Availability`
11. `Pay After Move is Complete`
12. `No Hidden Fees`
13. `DBS-Checked Movers`
14. `Trusted Across London`
15. `Stress-Free Moving Day`

**Descriptions (4):**
1. `Full house and flat removals across London. Vetted team, insured Luton van, packing add-on, dismantle service. Fixed pricing.`
2. `Book online in 60 seconds. Tell us pickup, dropoff, floors, lifts — we quote up front. £0 today, pay after the move.`
3. `Stress-free moving day with a vetted, DBS-checked team. £2M liability cover. No hidden fees, no time-watch on the day.`
4. `Need to move this weekend? Same-day London slots available. We pack, dismantle, drive, reassemble — you just open the new door.`

### 6.6 Handyman · General

**Display path:** `/handyman` and `/repairs`

**Headlines (15):**
1. `Local Handyman London` 📌 Position 1
2. `From £65 First Hour` 📌 Position 2
3. `Vetted · DBS-Checked Team`
4. `Online Booking in 60 Seconds`
5. `Same-Day Slots Available`
6. `Repairs · Mounting · Assembly`
7. `Plumbing · Electrics · Painting`
8. `Insured · No Hidden Fees`
9. `Pay After the Job is Complete`
10. `7-Day Availability`
11. `1-Hour Minimum Booking`
12. `Half-Day & Full-Day Rates`
13. `Property Maintenance`
14. `Trusted Across London`
15. `Friendly · Reliable · Punctual`

**Descriptions (4):**
1. `Local London handyman for repairs, assembly, mounting, painting, small plumbing and electrical jobs. Vetted, insured team.`
2. `From a leaking tap to a full day of odd jobs. £65 first hour, £50/hr after. Half-day £215, full day £395 — pay after.`
3. `Book online in 60 seconds. £0 today, pay after the job is complete. No surprise charges.`
4. `DBS-checked, fully insured handymen. Same-day slots, friendly punctual team, every tool on the van. Trusted across London.`

### 6.7 Handyman · Specific Tasks

**Display path:** `/handyman` and `/assembly`

**Headlines (15):**
1. `Furniture Assembly London` 📌 Position 1
2. `IKEA · TV · Shelves · Flatpack` 📌 Position 2
3. `From £65 First Hour`
4. `Online Booking in 60 Seconds`
5. `Same-Day Availability`
6. `Vetted · Insured Team`
7. `TV Wall Mounting Specialists`
8. `Picture & Mirror Hanging`
9. `Curtain Pole Installation`
10. `Pay After the Job is Done`
11. `1-Hour Minimum`
12. `No Hidden Fees`
13. `7-Day Service`
14. `London-Wide Coverage`
15. `Friendly · Tidy · On-Time`

**Descriptions (4):**
1. `IKEA flatpacks, TV wall mounting, shelves, mirrors, curtain poles. Vetted London team, every tool included, online booking.`
2. `Book online in 60 seconds. £65 first hour, £50/hr after. £0 today — pay only when the job is done.`
3. `Same-day London availability. DBS-checked, insured handyman, tidy work. Pictures hung, shelves up, TV mounted, no fuss.`
4. `From a single Billy bookcase to a full living room of flatpacks. Half-day and full-day rates available. Pay after.`

---

## 7. EXTENSIONS (apply to all 3 campaigns)

### 7.1 Sitelinks (4)

| Title | Description line 1 | Description line 2 | Final URL |
|---|---|---|---|
| Get an instant quote | 60-second online booking | £0 today, pay after the job | https://hausio.co.uk/book.html |
| All London services | Cleaning · Removals · Handyman | One vetted London team | https://hausio.co.uk/#services |
| Pricing | Flat hourly rates | No hidden fees | https://hausio.co.uk/#pricing |
| FAQ | Insured · DBS-checked | Pay after the job | https://hausio.co.uk/#faq |

### 7.2 Callouts (8)

```
£2M Public Liability
DBS-Checked Team
Same-Day Slots
Online Booking in 60 Seconds
Pay After the Job
Eco-Friendly Products
Free Cancellation Until Noon Day Before
7-Day Availability
```

### 7.3 Structured Snippets

**Header:** Services
**Values:** End-of-Tenancy Cleaning, Deep Clean, Regular Cleaning, Man & Van, House Removals, Furniture Assembly, TV Mounting, Property Repairs

### 7.4 Call extension

`+44 7304 330 614`
- **Schedule:** Mon-Sun 08:00–22:00
- **Country:** United Kingdom

### 7.5 Location extension

Link your **Google Business Profile** (after verification) — Google will pull address + map automatically.

### 7.6 Lead form extension (optional, fastest CR for mobile)

If you want quote requests directly from the ad without site visit:
- **Headline:** Get an instant quote in 60 seconds
- **Description:** Vetted London team. Insured. Same-day slots.
- **Questions:** Service type, Postcode, Phone, Email, Preferred date
- **Submission message:** Thanks — we'll WhatsApp you a fixed quote within 15 minutes.

---

## 8. STEP-BY-STEP IMPORT (manual route, 30-40 minutes)

If you don't want to use Editor (skip Sec. 9), do this in `ads.google.com` UI:

### 8.1 Create Conversion Action (do first — see §1.2)

### 8.2 Create Cleaning campaign
1. **Campaigns → New campaign → Goal: Leads → Type: Search**
2. Paste **§2.1 settings** as you see the form fields
3. Skip "Suggested keywords" — we paste our own
4. Create the 3 ad groups one by one with keywords from §2.2/2.3/2.4
5. For each ad group, create 1 RSA from §6 (you can add 2 more later)

### 8.3 Repeat for Removals (§3) and Handyman (§4)

### 8.4 Create shared negative list (§5)
**Tools → Shared library → Negative keyword lists → +Create list** → paste all negatives → Save → **Apply to** all 3 campaigns.

### 8.5 Add extensions (§7) at account level
**Ads & assets → Assets → +** for each type. Account-level extensions auto-apply to all campaigns.

### 8.6 Pause initially, review, then enable
Set all 3 campaigns to **Paused** while you review. Once everything looks right, **Enable** one at a time (start with Cleaning first to verify conversion tracking before scaling).

---

## 9. FAST IMPORT VIA GOOGLE ADS EDITOR (recommended, 10 minutes)

1. Download Google Ads Editor: ads.google.com/intl/en/home/tools/ads-editor/ (free, Mac + Windows)
2. **File → Sign in** with your Google Ads account
3. Wait for download to complete (1-2 min for empty account)
4. **File → Import → From file** → select [google_ads_bulk_import.csv](Hausio/ads_launch/google_ads_bulk_import.csv) *(I'll generate this next)*
5. Review the proposed changes panel — should see 3 campaigns, 7 ad groups, ~70 keywords, 7 RSAs
6. **Post → Post selected changes**
7. Switch to web UI to enable.

---

## 10. POST-LAUNCH OPS (first 30 days)

### Week 1 (£200 spend, ~120 clicks expected)
- **Daily:** Search terms report → add new negatives, raise/lower bids on poor performers
- **Day 7:** Pause keywords with 0 conversions and >£20 spent
- Verify all 3 conversion events firing on `/book.html` step 4 confirm

### Week 2 (£200, learning)
- Test 2nd RSA per ad group (different angle: scarcity vs trust vs price)
- Add ad-level location extension once GBP verified
- A/B headline pin position changes

### Week 3-4 (£600 remaining)
- If a campaign hits 30+ conversions: switch to **Maximize conversions** (no target CPA yet)
- If a campaign is starving: pause weakest ad group, redistribute to top performer
- If LSA verification clears: open £50/wk LSA test for cleaning category

### Day 30 review
- Total conversions, CPL per service, ROAS
- Decide: scale winners +50%, kill losers, expand to PMax (if ≥30 conv), open Meta retargeting

---

## 11. EXPECTED RESULTS (realistic scenario)

| Metric | Cleaning | Removals | Handyman | Total |
|---|---|---|---|---|
| Spend | £500 | £300 | £200 | £1,000 |
| Avg CPC | £1.20 | £1.40 | £1.10 | — |
| Clicks | 416 | 214 | 181 | 811 |
| CTR | 5% | 4% | 4.5% | — |
| Conversions (CR ~6%) | 25 | 8 | 11 | 44 |
| CPL | £20 | £37.50 | £18 | £22.7 |
| Avg order value | £130 | £350 | £150 | — |
| **Revenue (first month)** | **£3,250** | **£2,800** | **£1,650** | **£7,700** |
| ROAS Phase 1 | 6.5x | 9.3x | 8.2x | **7.7x** |

---

## 12. WHAT I NEED FROM YOU NEXT

1. **Google Ads account ID** (`123-456-7890`)
2. **Conversion action `AW-XXXXXXXXXX` + label** (after creating it per §1.2)
3. Confirm whether to use **Lead form extension** (§7.6) — increases mobile CR but bypasses site (no Stripe deposit on those leads)
4. Pick **import method**: manual (§8) or Editor CSV (§9)?

I'll generate the Editor CSV in the next file ([google_ads_bulk_import.csv](Hausio/ads_launch/google_ads_bulk_import.csv)) so you can pick whichever flow.
