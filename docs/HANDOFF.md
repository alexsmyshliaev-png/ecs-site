# HANDOFF — что осталось доделать и как

> Инструкция для следующей сессии Claude Code (любой модели).
> Написана 2026-07-07 после выполнения Этапов 1–2 полностью и Этапа 3 почти полностью
> (план — `docs/UPGRADE-PLAN.md`, аудит — `docs/AUDIT-2026-07-07.md`).
> Выполняй задачи по порядку. НЕ придумывай ничего сверх написанного —
> если чего-то не хватает, спроси владельца.

---

## 1. Контекст (прочитай, прежде чем трогать код)

- Сайт ЕЦС (страховой агент, СПб) — **чистая статика**: 9 HTML-страниц в `frontend/`,
  ванильный JS (7 модулей в `frontend/assets/js/`), 3 CSS. Боевой домен — `edincenter.ru`.
- **Бэкенда НЕТ** (ADR 2026-07-07 в `docs/architecture.md`). Старый FastAPI лежит
  в `archive/fastapi-backend/` — НЕ трогать, НЕ подключать.
- Заявки принимают **CRM-формы Битрикс24**: слоты `<div class="b24form" data-b24form="lead|office"
  data-product="..." data-form-slug="...">` (21 шт. на 9 страницах), монтирует их
  `leads.js` из `config.b24forms`. Пока `id/code/loader` пустые — показывается
  фолбэк «позвоните/напишите». Это ожидаемое состояние.
- Аналитика: `ecsTrack()` в `analytics.js` → dataLayer + Метрика. Метрика/GA4
  инициализируются **только после согласия** (cookie-баннер там же). Не ломай этот гейт.
- Работаем в ветке `feature/crm-forms-migration` (≈15 коммитов поверх main, не запушена).

### Инварианты (нарушение = ошибка)
1. id/code CRM-форм — **только** в `config.js`; скрытые поля заполняет **только** `leads.js`.
2. ПДн (имя/телефон/email) **никогда** не пишутся в localStorage.
3. Метрика/GA4/GTM не грузятся до согласия (`ecs_consent === "granted"`).
4. Общие блоки (шапка/меню/футер/модалки) правятся в `index.html`, затем
   `cd frontend && python3 build_pages.py` разносит их по 8 подстраницам.
   Контент `<main>` подстраниц скрипт не трогает.
5. Бренд: красная заливка — одно главное действие на экран; логотип не менять.
6. Каждая задача = отдельный коммит + запись в `docs/CHANGELOG.md` (секция даты, формат смотри в файле). Коммит-месседж заканчивается `Co-Authored-By: Claude <модель> <noreply@anthropic.com>`.
7. Ничего не пушить и не мержить в main без явной просьбы владельца.

### Особенности окружения (macOS, путь с кириллицей и пробелами!)
- Путь проекта содержит пробелы и кириллицу — **всегда бери пути в кавычки**.
- `node` НЕТ. Синтаксис JS проверяй так (парсит без исполнения):
  `osascript -l JavaScript -e 'ObjC.import("Foundation"); var s=$.NSString.stringWithContentsOfFileEncodingError("ПУТЬ/frontend/assets/js/ФАЙЛ.js",$.NSUTF8StringEncoding,null); try{new Function(s.js); "OK"}catch(e){"ERR: "+e}'`
- zsh раскрывает глобы в аргументах grep — пиши `grep -rn -e 'шаблон' каталог` без `--include=*.x`, либо `git grep`.
- Есть: `python3` (+Pillow 11), `cwebp`, `sips`, `curl`. Смоук-сервер:
  `cd frontend && python3 -m http.server 8765` → `curl -s -o /dev/null -w "%{http_code}" http://localhost:8765/страница.html`.
- Скрипты-помощники клади в scratchpad-каталог сессии, не в репозиторий.

---

## 2. ЗАДАЧА A (следующая по плану): calc.js — единый модуль калькуляторов

**Зачем:** сейчас 4 встраивания калькуляторов разбросаны по страницам с захардкоженными
id; скрипты провайдеров грузятся сразу (тормозят LCP); `config.calc` существует, но
**мёртвый — ни один JS его не читает**. Нужно: id — в config, загрузка — лениво по
IntersectionObserver, фолбэк при сбое.

