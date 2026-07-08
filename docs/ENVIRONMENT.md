# Окружение и настройки — где что включается

Карта внешних систем и точек конфигурации сайта ЕЦС. Единый источник правды для
фронтенда — `frontend/assets/js/config.js` (`window.ECS_CONFIG`). Всё в `frontend/`
публично: секретов там нет и быть не должно.

## Домен и хостинг
- Боевой домен: **edincenter.ru** (`config.siteUrl`, а также статически в `canonical`/OpenGraph и в `sitemap.xml`).
- Хостинг + HTTPS + заголовки безопасности (CSP, HSTS, …) — см. `deploy/README.md`.
  Конфиги заголовков: `frontend/_headers` (Cloudflare Pages/Netlify) и
  `deploy/nginx-security-headers.conf` (nginx). Калькуляторы Финуслуг привязаны к домену —
  на localhost/github.io не строятся (показывается фолбэк).
- github.io-версию после переезда закрыть от индексации / отключить.

## Битрикс24 (приём заявок и виджет)
- **CRM-формы**: Битрикс24 → CRM → Интеграции → CRM-формы → у формы «…» → Настроить →
  «Ссылка и код». Из embed берутся `id`/`code`/`loader` → `config.b24forms.{lead,office}`.
  Пока пусто — на месте формы фолбэк «позвоните/напишите». Подробности в комментарии `config.js`.
- **Виджет на сайт** (чат + обратный звонок): CRM → Интеграции → Виджет на сайт →
  URL загрузчика → `config.bitrixWidgetUrl`.
- Скрытые поля лида (`product`, `utm_first`, `ym_client_id`, …) заполняет `leads.js` — не в портале.

## Аналитика
- **Яндекс.Метрика**: номер счётчика → `config.yandexMetrikaId`. Инициализируется только
  после согласия (cookie-баннер в `analytics.js`). Цели = имена событий `ecsTrack`
  (`lead_success`, `calc_complete`, `calc_open`, `form_start`, `click_phone`, `fab_*`, …) —
  размечаются в интерфейсе Метрики.
- **Google Tag Manager**: контейнер → `config.gtmId`. Правило: Метрика — в коде, все прочие
  теги (пиксели VK/MyTarget, ретаргетинг, коллтрекинг, scroll depth) — через GTM. Грузится после согласия.
- **GA4** (опционально): `config.ga4Id`.

## Калькуляторы партнёров
- id/frame-id — в `config.calc` (`advPartnerId`, `osagoHome`, `osagoPage`, `mortgage {id,erid}`,
  `travelPartner`). Провайдеры: ОСАГО и ипотека — Финуслуги, путешествия — polis812.
- Формат `postMessage` для события `calc_complete` — уточнить у Финуслуг/polis812 (TODO в `calc.js`).

## Контакты и карта
- Телефон/email/адрес/часы/мессенджеры — `config.js` (`phone`, `phoneHref`, `email`,
  `address`, `workHours`, `whatsapp`, `telegram`, `max`, `vk`). Подставляются в `.js-phone`/`.js-email`
  и в блок соц-контактов (`ui.js`). Местный номер офиса `+7 812 240-90-80` — в разметке `office.html`.
- **Яндекс.Карты** (страница «Офис»): API-ключ → `config.yandexMapsApiKey`,
  координаты → `config.officeCoords`.

## Поисковые системы
- Яндекс.Вебмастер и Google Search Console: подтвердить сайт, отправить `sitemap.xml`
  (`https://edincenter.ru/sitemap.xml`). `robots.txt` уже в `frontend/`.

## Что настраивает владелец (заблокировано для Claude)
Полный список owner-blocked задач и куда вписывать значения — в `docs/HANDOFF.md` §6.
