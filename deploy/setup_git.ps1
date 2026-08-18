<#
  Convert a ZIP-based WeldTeam install (no .git) into a proper Git checkout of DEV,
  so future updates are a light `update.ps1` (git pull) instead of a full re-install.

  Safe: backs up .env and the database first; Git overwrites only repo-tracked files,
  while .env / data\ / .venv / logs (gitignored) are preserved on disk.

  Run in an Administrator PowerShell:
      Set-ExecutionPolicy -Scope Process Bypass -Force; iwr -useb https://raw.githubusercontent.com/Al1l-plup/-WT-/DEV/deploy/setup_git.ps1 | iex
#>
param(
  [string]$Dir    = 'C:\WeldTeam',
  [string]$Repo   = 'https://github.com/Al1l-plup/-WT-.git',
  [string]$Branch = 'DEV'
)
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

function Info($m){ Write-Host "[WeldTeam] $m" -ForegroundColor Cyan }
function Warn($m){ Write-Host "[WeldTeam] $m" -ForegroundColor Yellow }
function Die($m){ Write-Host "[WeldTeam] ERROR: $m" -ForegroundColor Red; exit 1 }
function Have($c){ [bool](Get-Command $c -ErrorAction SilentlyContinue) }

$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
          ).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
if (-not $admin) { Die 'Run in an Administrator PowerShell (right-click PowerShell -> Run as administrator).' }
if (-not (Test-Path $Dir)) { Die "$Dir not found - run the installer first." }

# 1) ensure Git
if (-not (Have 'git')) {
  Info 'Installing Git ...'
  if (Have 'winget') {
    winget install -e --id Git.Git --silent --accept-source-agreements --accept-package-agreements
  } else {
    $u='https://github.com/git-for-windows/git/releases/download/v2.45.2.windows.1/Git-2.45.2-64-bit.exe'
    $f="$env:TEMP\git-install.exe"; Invoke-WebRequest $u -OutFile $f
    Start-Process $f -ArgumentList '/VERYSILENT /NORESTART' -Wait
  }
  $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' +
              [Environment]::GetEnvironmentVariable('Path','User')
}
if (-not (Have 'git')) { Die 'Git not on PATH yet. Open a NEW Administrator PowerShell and run this again.' }
Info ('Git: ' + (git --version))

# 2) already a git checkout?
if (Test-Path "$Dir\.git") { Info 'Already a git checkout - nothing to convert. Use deploy\update.ps1.'; exit 0 }

# 3) backup .env and DB (safety)
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
if (Test-Path "$Dir\.env") { Copy-Item "$Dir\.env" "$Dir\.env.bak_$stamp" -Force; Info "Backed up .env -> .env.bak_$stamp" }
$db = "$Dir\data\welding_shop.db"
if (Test-Path $db) { Copy-Item $db "$db.bak_$stamp" -Force; Info "Backed up DB -> welding_shop.db.bak_$stamp" }

# 4) convert folder in place to a git checkout of the branch
Info "Converting $Dir into a git checkout of $Branch ..."
Push-Location $Dir
try {
  git init | Out-Null
  git remote remove origin 2>$null | Out-Null
  git remote add origin $Repo
  git fetch origin $Branch
  git checkout -f -B $Branch "origin/$Branch"   # -f: repo files overwrite the ZIP copies; .env/data stay (gitignored)
} finally { Pop-Location }

Info '=================== DONE ==================='
Info "$Dir is now a git checkout of $Branch."
Info 'Your .env and data\welding_shop.db are untouched (backups saved next to them).'
Info 'From now on, UPDATE with:'
Info '    powershell -ExecutionPolicy Bypass -File C:\WeldTeam\deploy\update.ps1'
