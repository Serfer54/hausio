# Hausio external consistency audit

Audit date: 9 September 2026

## Canonical facts

Use these values on every public profile and directory. Do not invent a customer-facing street address for this service-area business.

| Field | Canonical value |
|---|---|
| Trading name | Hausio |
| Legal name | Hausio Ltd |
| Company number | 17167561 |
| Phone | +44 7304 330614 |
| Email | hausio.co.uk@proton.me |
| Website | https://hausio.co.uk/ |
| Booking | https://hausio.co.uk/book.html |
| Public location | London, United Kingdom; service-area business |
| Service area | Greater London |
| Customer-facing hours | Monday-Sunday, 08:00-20:00 |
| Main services | Handyman; man and van; cleaning |
| Full pricing | https://hausio.co.uk/pricing.html |

The registered office shown by Companies House is a legal-company fact. It should only appear as a customer-facing address on a directory if customers are actually received there and the platform permits it.

## Findings

| Source | Result | Required action |
|---|---|---|
| Hausio website | Name, phone, hours, company number and current prices are present. Machine-readable files are now available at `/business.json` and `/pricing.json`. | Keep these two files as the source of truth when prices or hours change. |
| Companies House | Active company 17167561; registered office and SIC codes for removals, facilities support and general cleaning are present. | No website edit needed. Check after every filing. |
| Google Business Profile | Public snapshot showed `House cleaning service` as the main category and `Open 24 hours`, while the website says 08:00-20:00 and handyman/man-and-van are commercial priorities. | Profile owner must change hours to 08:00-20:00 daily and review the primary/secondary categories. Use `google-business-profile-update-pack.md`. |
| Search results | Google still showed cached snippets with the former moving rates on some results during the audit. Current pages contain £65/hour for one mover and £90/hour for two movers. | Request recrawl of the home page, man-and-van page and main area pages in Search Console after deployment. |
| Yell, Checkatrade and other directories | No verified Hausio listing was found in the sampled branded searches. | Register only from the prioritised directory plan and record each live profile URL. |

## Monthly rule

Complete `monthly-mention-check.csv` once per month. Every live profile must match the canonical facts above. Record a correction URL or support ticket in the `action` column and keep evidence in the `notes` column.

