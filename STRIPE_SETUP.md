# Stripe £50 Deposit — Setup Checklist

Everything is in place on this branch. Once you have Stripe credentials, paste them in the four spots below and you are live.

---

## 1. Open the Stripe account (you do this once)

1. Go to https://dashboard.stripe.com/register and sign up with the Hausio business email.
2. Country: **United Kingdom**.
3. Activate the account: business type, Companies House number (or UTR if sole trader), VAT number if registered, director ID, business bank account for payouts.
4. While KYC is pending, the test mode already works — you can ship the test integration today.

## 2. Enable payment methods

In Stripe Dashboard → **Settings → Payment methods**:
- Card (already on by default)
- Apple Pay
- Google Pay
- Link (optional, faster checkout)

## 3. Apple Pay domain verification (one-off)

In **Settings → Payment methods → Apple Pay → Add a new domain**:
1. Enter `hausio.co.uk`.
2. Stripe shows a domain association file. Download it.
3. Save it as `.well-known/apple-developer-merchantid-domain-association` in this repo.
4. Commit and deploy. Stripe will auto-verify. Apple Pay then renders on the live site.

## 4. Get the API keys

In **Developers → API keys**:
- Copy the **Publishable key** (`pk_test_...` for test, `pk_live_...` for live).
- Copy the **Secret key** (`sk_test_...` / `sk_live_...`). The secret key never leaves Netlify env vars.

## 5. Add the webhook (after you have the live URL)

In **Developers → Webhooks → Add endpoint**:
- URL: `https://hausio.co.uk/api/stripe-webhook`
- Events to listen to: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- Copy the **Signing secret** that Stripe gives you (`whsec_...`).

## 6. Paste the keys

### A. Publishable key (frontend)

Edit `js/booking.js` near the top:

```js
const STRIPE_PUBLISHABLE_KEY_TEST = 'pk_test_REPLACE_ME'; // ← paste the test key
const STRIPE_PUBLISHABLE_KEY_LIVE = 'pk_live_REPLACE_ME'; // ← paste the live key
```

The script auto-picks the live key on `hausio.co.uk` and the test key everywhere else (Netlify previews, `localhost`).

### B. Secret key + webhook secret (Netlify env vars)

In Netlify dashboard → **Site settings → Environment variables → Add variable**:

| Key | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` (and later `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

Save → trigger a redeploy.

## 7. Test before going live

With test keys plugged in, complete a test booking on `book.html` and pay with one of these cards:

| Card number | Outcome |
|---|---|
| `4242 4242 4242 4242` | Success (no 3DS) |
| `4000 0027 6000 3184` | Success after 3DS challenge |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0000 0000 0341` | Attaches but fails when charged |

CVC: any 3 digits. Expiry: any future date. Postcode: any.

Open Stripe Dashboard → **Payments** to confirm the £50.00 deposit lands.

## 8. Switch to live

Once KYC is approved and Apple Pay domain is verified:
1. Replace `pk_test_...` and `sk_test_...` with the live versions in step 6.
2. Update the webhook to listen on the live mode in Stripe Dashboard.
3. Push and redeploy.

## 9. Where things live

| File | Purpose |
|---|---|
| `netlify/functions/create-payment-intent.js` | Server function that creates the £50 PaymentIntent. |
| `netlify/functions/stripe-webhook.js` | Server function that listens to Stripe events. |
| `js/booking.js` | Initialises Stripe Elements on step 4 and confirms the payment before submitting the form. |
| `book.html` | Has the `#payment-element` mount point and the new "Pay £50 deposit & confirm" button. |
| `privacy.html` | Updated T&C with the deposit policy. |
| `index.html` | Pricing note mentions the deposit. |
| `netlify.toml` | Netlify build + functions config. |
| `package.json` | Pulls in the `stripe` SDK for the function. |

## 10. Refund flow (manual for now)

You refund a deposit from Stripe Dashboard → **Payments** → click the booking → **Refund**. Pick full or partial (£25 for same-day cancellations). The webhook logs `charge.refunded`; we can wire that into an automated email later.
