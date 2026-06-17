# -*- coding: utf-8 -*-
"""Генерирует страницы сайта ЕЦС из общих блоков index.html
(шапка, мобильное меню, футер, модалка) + уникальный контент каждой страницы.
Запуск: python3 build_pages.py"""
import io, os, re

BASE = os.path.dirname(os.path.abspath(__file__))
src = io.open(os.path.join(BASE, "index.html"), encoding="utf-8").read()

# --- общие блоки из index.html ---
header = src[src.find('<header class="header"'):src.find("</header>") + 9]
mob_i = src.find('<div class="mobnav"')
mobnav = src[mob_i:src.find("</div>", mob_i) + 6]
footer = src[src.find("<!-- ===================== FOOTER"):src.find('<script src="assets/js/config.js">')]

# снимаем активный пункт меню (назначим свой на каждой странице)
header = header.replace(' class="is-active"', "")
mobnav = mobnav.replace(' class="is-active"', "")

SHELL = u"""<!DOCTYPE html>
<html lang="ru"{theme}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/tokens.css">
  <link rel="stylesheet" href="assets/css/base.css">
  <link rel="stylesheet" href="assets/css/components.css">
</head>
<body data-product="{product}"{bodycls}>

{header}

{mobnav}

{main}

{footer}<script src="assets/js/config.js"></script>
<script src="assets/js/utm.js"></script>
<script src="assets/js/analytics.js"></script>
<script src="assets/js/bitrix.js"></script>
<script src="assets/js/leads.js"></script>
<script src="assets/js/ui.js"></script>
<script src="assets/js/main.js"></script>
<script>
{script}
</script>
{extra}
</body>
</html>
"""

def build(fname, title, desc, product, main, script, theme="", bodycls="", extra=""):
    h = header.replace('href="%s"' % fname, 'href="%s" class="is-active"' % fname)
    m = mobnav.replace('href="%s"' % fname, 'href="%s" class="is-active"' % fname)
    f = footer.replace('data-product="ОСАГО"', 'data-product="%s"' % product)
    html = SHELL.format(
        theme=theme, title=title, desc=desc, product=product,
        bodycls=(' class="%s"' % bodycls if bodycls else ""),
        header=h, mobnav=m, main=main, footer=f, script=script, extra=extra)
    io.open(os.path.join(BASE, fname), "w", encoding="utf-8").write(html)
    print("built", fname)

PH_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><circle cx="12" cy="13" r="4"/></svg>'

TRUST = u"""<div class="hero__trust">
        <div><b><span class="u">15</span>+</b><span>лет на рынке</span></div>
        <div><b><span class="u">0</span>&nbsp;₽</b><span>наша комиссия</span></div>
        <div><b><span class="u">9</span></b><span>ведущих страховых</span></div>
      </div>"""


