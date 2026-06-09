# WeldTeam - Start local server
$ProjectDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $ProjectDir "frontend"
$Port        = 3001

# --- Get local IP ---
$LocalIP = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -notlike "169.*" -and $_.IPAddress -ne "127.0.0.1" } |
    Sort-Object PrefixLength -Descending |
    Select-Object -First 1).IPAddress

if (-not $LocalIP) { $LocalIP = "??.??.??.??" }

# --- Check if port is already busy ---
$busy = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($busy) {
    Write-Host ""
    Write-Host "  [WARN] Port $Port is busy (PID $($busy.OwningProcess))." -ForegroundColor Yellow
    $answer = Read-Host "  Stop old process and restart? (y/n)"
    if ($answer -eq "y") {
        Stop-Process -Id $busy.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    } else {
        exit 0
    }
}

# --- Build frontend if dist is missing ---
$DistDir = Join-Path $FrontendDir "dist"
if (-not (Test-Path $DistDir)) {
    Write-Host ""
    Write-Host "  [BUILD] No dist folder found - building frontend..." -ForegroundColor Cyan
    Push-Location $FrontendDir
    npm run build
    Pop-Location
    if (-not (Test-Path $DistDir)) {
        Write-Host "  [ERROR] Build failed. Check errors above." -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] Frontend built." -ForegroundColor Green
}

# --- Firewall rule (requires admin rights) ---
$ruleName   = "WeldTeam Server 3001"
$ruleCheck  = netsh advfirewall firewall show rule name=$ruleName 2>$null
if ($ruleCheck -notmatch "OK") {
    Write-Host "  [FIREWALL] Adding firewall rule for port $Port..." -ForegroundColor Cyan
    netsh advfirewall firewall add rule name=$ruleName dir=in action=allow protocol=TCP localport=$Port 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [WARN] Admin rights needed for firewall. Run once as Administrator:" -ForegroundColor Yellow
        Write-Host "  netsh advfirewall firewall add rule name=`"WeldTeam Server 3001`" dir=in action=allow protocol=TCP localport=3001" -ForegroundColor Gray
    } else {
        Write-Host "  [OK] Firewall rule added." -ForegroundColor Green
    }
}

# --- Start server ---
Write-Host ""
Write-Host "========================================================" -ForegroundColor DarkCyan
Write-Host "   WeldTeam Server"                                        -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "   Local :  http://localhost:$Port"                        -ForegroundColor White
Write-Host "   LAN   :  http://$($LocalIP):$Port"                     -ForegroundColor Yellow
Write-Host ""
Write-Host "   Share the LAN link with colleagues on the same network" -ForegroundColor Gray
Write-Host "   Press Ctrl+C to stop the server"                        -ForegroundColor Gray
Write-Host "========================================================" -ForegroundColor DarkCyan
Write-Host ""

$env:NODE_ENV = "production"
$env:PORT     = $Port
Set-Location $ProjectDir
node backend/src/index.js
