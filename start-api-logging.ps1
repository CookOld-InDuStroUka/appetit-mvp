# PowerShell script to run API with logging
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$logDir = Join-Path $root 'logs'
if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$logFile = Join-Path $logDir 'api.log'
Set-Location "$root\apps\api"
pnpm db:push 2>&1 | Tee-Object -FilePath $logFile
pnpm dev 2>&1 | Tee-Object -FilePath $logFile -Append