# ============================================================
# КАСКО
# ============================================================
kasko_main = u"""<main id="top">

  <section class="hero hero--page">
    <div class="wrap hero__grid">
      <div class="hero__copy">
        <div class="hero__eyebrow eyebrow">Полная защита автомобиля</div>
        <h1><span class="accent">КАСКО</span><br>под ваш автомобиль<br>и бюджет</h1>
        <p class="hero__lead">Запросим цены в девяти страховых, уберём лишние опции и согласуем скидку. Вы платите только за полис.</p>
        <div class="hero__cta">
          <a class="btn btn--primary btn--lg" href="#" data-modal="lead" data-product="КАСКО" data-track="cta_hero_kasko">Получить расчёт</a>
          <a class="btn btn--ghost btn--lg" href="office.html" data-track="cta_hero_office">Посетить офис</a>
        </div>
        """ + TRUST + u"""
      </div>

      <div class="hero__panel reveal">
        <h3>Почему здесь нет калькулятора?</h3>
        <p>Онлайн-калькулятора КАСКО не существует. Цена считается индивидуально — под конкретный автомобиль и конкретных водителей.</p>
        <ul>
          <li>Тариф зависит от 20+ факторов: марка и год, пробег, стаж водителей, регион, место ночной стоянки</li>
          <li>У каждой страховой — собственная модель рисков и свои коэффициенты</li>
          <li>Финальную цену подтверждает андеррайтер после оценки автомобиля</li>
        </ul>
        <p>Поэтому «калькуляторы КАСКО» в интернете — на деле просто формы сбора заявок. Мы считаем честно: запросим реальные цены и пришлём готовые предложения.</p>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="s-head reveal">
        <span class="eyebrow">Что покрывает</span>
        <h2>КАСКО платит там, где ОСАГО бессильно</h2>
        <p>ОСАГО возмещает ущерб только пострадавшей стороне. КАСКО защищает ваш собственный автомобиль.</p>
      </div>
      <div class="bento">
        <article class="card card--feature card--photo b-1 reveal">
          <div class="card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg></div>
          <h3>ДТП — даже по вашей вине</h3>
          <p>Ремонт вашего автомобиля независимо от того, кто виноват в аварии. Включая случаи, когда виновник скрылся.</p>
          <span class="card__tag">Главный риск</span>
        </article>
        <article class="card b-2 reveal">
          <div class="card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
          <h3>Угон и хищение</h3>
          <p>Возмещение стоимости автомобиля при угоне или краже отдельных элементов.</p>
        </article>
        <article class="card card--accent b-3 reveal">
          <div class="card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg></div>
          <h3>Стихия и вандализм</h3>
          <p>Град, упавшее дерево, потоп, поджог, царапины во дворе — всё это страховой случай.</p>
        </article>
        <article class="card card--feature card--photo b-4 reveal">
          <div class="card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V5l-8-3Z"/></svg></div>
          <h3>Полная гибель (тотал)</h3>
          <p>Если восстанавливать автомобиль нецелесообразно — получите выплату в размере его стоимости.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="s-head reveal">
        <span class="eyebrow">Сравнение</span>
        <h2>ОСАГО и КАСКО — это разные полисы</h2>
      </div>
      <div class="reveal" style="overflow-x:auto">
        <table class="cmp">
          <tr><th></th><th>ОСАГО</th><th>КАСКО</th></tr>
          <tr><td>Обязателен по закону</td><td class="yes">Да</td><td class="no">Нет, добровольно</td></tr>
          <tr><td>Ремонт чужого автомобиля</td><td class="yes">Да</td><td class="no">—</td></tr>
          <tr><td>Ремонт вашего автомобиля</td><td class="no">—</td><td class="yes">Да</td></tr>
          <tr><td>Угон, стихия, вандализм</td><td class="no">—</td><td class="yes">Да</td></tr>
          <tr><td>Максимальная выплата</td><td>До 400 000 ₽ за имущество</td><td>Полная стоимость автомобиля</td></tr>
          <tr><td>Как считается цена</td><td>Единый тариф ЦБ + коэффициенты</td><td>Индивидуально под автомобиль</td></tr>
        </table>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="s-head reveal">
        <span class="eyebrow">Как это работает</span>
        <h2>Реальный расчёт за один день</h2>
      </div>
      <div class="steps">
        <article class="step reveal">
          <span class="step__n"><i>1</i> Шаг 1</span>
          <h3>Оставьте заявку</h3>
          <p>Имя, телефон и пара слов об автомобиле — этого достаточно, чтобы начать.</p>
        </article>
        <article class="step reveal">
          <span class="step__n"><i>2</i> Шаг 2</span>
          <h3>Уточним детали</h3>
          <p>Один звонок на 5 минут: водители, пробег, как храните автомобиль, нужна ли франшиза.</p>
        </article>
        <article class="step reveal">
          <span class="step__n"><i>3</i> Шаг 3</span>
          <h3>Сравните предложения</h3>
          <p>Пришлём расчёты из девяти страховых с честным сравнением цен и условий. Выбор — за вами.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section" id="lead">
    <div class="wrap" style="max-width:760px">
      <div class="lead reveal">
        <h3>Получите индивидуальный расчёт КАСКО</h3>
        <p>Бесплатно и без обязательств. Пришлём предложения девяти страховых в течение рабочего дня.</p>
        <form class="js-lead-form" data-form="kasko-page" data-product="КАСКО">
          <div class="lead__grid">
            <div class="field"><label for="k-name">Имя</label><input id="k-name" name="name" type="text" placeholder="Как к вам обращаться" required></div>
            <div class="field"><label for="k-phone">Телефон</label><input id="k-phone" name="phone" type="tel" placeholder="+7 (___) ___-__-__" required></div>
            <div class="field field--wide"><label for="k-car">Автомобиль</label><input id="k-car" name="car" type="text" placeholder="Например: Kia Rio, 2021"></div>
            <div class="field field--wide"><label for="k-comment">Комментарий</label><textarea id="k-comment" name="comment" placeholder="Кредитный автомобиль, нужна франшиза, особые пожелания…"></textarea></div>
          </div>
          <label class="lead__agree"><input type="checkbox" name="agree" required> Соглашаюсь с политикой обработки персональных данных</label>
          <button class="btn btn--primary lead__submit" type="submit">Получить расчёт</button>
        </form>
        <div class="lead__done">
          <div class="ok-ic">✓</div>
          <h3>Заявка отправлена!</h3>
          <p style="color:var(--muted);margin-top:10px">Менеджер свяжется с вами и уточнит детали расчёта.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap faq">
      <aside class="faq__aside reveal">
        <span class="eyebrow">FAQ</span>
        <div class="s-head" style="margin:14px 0 28px">
          <h2 style="font-size:clamp(28px,3.2vw,40px)">Часто задаваемые вопросы</h2>
        </div>
        <div class="faq__card">
          <h3>Не нашли ответ?</h3>
          <p>Напишите менеджеру — разберём ваш автомобиль и подберём программу под бюджет.</p>
          <a class="btn btn--primary" href="#" data-modal="lead" data-product="КАСКО" data-track="cta_faq_manager">Связаться с менеджером</a>
        </div>
      </aside>
      <div class="faq__list" id="faqList"></div>
    </div>
  </section>

  <section class="section--tight">
    <div class="wrap">
      <div class="cta-band reveal">
        <h2>Узнайте реальную цену КАСКО</h2>
        <p>Без «калькуляторов»-обманок: настоящие предложения девяти страховых за один день.</p>
        <div class="row">
          <a class="btn btn--primary btn--lg" href="#lead" data-track="cta_band_kasko">Получить расчёт</a>
          <a class="btn btn--outline btn--lg" href="tel:+78001234567" data-track="cta_band_call">Позвонить</a>
        </div>
      </div>
    </div>
  </section>

</main>"""

