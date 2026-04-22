# Hausio — Google Search Campaign Build
## London · Cleaning only · Launch budget £500–700/month

**Version:** 1.0 · **Date:** 2026-04-22
**Goal:** first 20 bookings to seed conversion data for tCPA / LSA expansion.

---

## 1 · Campaign-level settings

| Setting | Value |
|---|---|
| Campaign name | `HSO_UK_LDN_Search_Cleaning` |
| Goal | Leads |
| Campaign type | Search |
| Networks | Search only — **uncheck** "Include Google search partners", **uncheck** "Include Google Display Network" |
| Locations | **Greater London** + **20 miles radius of London, England** *(people in or regularly in — NOT "showed interest in")* |
| Excluded locations | UK outside Greater London and commuter belt |
| Languages | English |
| Audience segments | Observation only at launch (no targeting) |
| Daily budget | £20 (monthly cap £600) |
| Bidding | **Manual CPC with enhanced CPC = OFF** first 14 days → switch to **Maximize Conversions with tCPA £40** after 15 conversions |
| Start date | Once conversion tracking verified |
| Ad schedule | Mon–Sun 07:00–22:00 (home) — no change at launch, adjust after 2 weeks of data |
| Ad rotation | Optimize: prefer best-performing |
| Location options | People in or regularly in targeted locations |
| Conversion goal | Only `Booking_Submitted` (Primary) + `Phone_Call` (Primary). All others Secondary |

---

## 2 · Ad groups & keywords

### Ad group 1 — `AG_EndOfTenancy`
Max CPC: **£3.50** · Theme: end-of-tenancy / checkout cleaning (highest ticket £120–250/job)

**Keywords (paste into Google Ads editor, one per line):**

```
"end of tenancy cleaning london"
[end of tenancy cleaning london]
"end of tenancy cleaner"
[end of tenancy cleaner london]
"end of tenancy clean london"
"move out cleaning london"
"move out cleaner london"
"checkout cleaning london"
"tenancy clean london"
"eot cleaning london"
"end of lease cleaning london"
"end of tenancy cleaning near me"
"end of tenancy cleaning service"
```

### Ad group 2 — `AG_DeepClean`
Max CPC: **£2.80** · Theme: deep clean / one-off / after-builders

```
"deep cleaning london"
[deep cleaning london]
"deep clean service london"
"deep cleaner london"
"deep house cleaning london"
"one off cleaning london"
[one off cleaning london]
"one-off cleaner london"
"spring cleaning london"
"after builders cleaning london"
"post construction cleaning london"
"deep clean flat london"
"deep clean apartment london"
```

### Ad group 3 — `AG_RegularCleaner`
Max CPC: **£2.20** · Theme: ongoing weekly/fortnightly cleaning (high LTV)

```
"cleaner london"
[cleaner london]
"house cleaner london"
[house cleaner london]
"home cleaner london"
"domestic cleaner london"
"professional cleaner london"
"weekly cleaner london"
"fortnightly cleaner london"
"regular cleaner london"
"house cleaning service london"
"home cleaning service london"
"cleaning company london"
"cleaner near me"
```

> **Match type discipline:** start with phrase `"..."` and exact `[...]` only. **Do NOT use broad match at launch** — broad burns budget on "cleaning jobs", "cleaning tips", etc. even with negatives. Open broad only after 30 days of clean data.

---

## 3 · Campaign-level negative keyword list `NEG_Cleaning_Core`

Paste as a **shared negative list**, apply to this campaign and all future cleaning campaigns.

```
# Supply-side (job seekers)
+cleaner +jobs
+cleaning +jobs
vacancy
vacancies
hiring
recruitment
recruit
salary
wage
pay rate
how much do cleaners earn
cleaner wanted

# Informational / DIY
diy
tutorial
how to
tips
guide
video
youtube
"what is"
"why should"
checklist

# Wrong service
dry clean
dry cleaning
dry cleaner
laundromat
launderette
carpet cleaning
carpet cleaner
upholstery
oven cleaning only
oven cleaner only
window cleaning only
window cleaner only
gutter cleaning
gutter cleaner
pressure washing
pressure washer
jet wash
pool cleaning
pool cleaner
drain cleaning
drain unblock
chimney sweep
steam cleaning
steam cleaner

# B2B / out of scope
commercial
office cleaning
industrial
hotel cleaning
warehouse
school cleaning
restaurant cleaning
retail cleaning

# Wrong geography (belt & braces — location targeting already restricts)
manchester
birmingham
glasgow
edinburgh
liverpool
leeds

# Low intent / price hunters (optional — remove after 2 weeks if CVR acceptable)
free
cheapest
voucher
coupon

# Business-for-sale
for sale
franchise
company for sale
business for sale

# Students / unpaid
student discount
student

# Brand protection — your competitors (add after launch)
fantastic services
housekeep
taskrabbit
molly maid
merry maids
time for you
maidforyou
```

