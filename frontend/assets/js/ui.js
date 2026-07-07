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

  /* ---- модалки: [data-modal="lead"] → #leadModal, [data-modal="cheaper"] → #cheaperModal ---- */
  function initModal() {
    function open(modal, product) {
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
      // CRM-форму Битрикс24 монтируем лениво — при первом открытии модалки
      modal.querySelectorAll("[data-b24form]").forEach(function (slot) {
        if (product) slot.setAttribute("data-product", product);
        if (window.ECS.leads && window.ECS.leads.mount) window.ECS.leads.mount(slot);
      });
      window.ecsTrack("lead_modal_open", { product: product || "", modal: modal.id });
    }
    function closeAll() {
      document.querySelectorAll(".modal.is-open").forEach(function (m) { m.classList.remove("is-open"); });
      document.body.style.overflow = "";
    }
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-modal]");
      if (t) {
        var modal = document.getElementById(t.getAttribute("data-modal") + "Modal");
        if (modal) { e.preventDefault(); open(modal, t.getAttribute("data-product") || document.body.getAttribute("data-product") || ""); return; }
      }
      if (e.target.closest(".modal__close") || e.target.classList.contains("modal__backdrop")) closeAll();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });
    // короткий алиас для fab: открыть модалку заявки
    window.ECS.ui.openModal = function (product) {
      var lead = document.getElementById("leadModal");
      if (lead) open(lead, product);
    };
  }

  /* ---- плавающая кнопка связи ---- */
  function initFab() {
    var items = [];
    if (CFG.bitrixWidgetUrl) items.push({ label: "Чат с менеджером", color: "#2fc6f6", action: "b24chat", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2a8.4 8.4 0 1 1 16.1-4.3Z"/></svg>' });
    if (CFG.whatsapp) items.push({ label: "WhatsApp", color: "#25d366", href: CFG.whatsapp, icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.2 1.1-1.7 1.2-.5 0-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c0 .2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.8 1.4 1.8 2.2 1.2 1.1 2.3 1.4 2.6 1.6.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.2.5.3.6.4 0 .1 0 .7-.3 1.4Z"/></svg>' });
    if (CFG.telegram) items.push({ label: "Telegram", color: "#229ed9", href: CFG.telegram, icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m21.9 4.6-3 14.3c-.2 1-.8 1.2-1.7.8l-4.6-3.4-2.2 2.1c-.2.3-.5.5-.9.5l.3-4.7L18.4 6c.4-.3-.1-.5-.6-.2L7.3 12.4l-4.5-1.4c-1-.3-1-1 .2-1.4l17.6-6.8c.8-.3 1.5.2 1.3 1.8Z"/></svg>' });
    if (CFG.max) items.push({ label: "MAX", color: "transparent", href: CFG.max, icon: '<img src="assets/img/social-icons/max.svg" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">' });
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
      '<svg class="ic-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 1.9Z"/></svg>' +
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
          // data-noscroll — блок раскрывается на месте (рядом с кнопкой), не прокручиваем
          if (!btn.hasAttribute("data-noscroll")) {
            var y = target.getBoundingClientRect().top + window.scrollY - 80; // учитываем шапку
            window.scrollTo({ top: y, behavior: "smooth" });
          }
          window.ecsTrack && window.ecsTrack("toggle_open", { id: target.id });
        } else {
          target.setAttribute("hidden", "");
        }
        btn.classList.toggle("is-open", willOpen);
        btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
    });
  }

  /* ---- вкладки: [data-tabs] → .tabs__tab[data-tab] переключают .tabs__panel[data-panel] ---- */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (root) {
      var tabs = root.querySelectorAll(".tabs__tab");
      var panels = root.querySelectorAll(".tabs__panel");
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var name = tab.getAttribute("data-tab");
          tabs.forEach(function (t) {
            var on = t === tab;
            t.classList.toggle("is-active", on);
            t.setAttribute("aria-selected", on ? "true" : "false");
          });
          panels.forEach(function (p) { p.classList.toggle("is-active", p.getAttribute("data-panel") === name); });
          window.ecsTrack && window.ecsTrack("tab_switch", { tab: name });
        });
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

  /* ---- список страховых (insurers.html): рендер из config + раскрытие ---- */
  function initInsurers() {
    var list = document.getElementById("insurersList");
    if (!list || !Array.isArray(CFG.insurers)) return;
    var chev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
    var esc = function (t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;"); };

    CFG.insurers.forEach(function (ins) {
      var phone = ins.claimPhone
        ? '<a class="ins-line__val" href="tel:' + ins.claimPhone.replace(/[^+\d]/g, "") + '">' + esc(ins.claimPhone) + "</a>"
        : '<span class="ins-line__val ins-line__val--muted">указан в вашем полисе</span>';
      var email = ins.claimEmail
        ? '<a class="ins-line__val" href="mailto:' + esc(ins.claimEmail) + '">' + esc(ins.claimEmail) + "</a>"
        : '<span class="ins-line__val ins-line__val--muted">уточните на сайте страховой</span>';
      var site = ins.site
        ? '<a class="ins-item__site" href="' + esc(ins.site) + '" target="_blank" rel="noopener">Официальный сайт →</a>'
        : "";

      var item = document.createElement("div");
      item.className = "ins-item";
      item.innerHTML =
        '<button class="ins-item__head" type="button" aria-expanded="false">' +
          '<span class="ins-item__name">' + esc(ins.name) + "</span>" +
          '<span class="ins-item__ic">' + chev + "</span>" +
        "</button>" +
        '<div class="ins-item__body"><div class="ins-item__inner">' +
          '<div class="ins-line"><span class="ins-line__label">Звонок при страховом случае</span>' + phone + "</div>" +
          '<div class="ins-line"><span class="ins-line__label">Куда прислать документы</span>' + email + "</div>" +
          site +
        "</div></div>";

      var head = item.querySelector(".ins-item__head");
      var body = item.querySelector(".ins-item__body");
      head.addEventListener("click", function () {
        var open = item.classList.toggle("is-open");
        head.setAttribute("aria-expanded", open ? "true" : "false");
        body.style.maxHeight = open ? body.scrollHeight + "px" : "0";
        if (open) window.ecsTrack && window.ecsTrack("insurer_open", { name: ins.name });
      });
      list.appendChild(item);
    });
  }

  /* ---- JSON-LD (schema.org): InsuranceAgency / FAQPage / BreadcrumbList ---- */
  function initSEO() {
    var base = (CFG.siteUrl || location.origin).replace(/\/$/, "");
    var isHome = /^\/(index\.html)?$/.test(location.pathname) || document.body.getAttribute("data-product") === "Главная";
    var strip = function (t) { return String(t).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(); };
    function emit(obj) {
      var s = document.createElement("script");
      s.type = "application/ld+json";
      s.text = JSON.stringify(obj);
      document.head.appendChild(s);
    }

    if (isHome) {
      var sameAs = [CFG.telegram, CFG.whatsapp, CFG.vk, CFG.max].filter(Boolean);
      var org = {
        "@context": "https://schema.org", "@type": "InsuranceAgency",
        name: "ЕЦС — Единый центр страхования", url: base + "/", image: base + "/assets/img/og.png"
      };
      if (CFG.phoneHref) org.telephone = CFG.phoneHref;
      if (CFG.email) org.email = CFG.email;
      if (CFG.address) org.address = { "@type": "PostalAddress", addressLocality: CFG.address, addressCountry: "RU" };
      if (CFG.officeCoords && CFG.officeCoords.length === 2)
        org.geo = { "@type": "GeoCoordinates", latitude: CFG.officeCoords[0], longitude: CFG.officeCoords[1] };
      if (CFG.workHours) org.openingHours = "Mo-Su 09:00-21:00";
      if (sameAs.length) org.sameAs = sameAs;
      org.areaServed = "Санкт-Петербург";
      emit(org);
    } else {
      var h1 = document.querySelector("h1");
      var name = h1 ? strip(h1.textContent).slice(0, 80) : document.title;
      emit({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: base + "/" },
          { "@type": "ListItem", position: 2, name: name, item: base + location.pathname }
        ]
      });
    }

    if (Array.isArray(window.ECS_FAQ) && window.ECS_FAQ.length) {
      emit({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: window.ECS_FAQ.map(function (it) {
          return { "@type": "Question", name: strip(it.q),
                   acceptedAnswer: { "@type": "Answer", text: strip(it.a) } };
        })
      });
    }
  }

  window.ECS.ui = {
    init: function () { initHeader(); initReveal(); initFAQ(); initModal(); initFab(); initContacts(); initToggles(); initTabs(); initAccordions(); initInsurers(); initSEO(); }
  };
})();