kasko_script = u"""  window.ECS_FAQ = [
    { q: "Что такое франшиза и зачем она нужна?", a: "Франшиза — часть ущерба, которую вы берёте на себя (например, первые 15 000 ₽). Полис с франшизой дешевле на 20–40%. Подскажем, какой размер выгоден именно вам." },
    { q: "Можно ли платить за КАСКО в рассрочку?", a: "Да, большинство страховых разрешают оплату в 2–4 платежа без переплаты. Уточним доступные варианты при расчёте." },
    { q: "У меня кредитный автомобиль. КАСКО обязательно?", a: "Если автомобиль в залоге у банка — да, банк требует КАСКО. Мы подберём полис, который примет ваш банк, и поможем не переплачивать за навязанные опции." },
    { q: "Страхуете ли подержанные автомобили?", a: "Да. Возраст автомобиля влияет на тариф и набор рисков, но программы есть почти для любых машин. Для авто старше 7–10 лет подберём усечённые программы — например, только угон и тотал." },
    { q: "Как снизить цену КАСКО?", a: "Рабочие способы: франшиза, ограниченный список водителей, телематика, усечённое покрытие (угон + тотал), охранные системы. Покажем, сколько экономит каждый вариант." }
  ];"""

build("kasko.html",
      u"КАСКО — индивидуальный расчёт без переплат | ЕЦС",
      u"КАСКО под ваш автомобиль и бюджет. Честный расчёт в девяти страховых компаниях за один день, без комиссии. Объясняем, почему калькулятора КАСКО не существует.",
      u"КАСКО", kasko_main, kasko_script)

# ============================================================
# ИМУЩЕСТВО
# ============================================================
prop_main = u"""<main id="top">

  <section class="hero hero--page">
    <div class="wrap hero__grid">
      <div class="hero__copy">
        <div class="hero__eyebrow eyebrow">Дом под защитой</div>
        <h1>Страхование<br><span class="accent">квартиры</span> и дома</h1>
        <p class="hero__lead">Полис от залива, пожара и кражи — от пары сотен рублей в месяц. Подберём программу под вашу квартиру, дом или дачу.</p>
        <div class="hero__cta">
          <a class="btn btn--primary btn--lg" href="#lead" data-track="cta_hero_property">Подобрать программу</a>
          <a class="btn btn--ghost btn--lg" href="office.html" data-track="cta_hero_office">Посетить офис</a>
        </div>
        """ + TRUST + u"""
      </div>

      <div class="hero__panel reveal">
        <h3>Что можно застраховать</h3>
        <p>Программа собирается из блоков — платите только за нужное.</p>
        <ul>
          <li>Отделку и ремонт — стены, полы, потолки, инженерные сети</li>
          <li>Имущество — мебель, технику, личные вещи</li>
          <li>Конструктив — сам «коробку» квартиры или дома</li>
          <li>Ответственность перед соседями — если затопили или устроили пожар вы</li>
        </ul>
        <p>Цена зависит от объекта и набора рисков, поэтому точную стоимость считает менеджер — бесплатно и за один звонок.</p>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="s-head reveal">
        <span class="eyebrow">От чего защищает</span>
        <h2>Четыре риска, которые случаются чаще всего</h2>
      </div>
      <div class="bento">
        <article class="card card--feature card--photo b-1 reveal">
          <div class="card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.7 5.6 9a7 7 0 1 0 12.8 0L12 2.7Z"/></svg></div>
          <h3>Залив</h3>
          <p>Самый частый случай: прорвало трубу, сосед забыл закрыть кран, потёк стояк. Страховая оплатит ремонт и испорченное имущество.</p>
          <span class="card__tag">№1 по числу обращений</span>
        </article>
        <article class="card b-2 reveal">
          <div class="card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.2-.2-4.2 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.5-2.4 1.5-3.5.5 1.5 1 2 2 3Z"/></svg></div>
          <h3>Пожар</h3>
          <p>Возгорание, короткое замыкание, удар молнии — и последствия тушения тоже.</p>
        </article>
        <article class="card card--accent b-3 reveal">
          <div class="card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
          <h3>Кража и взлом</h3>
          <p>Похищенное имущество и повреждения при проникновении компенсирует страховая.</p>
        </article>
        <article class="card card--feature card--photo b-4 reveal">
          <div class="card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg></div>
          <h3>Ответственность перед соседями</h3>
          <p>Если источник потопа или пожара — ваша квартира, ремонт соседям оплатит страховая, а не вы. Самый недооценённый блок полиса.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="s-head reveal">
        <span class="eyebrow">Программы</span>
        <h2>Под любой объект</h2>
      </div>
      <div class="steps">
        <article class="step reveal">
          <span class="step__n"><i>1</i></span>
          <h3>Квартира</h3>
          <p>Коробочные полисы без осмотра — оформление за 15 минут. Для съёмных квартир есть программы для арендаторов и собственников.</p>
        </article>
        <article class="step reveal">
          <span class="step__n"><i>2</i></span>
          <h3>Дом и дача</h3>
          <p>Защита строения, бани, гаража и забора. Учтём материал стен, печное отопление и сезонность проживания.</p>
        </article>
        <article class="step reveal">
          <span class="step__n"><i>3</i></span>
          <h3>Ипотечное страхование</h3>
          <p>Обязательный полис для банка — дешевле, чем предлагает сам банк. Сравним аккредитованные страховые и продлим вовремя.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section" id="lead">
    <div class="wrap" style="max-width:760px">
      <div class="lead reveal">
        <h3>Подберём программу под ваш дом</h3>
        <p>Расскажите пару деталей — пришлём варианты с ценами в течение рабочего дня.</p>
        <form class="js-lead-form" data-form="property-page" data-product="Имущество">
          <div class="lead__grid">
            <div class="field"><label for="p-name">Имя</label><input id="p-name" name="name" type="text" placeholder="Как к вам обращаться" required></div>
            <div class="field"><label for="p-phone">Телефон</label><input id="p-phone" name="phone" type="tel" placeholder="+7 (___) ___-__-__" required></div>
            <div class="field field--wide"><label for="p-object">Что страхуем</label>
              <select id="p-object" name="object">
                <option>Квартира</option>
                <option>Дом / дача</option>
                <option>Ипотечное страхование</option>
                <option>Другое</option>
              </select>
            </div>
            <div class="field field--wide"><label for="p-comment">Комментарий</label><textarea id="p-comment" name="comment" placeholder="Например: двушка 54 м², свежий ремонт, хочу защиту от залива и соседей"></textarea></div>
          </div>
          <label class="lead__agree"><input type="checkbox" name="agree" required> Соглашаюсь с политикой обработки персональных данных</label>
          <button class="btn btn--primary lead__submit" type="submit">Подобрать программу</button>
        </form>
        <div class="lead__done">
          <div class="ok-ic">✓</div>
          <h3>Заявка отправлена!</h3>
          <p style="color:var(--muted);margin-top:10px">Менеджер подберёт варианты и свяжется с вами.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap faq">
      <aside class="faq__aside reveal">
        <span class="eyebrow">FAQ</span>
        <div class="s-head" style="margin:14px 0 28px">
          <h2 style="font-size:clamp(28px,3.2vw,40px)">Часто задаваемые вопросы</h2>
        </div>
        <div class="faq__card">
          <h3>Не нашли ответ?</h3>
          <p>Напишите менеджеру — подскажем программу под ваш объект за 10 минут.</p>
          <a class="btn btn--primary" href="#" data-modal="lead" data-product="Имущество" data-track="cta_faq_manager">Связаться с менеджером</a>
        </div>
      </aside>
      <div class="faq__list" id="faqList"></div>
    </div>
  </section>

  <section class="section--tight">
    <div class="wrap">
      <div class="cta-band reveal">
        <h2>Защитите дом уже сегодня</h2>
        <p>Полис оформляется онлайн за 15 минут и начинает работать без осмотра квартиры.</p>
        <div class="row">
          <a class="btn btn--primary btn--lg" href="#lead" data-track="cta_band_property">Подобрать программу</a>
          <a class="btn btn--outline btn--lg" href="tel:+78001234567" data-track="cta_band_call">Позвонить</a>
        </div>
      </div>
    </div>
  </section>

</main>"""

