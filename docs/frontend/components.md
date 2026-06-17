# Каталог компонентов и JS-модулей

## CSS (frontend/assets/css/)

| Файл | Ответственность |
|---|---|
| `tokens.css` | Дизайн-токены бренда: цвета, радиусы, тени, темы clean/bold/dark |
| `base.css` | Reset, типографика, `.wrap`/`.section`, кнопки, шапка |
| `components.css` | Hero, карточки, формы, FAQ, футер, модалка, fab, страницы офиса/бизнеса |

Ключевые классы: `.btn--primary` (красная — одна на экран, бренд-гайд),
`.btn--ghost`, `.btn--outline`, `.card`/`.card--feature`/`.card--accent`,
`.hero--page`, `.hero__panel`, `.lead` (форма), `.ph` (заглушка фото),
`.calc-frame` (обёртка калькулятора Финуслуг), `.cmp` (таблица сравнения).

## JS-модули (frontend/assets/js/), порядок подключения важен

| Модуль | Ответственность | Публичный API |
|---|---|---|
| `config.js` | Все настройки интеграций | `window.ECS_CONFIG` |
| `utm.js` | UTM first/last touch, прокидка в ссылки | `ECS.utm.get()`, `ECS.utm.init()` |
| `analytics.js` | dataLayer + Метрика + POST /api/events | `ecsTrack(event, params)` |
| `bitrix.js` | Загрузка виджета Битрикс24 | `ECS.bitrix.init()` |
| `leads.js` | Отправка лидов (API → вебхук → localStorage), формы, маска телефона | `ecsLead(data)`, формы `form.js-lead-form` |
| `ui.js` | Шапка, мобильное меню, reveal, FAQ, модалка, fab | `ECS.ui.init()`, `ECS.ui.openModal()` |
| `main.js` | Только инициализация модулей | — |

## Соглашения разметки

- `data-track="имя_цели"` — клик по элементу уходит в аналитику.
- `data-modal="lead"` + `data-product="X"` — кнопка открывает модалку заявки.
- `form.js-lead-form` + `data-form` + `data-product` — форма-лид; поле `phone`
  получает маску и валидацию автоматически; чекбокс `agree` не отправляется.
- `window.ECS_FAQ` — данные FAQ страницы.
