/* ============================================================
   ЕЦС · ui.js — интерфейсные механики:
   шапка, мобильное меню, reveal-анимации, FAQ-аккордеон,
   модалка заявки, плавающая кнопка связи.
   ============================================================ */
(function () {
  "use strict";
  window.ECS = window.ECS || {};
  var CFG = window.ECS_CONFIG || {};

  /* ---- шапка и мобильное меню ---- */
  function initHeader() {
    var header = document.getElementById("header");
    if (header) {
      var onScroll = function () { header.classList.toggle("is-stuck", window.scrollY > 8); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    var burger = document.querySelector(".burger");
    var mobnav = document.getElementById("mobnav");
    if (burger && mobnav) {
      burger.addEventListener("click", function () { mobnav.classList.toggle("is-open"); });
      mobnav.addEventListener("click", function (e) { if (e.target.tagName === "A") mobnav.classList.remove("is-open"); });
    }
  }

  /* ---- появление блоков при прокрутке ---- */
  function initReveal() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }

  /* ---- FAQ: страница задаёт window.ECS_FAQ = [{q, a}, ...] ---- */
  function initFAQ() {
    var list = document.getElementById("faqList");
    if (!list || !window.ECS_FAQ) return;
    window.ECS_FAQ.forEach(function (item) {
      var qa = document.createElement("div");
      qa.className = "qa";
      qa.innerHTML =
        '<button class="qa__q" type="button">' + item.q +
        '<span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg></span>' +
        '</button><div class="qa__a"><p>' + item.a + "</p></div>";
      var btn = qa.querySelector(".qa__q"), ans = qa.querySelector(".qa__a");
      btn.addEventListener("click", function () {
        var openNow = qa.classList.toggle("is-open");
        ans.style.maxHeight = openNow ? ans.scrollHeight + "px" : "0";
        if (openNow) window.ecsTrack("faq_open", { question: item.q.slice(0, 60) });
      });
      list.appendChild(qa);
    });
  }

  /* ---- модалка «Связаться с менеджером»: [data-modal="lead"] ---- */
  function initModal() {
    var modal = document.getElementById("leadModal");
    if (!modal) return;
    function open(product) {
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
      var f = modal.querySelector("form");
      if (f && product) f.setAttribute("data-product", product);
      window.ecsTrack("lead_modal_open", { product: product || "" });
    }
    function close() {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    document.addEventListener("click", function (e) {
      var t = e.target.closest('[data-modal="lead"]');
      if (t) { e.preventDefault(); open(t.getAttribute("data-product") || document.body.getAttribute("data-product") || ""); }
      if (e.target.closest(".modal__close") || e.target.classList.contains("modal__backdrop")) close();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    window.ECS.ui.openModal = open;
  }

  /* ---- плавающая кнопка связи ---- */
  function initFab() {
    var items = [];
    if (CFG.bitrixWidgetUrl) items.push({ label: "Чат с менеджером", color: "#2fc6f6", action: "b24chat", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2a8.4 8.4 0 1 1 16.1-4.3Z"/></svg>' });
    if (CFG.whatsapp) items.push({ label: "WhatsApp", color: "#25d366", href: CFG.whatsapp, icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.2 1.1-1.7 1.2-.5 0-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c0 .2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.8 1.4 1.8 2.2 1.2 1.1 2.3 1.4 2.6 1.6.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.2.5.3.6.4 0 .1 0 .7-.3 1.4Z"/></svg>' });
    if (CFG.telegram) items.push({ label: "Telegram", color: "#229ed9", href: CFG.telegram, icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m21.9 4.6-3 14.3c-.2 1-.8 1.2-1.7.8l-4.6-3.4-2.2 2.1c-.2.3-.5.5-.9.5l.3-4.7L18.4 6c.4-.3-.1-.5-.6-.2L7.3 12.4l-4.5-1.4c-1-.3-1-1 .2-1.4l17.6-6.8c.8-.3 1.5.2 1.3 1.8Z"/></svg>' });
    items.push({ label: "Позвонить", color: "#e60023", href: "tel:" + (CFG.phoneHref || ""), icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 1.9Z"/></svg>' });
    items.push({ label: "Оставить заявку", color: "#232325", action: "lead", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v12H7l-3 3V4Z"/><path d="M8 9h8M8 12h5"/></svg>' });

    var fab = document.createElement("div");
    fab.className = "fab";
    fab.innerHTML =
      '<div class="fab__menu">' + items.map(function (it) {
        var inner = '<span class="ic" style="background:' + it.color + '">' + it.icon + "</span>" + it.label;
        return it.href
          ? '<a class="fab__item" data-track="fab_' + (it.action || it.label) + '" href="' + it.href + '" target="' + (it.href.indexOf("tel:") === 0 ? "_self" : "_blank") + '" rel="noopener">' + inner + "</a>"
          : '<button class="fab__item" type="button" data-fab-action="' + it.action + '">' + inner + "</button>";
      }).join("") + "</div>" +
      '<button class="fab__toggle" type="button" aria-label="Связаться с нами">' +
      '<svg class="ic-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2a8.4 8.4 0 1 1 16.1-4.3Z"/><path d="M8 10h8M8 13h5"/></svg>' +
      '<svg class="ic-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
      "</button>";
    document.body.appendChild(fab);

    fab.querySelector(".fab__toggle").addEventListener("click", function () {
      fab.classList.toggle("is-open");
      if (fab.classList.contains("is-open")) window.ecsTrack("fab_open");
    });
    fab.addEventListener("click", function (e) {
      var b = e.target.closest("[data-fab-action]");
      if (!b) return;
      fab.classList.remove("is-open");
      if (b.getAttribute("data-fab-action") === "b24chat" && window.BX24Widget) {
        window.ecsTrack("fab_b24chat");
      } else if (window.ECS.ui.openModal) {
        window.ECS.ui.openModal(document.body.getAttribute("data-product") || "");
        window.ecsTrack("fab_lead");
      }
    });
  }

  /* ---- контакты-мессенджеры в hero: ссылки берём из config.js ---- */
  function initContacts() {
    document.querySelectorAll("a[data-soc]").forEach(function (a) {
      var url = CFG[a.getAttribute("data-soc")];
      if (url) a.setAttribute("href", url);   // config — единый источник правды
      else a.style.display = "none";           // нет ссылки в конфиге — прячем ячейку
    });
  }

  /* ---- кнопки, раскрывающие скрытый блок (data-toggle="id") ---- */
  function initToggles() {
    document.querySelectorAll("[data-toggle]").forEach(function (btn) {
      var target = document.getElementById(btn.getAttribute("data-toggle"));
      if (!target) return;
      btn.addEventListener("click", function () {
        var willOpen = target.hasAttribute("hidden");
        if (willOpen) {
          target.removeAttribute("hidden");
          // блоки внутри показываем сразу, не дожидаясь скролл-анимации
          target.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
          var y = target.getBoundingClientRect().top + window.scrollY - 80; // учитываем шапку
          window.scrollTo({ top: y, behavior: "smooth" });
          window.ecsTrack && window.ecsTrack("toggle_open", { id: target.id });
        } else {
          target.setAttribute("hidden", "");
        }
        btn.classList.toggle("is-open", willOpen);
        btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
    });
  }

  /* ---- вложенные аккордеоны (.acc) с плавным раскрытием ---- */
  function initAccordions() {
    document.querySelectorAll(".acc").forEach(function (acc) {
      var head = acc.querySelector(".acc__head");
      var body = acc.querySelector(".acc__body");
      if (!head || !body) return;
      head.addEventListener("click", function () {
        var open = acc.classList.toggle("is-open");
        head.setAttribute("aria-expanded", open ? "true" : "false");
        // фиксируем текущую высоту, затем анимируем к цели
        body.style.maxHeight = body.scrollHeight + "px";
        if (!open) requestAnimationFrame(function () { body.style.maxHeight = "0px"; });
        if (open) window.ecsTrack && window.ecsTrack("acc_open", { id: head.getAttribute("data-track") || "" });
      });
      // после раскрытия снимаем ограничение, чтобы контент не обрезался при рефлоу
      body.addEventListener("transitionend", function (e) {
        if (e.propertyName === "max-height" && acc.classList.contains("is-open")) {
          body.style.maxHeight = "none";
        }
      });
    });
  }

  window.ECS.ui = {
    init: function () { initHeader(); initReveal(); initFAQ(); initModal(); initFab(); initContacts(); initToggles(); initAccordions(); }
  };
})();
