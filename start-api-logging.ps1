# PowerShell script to run API with logging to logs/api.log
$root = $PSScriptRoot
$logDir = Join-Path $root 'logs'
if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}
$logFile = Join-Path $logDir 'api.log'
Set-Location (Join-Path $root 'apps/api')
pnpm dev 2>&1 | Tee-Object -FilePath $logFile