prop_script = u"""  window.ECS_FAQ = [
    { q: "Нужен ли осмотр квартиры перед страхованием?", a: "Для коробочных программ — нет: выбираете сумму покрытия, и полис начинает действовать. Осмотр нужен только для дорогой отделки и больших страховых сумм." },
    { q: "Сколько стоит полис?", a: "Зависит от объекта и набора рисков: базовая защита квартиры обходится от нескольких сотен рублей в месяц. Менеджер посчитает точную цену за один звонок." },
    { q: "Я снимаю квартиру. Мне это нужно?", a: "Да — есть программы для арендаторов: ваша техника и вещи плюс ответственность перед владельцем и соседями. Стоит недорого, а спасает от очень неприятных расходов." },
    { q: "У меня ипотека. Какой полис требует банк?", a: "Банк требует страхование конструктива. Мы сравним аккредитованные вашим банком страховые — обычно это на 20–40% дешевле, чем оформлять в самом банке." },
    { q: "Как получить выплату при заливе?", a: "Зафиксируйте последствия на фото, вызовите представителя УК для акта и позвоните нам — поможем собрать документы и подать заявление правильно с первого раза." }
  ];"""

build("property.html",
      u"Страхование квартиры, дома и имущества | ЕЦС",
      u"Страхование квартиры, дома и дачи от залива, пожара, кражи. Ответственность перед соседями. Подбор программы в девяти страховых без комиссии.",
      u"Имущество", prop_main, prop_script)

