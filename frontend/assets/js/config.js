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
    { name: "Ренессанс Страхование", site: "https://www.renins.ru",  claimPhone: "8 (800) 333-88-00", claimEmail: "" },
    { name: "Тинькофф Страхование",  site: "",                       claimPhone: "8 800 700-55-00", claimEmail: "" },
    { name: "Ингосстрах",            site: "https://www.ingos.ru/incident/osago",    claimPhone: "+7 (495) 956-55-55", claimEmail: "" },
    { name: "АльфаСтрахование",      site: "https://www.alfastrah.ru",claimPhone: "8 (800) 333-0-999", claimEmail: "" },
    { name: "Росгосстрах",           site: "https://www.rgs.ru",      claimPhone: "8 (800) 200-09-00", claimEmail: "" },
    { name: "Совкомбанк Страхование",site: "",                       claimPhone: "", claimEmail: "" },
    { name: "Зетта Страхование",     site: "https://www.zettains.ru", claimPhone: "", claimEmail: "" },
    { name: "ВСК",                   site: "https://www.vsk.ru",      claimPhone: "", claimEmail: "" },
    { name: "СОГАЗ",                 site: "https://www.sogaz.ru",    claimPhone: "", claimEmail: "" },
    { name: "Астро-Волга",           site: "",                       claimPhone: "", claimEmail: "" },
    { name: "МАКС",                  site: "https://www.makc.ru",     claimPhone: "", claimEmail: "" },
    { name: "Согласие",              site: "https://www.soglasie.ru", claimPhone: "", claimEmail: "" },
    { name: "INTOUCH",               site: "",                       claimPhone: "", claimEmail: "" },
    { name: "АО «ОСК»",              site: "",                       claimPhone: "", claimEmail: "" },
    { name: "Абсолют Страхование",   site: "",                       claimPhone: "", claimEmail: "" },
    { name: "Гелиос",                site: "",                       claimPhone: "", claimEmail: "" },
    { name: "СберСтрахование",       site: "",                       claimPhone: "", claimEmail: "" }
  ]
};
