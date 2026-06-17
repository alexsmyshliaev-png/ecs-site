/* ============================================================
   ЕЦС · leads.js — приём заявок.
   Порядок отправки лида:
   1) наш бэкенд /api/leads (он сам перешлёт в Битрикс24) —
      вебхук не светится в браузере;
   2) если бэкенда нет — прямой вебхук Битрикс24 из config.js;
   3) если нет и его — лид сохраняется в localStorage,
      чтобы ни одна заявка не потерялась.
   ============================================================ */
(function () {
  "use strict";
  window.ECS = window.ECS || {};
  var CFG = window.ECS_CONFIG || {};

  function submit(data) {
    var utm = window.ECS.utm ? window.ECS.utm.get() : {};
    var lead = Object.assign({}, data, {
      utm_last: utm.last || null,
      utm_first: utm.first || null,
      referrer: utm.referrer || "",
      page: location.href,
      ts: new Date().toISOString()
    });

    window.ecsTrack("lead_submit", { form: data.form || "default", product: data.product || "" });

    if (CFG.apiUrl) {
      return fetch(CFG.apiUrl.replace(/\/$/, "") + "/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
      }).catch(function (err) {
        console.warn("API lead error, fallback:", err);
        return fallback(lead);
      });
    }
    return fallback(lead);
  }

  function fallback(lead) {
    if (CFG.bitrixWebhookUrl) {
      // crm.item.add с entityTypeId=1 (лид) — crm.lead.add устарел
      var u = lead.utm_last || lead.utm_first || {};
      var fields = {
        title: "Сайт ЕЦС: " + (lead.product || "заявка") + " — " + (lead.name || ""),
        name: lead.name || "",
        comments: (lead.comment || "") + "\nСтраница: " + lead.page,
        sourceId: "WEB",
        utmSource: u.utm_source || "",
        utmMedium: u.utm_medium || "",
        utmCampaign: u.utm_campaign || "",
        utmContent: u.utm_content || "",
        utmTerm: u.utm_term || ""
      };
      var fm = [];
      if (lead.phone) fm.push({ typeId: "PHONE", valueType: "WORK", value: lead.phone });
      if (lead.email) fm.push({ typeId: "EMAIL", valueType: "WORK", value: lead.email });
      if (fm.length) fields.fm = fm;
      return fetch(CFG.bitrixWebhookUrl.replace(/\/$/, "") + "/crm.item.add.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityTypeId: 1, fields: fields })
      }).catch(function (err) { console.warn("Bitrix24 lead error:", err); });
    }
    try {
      var q = JSON.parse(localStorage.getItem("ecs_leads") || "[]");
      q.push(lead);
      localStorage.setItem("ecs_leads", JSON.stringify(q));
    } catch (e) {}
    return Promise.resolve();
  }

  /* ---- формы form.js-lead-form ---- */
  function initForms() {
    document.querySelectorAll("form.js-lead-form").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var phone = form.querySelector('[name="phone"]');
        if (phone && phone.value.replace(/\D/g, "").length < 10) {
          phone.classList.add("is-invalid");
          phone.focus();
          return;
        }
        if (phone) phone.classList.remove("is-invalid");

        var data = { form: form.getAttribute("data-form") || "lead", product: form.getAttribute("data-product") || "" };
        new FormData(form).forEach(function (v, k) { if (k !== "agree") data[k] = v; });

        var btn = form.querySelector('[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = "Отправляем…"; }

        submit(data).then(function () {
          var box = form.closest(".lead");
          if (box) box.classList.add("is-done");
          else { form.innerHTML = '<p style="font-weight:700">Спасибо! Мы свяжемся с вами в ближайшее время.</p>'; }
        });
      });
    });

    // лёгкая маска телефона
    document.querySelectorAll('input[name="phone"]').forEach(function (inp) {
      inp.addEventListener("input", function () {
        var d = inp.value.replace(/\D/g, "").slice(0, 11);
        if (d.startsWith("8")) d = "7" + d.slice(1);
        if (!d) { inp.value = ""; return; }
        if (!d.startsWith("7")) d = "7" + d;
        var s = "+7";
        if (d.length > 1) s += " (" + d.slice(1, 4);
        if (d.length >= 4) s += ") " + d.slice(4, 7);
        if (d.length >= 7) s += "-" + d.slice(7, 9);
        if (d.length >= 9) s += "-" + d.slice(9, 11);
        inp.value = s;
      });
    });
  }

  window.ECS.leads = { submit: submit, init: initForms };
  window.ecsLead = submit; // короткий алиас
})();