---

## 4 · Responsive Search Ads (RSAs)

Google wants **up to 15 headlines + 4 descriptions** per ad. **Pin 2 headlines to position 1** (brand + promise) and **2 to position 2** (service + location). Leave the rest unpinned.

### RSA for `AG_EndOfTenancy`

**Final URL:** `https://hausio.co.uk/book.html?service=cleaning` *(change to `/end-of-tenancy-cleaning` once that landing page is built)*

**Display path:** `hausio.co.uk` / `End-of-Tenancy` / `London`

**Headlines (15):**
| # | Headline | Pin |
|---|---|---|
| 1 | Hausio End-of-Tenancy Clean | **H1** |
| 2 | Get Your Deposit Back — Guaranteed Clean | **H1** |
| 3 | End-of-Tenancy Cleaning London | **H2** |
| 4 | London's Trusted Cleaners | **H2** |
| 5 | From £32/hr · Fully Insured |  |
| 6 | Same-Day & Next-Day Slots |  |
| 7 | DBS-Checked & £2M Insured |  |
| 8 | Book Online in 60 Seconds |  |
| 9 | Move-Out Cleaning · All London |  |
| 10 | Pay After the Job is Done |  |
| 11 | Deep Clean · Every Room |  |
| 12 | Eco-Friendly Products Included |  |
| 13 | No Hidden Fees. No Deposits. |  |
| 14 | 5% Off Your First Booking |  |
| 15 | Deposit-Back Cleaning Checklist |  |

**Descriptions (4):**
1. Vetted end-of-tenancy cleaners across London. DBS-checked team, £2M insurance, eco-friendly products. Book online in 60 seconds.
2. Get your deposit back. Our move-out clean covers kitchen, oven, bathroom, windows, all rooms. From £32/hr. Same-day available.
3. Trusted by London landlords & tenants. Pay after the job, no hidden fees. Instant quote, DBS-checked team, fully insured.
4. Fast, thorough, honest. End-of-tenancy cleaning from £32/hr across all London postcodes. Book now — confirmation in seconds.

### RSA for `AG_DeepClean`

**Final URL:** `https://hausio.co.uk/book.html?service=cleaning`

**Headlines (15):**
1. Hausio Deep Clean · London *(pin H1)*
2. Your Home, Truly Spotless *(pin H1)*
3. Deep Cleaning London *(pin H2)*
4. One-Off & Spring Cleans *(pin H2)*
5. From £28/hr · Eco-Friendly
6. DBS-Checked · Fully Insured
7. Book in 60 Seconds Online
8. After-Builders Clean Specialists
9. Same-Day & Weekend Slots
10. No Hidden Fees — Pay After
11. 5% Off Your First Deep Clean
12. Top-to-Bottom · Every Room
13. Trusted London Cleaners
14. Vetted Professionals Only
15. Instant Quote — Book Today

**Descriptions (4):**
1. A deep clean that actually feels deep. Vetted London cleaners, eco-friendly products, £2M insurance. From £28/hr.
2. One-off, spring, post-builders or pre-party — book a Hausio deep clean in 60 seconds. Same-day slots available.
3. Every corner, every surface, every detail. DBS-checked team, honest pricing, no hidden fees. Pay after the job.
4. London's trusted deep-cleaning service. Book online, get instant quote, pay only when the work's done.

### RSA for `AG_RegularCleaner`

**Final URL:** `https://hausio.co.uk/book.html?service=cleaning`

**Headlines (15):**
1. Hausio Home Cleaning · London *(pin H1)*
2. A Cleaner You Can Trust *(pin H1)*
3. Weekly Cleaner London *(pin H2)*
4. Fortnightly Home Cleaning *(pin H2)*
5. From £22/hr · No Contracts
6. DBS-Checked · £2M Insured
7. Same Cleaner Every Visit
8. Eco-Friendly Products Free
9. Book Online in 60 Seconds
10. 5% Off Your First Clean
11. Cancel Anytime · No Tie-Ins
12. Pay After the Job — Always
13. Vetted London Cleaners
14. Loved by 1,000+ London Homes
15. Trusted · Insured · Reliable

