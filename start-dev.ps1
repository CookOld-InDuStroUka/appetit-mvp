#  PowerShell-скрипт для запуска всего проекта (DB + API + WEB)

# 1) Поднимаем Postgres в Docker (если уже поднят  просто убедимся)
docker compose up -d db

# 2) API (порт 4000)
Start-Process powershell -ArgumentList "cd apps\api; pnpm dev"

# 3) WEB (порт 3000)
Start-Process powershell -ArgumentList "cd apps\web; pnpm dev"
