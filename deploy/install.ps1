<#
  WeldTeam MES - one-shot installer for Windows Server (local shop network).

  Installs Python and Git if missing, downloads the code from GitHub, sets up
  a virtualenv + dependencies + .env (with a fresh SECRET_KEY), builds the DB
  if absent, and registers an ALWAYS-ON Windows service (auto-start on boot,
  auto-restart on crash) via NSSM. Opens the firewall port. Idempotent: safe to
  re-run (it will update the code and restart the service).

  USAGE (Administrator PowerShell):
      Set-ExecutionPolicy -Scope Process Bypass -Force
      .\install.ps1

  Or fetch and run in one line (public repo):
      Set-ExecutionPolicy -Scope Process Bypass -Force
      iwr -useb https://raw.githubusercontent.com/Al1l-plup/-WT-/DEV/deploy/install.ps1 | iex

  Messages are in English on purpose (reliable under any Windows codepage).
#>
param(
  [string]$Dir     = 'C:\WeldTeam',
  [string]$Repo    = 'https://github.com/Al1l-plup/-WT-.git',
  [string]$Branch  = 'DEV',
  [string]$Service = 'WeldTeamMES',
  [int]   $Port    = 5000
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

function Info($m){ Write-Host "[WeldTeam] $m" -ForegroundColor Cyan }
function Warn($m){ Write-Host "[WeldTeam] $m" -ForegroundColor Yellow }
function Die($m){ Write-Host "[WeldTeam] ERROR: $m" -ForegroundColor Red; exit 1 }
function Have($c){ [bool](Get-Command $c -ErrorAction SilentlyContinue) }
function Winget(){ Have 'winget' }
function RefreshPath(){
  $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' +
              [Environment]::GetEnvironmentVariable('Path','User')
}
# git prints progress to stderr; under EAP=Stop that is wrongly treated as an error.
function Git-Do {
  $eap = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
  try { & git @args 2>&1 | ForEach-Object { Write-Host "$_" } }
  finally { $ErrorActionPreference = $eap }
  if ($LASTEXITCODE -ne 0) { throw "git $($args -join ' ') failed (exit $LASTEXITCODE)" }
}

# --- 0) must be admin (service + firewall) ---
$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
          ).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
if (-not $admin) { Die 'Run in an Administrator PowerShell (right-click PowerShell -> Run as administrator).' }

# --- 1) Python 3.11+ ---
function Ensure-Python {
  foreach ($probe in @('py -3 --version','python --version')) {
    try { $v = (& cmd /c $probe) 2>$null } catch { $v = $null }
    if ($v -match 'Python 3\.(1[1-9]|[2-9]\d)') { Info "Python present: $v"; return }
  }
  Info 'Installing Python 3.11 ...'
  if (Winget) {
    winget install -e --id Python.Python.3.11 --silent --accept-source-agreements --accept-package-agreements
  } else {
    $u='https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe'; $f="$env:TEMP\py311.exe"
    Invoke-WebRequest $u -OutFile $f
    Start-Process $f -ArgumentList '/quiet InstallAllUsers=1 PrependPath=1 Include_pip=1' -Wait
  }
  RefreshPath
  if (-not (Have 'python') -and -not (Have 'py')) { Die 'Python install failed - install manually from python.org and re-run.' }
}

# --- 2) Git (optional: ZIP fallback if absent) ---
function Ensure-Git {
  if (Have 'git') { Info 'Git present.'; return }
  Info 'Installing Git ...'
  try {
    if (Winget) {
      winget install -e --id Git.Git --silent --accept-source-agreements --accept-package-agreements
    } else {
      $u='https://github.com/git-for-windows/git/releases/download/v2.45.2.windows.1/Git-2.45.2-64-bit.exe'
      $f="$env:TEMP\git.exe"; Invoke-WebRequest $u -OutFile $f
      Start-Process $f -ArgumentList '/VERYSILENT /NORESTART' -Wait
    }
    RefreshPath
  } catch { Warn 'Git install failed - will use ZIP download instead.' }
}

# --- 3) get the code ---
function Get-Code {
  if (Have 'git') { Git-Do config --global http.sslBackend schannel }  # Windows cert store (corp SSL inspection)
  if (Test-Path "$Dir\.git") {
    Info "Updating existing checkout ($Branch) ..."
    Git-Do -C $Dir fetch origin $Branch
    Git-Do -C $Dir checkout -f $Branch
    Git-Do -C $Dir reset --hard "origin/$Branch"
  } elseif (Have 'git') {
    Info "Cloning $Repo ($Branch) -> $Dir ..."
    Git-Do clone -b $Branch $Repo $Dir
  } else {
    Info 'Git unavailable - downloading ZIP snapshot ...'
    $zip="$env:TEMP\wt.zip"
    Invoke-WebRequest "https://github.com/Al1l-plup/-WT-/archive/refs/heads/$Branch.zip" -OutFile $zip
    $tmp="$env:TEMP\wt_x"; if (Test-Path $tmp){ Remove-Item $tmp -Recurse -Force }
    Expand-Archive $zip $tmp -Force
    $inner = Get-ChildItem $tmp -Directory | Select-Object -First 1
    New-Item -ItemType Directory -Force $Dir | Out-Null
    Copy-Item "$($inner.FullName)\*" $Dir -Recurse -Force
  }
}

