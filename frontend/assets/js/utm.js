/* ============================================================
   ЕЦС · utm.js — работа с UTM-метками.
   Сохраняет первый и последний источник визита,
   прокидывает метки во внутренние ссылки и в каждый лид.
   ============================================================ */
(function () {
  "use strict";
  window.ECS = window.ECS || {};

  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  // yclid/gclid — идентификаторы клика Яндекс.Директа/Google Ads: нужны для офлайн-конверсий
  // (выгрузка сделок из CRM обратно в рекламный кабинет). Сохраняем в first/last touch.
  var CLICK_IDS = ["yclid", "gclid"];
  var TRACKED = KEYS.concat(CLICK_IDS);

  function parse() {
    var p = new URLSearchParams(location.search), out = {}, found = false;
    TRACKED.forEach(function (k) {
      if (p.get(k)) { out[k] = p.get(k); found = true; }
    });
    return found ? out : null;
  }

  function store() {
    var utm = parse();
    var now = new Date().toISOString();
    try {
      if (utm) {
        localStorage.setItem("ecs_utm_last", JSON.stringify({ utm: utm, at: now, page: location.pathname }));
        if (!localStorage.getItem("ecs_utm_first")) {
          localStorage.setItem("ecs_utm_first", JSON.stringify({ utm: utm, at: now, page: location.pathname, referrer: document.referrer }));
        }
      }
      if (!localStorage.getItem("ecs_first_visit")) {
        localStorage.setItem("ecs_first_visit", JSON.stringify({ at: now, referrer: document.referrer, page: location.pathname }));
      }
    } catch (e) { /* приватный режим */ }
  }

  function get() {
    try {
      var last = JSON.parse(localStorage.getItem("ecs_utm_last") || "null");
      var first = JSON.parse(localStorage.getItem("ecs_utm_first") || "null");
      return { last: last && last.utm, first: first && first.utm, referrer: (first && first.referrer) || document.referrer };
    } catch (e) { return { last: parse(), first: null, referrer: document.referrer }; }
  }

  // Пока пользователь ходит по сайту с UTM в адресе — переносим метки во внутренние
  // ссылки, чтобы Метрика корректно атрибуцировала весь визит. Через URL/searchParams:
  // не дублируем уже стоящие параметры и не ломаем якорь (#…), в отличие от «href += ?qs».
  function propagate() {
    var utm = parse();
    if (!utm) return;
    document.querySelectorAll('a[href$=".html"], a[href="/"], a[href^="index"]').forEach(function (a) {
      if (a.host !== location.host && a.getAttribute("href").indexOf("http") === 0) return;
      var u = new URL(a.href, location.origin);
      KEYS.forEach(function (k) { if (utm[k]) u.searchParams.set(k, utm[k]); });
      a.href = u.toString();
    });
  }

  window.ECS.utm = {
    parse: parse,
    get: get,
    init: function () { store(); propagate(); }
  };
})();
