/* ============================================================
   ЕЦС · leads.js — интеграция с CRM-формами Битрикс24.
   Заявку создаёт форма Битрикс24 напрямую в CRM. Собственного
   бэкенда и вебхука в браузере нет, ПДн в localStorage не пишем
   (ADR 2026-07-07, docs/architecture.md). Здесь мы только:
     1) монтируем embed формы в слоты [data-b24form] из config.b24forms;
     2) через b24:form:init заполняем скрытые поля (product/utm/…);
     3) транслируем события формы в ecsTrack (lead_form_open / lead_success);
     4) если форма не настроена или не загрузилась — показываем фолбэк
        «позвоните / напишите» (bullet 1.2 плана).

   TODO(1.1): пока config.b24forms.*.{id,code,loader} пустые — везде
   показывается фолбэк. Заполните их из embed-кода формы (см. config.js).
   TODO(проверить при живом подключении, helpdesk 12853296): точные имена
   событий формы (b24:form:init / :submit / :success) и форму detail —
   ниже используется defensively (e.detail.object || e.detail).
   ============================================================ */
(function () {
  "use strict";
  window.ECS = window.ECS || {};
  var CFG = window.ECS_CONFIG || {};
  var FALLBACK_MS = 5000;

  /* ---- скрытые поля, которые кладём в форму ---- */
  function hiddenFields(slot) {
    var utm = (window.ECS.utm && window.ECS.utm.get()) || {};
    var f = {
      product: slot.getAttribute("data-product") || document.body.getAttribute("data-product") || "",
      form_slug: slot.getAttribute("data-form-slug") || slot.getAttribute("data-b24form") || "",
      page_url: location.origin + location.pathname, // без query/hash — не тащим PII из адреса
      utm_first: utm.first ? JSON.stringify(utm.first) : "",
      referrer_first: utm.referrer || ""
    };
    // номер из калькулятора ОСАГО по госномеру (сохраняется страницей в ecs_plate)
    try {
      var plate = localStorage.getItem("ecs_plate");
      if (plate) f.plate = plate;
    } catch (e) {}
    return f;
  }

  /* ---- ym clientID приходит асинхронно — до сабмита успеваем ---- */
  function withClientId(cb) {
    if (CFG.yandexMetrikaId && typeof window.ym === "function") {
      try { window.ym(CFG.yandexMetrikaId, "getClientID", cb); return; } catch (e) {}
    }
    cb("");
  }

  function fillForm(form, slot) {
    if (!form || typeof form.setProperty !== "function") return;
    var f = hiddenFields(slot);
    Object.keys(f).forEach(function (k) { try { form.setProperty(k, f[k]); } catch (e) {} });
    withClientId(function (id) { try { form.setProperty("ym_client_id", id || ""); } catch (e) {} });
  }

  function slotOf(e) {
    var t = e.target;
    return (t && t.closest) ? t.closest("[data-b24form]") : null;
  }

  /* ---- события форм Битрикс24 ---- */
  function bindFormEvents() {
    document.addEventListener("b24:form:init", function (e) {
      var form = (e.detail && (e.detail.object || e.detail)) || null;
      var slot = slotOf(e) || document.querySelector("[data-b24form].is-mounted:not(.is-loaded)");
      if (slot) { slot.classList.add("is-loaded"); fillForm(form, slot); }
      window.ecsTrack && window.ecsTrack("lead_form_open", { form: slot ? slot.getAttribute("data-form-slug") : "" });
    });

    // успешная отправка (имя события сверить, helpdesk 12853296)
    ["b24:form:submit", "b24:form:success"].forEach(function (evt) {
      document.addEventListener(evt, function (e) {
        if (evt === "b24:form:submit") return; // считаем конверсией только success
        var slot = slotOf(e);
        window.ecsTrack && window.ecsTrack("lead_success", {
          form: slot ? slot.getAttribute("data-form-slug") : "",
          product: slot ? slot.getAttribute("data-product") : ""
        });
      });
    });
  }

  /* ---- монтирование формы в слот ---- */
  function mount(slot) {
    if (!slot || slot.classList.contains("is-mounted") || slot.classList.contains("is-fallback")) return;
    var cfg = (CFG.b24forms && CFG.b24forms[slot.getAttribute("data-b24form")]) || {};
    if (!cfg.id || !cfg.code || !cfg.loader) { showFallback(slot); return; } // форма ещё не настроена

    slot.classList.add("is-mounted");
    // маркер для загрузчика Б24 (без inline-JS — дружелюбнее к CSP этапа 2)
    var marker = document.createElement("script");
    marker.setAttribute("data-b24-form", "inline/" + cfg.id + "/" + cfg.code);
    marker.setAttribute("data-skip-moving", "true");
    slot.appendChild(marker);
    var loader = document.createElement("script");
    loader.async = true;
    loader.src = cfg.loader + (cfg.loader.indexOf("?") > -1 ? "&" : "?") + ((Date.now() / 180000) | 0);
    slot.appendChild(loader);

    setTimeout(function () {
      if (!slot.classList.contains("is-loaded")) showFallback(slot);
    }, FALLBACK_MS);
  }

  /* ---- фолбэк: CDN недоступен или форма не настроена ---- */
  function showFallback(slot) {
    if (slot.classList.contains("is-fallback")) return;
    slot.classList.add("is-fallback");
    var links = [];
    if (CFG.whatsapp) links.push('<a href="' + CFG.whatsapp + '" target="_blank" rel="noopener">WhatsApp</a>');
    if (CFG.telegram) links.push('<a href="' + CFG.telegram + '" target="_blank" rel="noopener">Telegram</a>');
    slot.innerHTML =
      '<div class="b24form__fallback">' +
        "<p><b>Оставьте заявку по телефону или в мессенджере</b></p>" +
        (CFG.phone ? '<p class="b24form__phone"><a href="tel:' + (CFG.phoneHref || "") + '">' + CFG.phone + "</a></p>" : "") +
        (links.length ? "<p>или напишите нам: " + links.join(" · ") + "</p>" : "") +
      "</div>";
    window.ecsTrack && window.ecsTrack("b24form_failed", {
      form: slot.getAttribute("data-form-slug") || slot.getAttribute("data-b24form") || ""
    });
  }

  /* ---- form_start: первое взаимодействие пользователя со слотом формы ----
     Одноразово на слот — микро-конверсия «начал заполнять» (до отправки).
     Слушаем в фазе перехвата: клик/фокус во встроенной форме доходит до нас,
     пока форма рендерится в тот же DOM (не iframe). */
  function bindFormStart() {
    function onFirst(e) {
      var slot = e.target && e.target.closest ? e.target.closest("[data-b24form]") : null;
      if (!slot || slot.getAttribute("data-form-started")) return;
      slot.setAttribute("data-form-started", "1");
      window.ecsTrack && window.ecsTrack("form_start", {
        form: slot.getAttribute("data-form-slug") || slot.getAttribute("data-b24form") || ""
      });
    }
    document.addEventListener("focusin", onFirst, true);
    document.addEventListener("click", onFirst, true);
  }

  function init() {
    bindFormEvents();
    bindFormStart();
    // немодальные слоты монтируем сразу; модальные — лениво при открытии (ui.js)
    document.querySelectorAll("[data-b24form]").forEach(function (slot) {
      if (!slot.closest(".modal")) mount(slot);
    });
  }

  window.ECS.leads = { init: init, mount: mount };
})();
