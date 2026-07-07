# Events API

## Обзор
Собственная аналитика действий посетителей. События шлёт
`frontend/assets/js/analytics.js` (sendBeacon) при каждом вызове `ecsTrack()`.

Типовые события: `page_view`, `lead_submit`, `lead_modal_open`, `faq_open`,
`click_phone`, `click_email`, `calc_plate_filled`, `calc_widget_failed`,
`fab_open` + все `data-track`-атрибуты из разметки.

## Эндпоинты

### POST /api/events/
**Авторизация:** не требуется.
**Тело запроса:**
```json
{
  "event": "lead_submit",
  "page": "/kasko.html",
  "referrer": "https://yandex.ru/",
  "params": {"form": "kasko-page", "product": "КАСКО"},
  "utm_last": {"utm_source": "yandex"}
}
```
**Ответ 201:** объект события с `id` и `created_at`.
**Ошибки:** 422 — нет поля `event`.

---

### GET /api/events/?limit=500
**Описание:** последние события.
**Авторизация:** `Authorization: Bearer <ADMIN_TOKEN>`.

### GET /api/events/summary
**Описание:** сводка «событие → количество», отсортирована по убыванию.
**Авторизация:** `Authorization: Bearer <ADMIN_TOKEN>`.
**Ответ 200:**
```json
[{"event": "page_view", "count": 120}, {"event": "lead_submit", "count": 7}]
```
