# Hausio Review-Generation Engine

**Goal:** 25 Google reviews + 15 Trustpilot reviews in the first 90 days. Maintain 18-day cadence (Sterling Sky rule) thereafter.

**Why this matters:**
- 18-day rule: if Google sees no new reviews for 3 weeks, local-pack ranking drops sharply
- Magic threshold: 10+ reviews to start affecting ranking (Sterling Sky)
- 31% of UK consumers only consider businesses with 4.5+ stars (BrightLocal 2026)
- Trustpilot star snippets appear in UK SERPs — every review compounds branded-search CTR

---

## Channel mix (per customer)

| Channel | When sent | Vehicle | Why |
|---------|-----------|---------|-----|
| **SMS** | 2 hours after job complete | Twilio (or manual via WhatsApp) | Highest open rate (98%), captures emotion at peak |
| **Email** | 24 hours after job complete | Netlify Forms email or transactional service | Permanent record, can be re-found |
| **In-person card** | Hand-delivered by cleaner | Printed business card with QR | Tactile prompt — best for first-time customers |

Use ALL THREE for first 30 customers (build review velocity). After that, drop in-person card and rotate SMS/email by customer preference at booking.

---

## SMS template (2 hours post-job)

```
Hi {first_name}, this is Hausio — thanks for booking us today!

If we did a great job, would you mind leaving a 30-second Google review?

→ {google_review_link}

Means a lot for a small London team like ours.

— Serhii at Hausio
```

160-char hard limit not exceeded. No question gating.

---

## Email template (24 hours post-job)

**Subject:** `How did we do, {first_name}?`

```
Hi {first_name},

Thank you for choosing Hausio for your {service} this {weekday}. We hope everything went smoothly.

If we made your day easier, we'd be hugely grateful for a quick review on Google — it helps other Londoners find us:

→ {google_review_link}

If you'd prefer to leave a Trustpilot review, that link is here:
→ {trustpilot_review_link}

If anything wasn't quite right, please reply to this email first — we'd much rather fix it than read about it. Direct line: +44 7304 330 614.

Warmly,
Serhii at Hausio
hausio.co.uk
```

Both review links presented. Some customers strongly prefer one platform — never force.

---

## In-person card (printed)

Front:
```
HAUSIO

How was today?

[QR code → google_review_link]

Scan to leave a 30-second Google review.

hausio.co.uk · +44 7304 330 614
```

Back:
```
Or visit:
g.page/r/hausio-london   (Google)
trustpilot.com/review/hausio.co.uk
```

Cleaner / handyman / removal lead hands one card at end of job, with thanks. Cost: ~£0.05 per card (Vistaprint, 500 cards £25).

---

## Hard rules — DO NOT BREAK

1. **No review gating.** Never ask "are you happy?" before sending the link. Google's fake-engagement policy bans this. UK ASA has fined for it. FTC fines start at $50,120/violation.
2. **No incentives for reviews.** No discounts, no coupons, no entries-into-draws in exchange for a review. Both Google and FTC prohibit (you can incentivise *feedback*, but not reviews).
3. **Send to every customer**, not just the ones you assume liked the service. Selection bias inflates rating but Google's anomaly detection notices and suppresses listings that show this pattern.
4. **No bulk sending in batches.** A burst of 20 reviews in 24 hours triggers Google review-velocity flags. Real-time send-on-job-complete creates a natural distribution.
5. **Owner response within 24 hours**, on every review, positive or negative. 88% of consumers prefer businesses that respond (BrightLocal 2026).

---

## Owner response templates

### 5-star review
```
Thank you so much, {first_name} — really appreciated. The team will be thrilled to hear this. Looking forward to your next clean / move / fix-up.
— Serhii, Hausio
```

### 4-star review (specific concern mentioned)
```
Thanks for the kind review, {first_name}, and for flagging {specific_issue}. We'll factor this into our pre-job briefing for next time. If anything still needs sorting on this booking, please drop me a line at hello@hausio.co.uk and we'll make it right.
— Serhii, Hausio
```

### 3-star or below
```
{first_name}, thank you for the honest feedback — and I'm sorry the experience didn't match what we promise. I'd really like to understand what went wrong and put it right. Could you reply here or drop me an email at hello@hausio.co.uk so we can talk?
— Serhii, Hausio
```

Never argue. Never explain why the customer was wrong. Move the conversation private. Earn the chance to fix it.

---

## Tooling — pragmatic stack

### Phase 1 — Manual (first 30 customers)
- After every job, the cleaner / lead WhatsApps the office: "Job done, customer is {first_name}, phone {phone}, email {email}."
- Office (you or VA) sends SMS via WhatsApp Business OR by hand from your phone (set up text-replacement shortcuts).
- 24h later, manual email send.

**Cost:** £0
**Effort:** ~3 minutes per customer

### Phase 2 — Semi-automated (30+ customers)
- Trustpilot's free **Automatic Feedback Service (AFS)** — once you have a Trustpilot business account, you can BCC `your-id@invitations.trustpilot.com` on every booking confirmation email. Trustpilot then sends the review invite automatically.
- For Google: use Google's free **Review Link Generator** in your GBP dashboard — gives you `g.page/r/{place-id}/review` short URL. Embed in confirmation email template (Netlify Forms email setting).

**Cost:** £0 (Trustpilot Free tier: 100 invites/month)
**Effort:** ~1 minute per customer (just BCC)

### Phase 3 — Fully automated (100+ customers/month)
- Twilio for SMS (£0.04/SMS in UK)
- Netlify Function listens for Stripe webhook `payment_intent.succeeded` → schedules:
  - Twilio SMS at +2h
  - Email at +24h via SendGrid / Resend / Mailgun (free tiers cover 100/day)
- Total cost: ~£20-40/month for 1,000 customers

Skip Phase 3 until your monthly volume needs it.

---

## Generating the review links

### Google review link (need GBP first)
1. Sign in to business.google.com
2. Manage location → Get more reviews → Share review form
3. Copy the URL — looks like `https://g.page/r/CXXXXXXXXX/review`
4. Use it as-is or shorten with bit.ly for SMS character limit

### Trustpilot review link (after claiming profile)
1. business.trustpilot.com → Reviews → Get review link
2. Copy the URL — looks like `https://uk.trustpilot.com/evaluate/hausio.co.uk`
3. Use it as-is in email; for SMS shorten with bit.ly

---

## Measurement

Track weekly in `seo/reviews/REVIEW_TRACKER.csv` (next file):
- Customers served
- Review invites sent (SMS / email / card)
- Google reviews added
- Trustpilot reviews added
- Average rating
- Days since last review (must stay <18 — Sterling Sky rule)

Monthly KPIs:
- New Google reviews target: 8+/month
- New Trustpilot reviews target: 5+/month
- Owner response rate: 100% within 24 hours
- Average rating: maintain 4.5+ across both platforms

---

## Booking-flow integration (already-deployed code)

In `book.html` step 4 (success state) and in the post-Stripe redirect, surface a soft "Tell us how we did" link. **Do not show review prompt before service is delivered** — only after job-complete touchpoint, which lives outside the booking flow (Phase 1 = manual, Phase 2 = email BCC).

Snippet to add to the post-payment success message in `book.html` (only after Trustpilot account is live):

```html
<p class="success-followup">
  When the job's done, we'll send you a quick note — if it went well,
  a 30-second Google or Trustpilot review helps another Londoner find us.
</p>
```

This sets expectation up-front so the post-job ask isn't a surprise.

---

*The 18-day rule is the only metric that really matters. Velocity > Volume. One review every 5 days for a year > 73 reviews in one launch week then nothing.*
