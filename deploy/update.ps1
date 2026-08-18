<#
  Update WeldTeam MES on the server to the latest code and restart the service.
  Run in an Administrator PowerShell:
      powershell -ExecutionPolicy Bypass -File C:\WeldTeam\deploy\update.ps1
  The database (data\welding_shop.db) is NOT touched; schema migrates on start.
  Messages are in English on purpose (reliable under any Windows codepage).
#>
param(
  [string]$Dir     = 'C:\WeldTeam',
  [string]$Branch  = 'DEV',
  [string]$Service = 'WeldTeamMES'
)
$ErrorActionPreference = 'Stop'
function Info($m){ Write-Host "[WeldTeam] $m" -ForegroundColor Cyan }
# git prints progress to stderr; under EAP=Stop that is wrongly treated as an
# error and aborts the script. Run git with Continue and check the exit code.
function Git-Do {
  $eap = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
  try { & git @args 2>&1 | ForEach-Object { Write-Host "$_" } }
  finally { $ErrorActionPreference = $eap }
  if ($LASTEXITCODE -ne 0) { throw "git $($args -join ' ') failed (exit $LASTEXITCODE)" }
}

if (-not (Test-Path "$Dir\.git")) {
  Write-Host "No git checkout in $Dir - run deploy\setup_git.ps1 first." -ForegroundColor Red; exit 1
}

Info "Updating to latest ($Branch) ..."
Git-Do -C $Dir fetch origin $Branch
Git-Do -C $Dir checkout -f $Branch
Git-Do -C $Dir reset --hard "origin/$Branch"   # match origin exactly; .env/data are gitignored and kept

Info 'Updating dependencies ...'
& "$Dir\.venv\Scripts\pip.exe" install -r "$Dir\requirements.txt" --quiet

$nssm = "$Dir\deploy\nssm.exe"
if (Test-Path $nssm) { Info 'Restarting service ...'; & $nssm restart $Service }
else { Restart-Service $Service }
Info 'Done. Site is back up (port from .env, default 5000/8090).'