# --- 4) virtualenv + dependencies ---
function Setup-Venv {
  if (-not (Test-Path "$Dir\.venv\Scripts\python.exe")) {
    Info 'Creating virtualenv ...'
    Push-Location $Dir
    if (Have 'py') { & py -3 -m venv .venv } else { & python -m venv .venv }
    Pop-Location
  }
  Info 'Installing dependencies ...'
  & "$Dir\.venv\Scripts\python.exe" -m pip install --upgrade pip --quiet
  & "$Dir\.venv\Scripts\pip.exe" install -r "$Dir\requirements.txt" --quiet
}

# --- 5) .env with a fresh secret key (kept if already present) ---
function Setup-Env {
  $envFile = "$Dir\.env"
  if (Test-Path $envFile) { Info '.env exists - keeping current settings.'; return }
  $key = (& "$Dir\.venv\Scripts\python.exe" -c "import secrets;print(secrets.token_hex(32))").Trim()
  $content = "FLASK_ENV=production`r`nSECRET_KEY=$key`r`nHOST=0.0.0.0`r`nPORT=$Port`r`nADMIN_EMAIL=al.galimov@astana-motors.kz`r`nLOG_LEVEL=INFO`r`n"
  [IO.File]::WriteAllText($envFile, $content, (New-Object Text.UTF8Encoding($false)))  # UTF-8 no BOM
  Info '.env created with a new SECRET_KEY.'
}

# --- 6) database (build fresh only if missing; real data must be copied over) ---
function Ensure-DB {
  $db = "$Dir\data\welding_shop.db"
  if (Test-Path $db) { Info 'Database present - not touched.'; return }
  Warn 'No data\welding_shop.db found - building a FRESH database (reference data only).'
  & "$Dir\.venv\Scripts\python.exe" "$Dir\scripts\init_db.py"
  Warn '======================================================================'
  Warn ' The fresh DB has NO real data (Weld Balance / defects / equipment).'
  Warn " Copy your real  data\welding_shop.db  from the working PC into"
  Warn "   $Dir\data\   then run:   $Dir\deploy\nssm.exe restart $Service"
  Warn '======================================================================'
}

# --- 7) always-on Windows service via NSSM ---
function Install-Service {
  $nssm = "$Dir\deploy\nssm.exe"
  if (-not (Test-Path $nssm)) {
    Info 'Downloading NSSM (service manager) ...'
    $zip="$env:TEMP\nssm.zip"; Invoke-WebRequest 'https://nssm.cc/release/nssm-2.24.zip' -OutFile $zip
    $tmp="$env:TEMP\nssm_x"; if (Test-Path $tmp){ Remove-Item $tmp -Recurse -Force }
    Expand-Archive $zip $tmp -Force
    New-Item -ItemType Directory -Force "$Dir\deploy" | Out-Null
    Copy-Item "$tmp\nssm-2.24\win64\nssm.exe" $nssm -Force
  }
  New-Item -ItemType Directory -Force "$Dir\logs" | Out-Null
  $py = "$Dir\.venv\Scripts\python.exe"
  if (Get-Service $Service -ErrorAction SilentlyContinue) {
    Info "Service '$Service' exists - reconfiguring ..."; & $nssm stop $Service | Out-Null
  } else {
    Info "Installing service '$Service' ..."; & $nssm install $Service $py "$Dir\wsgi.py"
  }
  & $nssm set $Service AppDirectory $Dir            | Out-Null
  & $nssm set $Service DisplayName 'WeldTeam MES'   | Out-Null
  & $nssm set $Service Description 'WeldTeam MES (Flask + Waitress)' | Out-Null
  & $nssm set $Service AppStdout "$Dir\logs\server.log" | Out-Null
  & $nssm set $Service AppStderr "$Dir\logs\server.log" | Out-Null
  & $nssm set $Service AppRotateFiles 1             | Out-Null
  & $nssm set $Service Start SERVICE_AUTO_START     | Out-Null
  & $nssm set $Service AppExit Default Restart      | Out-Null   # keep-alive: restart on any exit
  & $nssm set $Service AppRestartDelay 3000         | Out-Null
  & $nssm start $Service | Out-Null
  Info "Service '$Service' started (auto-start on boot, auto-restart on crash)."
}

# --- 8) firewall for the LAN ---
function Open-Firewall {
  if (-not (Get-NetFirewallRule -DisplayName "WeldTeam MES $Port" -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -DisplayName "WeldTeam MES $Port" -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow | Out-Null
    Info "Firewall opened for TCP $Port."
  } else { Info "Firewall rule for TCP $Port already exists." }
}

Info "=== WeldTeam MES install -> $Dir (branch $Branch) ==="
Ensure-Python
Ensure-Git
Get-Code
Setup-Venv
Setup-Env
Ensure-DB
Install-Service
Open-Firewall

$ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
       Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } |
       Select-Object -First 1).IPAddress
Info '=================== DONE ==================='
Info "Service '$Service' is running and will start automatically on every boot."
Info "On this server:   http://127.0.0.1:$Port"
if ($ip) { Info "From the shop LAN: http://${ip}:$Port" }
Info 'Manage the service:  Get-Service WeldTeamMES  |  Restart-Service WeldTeamMES'
