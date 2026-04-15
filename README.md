# Hausio — London Home Services Website

Static marketing site + multi-step online booking for **Hausio**, a London home services company (cleaning, removals, handyman, gardening).

## Files

```
Hausio/
├── index.html          Landing page
├── book.html           Multi-step booking flow with live price calculator
├── css/style.css       All styling (desktop + mobile)
├── js/main.js          Shared: nav, smooth-scroll, footer year
├── js/booking.js       Booking flow logic + pricing engine
└── assets/             (drop logo PNGs here if/when desired)
```

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve Hausio
# or
python -m http.server -d Hausio 8000
```

## Deploy (free)

- **Netlify** — drag-and-drop the `Hausio/` folder at [app.netlify.com/drop](https://app.netlify.com/drop)
- **Vercel** — `npx vercel` inside `Hausio/`
- **GitHub Pages** — push to a repo, enable Pages on `main`
- **Cloudflare Pages** — connect repo, no build command needed

## To customise

- **Contact info** — search for `tel:+44` and `hello@hausio.co.uk` in both HTML files, replace when ready
- **Pricing** — edit the `PRICES` object at the top of `js/booking.js`; also update the matching `£` labels in `index.html` (Services section + Pricing section)
- **Booking submission** — currently the submit just shows a success message. Hook to a backend / form service (Formspree, Getform, Netlify Forms, your own endpoint) in `js/booking.js` → `form.addEventListener('submit', …)`
- **Logo** — the SVG is inline so it renders crisp at any size. To swap for a PNG of the real logo, replace the `.brand-mark svg` blocks in both HTML files with `<img src="assets/logo.png">`

## Pricing (based on London 2026 market research)

| Service    | Rate |
|------------|------|
| Cleaning (regular)     | £22/hr |
| Cleaning (deep)        | £28/hr |
| Cleaning (end of tenancy) | £32/hr |
| Removals (1 man + van) | £55/hr |
| Removals (2 men + van) | £85/hr |
| Removals (3 men + van) | £115/hr |
| Handyman (1st hour)    | £65 |
| Handyman (subsequent)  | £50/hr |
| Gardening              | £40/hr |

Competitive with Housekeep, ARO Multi Services, and major London man-and-van operators.

## Next steps (when ready)

1. Connect submit to a real backend (Formspree is the fastest: change form action to their endpoint)
2. Add real phone number and domain
3. Replace inline SVG logo with the final PNG from the brand files
4. Add a `/thank-you` page or Stripe integration for deposits
5. SEO: add sitemap.xml, robots.txt, Schema.org LocalBusiness JSON-LD