### Текущее состояние (точные места)
1. **index.html:199-201** — ОСАГО (Финуслуги), контейнер + синхронный скрипт:
   `<div id="frame-calculator_wrap" data-id-frame="ce2dab9b-9b5f-4a7d-b1e7-d2442acf96a3" data-adv-p-id="5289dc16e387469434f49f7a2a9b1924"></div>`
   `<script src="https://finuslugi.ru/osago/partners/main/iframe.bundle.iife.js"></script>`
2. **osago.html:75-77** — то же, но **другой** frame-id: `d7b09765-d80c-4043-85ec-7cfd0f5d9319`.
3. **travel.html:78** — polis812: один `<script src="https://polis812.ru/wl/loader.js" data-partner="118044" data-type="vzr" data-white-label="true" data-theme="custom" data-colors="…длинный urlencoded JSON…">` (скопируй атрибуты из файла как есть).
4. **property.html:269-297** — ипотека (Финуслуги agents): модалка `#mortgageModal`
   с `<div id="mortgage-frame-calculator" data-id="2adb9c4c-…" data-adv-p-id="5289dc16e…" data-erid="2W5zFJnCygd" …>`
   и inline-скрипт, грузящий `https://agents.finuslugi.ru/assets/js/mortgage-frame-calc.js`
   по клику на `[data-modal="mortgage"]`. Ленивость уже есть — сохрани поведение
   (модалка = грузим по клику, НЕ по IntersectionObserver).

**Важно:** в `config.js` значение `calc.osago: "5289dc16…"` — это на самом деле
**adv-p-id (id партнёра)**, а не frame-id. Не перепутай при переносе.

### Что сделать
1. В `config.js` заменить секцию `calc` на честную структуру, например:
   ```js
   calc: {
     advPartnerId: "5289dc16e387469434f49f7a2a9b1924", // общий id партнёра Финуслуг
     osagoHome:  "ce2dab9b-9b5f-4a7d-b1e7-d2442acf96a3", // frame-id на главной
     osagoPage:  "d7b09765-d80c-4043-85ec-7cfd0f5d9319", // frame-id на osago.html
     mortgage:   { id: "2adb9c4c-b217-4f22-ad03-70b1d14055c3", erid: "2W5zFJnCygd" },
     travelPartner: "118044" // polis812
   }
   ```
2. Создать `frontend/assets/js/calc.js` (IIFE в стиле остальных модулей, ES5, `"use strict"`,
   `window.ECS.calc = { init: ... }`). Логика:
   - находит `[data-calc="osago-home|osago|travel|mortgage"]`;
   - для не-модальных — IntersectionObserver (`rootMargin: "200px"`), при появлении
     строит контейнер провайдера из config и добавляет `<script>` провайдера;
   - для `mortgage` — монтирование по клику на `[data-modal="mortgage"]` (перенести
     логику из inline-скрипта property.html, сам inline-скрипт удалить);
   - таймаут 8 с: если контейнер пуст (нет iframe внутри) — показать фолбэк
     «Не загрузилось — оставьте заявку, рассчитаем вручную» (кнопка `data-modal="lead"`)
     + `ecsTrack("calc_widget_failed", { calc: имя })`;
   - `ecsTrack("calc_open", { calc: имя })` при успешном монтировании.
3. Заменить разметку на страницах на `<div data-calc="...">` (сохрани обёртки
   `.calc-frame`, подписи `.calc-frame__note` и фолбэк-ссылки как есть).
   Скрипты провайдеров из HTML удалить.
4. Подключить `calc.js` на 4 страницах (index, osago, travel, property) перед `main.js`,
   вызвать `window.ECS.calc.init()` из `main.js` (после `ui.init()`); на страницах без
   калькуляторов модуль не подключаем.
5. `preconnect` в `<head>` только страниц с калькуляторами:
   index/osago → `https://finuslugi.ru`; travel → `https://polis812.ru`;
   property → `https://agents.finuslugi.ru`.
6. Обновить `docs/frontend/components.md` (модуль calc.js + соглашение `data-calc`).

### Приёмка
- `git grep -n 'finuslugi\|polis812' frontend/*.html` — только preconnect в head,
  никаких `<script src>` провайдеров в HTML.
- JS-синтаксис всех модулей — OK (JXA-проверка).
- Смоук: страницы 200; на localhost виджеты не строятся (привязка к домену) —
  через 8 с должен появиться фолбэк + `calc_widget_failed` в console.debug.
- Разметка `data-calc` присутствует: index=1, osago=1, travel=1, property=1.

