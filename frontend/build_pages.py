# -*- coding: utf-8 -*-
"""Синхронизация общих блоков сайта ЕЦС.

Берёт ЭТАЛОННЫЕ общие блоки из index.html (шапка, мобильное меню, футер
вместе с модалкой заявки) и обновляет их во всех подстраницах.
Контент <main> каждой страницы НЕ трогается — поэтому уникальные блоки
страниц (hero, секции, кнопки-контакты) не теряются.

Раньше скрипт пересобирал страницы из захардкоженного в нём контента и при
запуске затирал правки, внесённые прямо в .html (так пропадали кнопки).
Теперь правь контент прямо в нужном <main>, а общую «обвязку» — в index.html
и запускай этот скрипт, чтобы разнести её по всем страницам.

Запуск: cd frontend && python3 build_pages.py
"""
import io, os, re

BASE = os.path.dirname(os.path.abspath(__file__))

# страницы, куда разносим общие блоки (index.html — источник, его не трогаем)
PAGES = ["kasko.html", "property.html", "travel.html",
         "business.html", "office.html", "privacy.html"]

FOOTER_START = "<!-- ===================== FOOTER"
FOOTER_END = '<script src="assets/js/config.js">'


def region(text, start, end):
    """Вырезает кусок от start до первого end (включительно)."""
    i = text.find(start)
    if i == -1:
        raise ValueError("не найден блок: %r" % start)
    j = text.find(end, i)
    if j == -1:
        raise ValueError("не найден конец блока для: %r" % start)
    return text[i:j + len(end)]


def footer_region(text):
    """Футер + модалка: от комментария FOOTER до подключения config.js."""
    i = text.find(FOOTER_START)
    j = text.find(FOOTER_END, i)
    if i == -1 or j == -1:
        raise ValueError("не найден футер")
    return text[i:j]


def modal_product(footer_text):
    """Достаёт data-product модалки заявки из футер-блока (или None)."""
    m = re.search(r'data-form="modal" data-product="([^"]*)"', footer_text)
    return m.group(1) if m else None


# --- эталонные блоки из index.html ---
src = io.open(os.path.join(BASE, "index.html"), encoding="utf-8").read()
header_src = region(src, '<header class="header"', "</header>")
mobnav_src = region(src, '<div class="mobnav"', "</div>")
footer_src = footer_region(src)

# снимаем активный пункт меню — назначим свой на каждой странице
header_base = header_src.replace(' class="is-active"', "")
mobnav_base = mobnav_src.replace(' class="is-active"', "")

for fname in PAGES:
    path = os.path.join(BASE, fname)
    if not os.path.exists(path):
        print("пропуск (нет файла):", fname)
        continue
    page = io.open(path, encoding="utf-8").read()

    # активный пункт меню для этой страницы
    h = header_base.replace('href="%s"' % fname, 'href="%s" class="is-active"' % fname)
    m = mobnav_base.replace('href="%s"' % fname, 'href="%s" class="is-active"' % fname)

    # футер: сохраняем data-product модалки именно этой страницы
    old_footer = footer_region(page)
    product = modal_product(old_footer)
    f = footer_src
    if product is not None:
        f = footer_src.replace('data-form="modal" data-product="ОСАГО"',
                               'data-form="modal" data-product="%s"' % product, 1)

    # точечная замена общих блоков, контент <main> не трогаем
    page = page.replace(region(page, '<header class="header"', "</header>"), h, 1)
    page = page.replace(region(page, '<div class="mobnav"', "</div>"), m, 1)
    page = page.replace(old_footer, f, 1)

    io.open(path, "w", encoding="utf-8").write(page)
    print("синхронизировано:", fname)

print("OK")
