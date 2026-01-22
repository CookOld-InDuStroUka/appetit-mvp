# Appetit MVP

Appetit MVP — сервис для заказа еды с витриной заведений, оформлением заказов и интеграциями (карты, Telegram‑логин, почта/SMS). Репозиторий оформлен как монорепо с разделением на web‑клиент, API и shared‑пакеты.

## Ключевые фичи

- Витрина заведений и карточки блюд.
- Оформление заказов и базовые пользовательские сценарии.
- Интеграции: Telegram‑логин, карты, email/SMS уведомления.
- Централизованные shared‑типы для повторного использования между слоями.

## Стек

- **Frontend**: Next.js 14, React 18
- **Backend**: Node.js, Express, Prisma
- **DB**: PostgreSQL 16
- **Tooling**: pnpm, TypeScript

## Требования

- Node.js 20+
- pnpm 9+ (рекомендуется через `corepack`)
- Docker (для локальной базы данных)

## Установка и запуск

### 1) Клонирование и установка зависимостей

```bash
pnpm install
```

### 2) Переменные окружения

Скопируйте `.env.example` в `.env` (используется API).

```bash
cp .env.example .env
```

Для web‑клиента создайте `apps/web/.env.local` и скопируйте туда публичные переменные (`NEXT_PUBLIC_*`).

### 3) Запуск базы данных

```bash
docker compose up -d
```

### 4) Запуск API

```bash
pnpm -C apps/api dev
```

### 5) Запуск Web

```bash
pnpm -C apps/web dev
```

#### Windows (PowerShell)

```powershell
pnpm install
copy .env.example .env

docker compose up -d

pnpm -C apps/api dev
pnpm -C apps/web dev
```

## Переменные окружения

Полный список есть в `.env.example`. Ключевые:

- `DATABASE_URL` — строка подключения к Postgres
- `NEXT_PUBLIC_API_BASE` — базовый URL API
- `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` — ключ карт
- `JWT_SECRET`, `TG_BOT_TOKEN`, `RESEND_API_KEY`, `TWILIO_*` — интеграции

## Команды

| Команда | Описание |
| --- | --- |
| `pnpm -C apps/api dev` | локальный запуск API + prisma db push/seed |
| `pnpm -C apps/web dev` | локальный запуск web‑клиента |
| `pnpm --filter @appetit/api build` | сборка API |
| `pnpm -C apps/web build` | сборка web‑клиента |
| `pnpm -C apps/api db:push` | синхронизация схемы БД |
| `pnpm -C apps/api db:seed` | заполнение БД тестовыми данными |

> Тесты и линт пока не настроены — см. Roadmap.

## Структура проекта (фактическая)

```text
apps/
  api/        # API (Express + Prisma)
  web/        # Next.js клиент
packages/
  shared/     # общие типы/утилиты
```

## Repository audit и рекомендуемая структура

**Текущее состояние**: монорепо уже разделено на `apps` и `packages`, но нет отдельного места для документации, CI и шаблонов, а конфигурация окружения смешана между слоями.

**Рекомендация**: выделить `docs/`, `.github/`, и стандартизировать окружение (пример в `docs/STRUCTURE.md`).

## Architecture

### Компоненты

- **Web (Next.js)** — UI, страницы, SSR/CSR, запросы к API.
- **API (Express)** — бизнес‑логика, авторизация, интеграции.
- **Database (PostgreSQL)** — хранение пользователей, заказов, меню.
- **Shared** — типы/модели для совместного использования.

### Поток данных

1. Пользователь открывает web‑клиент.
2. Web делает запросы к API (`/api/v1/...`).
3. API валидирует и обращается к Postgres через Prisma.
4. Для нотификаций API вызывает внешние сервисы (Resend/Twilio/Telegram).
5. Ответ возвращается в web‑клиент.

### Основные модули и ответственность

- `apps/web/src/pages` — маршруты/страницы.
- `apps/web/src/components` — UI‑компоненты.
- `apps/api/src/routes` — HTTP‑маршруты и обработчики.
- `apps/api/src/prisma.ts` — клиент Prisma.
- `packages/shared` — общие типы/контракты.

## Roadmap / TODO

- [ ] Настроить ESLint/Prettier и базовый lint‑pipeline.
- [ ] Добавить тестовый контур (unit + API интеграционные тесты).
- [ ] Выделить `packages/ui` и `packages/config`.
- [ ] Подключить CI (GitHub Actions).
- [ ] Документировать публичный API (OpenAPI/Swagger).

## Лицензия

Проект распространяется по лицензии MIT — см. [LICENSE](LICENSE).

## Дополнительные документы

- [Architecture & Proposed Structure](docs/STRUCTURE.md)
- [Commit Plan](docs/COMMIT_PLAN.md)
- [Contributing](CONTRIBUTING.md)