---

## 3. ЗАДАЧА B (мелочь, 10 минут): width/height у соц-иконок

В hero-контактах 4 страниц есть `<img src="assets/img/social-icons/...">` без
`width`/`height` (CLS). Найди: `git grep -n 'social-icons' frontend/*.html`.
Проставь фактические пропорции (посмотри `sips -g pixelWidth -g pixelHeight файл`
для png; для svg возьми viewBox) при отображаемой высоте из CSS. `loading="lazy"`
НЕ добавляй, если иконка в первом экране (hero). Коммит + CHANGELOG.

---

## 4. ЗАДАЧА C — Этап 4: аналитика и маркетинг (код)

### C1. utm.js — починить propagate() и добавить yclid/gclid
`frontend/assets/js/utm.js`, функция `propagate()` сейчас делает
`a.href += "?"+qs` — **дублирует метки и ломает якоря**. Переписать:
```js
var u = new URL(a.href, location.origin);
KEYS.forEach(function (k) { if (utm[k]) u.searchParams.set(k, utm[k]); });
a.href = u.toString();
```
Плюс: в `parse()`/`store()` дополнительно сохранять `yclid` и `gclid`
(нужны для офлайн-конверсий Директа) в те же `ecs_utm_first/last`.
Приёмка: открой сайт с `?utm_source=test&yclid=1#faq` — ссылки не дублируют
параметры, якорь сохраняется, в localStorage есть yclid.

### C2. GTM-загрузчик
В `config.js` добавить `gtmId: ""` (комментарий: «контейнер GTM, напр. GTM-XXXXXXX»).
В `analytics.js` в `startTracking()` (после согласия!) добавить `initGTM()` —
стандартный сниппет загрузки `https://www.googletagmanager.com/gtm.js?id=`.
Правило из плана: Метрика — в коде; все прочие теги — только через GTM.
`www.googletagmanager.com` уже есть в CSP. Пустой `gtmId` = ничего не грузим.

### C3. События
- `form_start`: в `leads.js` при первом клике/фокусе внутри слота `[data-b24form]`
  (одноразово на слот) → `ecsTrack("form_start", { form: slug })`.
- scroll depth 25/50/75/90: по плану — через GTM-триггеры, в коде НЕ делать.
- `calc_open` — уже в задаче A. `calc_complete` — требует формата postMessage от
  Финуслуг/polis812: **не выдумывай**, оставь TODO-комментарий в calc.js и упомяни
  владельцу (уточнить у партнёров).

### C4. Контакты из config (убрать хардкод телефона)
Телефон `8 800 123-45-67` захардкожен в HTML 27+ раз — коллтрекинг с подменой
номера невозможен. Механика (без шаблонизатора):
1. В разметке шапки/футера/страниц заменить видимый телефон на
   `<a class="js-phone" href="tel:+78001234567">8 800 123-45-67</a>` (оставить
   текущие значения как fallback для no-JS и SEO).
2. В `ui.js` добавить `initPhones()`: `document.querySelectorAll('a[href^="tel:"]')` →
   подставить `CFG.phoneHref` в href и `CFG.phone` в textContent (только если текст
   элемента похож на телефон — не трогать «Позвонить»). Аналогично `mailto:` → `CFG.email`.
3. Шапку/футер править в `index.html` + прогнать `build_pages.py`; телефоны в
   контенте `<main>` подстраниц — руками на каждой.
Приёмка: поменяй `phone` в config.js локально → номер меняется везде после
перезагрузки; `git grep -c '8 800 123-45-67' frontend/*.html` — остаются только
fallback-тексты внутри `js-phone`-ссылок (или 0, если решишь заменить текст на пустой и рендерить целиком из JS — НЕ делай так: SEO/no-JS).

---

## 5. ЗАДАЧА D — Этап 5: поддерживаемость

### D1. CLAUDE.md в корень
Возьми драфт из `docs/AUDIT-2026-07-07.md` §12 и перепиши под новую архитектуру:
без FastAPI/pytest; добавь инварианты из раздела 1 этого файла (особенно №1–4),
команды запуска/проверки из раздела «Особенности окружения», ссылку на
`docs/architecture.md` и `docs/HANDOFF.md`. Коротко: ≤80 строк.

### D2. .gitignore — версионировать .claude/
Заменить строку `.claude/` на `.claude/settings.local.json`. После этого
`git add .claude/launch.json` (конфигурация запуска ecs-site должна версионироваться).