# ============================================================
# ПУТЕШЕСТВИЯ
# ============================================================
travel_main = u"""<main id="top">

  <section class="hero hero--page">
    <div class="wrap hero__grid hero__grid--wide">
      <div class="hero__copy">
        <div class="hero__eyebrow eyebrow">Спокойный отдых</div>
        <h1>Страховка для<br><span class="accent">путешествий</span></h1>
        <p class="hero__lead">Медицина, отмена поездки, багаж и активный отдых. Рассчитайте и оформите онлайн за 3 минуты.</p>
        <div class="hero__cta">
          <a class="btn btn--primary btn--lg" href="#calc" data-track="cta_hero_travel">Рассчитать онлайн</a>
          <a class="btn btn--ghost btn--lg" href="#" data-modal="lead" data-product="Путешествия" data-track="cta_hero_manager">Спросить менеджера</a>
        </div>
        """ + TRUST + u"""
      </div>

      <div class="calc-frame reveal" id="calc">
        <!-- Калькулятор путешествий (polis812) -->
        <script data-params="" data-white-label="true" data-type="vzr" data-title="Туристическая страховка онлайн" data-subtitle="Лучший способ оценить, сравнить и купить страховку от надежных компаний" data-theme="custom" data-colors="%7B%22primary%22%3A%22%23EB0600%22%2C%22secondary%22%3A%22%237CB1FB%22%2C%22accent%22%3A%22%23326AFF%22%2C%22accentHover%22%3A%22%23326AFF%22%2C%22calculatorBlock1%22%3A%22%23F1F6FB%22%2C%22calculatorBlock2%22%3A%22%23AAE9C4%22%2C%22secondaryLight%22%3A%22%23C5DDFE%22%2C%22accentHoverLight%22%3A%22%2392a5ff%22%2C%22accentActive%22%3A%22%232d5fe4%22%2C%22calculatorBlock%22%3A%22%23F1F6FB%22%2C%22optionColor%22%3A%7B%22name%22%3A%22%D0%A7%D0%B5%D1%80%D0%BD%D1%8B%D0%B9%22%2C%22val%22%3A%22%23303030%22%7D%2C%22backgroundColor%22%3A%22%23F7F8FA%22%7D" data-partner="118044" data-partner-ym-id="118044" type="application/javascript" src="https://polis812.ru/wl/loader.js"></script>
        <p class="calc-frame__note">Расчёт и оплата проходят на защищённой платформе партнёра. Полис приходит на email сразу после оплаты.</p>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="s-head reveal">
        <span class="eyebrow">Что покрывает</span>
        <h2>Полис, который реально работает в поездке</h2>
      </div>
      <div class="bento">
        <article class="card card--feature card--photo b-1 reveal">
          <div class="card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
          <h3>Медицина и экстренная помощь</h3>
          <p>Врач, госпитализация, лекарства и транспортировка. Круглосуточный ассистанс на русском языке — один звонок, и вас направят в клинику.</p>
          <span class="card__tag">Основа полиса</span>
        </article>
        <article class="card b-2 reveal">
          <div class="card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div>
          <h3>Отмена поездки</h3>
          <p>Вернём стоимость билетов и отеля, если поездка сорвалась по уважительной причине.</p>
        </article>
        <article class="card card--accent b-3 reveal">
          <div class="card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20h12M6 20a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2M9 7V5a3 3 0 0 1 6 0v2"/></svg></div>
          <h3>Багаж</h3>
          <p>Компенсация за потерянный или задержанный авиакомпанией багаж.</p>
        </article>
        <article class="card card--feature card--photo b-4 reveal">
          <div class="card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 3-5 5-5-5-4 4 5 5-5 5 4 4 5-5 5 5 4-4-5-5 5-5-4-4Z"/></svg></div>
          <h3>Спорт и активный отдых</h3>
          <p>Горные лыжи, дайвинг, серфинг и походы — добавьте опцию «активный отдых», и полис покроет травмы на тренировках и склонах.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap faq">
      <aside class="faq__aside reveal">
        <span class="eyebrow">FAQ</span>
        <div class="s-head" style="margin:14px 0 28px">
          <h2 style="font-size:clamp(28px,3.2vw,40px)">Часто задаваемые вопросы</h2>
        </div>
        <div class="faq__card">
          <h3>Не нашли ответ?</h3>
          <p>Напишите менеджеру — подскажем полис под вашу страну и формат поездки.</p>
          <a class="btn btn--primary" href="#" data-modal="lead" data-product="Путешествия" data-track="cta_faq_manager">Связаться с менеджером</a>
        </div>
      </aside>
      <div class="faq__list" id="faqList"></div>
    </div>
  </section>

  <section class="section--tight">
    <div class="wrap">
      <div class="cta-band reveal">
        <h2>Куда летим?</h2>
        <p>Полис оформляется за 3 минуты и приходит на email — хоть из аэропорта.</p>
        <div class="row">
          <a class="btn btn--primary btn--lg" href="#calc" data-track="cta_band_travel">Рассчитать стоимость</a>
          <a class="btn btn--outline btn--lg" href="#" data-modal="lead" data-product="Путешествия" data-track="cta_band_lead">Оставить контакт</a>
        </div>
      </div>
    </div>
  </section>

</main>"""