**Descriptions (4):**
1. Regular cleaners for London homes — weekly or fortnightly, same person each visit. From £22/hr. No contracts, cancel anytime.
2. DBS-checked, English-speaking, fully insured cleaners. Eco-friendly products included. Book in 60 seconds.
3. The same trusted cleaner every week. Pay only after the job. No hidden fees, no tie-ins, no deposits.
4. Book a Hausio cleaner today. 5% off your first clean. London coverage, same-day slots available.

---

## 5 · Campaign assets (ad extensions)

### 5.1 Sitelinks (6, campaign-level)

| Link text | Description line 1 | Description line 2 | Final URL |
|---|---|---|---|
| End-of-Tenancy Clean | From £32/hr, deposit-back guarantee | Same-day London slots | `https://hausio.co.uk/book.html?service=cleaning` |
| Deep Clean | From £28/hr, top-to-bottom | One-off or spring cleans | `https://hausio.co.uk/book.html?service=cleaning` |
| Regular Cleaner | From £22/hr, weekly or fortnightly | Same cleaner every visit | `https://hausio.co.uk/book.html?service=cleaning` |
| Instant Quote | See your price in 60 seconds | No phone call needed | `https://hausio.co.uk/book.html` |
| How It Works | 3 simple steps · book online | Pay after the job is done | `https://hausio.co.uk/#how` |
| Why Hausio | DBS-checked · Fully insured | £2M public liability cover | `https://hausio.co.uk/#why` |

### 5.2 Callouts (10)

```
DBS-checked cleaners
£2M public liability cover
Eco-friendly products included
Same-day slots available
Book online in 60 seconds
No hidden fees
Pay after the job
5% off your first booking
Cancel anytime — no tie-ins
Trusted London home services
```

### 5.3 Structured snippets

- **Header: Services**
  - Regular cleaning
  - Deep clean
  - End of tenancy
  - One-off cleaning
  - After-builders clean
  - Spring cleaning

### 5.4 Call asset

- **Phone:** +44 7304 330 614
- **Conversion action:** `Phone_Call` (call length ≥ 60s) — set up as primary conversion
- **Show:** all eligible devices, all schedule hours

### 5.5 Price asset

| Type | Header | Description | Price | URL |
|---|---|---|---|---|
| Services | Regular clean | Weekly/fortnightly | From £22/hr | `book.html?service=cleaning` |
| Services | Deep clean | One-off thorough clean | From £28/hr | `book.html?service=cleaning` |
| Services | End of tenancy | Deposit-back guarantee | From £32/hr | `book.html?service=cleaning` |

### 5.6 Promotion asset

- **Occasion:** None (evergreen launch offer)
- **Promo:** 5% off
- **Item:** First booking
- **Final URL:** `https://hausio.co.uk/book.html?service=cleaning`
- **Promotion code:** none (auto-apply via quote-badge)

### 5.7 Location asset

Requires **Google Business Profile**. Action: create GBP as "Hausio" service-area business, verify by postcard. Once verified, link in Google Ads → Assets → Locations.

---

## 6 · Conversion tracking (Google Ads ↔ GTM)

### 6.1 In Google Ads

