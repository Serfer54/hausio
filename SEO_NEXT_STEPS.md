# Hausio — SEO Roadmap (что осталось после 2026-05-29)

## Что сделано в этой сессии

| Элемент | Статус | Файлы |
|---|---|---|
| 5 new service overview pages (London-level) | ✅ | `furniture-assembly-london.html`, `tv-mounting-london.html`, `garden-clearance-london.html`, `waste-removal-london.html`, `painting-decorating-london.html` |
| boroughs.json — добавлены 17 scaffold boroughs | ✅ | `data/boroughs.json` (всего 32 borough) |
| Header nav + footer Services list | ✅ | Все 64 HTML файла обновлены через `scripts/update-nav-footer.js` |
| Sitemap.xml — добавлены 5 service overviews | ✅ | `sitemap.xml` |
| Tel-obfuscation в footer | ✅ | Все 64 HTML, обработчик в `js/wa-obfuscate.js` |

## Что осталось (приоритизированный backlog)

### Приоритет 1 — финальная защита от Web3Forms-уязвимости (1 час)

Текущий `js/booking.js` шлёт лиды в Web3Forms как backup. Если Avast блокирует у Сергея — то у бота в Нигерии тоже блокируется (хорошо), но **легитимные клиенты с Avast тоже не доходят**. Решение:

1. Проверить в Netlify Forms dashboard, что 100% лидов идёт через Netlify Forms → Resend.
2. Если да — удалить Web3Forms POST в `js/booking.js` целиком. Останется один pipeline: Netlify → submission-created.js → Resend.

### Приоритет 2 — Borough overview pages для 17 scaffold boroughs (~3 часа)

В `data/boroughs.json` 17 новых boroughs имеют флаг `_scaffold: true`. Они содержат:
- Полные метаданные (postcodes, neighborhoods, ULEZ, CPZ status) — корректно
- Generic snippets/FAQ/serviceFraming — корректно, но не глубоко локально

Для каждого borough нужно:
- Заменить generic snippets на 5-6 borough-specific work-snippets (как у tower-hamlets/southwark/etc: Canary Wharf goods lifts, Wimbledon fortnight, Westfield gridlock — реальные локальные особенности).
- Добавить 2-3 borough-specific FAQ
- Углубить serviceFraming для 7 услуг с borough-specific деталями

**Источники для исследования каждого borough:**
- Постовые маршруты, ULEZ-проверка (gov.uk/check-mot-status в стороне, но ULEZ overlap на TfL)
- Council CPZ pages (e.g. `bromley.gov.uk/parking/permit-information`)
- Известные housing developments (для concierge/lift coordination)
- Stadium/event venues (matchday closures)
- University campuses (student tenancy peaks)
- Conservation areas (handyman fixings constraints)

**Что генератор НЕ запустит сейчас:** existing `gen-borough-pages.js` использует `b.serviceFraming.cleaning` для overview pages — но новые scaffolds НЕ имеют ключа `cleaning` (после pivot). Перед запуском генератора надо:
- Удалить cleaning из renderBoroughPage в generator (или сделать conditional)
- Заменить hardcoded title "Cleaners, Man and Van & Handyman" на "Man and Van, Handyman & Specialist Services"

### Приоритет 3 — Borough × Service pages (5 услуг × 32 boroughs = 160 страниц)

Расширить `scripts/gen-service-borough-pages.js`:
- Добавить 5 новых entries в `SERVICES` (furniture-assembly, tv-mounting, garden-clearance, waste-removal, painting-decorating)
- Скопировать структуру `handyman` / `man-and-van` блоков
- Использовать `serviceFraming[serviceKey]` из boroughs.json

После Priority 2 (borough-specific framings есть для всех 32) — запустить генератор → 160 страниц.

**Sitemap update:** добавить эти 160 + 17 borough overviews = 177 новых URL.

### Приоритет 4 — Removed cleaning copy

После пивота cleaning:
- `cleaning-london.html` — решить судьбу (оставить как контент-страницу для SEO трафика, переадресовать на /book или удалить с 410)
- В `book.html` radio "cleaning" — убрать
- В существующих 15 boroughs.json serviceFraming.cleaning — оставить как есть (генератор всё ещё использует для borough overview), либо удалить и убрать из генератора

### Приоритет 5 — Content depth (post-launch)

Когда основной каркас работает:
- 2-3 in-depth blog post per service (e.g. "How much does TV mounting cost in London — 2026 guide", "Garden clearance vs hiring a skip — the maths")
- Schema.org Service+AggregateRating с реальными отзывами Google
- Internal linking audit: borough → linked boroughs, service overview → all borough × service variants
- Hreflang если расширим на Edinburgh/Manchester (но это **только** если будут физические бригады)

## Не рекомендуется

- **Расширение за пределы London (Manchester/Birmingham)** без физического coverage area. Google детектит doorway pages и пенализирует.
- **AI-генерация snippets без local research** — выглядит как пост-2023 spam. Лучше 5 деталей правды чем 20 generic предложений.
- **160 страниц за один раз** до того как фундамент в borough.json готов — рискуем thin content penalty.

## Quick wins (опционально, если есть час)

- В `js/booking.js` уточнить параметр `service=handyman` для всех 5 новых сервисов (Stripe/GA4 continuity) или ввести гранулярные сервисы в booking flow
- Add `<link rel="alternate" hreflang="en-GB">` на все service overview pages
- Lighthouse audit топ-5 страниц + fix Core Web Vitals
