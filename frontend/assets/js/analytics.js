/* ============================================================
   ЕЦС · analytics.js — единая точка аналитики + согласие на cookie.
   ecsTrack() шлёт событие в dataLayer (GTM) и Яндекс.Метрику (reachGoal).
   Собственного бэкенда событий нет (ADR 2026-07-07).

   152-ФЗ/cookie: Яндекс.Метрика с Вебвизором = сбор ПДн, поэтому она
   инициализируется ТОЛЬКО после явного согласия. До согласия показывается
   лёгкий баннер; выбор (granted/denied) хранится в localStorage
   (сам флаг согласия — не ПДн). Баннер не показывается, если ни Метрика,
   ни GA4 не настроены (например, на localhost).
   ============================================================ */
(function () {
  "use strict";
  window.ECS = window.ECS || {};
  var CFG = window.ECS_CONFIG || {};
  var CONSENT_KEY = "ecs_consent";

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

  /* ---- согласие ---- */
  function consentState() {
    try { return localStorage.getItem(CONSENT_KEY) || ""; } catch (e) { return ""; }
  }
  function setConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
  }
  function needsConsentUI() {
    // гейтить нечего, если аналитика не настроена (Метрика/GA4/GTM все за согласием)
    return !!(CFG.yandexMetrikaId || CFG.ga4Id || CFG.gtmId);
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

  // GTM грузим ТОЛЬКО после согласия (как и Метрику). GTM подхватывает уже накопленный
  // dataLayer, поэтому ecsTrack-события, отправленные до его загрузки, не теряются.
  // <noscript>-iframe не нужен: без JS не проходит и гейт согласия, теги не сработают.
  function initGTM() {
    if (!CFG.gtmId) return;
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtm.js?id=" + CFG.gtmId;
    document.head.appendChild(s);
  }

  var started = false;
  function startTracking() {
    if (started) return;
    started = true;
    initMetrika();
    initGA4();
    initGTM();
  }

  /* ---- баннер согласия ---- */
  function removeBanner() {
    var b = document.getElementById("cookieConsent");
    if (b && b.parentNode) b.parentNode.removeChild(b);
  }
  function showBanner() {
    if (document.getElementById("cookieConsent")) return;
    var el = document.createElement("div");
    el.className = "cookie";
    el.id = "cookieConsent";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Согласие на использование cookie");
    el.innerHTML =
      '<p class="cookie__text">Мы используем cookie и Яндекс.Метрику (включая Вебвизор) для аналитики сайта. ' +
      'Оставаясь, вы соглашаетесь с этим. Подробнее — в ' +
      '<a href="privacy.html" target="_blank" rel="noopener">Политике обработки персональных данных</a>.</p>' +
      '<div class="cookie__actions">' +
        '<button class="btn btn--primary cookie__ok" type="button">Принять</button>' +
        '<button class="btn btn--ghost cookie__no" type="button">Отклонить</button>' +
      "</div>";
    document.body.appendChild(el);
    el.querySelector(".cookie__ok").addEventListener("click", function () {
      setConsent("granted"); removeBanner(); startTracking();
      track("consent_granted", {});
    });
    el.querySelector(".cookie__no").addEventListener("click", function () {
      setConsent("denied"); removeBanner();
    });
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
    // повторно открыть баннер (например, из ссылки «Настройки cookie» в футере/privacy)
    showConsent: showBanner,
    init: function () {
      initClickTracking();
      if (consentState() === "granted") { startTracking(); return; }
      if (consentState() === "denied") return;      // выбор сделан — не докучаем
      if (needsConsentUI()) showBanner();           // спрашиваем только если есть что гейтить
    }
  };
  window.ecsTrack = track; // короткий алиас, используется в страницах
})();