### D3. docs
- `docs/ENVIRONMENT.md` (новый): где что настраивается — портал Битрикс24
  (CRM-формы: CRM→Интеграции→CRM-формы; виджет: CRM→Интеграции→Виджет на сайт),
  Метрика (id в config.js), GTM (gtmId), хостинг (см. `deploy/README.md`), домен
  edincenter.ru, Search Console/Вебмастер.
- `docs/UI_GUIDELINES.md` (новый): правила бренда текстом — из «ЕЦС — Руководство
  по бренду.pdf» в корне (красный #e60023 — одно главное действие на экран; красная
  тень только под бейджем логотипа; логотип не менять, только компоновку; партнёрские
  лого grayscale ~78% — уже в CSS `.marquee:hover .logo`; шрифт Inter).
- `docs/frontend/components.md` — дополнить calc.js (задача A) и initPhones (C4).

### D4. Prettier + CI (опционально, спроси владельца)
`.prettierrc` (printWidth 120, singleQuote false) + `npx prettier --check` в
GitHub Actions. ВНИМАНИЕ: node в локальной среде нет — CI-only. Прогон prettier
по всем HTML даст гигантский диф — согласуй с владельцем до запуска.

### D5. Eleventy — НЕ НАЧИНАЙ без отдельной команды владельца
Самая крупная задача (отдельная ветка от актуального main): `_includes/` для
шапки/футера/модалок, `_data/site.json` для контактов, чистые URL `/osago/` +
редиректы со старых `.html`, сборка в GitHub Actions. Заменяет `build_pages.py`.
План — в `docs/UPGRADE-PLAN.md` Этап 5. Это многодневная работа.

---

## 6. Заблокировано владельцем (НЕ делать, только напоминать)

| Что | Куда вписать, когда появится |
|---|---|
| id/code/loader CRM-форм Битрикс24 («Заявка», «Запись в офис») | `config.js → b24forms` (инструкция в комментарии там) |
| URL виджета Б24 (чат/звонок) | `config.js → bitrixWidgetUrl` |
| Номер счётчика Метрики | `config.js → yandexMetrikaId` |
| GTM-контейнер | `config.js → gtmId` (после C2) |
| Боевой телефон/email/адрес, координаты офиса, ключ Яндекс.Карт | `config.js` (+ хардкоды до C4) |
| Фото офиса и travel-hero | `office.html`, `travel.html` (блоки `.ph`) |
| Хостинг + HTTPS + заголовки, CSP Report-Only → enforce, securityheaders.com=A | `deploy/README.md` — инструкция готова |
| Отключить github.io после переезда | — |
| Яндекс.Вебмастер + Google Search Console, отправить sitemap | — |
| Цели в Метрике: lead_success, calc_complete (макро); click_phone, fab_*, lead_form_open, calc_open (микро) | интерфейс Метрики |
| Формат postMessage калькуляторов (для calc_complete) | у Финуслуг/polis812 |

**Когда владелец даст id форм Б24** — вписать в config.js, открыть каждую страницу,
отправить тестовую заявку и проверить в CRM: лид с product/page_url/utm_first/
ym_client_id; сверить имена событий формы (helpdesk-статья 12853296) с
обработчиками в `leads.js` (там TODO) — при расхождении поправить `bindFormEvents()`.

---

## 7. Быстрая самопроверка после любой правки

```bash
CD="/Users/smish_y/FC_U/ЕЦС /Общее/ЕЦС общий сайт"   # подставь актуальный корень!
# 1. JS-синтаксис (см. JXA-однострочник в разделе «Особенности окружения»)
# 2. Python-скрипты: python3 -m py_compile "$CD/frontend/build_pages.py" "$CD/frontend/build_share.py"
# 3. Смоук: cd "$CD/frontend" && python3 -m http.server 8765 &  → curl каждую страницу → kill
# 4. Инварианты: git grep -n 'apiUrl\|/api/leads\|/api/events\|bitrixWebhookUrl' frontend/ docs/  # пусто (кроме CHANGELOG/AUDIT/HANDOFF)
# 5. Формы: git grep -c 'data-b24form=' frontend/*.html  # 21 слот суммарно
# 6. После правки общих блоков index.html: python3 build_pages.py и git diff — только ожидаемые изменения
```

Хорошей работы. Если что-то в этом файле противоречит коду — верь коду и спроси владельца.