1. **Tools → Conversions → New conversion action → Website**
2. **Category:** Submit lead form
3. **Name:** `Booking_Submitted`
4. **Value:** "Use different values for each conversion" → *(dataLayer variable — we'll pass this)*
5. **Count:** One
6. **Click-through conversion window:** 30 days
7. **View-through conversion window:** 1 day
8. **Attribution:** Data-driven
9. **Include in "Conversions":** Yes (primary)
10. **Save → "Use Google Tag Manager"** → copy **Conversion ID** (format `AW-XXXXXXXXXX`) and **Conversion Label**

Create a second conversion action:
- **Name:** `Phone_Call` · **Category:** Phone calls · **Source:** Calls from ads
- Count: One · Call length ≥ 60s · Primary

### 6.2 In GTM (container `GTM-5RN3TRV4`)

1. **Variables → New → Data Layer Variable**
   - Name: `DLV - value`
   - Data layer variable name: `value`
   - Default: `0`
2. **Variables → New → Data Layer Variable**
   - Name: `DLV - currency`
   - Data layer variable name: `currency`
   - Default: `GBP`
3. **Variables → New → Data Layer Variable**
   - Name: `DLV - service`
   - Data layer variable name: `service`
4. **Triggers → New → Custom Event**
   - Name: `CE - generate_lead`
   - Event name: `generate_lead`
   - Fires on: All Custom Events
5. **Tags → New → Google Ads Conversion Tracking**
   - Name: `GAds - Booking_Submitted`
   - Conversion ID: `AW-XXXXXXXXXX` *(from step 6.1 above)*
   - Conversion Label: *(from step 6.1 above)*
   - Conversion Value: `{{DLV - value}}`
   - Currency code: `{{DLV - currency}}`
   - Order ID: *(leave blank)*
   - Trigger: `CE - generate_lead`
6. **Submit → Publish** (version name "Google Ads conversion wired up")
7. **Verify** via Google Ads → Conversions → your action → "Recent activity" within 24h. Also Tag Assistant / Preview Mode should show the tag fire on booking submit.

> Our [booking.js](js/booking.js) already pushes `{event: "generate_lead", service, value, currency}` to `dataLayer` on successful submit — no code changes needed on the site side.

### 6.3 Link Google Ads ↔ GA4

In **GA4 Admin → Product Links → Google Ads Links**: link the Ads account. Then in GA4 → Admin → Events, mark `generate_lead` as conversion (already done if memory is accurate). Enable **Auto-tagging** in Google Ads settings (on by default).

---

## 7 · First 30 days — operating checklist

| Day | Task |
|---|---|
| 1 | Create GBP profile · submit LSA application · set up Google Ads conversions |
| 2 | Import campaign (sections 1–5 above) · **paused** |
| 3 | Publish GTM container with Ads conversion tag · test via Preview Mode |
| 4 | Submit real test booking → verify conversion shows in Google Ads within 3 hours |
| 5 | **Enable campaign** — Manual CPC, max CPCs per section 2 |
| 7 | Pull Search Terms report → add negatives → check Quality Score (aim ≥ 6) |
| 10 | Second Search Terms sweep — kill any ad group <5 clicks / 2% CTR |
| 14 | Review: bookings, CPL, QS. If <5 conversions, tighten keywords. If 5–15, stay on MCPC |
| 15–30 | If 15+ conversions — switch bidding to **Maximize Conversions with tCPA £40** |
| 30 | Review ad-level performance · kill lowest 30% headlines · refresh creative · decide on Handyman launch |

---

## 8 · Red-flag metrics (stop/fix triggers)

| Metric | Red-line | Action |
|---|---|---|
| Search Impr. share < 40% | rank issue | Raise bids on AGs with QS ≥ 7 |
| Quality Score < 5 | landing page / ad relevance | Build service-specific landing page; tighten ad groups |
| CTR < 3% on exact match | ad copy weak | Test new RSA headlines, refresh offer |
| Conv. rate < 3% | landing page / offer | Rebuild form flow, test stronger CTA |
| CPL > £60 | unit economics | Pause worst AG, tighten keywords, exclude low-intent queries |
| Bounce rate > 70% | geo / intent mismatch | Check Search Terms → negatives |

---

## 9 · Out of scope (Phase 2 — do NOT build at launch)

- Performance Max — wait for 30+ conv/month
- Display Remarketing — wait for 500+ unique visitors
- Discovery / Demand Gen — wait until brand search > 20/mo
- YouTube TrueView — brand awareness, later stage
- Shopping — N/A (service business)
- Meta Ads — Phase 2 retargeting only, wait for pool
- Removals & Handyman Search — only after Cleaning unit economics proven

---

## 10 · Budget forecast (month 1, realistic range)

| Line | Low | Mid | High |
|---|---|---|---|
| Impressions | 18,000 | 30,000 | 45,000 |
| Clicks (CTR 3.5–5%) | 630 | 1,200 | 2,000 |
| Avg CPC | £3.20 | £2.20 | £1.70 |
| **Spend** | **£600** | **£600** | **£600** |
| Conversion rate | 3% | 5% | 7% |
| Leads (form submits) | 19 | 60 | 140 |
| Close rate | 30% | 40% | 50% |
| **Bookings** | **6** | **24** | **70** |
| Avg first-job value | £90 | £110 | £140 |
| **Revenue (job 1)** | **£540** | **£2,640** | **£9,800** |
| Repeat probability (6m) | 30% | 45% | 60% |
| **6-month LTV / customer** | £180 | £360 | £620 |

Mid-case = **CPL £10, CAC £25, 6-month LTV £360** → payback inside 1 booking.

---

*Document prepared for Hausio Ltd launch. Review monthly, update as data accumulates.*
