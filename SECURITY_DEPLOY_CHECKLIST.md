# Hausio — Security Deploy Checklist

Дата создания: 2026-05-29
Контекст: защита от нигерийского WhatsApp-спама + приватизация репозитория.

---

## Что уже сделано в коде (этой сессией)

| Файл | Изменение |
|---|---|
| `js/wa-obfuscate.js` | Новый. Номер хранится char-кодами, в HTML не светится. |
| 59 HTML страниц | `<a href="https://wa.me/447304330614" target="_blank">` → `<a href="#" data-wa rel="nofollow noopener">`. Подключён `wa-obfuscate.js`. |
| `book.html` | Маркер `TURNSTILE_SITEKEY_PROD_REQUIRED` рядом с test-ключом. |
| `js/popup.js` | Маркер `TURNSTILE_SITEKEY_PROD_REQUIRED` рядом с test-ключом. |

После пуша на Netlify бот, тупо парсящий HTML, номер не найдёт. Это режет основной поток скраперов — но **не закрывает все векторы**. Дальше — ручные шаги.

---

## Ручные шаги (обязательные, в порядке убывания приоритета)

### 1. Приватизация GitHub-репозитория (5 минут, blocker)

`gh` CLI не установлен — делаем через веб:

1. https://github.com/Serfer54/hausio/settings
2. Прокрутить вниз до **Danger Zone**
3. **Change repository visibility** → **Make private** → ввести `Serfer54/hausio` → подтвердить.

**Netlify не сломается** — деплой использует deploy-key/OAuth, не зависит от публичности репо. Webhooks тоже работают на приватных репо.

После — проверить: `https://github.com/Serfer54/hausio` должен показывать 404 в режиме incognito.

---

### 2. Cloudflare Turnstile — production-ключи (10 минут, blocker)

Сейчас в коде test-ключ `1x00000000000000000000AA` — он **пропускает любых ботов**. Booking-форма реально не защищена. Это даёт спамерам отправлять формы массово (откуда могло утечь и в WhatsApp — Web3Forms принимает все сабмиты и нотификации идут на email).

#### 2.1 Создать сайт в Turnstile

1. https://dash.cloudflare.com → **Turnstile** (sidebar)
2. **Add Site** → Domain: `hausio.co.uk` → Widget mode: **Managed** → Save.
3. Скопировать **Site Key** (публичный) и **Secret Key** (серверный).

#### 2.2 Подставить Site Key в код (2 места)

Grep по проекту:
```
TURNSTILE_SITEKEY_PROD_REQUIRED
```

Найдёт:
- [book.html](book.html) — заменить `data-sitekey="1x00000000000000000000AA"` на новый Site Key
- [js/popup.js](js/popup.js) — заменить `const TURNSTILE_SITE_KEY = '1x00000000000000000000AA';` на новый Site Key

#### 2.3 Добавить Secret Key в Netlify env

1. https://app.netlify.com/projects/celebrated-babka-f215f3/configuration/env
2. **Add variable** → Key: `TURNSTILE_SECRET_KEY`, Value: `<secret_key>` → Save.

Backend (`netlify/functions/submission-created.js`) проверит токен на каждом сабмите и дропнет письмо для лидов, которые не прошли Turnstile.

#### 2.4 Триггернуть редеплой Netlify

После изменения env vars — Netlify не пересобирает автоматически. Trigger через **Deploys → Trigger deploy → Deploy site**.

---

### 3. Cloudflare WAF — geo-block (15 минут, рекомендуется)

Блокирует трафик из стран с высокой долей скраперов. Хирургически — закрываем только `/book.html` и страницы с формами, не весь сайт (чтобы не потерять случайных живых посетителей).

1. https://dash.cloudflare.com → выбрать домен `hausio.co.uk` → **Security** → **WAF** → **Custom rules** → **Create rule**
2. Имя: `Block spammer geos on forms`
3. Expression (Edit expression → вставить):
   ```
   (ip.geoip.country in {"NG" "GH" "CM" "PK" "ID" "BD"} and http.request.uri.path contains "/book")
   or
   (ip.geoip.country in {"NG" "GH" "CM"} and http.request.method eq "POST")
   ```
4. Action: **Block**
5. Deploy.

Список стран можно сузить/расширить. Текущий набор — Нигерия, Гана, Камерун (основной источник), плюс Пакистан/Индонезия/Бангладеш (вторичный фон lead-spam). Если потеряете живых клиентов — убрать PK/ID/BD.

#### 3.1 Дополнительно — bot fight mode

1. **Security** → **Bots** → **Bot Fight Mode** → **On** (бесплатный план).
2. Это блочит low-reputation bots (Scrapy без residential proxy, curl-баннер, и т.д.).

---

### 4. WhatsApp Business — фильтрация (5 минут, добивает руками)

WhatsApp Business даёт инструменты, которых нет в обычном:

1. **Settings → Business tools → Greeting message**:
   > Hi, this is Hausio London. To get a quote please share: (1) postcode (2) service (handyman or man-and-van) (3) preferred date. Our team replies in business hours, Mon–Sat 8am–7pm. Spam and bot messages are reported and blocked.

2. **Settings → Business tools → Away message** (для выходных/ночи) — ставит ожидание ответа.

3. **При спаме**: тап на сообщение → **Block & report**. Каждый репорт повышает шанс что номер попадёт в WhatsApp anti-spam list.

4. **Не отвечать** на спам с просьбами "press 1" / форвардами / голос-сообщениями про "investment". Это типичные templates нигерийских лидген-фабрик; ответ повышает score номера в их базе.

---

## Дополнительные шаги (не срочные)

### 5. Обновить истёкшие токены доступа

В памяти (project_hausio.md, 2026-05-09) сохранены токены сроком 7 дней — они уже истекли. Если планируется работать через API:

- **Netlify PAT**: https://app.netlify.com/user/applications → **New access token** → срок 90 дней.
- **Cloudflare API token**: https://dash.cloudflare.com/profile/api-tokens → **Create Token** → шаблон "Edit zone DNS" + добавить **Zone:WAF Configuration:Edit** для WAF rules → 90 дней.
- **GitHub PAT** (если ставить gh): https://github.com/settings/tokens → классический или fine-grained.

### 6. Установить `gh` CLI (опционально)

Это позволит делать `gh repo edit` / `gh pr create` напрямую из этой папки:
- https://cli.github.com/ → installer для Windows.
- После: `gh auth login`.

### 7. Removal Web3Forms (опционально)

В [js/booking.js](js/booking.js) Web3Forms всё ещё подключён как backup (с `access_key 2037c101...`). Avast блочит, и часть лидов уходит впустую. Если Resend + Netlify Forms покрывают весь поток — можно убрать. Но **сначала проверить** в Netlify Forms dashboard что лиды приходят туда (не только в Resend) — без этого Web3Forms единственный резерв на случай если Resend ляжет.

---

## Quick verify после деплоя

После пушей и редеплоя — проверить:

1. Открыть в incognito `https://hausio.co.uk` → DevTools → Network → искать `wa.me` в HTML response. **Не должно быть**.
2. Кликнуть на WhatsApp-иконку в шапке → должен открыться `wa.me/447304330614?text=Hi%20Hausio...` (нормально).
3. Открыть `https://hausio.co.uk/book.html` → DevTools → Network → искать `1x00000000000000000000AA` в response. **Не должно быть** после замены.
4. Заполнить тестовый booking через VPN с Nigeria IP — должен получить блок от WAF (после шага 3).
5. https://github.com/Serfer54/hausio в incognito — должен показать 404.
