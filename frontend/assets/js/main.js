/* ============================================================
   ЕЦС · main.js — только инициализация модулей.
   Порядок подключения на странице:
   config.js → utm.js → analytics.js → bitrix.js → leads.js → ui.js → main.js
   ============================================================ */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    window.ECS.utm.init();
    window.ECS.analytics.init();
    window.ECS.bitrix.init();
    window.ECS.leads.init();
    window.ECS.ui.init();
    window.ecsTrack("page_view", { title: document.title });
  });
})();
