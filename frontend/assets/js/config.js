/* ============================================================
   ЕЦС — конфигурация сайта.
   Все интеграции подключаются здесь: впишите свои значения
   и они автоматически заработают на всех страницах.
   ============================================================ */
window.ECS_CONFIG = {
  /* —— Наш бэкенд (FastAPI) ——
     Адрес API: лиды и аналитика идут через него, а вебхук
     Битрикс24 остаётся на сервере и не виден посетителям.
     Локально: "http://localhost:8000". Пусто = бэкенд не используется. */
  apiUrl: "",

  /* —— Контакты —— */
  phone: "8 800 123-45-67",
  phoneHref: "+78001234567",
  email: "info@ecs.ru",
  address: "г. Санкт-Петербург", // полный адрес офиса — впишите для страницы «Офис»
  workHours: "Ежедневно 9:00–21:00",

  /* —— Мессенджеры —— (используются в плавающей кнопке связи и в
     блоке контактов в hero на странице ОСАГО; пустая строка = скрыто) */
  whatsapp: "https://wa.me/78001234567",   // напр. "https://wa.me/79991234567"
  telegram: "https://t.me/ecs_insurance",  // напр. "https://t.me/ecs_insurance"
  max: "https://max.ru/ecs_insurance",     // мессенджер MAX, напр. "https://max.ru/ecs_insurance"
  vk: "",       // напр. "https://vk.com/ecs_insurance"

  /* —— Битрикс24 —— */
  // 1) Виджет (онлайн-чат + CRM-формы + обратный звонок):
  //    Битрикс24 → CRM → Интеграции → Виджет на сайт → скопируйте URL из кода
  //    вида https://cdn-ru.bitrix24.ru/bXXXXXX/crm/site_button/loader_X_xxxxxx.js
  bitrixWidgetUrl: "",
  // 2) Вебхук для создания лидов из форм сайта (если форма не из Б24):
  //    Битрикс24 → Приложения → Разработчикам → Готовые сценарии →
  //    Другое → Входящий вебхук; права (scope): crm.
  //    Вид: https://ваш-портал.bitrix24.ru/rest/1/xxxxxxxx/
  //    ВНИМАНИЕ: вебхук в браузере виден всем посетителям сайта —
  //    надёжнее оставить это поле пустым и использовать apiUrl (бэкенд).
  bitrixWebhookUrl: "",

  /* —— Аналитика —— */
  // Яндекс.Метрика: впишите номер счётчика (число), напр. 12345678
  yandexMetrikaId: "",
  // Google Analytics 4 (опционально), напр. "G-XXXXXXX"
  ga4Id: "",

  /* —— Яндекс.Карты (страница «Офис») —— */
  // API-ключ: https://developer.tech.yandex.ru/ → JavaScript API и Геокодер
  yandexMapsApiKey: "",
  officeCoords: [59.93428, 30.335099], // [широта, долгота] — замените на точку офиса

  /* —— Калькуляторы Финуслуг (data-id для каждого продукта) —— */
  calc: {
    osago:  "5289dc16e387469434f49f7a2a9b1924",
    travel: "5289dc16e387469434f49f7a2a9b1924" // замените на id калькулятора путешествий
  },

  /* —— Страховые компании (страница insurers.html) ——
     При страховом случае клиент открывает свою страховую и видит:
       claimPhone — телефон для обращения по убытку (круглосуточный)
       claimEmail — куда прислать документы
     Заполните claimPhone и claimEmail проверенными данными.
     Пустые поля показываются как «указан в полисе» / «уточните на сайте». */
  insurers: [
    { name: "Ренессанс Страхование",     site: "https://renins.ru/claims",                  claimPhone: "8 800 333-88-00",  claimEmail: "propertyclaims@renins.com" },
    { name: "Т-Страхование (Тинькофф)",  site: "https://tbank.ru/insurance",                claimPhone: "8 800 755-80-00",  claimEmail: "" },
    { name: "Ингосстрах",                site: "https://ingos.ru/incident",                 claimPhone: "8 800 100-77-55",  claimEmail: "chs@ingos.ru" },
    { name: "АльфаСтрахование",          site: "https://alfastrah.ru/claims",               claimPhone: "8 800 333-09-99",  claimEmail: "" },
    { name: "Росгосстрах",               site: "https://rgs.ru",                            claimPhone: "8 800 200-99-77",  claimEmail: "" },
    { name: "Совкомбанк Страхование",    site: "https://sovcomins.ru/strakhovoy-sluchay",   claimPhone: "8 800 100-21-11",  claimEmail: "" },
    { name: "Зетта Страхование",         site: "https://zettains.ru",                       claimPhone: "8 800 777-77-07",  claimEmail: "" },
    { name: "ВСК",                       site: "https://vsk.ru",                            claimPhone: "8 800 775-77-51",  claimEmail: "info@vsk.ru" },
    { name: "СОГАЗ",                     site: "https://claim.sogaz.ru",                    claimPhone: "8 800 333-08-88",  claimEmail: "" },
    { name: "Астро-Волга",               site: "https://astrovolga.ru",                     claimPhone: "8 800 600-87-67",  claimEmail: "" },
    { name: "МАКС",                      site: "https://makc.ru",                           claimPhone: "+7 495 730-11-01", claimEmail: "info@makc.ru" },
    { name: "Согласие",                  site: "https://soglasie.ru/insurance",             claimPhone: "8 900 555-11-55",  claimEmail: "" },
    { name: "АО «ОСК»",                  site: "https://osk-ins.ru",                        claimPhone: "8 800 333-00-44",  claimEmail: "" },
    { name: "Абсолют Страхование",       site: "https://absolutins.ru/strahovoj-sluchay",   claimPhone: "+7 495 025-77-77", claimEmail: "info@absolutins.ru" },
    { name: "Гелиос",                    site: "https://skgelios.ru",                       claimPhone: "8 800 1-007-007",  claimEmail: "propertyclaims@skgelios.ru" },
    { name: "СберСтрахование",           site: "https://sberbankins.ru",                    claimPhone: "900",              claimEmail: "ks@sberins.ru" }
  ]
};