travel_script = u"""  window.ECS_FAQ = [
    { q: "Нужна ли страховка для визы?", a: "Для шенгенской визы — обязательно: покрытие не менее 30 000 € на весь срок поездки. Калькулятор сразу предлагает полисы, подходящие для визовых центров." },
    { q: "Действует ли страховка для поездок по России?", a: "Да, есть отдельные программы для путешествий по России — пригодятся на горнолыжных курортах и в активных турах." },
    { q: "Что делать, если заболел за границей?", a: "Позвоните в ассистанс по номеру из полиса до визита к врачу — вас направят в клинику, где лечение оплатит страховая напрямую. Сохраняйте все документы и чеки." },
    { q: "Можно ли оформить один полис на всю семью?", a: "Да, в один полис можно включить всех путешественников, включая детей. Это удобнее и обычно дешевле отдельных полисов." },
    { q: "Покрывает ли полис горные лыжи и дайвинг?", a: "Только с опцией «активный отдых / спорт» — отметьте её в калькуляторе. Без неё травмы на склоне не считаются страховым случаем." }
  ];"""

build("travel.html",
      u"Страховка для путешествий онлайн за 3 минуты | ЕЦС",
      u"Туристическая страховка онлайн: медицина, отмена поездки, багаж, активный отдых. Сравните цены страховых и оформите полис за 3 минуты.",
      u"Путешествия", travel_main, travel_script)

# ============================================================
# БИЗНЕС (строгая тёмная тема)
# ============================================================
biz_main = u"""<main id="top">

  <section class="hero hero--page">
    <div class="wrap hero__grid">
      <div class="hero__copy">
        <div class="hero__eyebrow eyebrow">Страхование для бизнеса</div>
        <h1>Управление рисками<br>вашей компании</h1>
        <p class="hero__lead">Имущество, ответственность, грузы, персонал. Персональный андеррайтинг, тендер среди страховых и сопровождение убытков до выплаты.</p>
        <div class="hero__cta">
          <a class="btn btn--primary btn--lg" href="#brief" data-track="cta_hero_biz">Обсудить задачу</a>
          <a class="btn btn--ghost btn--lg" href="tel:+78001234567" data-track="cta_hero_call">Позвонить</a>
        </div>
      </div>

      <div class="hero__panel reveal">
        <h3>Принципы работы</h3>
        <ul>
          <li>Работаем по договору, документы для бухгалтерии — в полном порядке</li>
          <li>Тендер среди страховых: вы видите все предложения и реальные условия</li>
          <li>Наша комиссия — 0 ₽: вознаграждение платит страховая компания</li>
          <li>Сопровождаем убытки: от уведомления страховой до получения выплаты</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="section--tight">
    <div class="wrap">
      <div class="stats reveal">
        <div class="stats__inner">
          <div><b><span class="u">15</span>+</b><span>лет на рынке страхования</span></div>
          <div><b><span class="u">9</span></b><span>страховых компаний-партнёров</span></div>
          <div><b><span class="u">0</span> ₽</b><span>комиссия для клиента</span></div>
          <div><b><span class="u">24</span> ч</b><span>на первое предложение</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="s-head reveal">
        <span class="eyebrow">Направления</span>
        <h2>Закрываем все страховые задачи компании</h2>
      </div>
      <div class="biz-services reveal">
        <article class="biz-card">
          <span class="num">01</span>
          <h3>Имущество предприятия</h3>
          <p>Здания, склады, оборудование, товарные запасы. Включая перерыв в производстве после страхового случая.</p>
        </article>
        <article class="biz-card">
          <span class="num">02</span>
          <h3>Грузоперевозки</h3>
          <p>Разовые отправки и генеральные полисы на грузопоток. Внутренние и международные маршруты.</p>
        </article>
        <article class="biz-card">
          <span class="num">03</span>
          <h3>Ответственность</h3>
          <p>Гражданская, профессиональная, ответственность директоров (D&amp;O), строительно-монтажные риски.</p>
        </article>
        <article class="biz-card">
          <span class="num">04</span>
          <h3>ДМС для сотрудников</h3>
          <p>Программы под бюджет: от телемедицины до стационара. Сильный аргумент в борьбе за кадры.</p>
        </article>
        <article class="biz-card">
          <span class="num">05</span>
          <h3>Автопарк</h3>
          <p>ОСАГО и КАСКО для корпоративного транспорта единым договором: проще учёт, ниже тариф.</p>
        </article>
        <article class="biz-card">
          <span class="num">06</span>
          <h3>Специальные риски</h3>
          <p>Киберриски, спецтехника, залоговое имущество для банков и лизинга — найдём решение под отрасль.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="s-head reveal">
        <span class="eyebrow">Процесс</span>
        <h2>От заявки до полиса — прозрачно</h2>
      </div>
      <div class="biz-process reveal">
        <div class="biz-step">
          <h3>Аудит рисков</h3>
          <p>Изучаем активы, договоры и текущие полисы. Находим дыры в покрытии и переплаты.</p>
        </div>
        <div class="biz-step">
          <h3>Тендер</h3>
          <p>Запрашиваем условия у страховых, торгуемся по тарифам и исключениям из покрытия.</p>
        </div>
        <div class="biz-step">
          <h3>Сравнение и выбор</h3>
          <p>Готовим понятную сравнительную таблицу. Решение принимаете вы — на основе цифр.</p>
        </div>
        <div class="biz-step">
          <h3>Сопровождение</h3>
          <p>Ведём договор весь срок: продления, изменения и урегулирование убытков до выплаты.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="brief">
    <div class="wrap" style="max-width:860px">
      <div class="lead reveal">
        <h3>Обсудим вашу задачу</h3>
        <p>Коротко опишите бизнес — персональный менеджер свяжется в течение рабочего дня и предложит план.</p>
        <form class="js-lead-form" data-form="business-brief" data-product="Бизнес">
          <div class="lead__grid">
            <div class="field"><label for="b-company">Компания</label><input id="b-company" name="company" type="text" placeholder="ООО «Компания»" required></div>
            <div class="field"><label for="b-name">Контактное лицо</label><input id="b-name" name="name" type="text" placeholder="Имя" required></div>
            <div class="field"><label for="b-phone">Телефон</label><input id="b-phone" name="phone" type="tel" placeholder="+7 (___) ___-__-__" required></div>
            <div class="field"><label for="b-email">Email</label><input id="b-email" name="email" type="email" placeholder="name@company.ru"></div>
            <div class="field field--wide"><label for="b-topic">Направление</label>
              <select id="b-topic" name="topic">
                <option>Имущество предприятия</option>
                <option>Грузоперевозки</option>
                <option>Ответственность</option>
                <option>ДМС для сотрудников</option>
                <option>Автопарк</option>
                <option>Другое / нужна консультация</option>
              </select>
            </div>
            <div class="field field--wide"><label for="b-comment">Задача</label><textarea id="b-comment" name="comment" placeholder="Например: склад 2000 м² с товарным запасом, нужны имущество + перерыв в производстве"></textarea></div>
          </div>
          <label class="lead__agree"><input type="checkbox" name="agree" required> Соглашаюсь с политикой обработки персональных данных</label>
          <button class="btn btn--primary lead__submit" type="submit">Отправить запрос</button>
        </form>
        <div class="lead__done">
          <div class="ok-ic">✓</div>
          <h3>Запрос принят</h3>
          <p style="color:var(--muted);margin-top:10px">Персональный менеджер свяжется с вами в течение рабочего дня.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap faq">
      <aside class="faq__aside reveal">
        <span class="eyebrow">FAQ</span>
        <div class="s-head" style="margin:14px 0 28px">
          <h2 style="font-size:clamp(28px,3.2vw,40px)">Вопросы о работе с юрлицами</h2>
        </div>
        <div class="faq__card">
          <h3>Нужен счёт и договор?</h3>
          <p>Работаем официально: договор, счёт, закрывающие документы. Напишите — вышлем шаблоны.</p>
          <a class="btn btn--primary" href="#" data-modal="lead" data-product="Бизнес" data-track="cta_faq_manager">Запросить документы</a>
        </div>
      </aside>
      <div class="faq__list" id="faqList"></div>
    </div>
  </section>

</main>"""

