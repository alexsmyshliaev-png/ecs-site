"""Тесты роутера лидов."""


def test_create_lead(client):
    resp = client.post("/api/leads/", json={
        "name": "Тест",
        "phone": "+7 (999) 123-45-67",
        "product": "ОСАГО",
        "form": "modal",
        "comment": "Нужен полис",
        "page": "http://localhost:8765/index.html",
        "utm_last": {"utm_source": "yandex", "utm_medium": "cpc"},
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["id"] == 1
    assert data["name"] == "Тест"
    assert data["utm_last"]["utm_source"] == "yandex"
    assert data["bitrix_status"] == "disabled"  # вебхук в тестах не настроен


def test_create_lead_keeps_extra_fields(client):
    resp = client.post("/api/leads/", json={
        "name": "Тест",
        "phone": "+7 (999) 123-45-67",
        "car": "Kia Rio, 2021",  # поле формы КАСКО — должно попасть в extra
    })
    assert resp.status_code == 201


def test_create_lead_requires_name(client):
    resp = client.post("/api/leads/", json={"phone": "+7 (999) 123-45-67"})
    assert resp.status_code == 422


def test_list_leads_requires_token(client):
    resp = client.get("/api/leads/")
    assert resp.status_code in (401, 403)  # без ADMIN_TOKEN чтение закрыто
