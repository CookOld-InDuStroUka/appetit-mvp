# Proposed Repository Structure

Ниже — рекомендуемая структура для более «витринного» GitHub‑репозитория. Она добавляет `docs/`, `.github/` и явное разделение слоёв, не ломая монорепо.

## Proposed tree

```text
.
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   ├── src/
│   │   └── package.json
│   └── web/
│       ├── public/
│       ├── src/
│       └── package.json
├── packages/
│   ├── shared/
│   ├── ui/                # (план) общий UI‑kit
│   └── config/            # (план) shared tsconfig/eslint
├── docs/
│   ├── STRUCTURE.md
│   ├── ARCHITECTURE.md    # (план) расширенная архитектура
│   └── COMMIT_PLAN.md
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/         # (план) CI
├── .env.example
├── docker-compose.yml
├── package.json
└── README.md
```

## Что и куда переносить

| Что сейчас | Куда в новой структуре | Зачем |
| --- | --- | --- |
| `apps/api` | `apps/api` (без изменений) | API уже хорошо изолирован |
| `apps/web` | `apps/web` (без изменений) | клиент уже выделен |
| `packages/shared` | `packages/shared` (без изменений) | общие типы/модели |
| README/архитектура | `README.md` + `docs/ARCHITECTURE.md` | разделение краткой и подробной документации |
| Dev-заметки/руководства | `docs/` | единый каталог документации |
| CI/issue templates | `.github/` | стандарт GitHub |

> На практике это не требует физического «переноса» ключевых приложений — достаточно добавить `docs/` и `.github/`, а в будущем выделить `packages/ui` и `packages/config`.