biz_script = u"""  window.ECS_FAQ = [
    { q: "Чем брокер лучше прямого обращения в страховую?", a: "Страховая предложит свой продукт, мы — рынок целиком. Тендер среди девяти компаний в среднем снижает бюджет на страхование и убирает невыгодные исключения из договора, которые видны только при сравнении." },
    { q: "Сколько стоят ваши услуги?", a: "Для клиента — 0 ₽. Вознаграждение брокеру выплачивает страховая компания. Бюджет согласовываем до начала работы, скрытых надбавок в тарифе нет." },
    { q: "Как происходит урегулирование убытков?", a: "Заявляете убыток нам — дальше мы: уведомляем страховую, собираем комплект документов, контролируем сроки и при необходимости подключаем сюрвейера. Ваша задача — только предоставить документы." },
    { q: "Работаете ли с малым бизнесом?", a: "Да. Для малого бизнеса есть готовые программы с быстрым оформлением: имущество, ответственность перед посетителями, ДМС от 5 сотрудников." },
    { q: "Какие документы нужны для расчёта?", a: "Для старта достаточно заполнить заявку на странице. Для точного тарифа понадобится опросный лист по направлению — пришлём шаблон и поможем заполнить." }
  ];"""

build("business.html",
      u"Страхование бизнеса: имущество, грузы, ответственность, ДМС | ЕЦС",
      u"Корпоративное страхование под ключ: аудит рисков, тендер среди страховых, сопровождение убытков. Имущество, грузы, ответственность, ДМС, автопарк.",
      u"Бизнес", biz_main, biz_script,
      theme=' data-theme="dark"', bodycls="page-biz")

