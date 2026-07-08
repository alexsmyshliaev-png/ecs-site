# ЕЦС — корпоративный сайт страхового агентства (СПб)

**Чистая статика**: 9 HTML-страниц в `frontend/`, ванильный JS (8 модулей в
`frontend/assets/js/`), 3 CSS. Боевой домен — `edincenter.ru`. **Бэкенда нет**
(ADR 2026-07-07 в `docs/architecture.md`): старый FastAPI лежит в
`archive/fastapi-backend/` — не трогать, не подключать. Заявки принимают
CRM-формы Битрикс24. Прочти `docs/architecture.md` перед архитектурными
изменениями, `docs/HANDOFF.md` — перед продолжением работ.

## Как что устроено
- **Заявки** — слоты `<div class="b24form" data-b24form="lead|office" data-product="…">`;
  `leads.js` монтирует embed CRM-формы из `config.b24forms` и заполняет скрытые поля.
- **Калькуляторы** — слоты `<div data-calc="osago-home|osago|travel|mortgage">`;
  `calc.js` лениво строит виджет партнёра из `config.calc` (`calc.js` подключён
  только на 4 страницах с калькуляторами, вызов в `main.js` защищён).
- **Аналитика** — `ecsTrack()` (`analytics.js`) → dataLayer + Метрика. Метрика/GA4/GTM
  инициализируются **только после согласия** (cookie-баннер там же).
- **Контакты** — из `config.js`; `ui.js initPhones()` подставляет их в `.js-phone`/`.js-email`.

## Критические инварианты (нарушение = ошибка/потерянная работа)
1. Шапку/меню/футер/модалки правь ТОЛЬКО в `frontend/index.html`, затем
   `cd frontend && python3 build_pages.py` — иначе правки в подстраницах затрутся.
   Контент `<main>` подстраниц скрипт не трогает.
2. id/code CRM-форм — только в `config.js`; скрытые поля заполняет только `leads.js`.
   id/frame-id калькуляторов — только в `config.calc`. Всё в `frontend/` публично: секретов нет.
3. ПДн (имя/телефон/email) НИКОГДА не пишутся в localStorage.
4. Метрика/GA4/GTM не грузятся до согласия (`ecs_consent === "granted"`). Не ломать гейт.
5. Порядок скриптов на странице: `config → utm → analytics → bitrix → leads → ui →
   [calc] → main`. Не менять.
6. Вся аналитика — через `ecsTrack()`/`data-track`. Прямые `ym()`/`gtag()` вне `analytics.js` запрещены.
7. Пользовательский ввод НИКОГДА не вставляется через `innerHTML`.

## UI и бренд (ЕЦС — Руководство по бренду.pdf; текстом — docs/UI_GUIDELINES.md)
- Красный `#E60023` — ОДНА главная кнопка на экран. Вторую красную заливку не добавлять.
- Логотип не изменять (только компоновку). Логотипы партнёров — grayscale.
- Цвета/радиусы/тени — только токены `tokens.css`, без хардкода hex в `components.css`.

## Стандарты кода
- JS: без фреймворков и npm; `"use strict"`; ES5-совместимый стиль модулей
  (IIFE + `window.ECS.<name>` + `init()` из `main.js`). Один модуль = одна зона ответственности.
- HTML: один `h1` на страницу; уникальные `title`/`description`; `alt` и `width`/`height`
  у всех `<img>`; `canonical` на каждой странице.

## Окружение (macOS, путь с кириллицей и пробелами!)
- Пути ВСЕГДА в кавычках. `node` НЕТ — не предлагать npm-инструменты локально.
- Смоук-сервер: `cd frontend && python3 -m http.server 8765` →
  `curl -s -o /dev/null -w "%{http_code}" http://localhost:8765/страница.html`.
- Проверка JS-синтаксиса без исполнения (JXA):
  `osascript -l JavaScript -e 'ObjC.import("Foundation"); var s=$.NSString.stringWithContentsOfFileEncodingError("ПУТЬ/ФАЙЛ.js",$.NSUTF8StringEncoding,null); try{new Function(s.js); "OK"}catch(e){"ERR: "+e}'`
- Python-скрипты: `python3 -m py_compile frontend/build_pages.py frontend/build_share.py`.
- Есть: `python3` (+Pillow), `cwebp`, `sips`, `curl`. Скрипты-помощники — в scratchpad, не в репозиторий.

## Коммиты и документация
- Каждая задача = отдельный коммит + строка в `docs/CHANGELOG.md` (Added/Changed/Removed).
- Коммит-месседж заканчивается `Co-Authored-By: Claude <модель> <noreply@anthropic.com>`.
- Ничего не пушить и не мержить в `main` без явной просьбы владельца.
- Изменил архитектуру → ADR в `docs/architecture.md`. Новый модуль/разметка → `docs/frontend/components.md`.

## Перед коммитом
1. JS-синтаксис (JXA) всех правленых модулей — OK.
2. Правил обвязку → прогнан `build_pages.py`, в `git diff` только ожидаемое.
3. Страницы открываются на 8765 (200) без ошибок в консоли.
