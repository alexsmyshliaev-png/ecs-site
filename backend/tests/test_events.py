"""Тесты роутера событий аналитики."""


def test_create_event(client):
    resp = client.post("/api/events/", json={
        "event": "page_view",
        "page": "/kasko.html",
        "utm_last": {"utm_source": "yandex"},
    })
    assert resp.status_code == 201
    assert resp.json()["event"] == "page_view"


def test_event_requires_name(client):
    resp = client.post("/api/events/", json={"page": "/index.html"})
    assert resp.status_code == 422


def test_summary_requires_token(client):
    resp = client.get("/api/events/summary")
    assert resp.status_code in (401, 403)
