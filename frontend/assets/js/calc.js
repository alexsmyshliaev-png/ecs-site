/* ============================================================
   ЕЦС · calc.js — единый модуль калькуляторов страховых партнёров.
   Разметка страниц сведена к слотам <div data-calc="osago-home|osago|travel|mortgage">;
   все id/frame-id — в config.calc (в HTML их нет). Скрипт провайдера грузим
   ЛЕНИВО: для встроенных виджетов — по IntersectionObserver (когда слот
   приближается к экрану), для ипотеки — по клику (виджет живёт в модалке).
   Если за 8 с виджет не отрисовал iframe — показываем фолбэк
   «рассчитаем вручную» + ecsTrack("calc_widget_failed").

   TODO(calc_complete, задача C3): формат postMessage об успешном расчёте
   у Финуслуг/polis812 не задокументирован публично — уточнить у партнёров,
   тогда добавить window.addEventListener("message", …) → ecsTrack("calc_complete").
   ============================================================ */
(function () {
  "use strict";
  window.ECS = window.ECS || {};
  var CFG = window.ECS_CONFIG || {};
  var TIMEOUT_MS = 8000; // нет iframe за 8 с → виджет не поднялся, показываем фолбэк

  function calc() { return CFG.calc || {}; }

  // <script> провайдера: data-* проставляем ДО src, чтобы к моменту загрузки они уже стояли.
  function appendScript(parent, src, attrs) {
    var s = document.createElement("script");
    s.async = true;
    if (attrs) Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    s.src = src;
    parent.appendChild(s);
    return s;
  }

  /* —— polis812: тема виджета едет в data-* самого <script> (не наши id — не в config) —— */
  var TRAVEL_COLORS = "%7B%22primary%22%3A%22%23EB0600%22%2C%22secondary%22%3A%22%237CB1FB%22%2C%22accent%22%3A%22%23326AFF%22%2C%22accentHover%22%3A%22%23326AFF%22%2C%22calculatorBlock1%22%3A%22%23F1F6FB%22%2C%22calculatorBlock2%22%3A%22%23AAE9C4%22%2C%22secondaryLight%22%3A%22%23C5DDFE%22%2C%22accentHoverLight%22%3A%22%2392a5ff%22%2C%22accentActive%22%3A%22%232d5fe4%22%2C%22calculatorBlock%22%3A%22%23F1F6FB%22%2C%22optionColor%22%3A%7B%22name%22%3A%22%D0%A7%D0%B5%D1%80%D0%BD%D1%8B%D0%B9%22%2C%22val%22%3A%22%23303030%22%7D%2C%22backgroundColor%22%3A%22%23F7F8FA%22%7D";

  /* —— Финуслуги ОСАГО: один bundle, frame-id разный на главной и osago.html —— */
  function buildOsago(frameKey) {
    return function (slot) {
      var c = calc();
      var box = document.createElement("div");
      box.id = "frame-calculator_wrap"; // id сохранён — под него уже есть стили в components.css
      box.setAttribute("data-id-frame", c[frameKey] || "");
      box.setAttribute("data-adv-p-id", c.advPartnerId || "");
      slot.appendChild(box);
      appendScript(slot, "https://finuslugi.ru/osago/partners/main/iframe.bundle.iife.js");
    };
  }

  /* —— polis812 (путешествия) —— */
  function buildTravel(slot) {
    var c = calc();
    appendScript(slot, "https://polis812.ru/wl/loader.js", {
      "data-params": "",
      "data-white-label": "true",
      "data-type": "vzr",
      "data-title": "Туристическая страховка онлайн",
      "data-subtitle": "Лучший способ оценить, сравнить и купить страховку от надежных компаний",
      "data-theme": "custom",
      "data-colors": TRAVEL_COLORS,
      "data-partner": c.travelPartner || "",
      "data-partner-ym-id": c.travelPartner || "",
      "type": "application/javascript"
    });
  }

  /* —— Финуслуги ипотека (модалка property.html): скрипт грузится в body,
        находит контейнер #mortgage-frame-calculator по id и строит виджет в нём —— */
  function buildMortgage(slot) {
    var c = calc();
    var m = c.mortgage || {};
    var box = document.createElement("div");
    box.id = "mortgage-frame-calculator"; // id сохранён — под него уже есть стили
    box.setAttribute("data-id", m.id || "");
    box.setAttribute("data-adv-p-id", c.advPartnerId || "");
    box.setAttribute("data-erid", m.erid || "");
    box.setAttribute("data-color", "#F1F1F3");
    box.setAttribute("data-color-hover", "#DEDEDF");
    slot.appendChild(box);
    appendScript(document.body, "https://agents.finuslugi.ru/assets/js/mortgage-frame-calc.js");
  }

  var PROVIDERS = {
    "osago-home": { product: "ОСАГО",        build: buildOsago("osagoHome") },
    "osago":      { product: "ОСАГО",        build: buildOsago("osagoPage") },
    "travel":     { product: "Путешествия",  build: buildTravel },
    "mortgage":   { product: "Имущество",    build: buildMortgage, modal: true }
  };

  /* ---- монтирование виджета в слот (однократно) ---- */
  function mount(slot) {
    if (!slot || slot.getAttribute("data-calc-state")) return; // уже смонтирован/упал
    var name = slot.getAttribute("data-calc");
    var provider = PROVIDERS[name];
    if (!provider) return;
    slot.setAttribute("data-calc-state", "mounted");
    provider.build(slot);
    window.ecsTrack && window.ecsTrack("calc_open", { calc: name });
    setTimeout(function () {
      if (!slot.querySelector("iframe")) showFallback(slot, name, provider.product);
    }, TIMEOUT_MS);
  }

  /* ---- фолбэк: виджет не отрисовался (CDN недоступен / привязка к домену) ---- */
  function showFallback(slot, name, product) {
    if (slot.getAttribute("data-calc-state") === "failed") return;
    slot.setAttribute("data-calc-state", "failed");
    slot.innerHTML =
      '<div class="b24form__fallback">' +
        "<p><b>Калькулятор не загрузился</b></p>" +
        "<p>Оставьте заявку — рассчитаем вручную и пришлём лучшую цену.</p>" +
        '<p><a class="btn btn--primary" href="#" data-modal="lead"' +
          (product ? ' data-product="' + product + '"' : "") + ">Оставить заявку</a></p>" +
      "</div>";
    window.ecsTrack && window.ecsTrack("calc_widget_failed", { calc: name });
  }

  function init() {
    var slots = document.querySelectorAll("[data-calc]");
    if (!slots.length) return;

    // модалка ипотеки: монтируем при первом клике по кнопке (виджету нужен видимый контейнер)
    document.addEventListener("click", function (e) {
      if (!e.target.closest('[data-modal="mortgage"]')) return;
      var m = document.querySelector('[data-calc="mortgage"]');
      if (m) mount(m);
    });

    var lazy = [];
    slots.forEach(function (slot) {
      if (PROVIDERS[slot.getAttribute("data-calc")] &&
          PROVIDERS[slot.getAttribute("data-calc")].modal) return; // модальные — по клику
      lazy.push(slot);
    });
    if (!lazy.length) return;

    if (typeof IntersectionObserver === "function") {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { io.unobserve(en.target); mount(en.target); }
        });
      }, { rootMargin: "200px" });
      lazy.forEach(function (slot) { io.observe(slot); });
    } else {
      lazy.forEach(mount); // старый браузер — грузим сразу
    }
  }

  window.ECS.calc = { init: init, mount: mount };
})();
