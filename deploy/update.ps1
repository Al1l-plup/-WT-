<#
  Update WeldTeam MES on the server to the latest code and restart the service.
  Run in an Administrator PowerShell:  .\update.ps1
  The database (data\welding_shop.db) is NOT touched; schema migrates on start.
#>
param(
  [string]$Dir     = 'C:\WeldTeam',
  [string]$Branch  = 'DEV',
  [string]$Service = 'WeldTeamMES'
)
$ErrorActionPreference = 'Stop'
function Info($m){ Write-Host "[WeldTeam] $m" -ForegroundColor Cyan }

if (-not (Test-Path "$Dir\.git")) { Write-Host "No git checkout in $Dir - re-run install.ps1." -ForegroundColor Red; exit 1 }

Info "Pulling latest ($Branch) ..."
git -C $Dir fetch origin
git -C $Dir checkout $Branch
git -C $Dir pull origin $Branch

Info 'Updating dependencies ...'
& "$Dir\.venv\Scripts\pip.exe" install -r "$Dir\requirements.txt" --quiet

$nssm = "$Dir\deploy\nssm.exe"
if (Test-Path $nssm) { Info 'Restarting service ...'; & $nssm restart $Service }
else { Restart-Service $Service }
Info 'Updated. Site is back up on port 5000.'
