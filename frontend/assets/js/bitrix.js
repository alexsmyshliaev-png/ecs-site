/* ============================================================
   ЕЦС · bitrix.js — виджет Битрикс24 (онлайн-чат, CRM-формы,
   обратный звонок). Включается, когда в config.js заполнен
   bitrixWidgetUrl. Отправка лидов — в leads.js.
   ============================================================ */
(function () {
  "use strict";
  window.ECS = window.ECS || {};
  var CFG = window.ECS_CONFIG || {};

  function initWidget() {
    if (!CFG.bitrixWidgetUrl) return;
    (function (w, d, u) {
      var s = d.createElement("script"); s.async = true;
      s.src = u + "?" + ((Date.now() / 60000) | 0);
      var h = d.getElementsByTagName("script")[0]; h.parentNode.insertBefore(s, h);
    })(window, document, CFG.bitrixWidgetUrl);
  }

  window.ECS.bitrix = { init: initWidget };
})();
