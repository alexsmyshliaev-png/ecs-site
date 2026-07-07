/* ============================================================
   ЕЦС · analytics.js — единая точка аналитики.
   ecsTrack() шлёт событие в dataLayer (GA4/GTM) и Яндекс.Метрику
   (reachGoal). Собственного бэкенда событий нет — см. ADR
   2026-07-07 (docs/architecture.md): аналитика живёт в Метрике,
   прочие теги подключаются через GTM.
   ============================================================ */
(function () {
  "use strict";
  window.ECS = window.ECS || {};
  var CFG = window.ECS_CONFIG || {};

  window.dataLayer = window.dataLayer || [];

  function track(event, params) {
    params = params || {};
    params.page = location.pathname;
    window.dataLayer.push(Object.assign({ event: event }, params));
    if (CFG.yandexMetrikaId && typeof window.ym === "function") {
      window.ym(CFG.yandexMetrikaId, "reachGoal", event, params);
    }
    if (window.console && console.debug) console.debug("[ecsTrack]", event, params);
  }

  function initMetrika() {
    if (!CFG.yandexMetrikaId) return;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      k = e.createElement(t); a = e.getElementsByTagName(t)[0];
      k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    window.ym(CFG.yandexMetrikaId, "init", {
      clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true, ecommerce: "dataLayer"
    });
  }

  function initGA4() {
    if (!CFG.ga4Id) return;
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + CFG.ga4Id;
    document.head.appendChild(s);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", CFG.ga4Id);
  }

  // Любой элемент с data-track="имя_цели" отправляет событие по клику.
  function initClickTracking() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-track]");
      if (el) track(el.getAttribute("data-track"), { label: (el.textContent || "").trim().slice(0, 60) });
    });
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
      if (!a) return;
      track(a.href.indexOf("tel:") === 0 ? "click_phone" : "click_email");
    });
  }

  window.ECS.analytics = {
    track: track,
    init: function () { initMetrika(); initGA4(); initClickTracking(); }
  };
  window.ecsTrack = track; // короткий алиас, используется в страницах
})();
