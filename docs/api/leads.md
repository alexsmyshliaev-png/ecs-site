# Leads API

## Обзор
Приём заявок с форм сайта. Лид всегда сохраняется в SQLite; если настроен
`BITRIX_WEBHOOK_URL` — пересылается в Битрикс24 (`crm.lead.add`), статус
пересылки пишется в `bitrix_status` (pending / sent / failed / disabled).

## Эндпоинты

### POST /api/leads/
**Описание:** создать лид (вызывается из `frontend/assets/js/leads.js`).
**Авторизация:** не требуется (публичная форма).
**Тело запроса:**
```json
{
  "name": "Иван",
  "phone": "+7 (999) 123-45-67",
  "email": "",
  "product": "ОСАГО",
  "form": "modal",
  "comment": "Нужен полис",
  "page": "https://site.ru/index.html",
  "referrer": "https://yandex.ru/",
  "utm_first": {"utm_source": "yandex"},
  "utm_last": {"utm_source": "yandex", "utm_medium": "cpc"},
  "car": "Kia Rio, 2021"
}
```
Поля сверх схемы (`car`, `object`, `topic`, `when`…) сохраняются в `extra`.

**Ответ 201:**
```json
{
  "id": 1, "created_at": "2026-06-11T00:00:00", "name": "Иван",
  "phone": "+7 (999) 123-45-67", "product": "ОСАГО",
  "bitrix_status": "sent", "bitrix_lead_id": 123
}
```

**Ошибки:**
- 422 — нет обязательного поля `name`

---

### GET /api/leads/?limit=200
**Описание:** список последних лидов (для владельца).
**Авторизация:** `Authorization: Bearer <ADMIN_TOKEN>`.
**Ошибки:** 401 — неверный токен; 403 — `ADMIN_TOKEN` не задан в .env.
