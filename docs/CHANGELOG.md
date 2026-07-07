# Changelog

## [Unreleased]

## [2026-07-07] — Этап 1: миграция заявок на CRM-формы Битрикс24, вывод бэкенда
> Основание: ADR 2026-07-07 (docs/architecture.md) + docs/AUDIT-2026-07-07.md.
> Заявки принимаются CRM-формами Битрикс24 (виджет), собственный FastAPI-бэкенд
> выводится из эксплуатации. Ветка `feature/crm-forms-migration`.

### Changed
- `frontend/assets/js/analytics.js` — убрана серверная аналитика: удалена `sendToBackend()` и отправка на `/api/events`. События идут только в `dataLayer` (GTM) и Яндекс.Метрику (`reachGoal`).
- `frontend/assets/js/config.js` — удалены `apiUrl` и `bitrixWebhookUrl` (сервер и вебхук больше не используются). Добавлена секция `b24forms: { lead, office }` с `{id, code, loader}` и инструкцией, где взять значения из embed-кода CRM-формы. `bitrixWidgetUrl` (виджет чата/звонка) сохранён.
- `frontend/assets/js/ui.js` — модалки монтируют CRM-форму лениво при открытии (в слот `[data-b24form]`), вместо простановки `data-product` на самописную `<form>`.

### Removed
- `frontend/assets/js/leads.js` — полностью переписан: удалены отправка на `/api/leads`, прямой вебхук Битрикс24 и localStorage-фолбэк лида (ПДн в localStorage больше не пишутся). Удалены самописная маска телефона и обработчик `form.js-lead-form`.

### Added
- `frontend/assets/js/leads.js` — модуль интеграции с CRM-формами Битрикс24: монтирует embed в слоты `[data-b24form]` из `config.b24forms`; по `b24:form:init` заполняет скрытые поля (`product`, `form_slug`, `page_url`, `utm_first`, `referrer_first`, `ym_client_id`, `plate`); транслирует события формы в `ecsTrack` (`lead_form_open`, `lead_success`); при ненастроенной/незагрузившейся форме (таймаут 5 с) показывает фолбэк «позвоните/напишите» + `ecsTrack("b24form_failed")`.
- `frontend/assets/css/components.css` — стили слота `.b24form` и блока-фолбэка `.b24form__fallback`.

### Changed (HTML, все 9 страниц)
- Самописные формы заявок заменены на слоты CRM-форм Битрикс24 `<div class="b24form" data-b24form="lead" data-product="…" data-form-slug="…">`:
  - модалки `#leadModal` (product сохранён по страницам) и `#cheaperModal` (product «Найдём дешевле») — правка в `index.html`, разнесена `build_pages.py`;
  - inline-формы в теле страниц: `kasko.html` (kasko-page), `business.html` (business-brief), `property.html` (property-page). Обёртки секций (`.lead`, заголовки, описания) сохранены.
- `frontend/build_pages.py` — `modal_product()` и подстановка product обновлены под новый слот (`data-b24form="lead" … data-form-slug="modal"`); старый формат `data-form="modal"` оставлен как fallback для первого прогона миграции.

## [2026-06-11] — Hero: калькулятор/инфо справа на всех страницах, polis812
### Added
- `frontend/travel.html` — калькулятор путешествий polis812 (`https://polis812.ru/wl/loader.js`, партнёр 118044) встроен в правую колонку hero вместо калькулятора Финуслуг
- Сбалансированная статистика hero: единый ряд равных колонок в рамке (`.hero__trust`), кнопки и статистика центрируются в колонке

### Changed
- Hero всех подстраниц (КАСКО, Имущество, Бизнес, Офис) — двухколоночный, инфо-панель справа, как на ОСАГО (раскладка `hero__grid`)
- Travel hero — двухколоночный `hero__grid--wide` (калькулятор шире)
- Line art фонов сделан намного прозрачнее (opacity .16–.2 → .06–.08), чтобы не мешать тексту
- ОСАГО: убран дублирующий блок калькулятора «Рассчитайте ОСАГО онлайн»; калькулятор по госномеру остаётся в hero, его сабмит открывает форму заявки с подставленным номером

### Removed
- Секция-калькулятор Финуслуг «Рассчитайте ОСАГО онлайн» на index (дубль)
- Неиспользуемая функция `hero_center` и стили центрированного hero

## [2026-06-11] — Правки дизайна: line art, шапка, отступы, мобильный порядок
### Added
- `frontend/assets/img/line-city.png`, `line-building.png` — line art города (белые линии, прозрачный фон; сгенерированы из «Background line art», обрезаны по содержимому) — фон всех тёмных плашек вместо texture-dark.png
- `frontend/assets/css/components.css` — `.hero__grid--calc` (grid-areas): на мобильном калькулятор идёт выше кнопок связи и статистики

### Changed
- Шапка: рядом с бейджем только расшифровка «Единый центр страхования» (без дублирующего «ЕЦС»); из меню убран «Офис» (переход — по кнопке «Посетить офис»); «Бизнес» — последний пункт; шрифт пунктов 14.5→16px
- Отступы между секциями уменьшены: 96→60px (`.section`), 64→40px (`--tight`), мобильные 64→44px
- `frontend/index.html` — hero перестроен: копия → калькулятор → действия (hero__actions)

### Removed
- Фолбэк «Калькулятор временно недоступен» на index и travel (по решению владельца — на боевом домене виджет работает)

## [2026-06-11] — Реструктуризация по fullstack-web-dev
### Added
- `backend/` — FastAPI-приложение: приём лидов с пересылкой в Битрикс24 (вебхук хранится в `.env`, не в браузере) и серверная аналитика событий
  - `backend/app/routers/leads.py` — POST/GET /api/leads
  - `backend/app/routers/events.py` — POST/GET /api/events, GET /api/events/summary
  - `backend/app/services/` — lead_service, event_service, bitrix_service
  - `backend/app/models/`, `backend/app/schemas/`, `backend/app/core/`, `backend/app/dependencies/`
  - `backend/tests/` — 7 тестов (pytest), все зелёные
- `frontend/assets/js/` — монолитный main.js разбит на модули по ответственности: `utm.js`, `analytics.js`, `leads.js`, `bitrix.js`, `ui.js`, `main.js` (только инициализация)
- `frontend/assets/css/` — main.css разбит на `tokens.css` (бренд-токены), `base.css` (reset, кнопки, шапка), `components.css` (всё остальное)
- `docs/` — архитектура, setup, API-доки, каталог компонентов и страниц

### Changed
- HTML-страницы перенесены в `frontend/`, обновлены подключения CSS/JS
- `frontend/assets/js/config.js` — добавлен параметр `apiUrl` (адрес бэкенда)
- `frontend/assets/js/leads.js` — лиды идут на бэкенд `/api/leads`; фолбэк: прямой вебхук Битрикс24 → localStorage
- `.claude/launch.json` — два сервера: статика (8765) и API (8000)

## [2026-06-11] — Сайт инициализирован (6 страниц)
### Added
- Страницы: index (ОСАГО + калькулятор Финуслуг), kasko, property, travel (+калькулятор), business (тёмная строгая тема), office (карта-заглушка, запись на приём)
- Дизайн-система по бренд-гайду (ЕЦС — Руководство по бренду.pdf): красный #E60023 — одно главное действие на экран, Inter, pill-кнопки
- UTM-трекинг (first/last touch), аналитика ecsTrack → dataLayer/Метрика, формы заявок с маской телефона, плавающая кнопка связи
- Изображения извлечены из примера-бандла: логотипы 9 страховых, автомобиль, фоновая текстура
