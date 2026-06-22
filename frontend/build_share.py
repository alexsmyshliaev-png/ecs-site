#!/usr/bin/env python3
"""Сборка «пересылаемой» версии сайта: dist/ + zip.

Каждая страница превращается в один самодостаточный .html:
CSS и JS встраиваются внутрь, картинки (включая фоны из CSS) — в base64.
Такие файлы можно отправить в мессенджере или почтой — они откроются
у получателя без папки assets и без веб-сервера.

Запуск:  cd frontend && python3 build_share.py
Результат: ../dist/*.html и ../ЕЦС-сайт-демо.zip

Что требует интернета у получателя (и не работает с пересланного файла
в любом случае): шрифт Inter (Google Fonts, без сети откроется системным),
калькуляторы Финуслуг/polis812, виджет Битрикс24, Яндекс.Карты.
"""
import base64
import mimetypes
import os
import re
import zipfile

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)
DIST = os.path.join(ROOT, "dist")
ZIP_PATH = os.path.join(ROOT, "ЕЦС-сайт-демо.zip")

PAGES = ["index.html", "osago.html", "kasko.html", "property.html", "travel.html",
         "business.html", "office.html", "insurers.html", "privacy.html"]


def data_uri(path: str) -> str:
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
    with open(path, "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode()


def inline_css(css_path: str) -> str:
    """Читает CSS и заменяет url("../img/…") на data URI."""
    css = open(css_path, encoding="utf-8").read()

    def repl(m: re.Match) -> str:
        rel = m.group(1)
        img = os.path.normpath(os.path.join(os.path.dirname(css_path), rel))
        if os.path.exists(img):
            return f'url("{data_uri(img)}")'
        return m.group(0)

    return re.sub(r'url\("([^"):]+)"\)', repl, css)


def build_page(name: str) -> str:
    html = open(os.path.join(BASE, name), encoding="utf-8").read()

    # <link rel="stylesheet" href="assets/css/X.css"> -> <style>…</style>
    def css_repl(m: re.Match) -> str:
        return "<style>\n" + inline_css(os.path.join(BASE, m.group(1))) + "\n</style>"

    html = re.sub(r'<link rel="stylesheet" href="(assets/css/[^"]+)">', css_repl, html)

    # <script src="assets/js/X.js"></script> -> <script>…</script>
    def js_repl(m: re.Match) -> str:
        js = open(os.path.join(BASE, m.group(1)), encoding="utf-8").read()
        return "<script>\n" + js + "\n</script>"

    html = re.sub(r'<script src="(assets/js/[^"]+)"></script>', js_repl, html)

    # <img src="assets/img/X.png" -> data URI
    def img_repl(m: re.Match) -> str:
        img = os.path.join(BASE, m.group(1))
        if os.path.exists(img):
            return f'src="{data_uri(img)}"'
        return m.group(0)

    html = re.sub(r'src="(assets/img/[^"]+)"', img_repl, html)
    return html


def main() -> None:
    os.makedirs(DIST, exist_ok=True)
    for name in PAGES:
        out = os.path.join(DIST, name)
        with open(out, "w", encoding="utf-8") as f:
            f.write(build_page(name))
        size = os.path.getsize(out) // 1024
        print(f"  {name:<16} {size} КБ")

    with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as z:
        for name in PAGES:
            z.write(os.path.join(DIST, name), name)
    print(f"\nГотово: dist/ и {os.path.basename(ZIP_PATH)} "
          f"({os.path.getsize(ZIP_PATH) // 1024} КБ)")


if __name__ == "__main__":
    main()