# ============================================================
# ОФИС
# ============================================================
office_main = u"""<main id="top">

  <section class="hero hero--page">
    <div class="wrap hero__grid">
      <div class="hero__copy">
        <div class="hero__eyebrow eyebrow">Приходите в гости</div>
        <h1>Офис <span class="accent">ЕЦС</span></h1>
        <p class="hero__lead">Разберём ваш случай за чашкой кофе: документы, расчёты и полис — на месте. Запишитесь, чтобы не ждать.</p>
        <div class="hero__cta">
          <a class="btn btn--primary btn--lg" href="#booking" data-track="cta_hero_booking">Записаться на приём</a>
          <a class="btn btn--ghost btn--lg" href="tel:+78001234567" data-track="cta_hero_call">Позвонить</a>
        </div>
      </div>

      <div class="hero__panel reveal">
        <h3>Как нас найти</h3>
        <ul>
          <li>Адрес: г. Санкт-Петербург — точный адрес добавим</li>
          <li>Ежедневно с 9:00 до 21:00, без перерывов</li>
          <li>Парковка рядом с офисом</li>
          <li>Кофе — за наш счёт</li>
        </ul>
        <a class="btn btn--outline" href="https://yandex.ru/maps/?text=ЕЦС%20Единый%20центр%20страхования%20Санкт-Петербург" target="_blank" rel="noopener" data-track="office_route">Построить маршрут</a>
      </div>
    </div>
  </section>

  <section class="section--tight" id="map">
    <div class="wrap">
      <div class="map-box reveal">
        <div id="ymap"></div>
        <div class="ph" id="mapPh">
          """ + PH_ICON + u"""
          <div><b>Здесь будет карта</b><span>появится автоматически после того, как впишете API-ключ Яндекс.Карт и координаты офиса в assets/js/config.js</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="s-head reveal">
        <span class="eyebrow">Офис</span>
        <h2>Как у нас внутри</h2>
        <p>Фотографии добавим, когда будут готовы — слоты уже на месте.</p>
      </div>
      <div class="gallery reveal">
        <div class="ph">""" + PH_ICON + u"""<div><b>Фото офиса</b><span>главный зал</span></div></div>
        <div class="ph">""" + PH_ICON + u"""<div><b>Фото офиса</b><span>переговорная</span></div></div>
        <div class="ph">""" + PH_ICON + u"""<div><b>Фото офиса</b><span>зона ожидания</span></div></div>
        <div class="ph">""" + PH_ICON + u"""<div><b>Фото офиса</b><span>вход</span></div></div>
        <div class="ph">""" + PH_ICON + u"""<div><b>Фото офиса</b><span>команда</span></div></div>
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="info-row">
        <div class="info-card reveal">
          <h3><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span>Адрес</h3>
          <p>г. Санкт-Петербург<br>точный адрес добавим</p>
        </div>
        <div class="info-card reveal">
          <h3><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></span>Часы работы</h3>
          <p>Ежедневно 9:00–21:00<br>без перерывов и выходных</p>
        </div>
        <div class="info-card reveal">
          <h3><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 1.9Z"/></svg></span>Контакты</h3>
          <a href="tel:+78001234567">8 800 123-45-67</a>
          <a href="mailto:info@ecs.ru">info@ecs.ru</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="booking" style="padding-top:0">
    <div class="wrap" style="max-width:760px">
      <div class="lead reveal">
        <h3>Запись на приём</h3>
        <p>Выберите удобное время — подтвердим запись звонком или сообщением.</p>
        <form class="js-lead-form" data-form="office-booking" data-product="Запись в офис">
          <div class="lead__grid">
            <div class="field"><label for="o-name">Имя</label><input id="o-name" name="name" type="text" placeholder="Как к вам обращаться" required></div>
            <div class="field"><label for="o-phone">Телефон</label><input id="o-phone" name="phone" type="tel" placeholder="+7 (___) ___-__-__" required></div>
            <div class="field field--wide"><label for="o-when">Удобные дата и время</label><input id="o-when" name="when" type="text" placeholder="Например: пятница после 18:00"></div>
            <div class="field field--wide"><label for="o-comment">С чем приходите</label><textarea id="o-comment" name="comment" placeholder="ОСАГО, КАСКО, имущество, страховой случай…"></textarea></div>
          </div>
          <label class="lead__agree"><input type="checkbox" name="agree" required> Соглашаюсь с политикой обработки персональных данных</label>
          <button class="btn btn--primary lead__submit" type="submit">Записаться</button>
        </form>
        <div class="lead__done">
          <div class="ok-ic">✓</div>
          <h3>Вы записаны!</h3>
          <p style="color:var(--muted);margin-top:10px">Подтвердим время звонком в ближайший час (в рабочее время).</p>
        </div>
      </div>
    </div>
  </section>

</main>"""

office_script = u"""  // Яндекс.Карта: включится сама, когда в config.js появится API-ключ
  (function () {
    var CFG = window.ECS_CONFIG || {};
    if (!CFG.yandexMapsApiKey) return;
    var s = document.createElement("script");
    s.src = "https://api-maps.yandex.ru/2.1/?apikey=" + CFG.yandexMapsApiKey + "&lang=ru_RU";
    s.onload = function () {
      ymaps.ready(function () {
        var c = CFG.officeCoords || [59.93428, 30.335099];
        document.getElementById("mapPh").style.display = "none";
        document.getElementById("ymap").style.display = "block";
        var map = new ymaps.Map("ymap", { center: c, zoom: 16, controls: ["zoomControl", "fullscreenControl"] });
        map.behaviors.disable("scrollZoom");
        map.geoObjects.add(new ymaps.Placemark(c, {
          balloonContentHeader: "ЕЦС — Единый центр страхования",
          balloonContentBody: (CFG.address || "") + "<br>" + (CFG.workHours || "")
        }, { preset: "islands#redDotIcon" }));
        window.ecsTrack("map_loaded");
      });
    };
    document.head.appendChild(s);
  })();"""

build("office.html",
      u"Офис ЕЦС: запись на приём | Единый центр страхования",
      u"Приезжайте в офис ЕЦС: разберём документы, рассчитаем полис и оформим всё на месте. Запись на приём онлайн, ежедневно 9:00–21:00.",
      u"Запись в офис", office_main, office_script)

print("OK")
