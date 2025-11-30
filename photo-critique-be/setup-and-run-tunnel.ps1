<#
  setup-and-run-tunnel.ps1
  - Creates/starts a Cloudflare Tunnel bound to dev.<domain> -> localhost:<localPort>
  - If cloudflared is missing, attempts to download & install (msi).
  - One-time cloudflared login will open your browser; the script waits for cert.
  - Creates %USERPROFILE%\.cloudflared\config.yml if not exists.
  - Starts the tunnel (non-blocking).
#>

# -----------------------------
# Configuration
# -----------------------------
$domain     = "photocritique.pages.dev"
$subdomain  = "app"
$tunnelName = "tunnel-$env:USERNAME"
$localPort  = 8080
# -----------------------------

# paths / defaults
$cloudflaredDefaultPaths = @(
    "$env:ProgramFiles\Cloudflare\cloudflared.exe",
    "$env:ProgramFiles(x86)\Cloudflare\cloudflared.exe",
    "$env:LOCALAPPDATA\cloudflared\cloudflared.exe"
)

$cloudflaredDownloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.msi"
$cloudflaredExe = $null
$configDir = Join-Path $env:USERPROFILE ".cloudflared"
$configPath = Join-Path $configDir "config.yml"
$certPath = Join-Path $configDir "cert.pem"

function Write-Info($msg) { Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "[ERROR] $msg" -ForegroundColor Red }

function Find-Cloudflared {
    # Try command first
    $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    # Check common installation paths
    foreach ($path in $cloudflaredDefaultPaths) {
        if (Test-Path $path) {
            return $path
        }
    }

    # Search in Program Files and other locations
    $searchPaths = @(
        "$env:ProgramFiles\Cloudflare",
        "$env:ProgramFiles(x86)\Cloudflare",
        "$env:LOCALAPPDATA\Cloudflare",
        "$env:LOCALAPPDATA\cloudflared"
    )

    foreach ($dir in $searchPaths) {
        if (Test-Path $dir) {
            $exe = Get-ChildItem -Path $dir -Filter "cloudflared.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($exe) {
                return $exe.FullName
            }
        }
    }

    return $null
}

# -----------------------------
# 1) Find cloudflared
# -----------------------------
Write-Info "Locating cloudflared..."
$cloudflaredExe = Find-Cloudflared

if ($cloudflaredExe) {
    Write-Info "Found cloudflared at: $cloudflaredExe"
} else {
    Write-Warn "cloudflared not found in standard locations."
}

# -----------------------------
# 2) If not found, download & install MSI
# -----------------------------
if (-not $cloudflaredExe) {
    Write-Warn "cloudflared not found. Downloading and installing..."
    $tmpMsi = Join-Path $env:TEMP "cloudflared.msi"

    try {
        # Download
        Write-Info "Downloading cloudflared from $cloudflaredDownloadUrl"
        Invoke-WebRequest -Uri $cloudflaredDownloadUrl -OutFile $tmpMsi -UseBasicParsing
        Write-Info "Downloaded to $tmpMsi"

        # Install
        Write-Info "Installing cloudflared (requires Administrator privileges)..."
        $msiLog = Join-Path $env:TEMP "cloudflared-install.log"
        $installArgs = @(
            "/i", "`"$tmpMsi`"",
            "/quiet",
            "/norestart",
            "/L*V", "`"$msiLog`""
        )

        $process = Start-Process -FilePath "msiexec.exe" -ArgumentList $installArgs -Wait -PassThru -NoNewWindow

        if ($process.ExitCode -ne 0) {
            Write-Err "Installation failed with exit code $($process.ExitCode). Check log: $msiLog"
            Write-Warn "You may need to run PowerShell as Administrator"
            Remove-Item $tmpMsi -ErrorAction SilentlyContinue
            exit 1
        }

        Write-Info "Installation completed successfully"
        Remove-Item $tmpMsi -ErrorAction SilentlyContinue

        # Wait a moment for installation to complete
        Start-Sleep -Seconds 5

        # Refresh PATH environment variable by re-reading from registry
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

        # Try to find cloudflared again
        Write-Info "Searching for installed cloudflared..."
        $cloudflaredExe = Find-Cloudflared

        if (-not $cloudflaredExe) {
            Write-Err "cloudflared installed but not found. Please restart your PowerShell session and run the script again."
            Write-Err "Alternatively, you can manually run cloudflared from the Start menu."
            exit 1
        }

        Write-Info "Found cloudflared after installation: $cloudflaredExe"

    } catch {
        Write-Err "Failed to download or install cloudflared: $($_.Exception.Message)"
        if (Test-Path $tmpMsi) {
            Remove-Item $tmpMsi -ErrorAction SilentlyContinue
        }
        exit 1
    }
}

# Ensure we have the cloudflared executable
if (-not $cloudflaredExe) {
    Write-Err "Could not find or install cloudflared. Exiting."
    exit 1
}

# ensure config dir exists
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# -----------------------------
# 3) Login to Cloudflare (one-time)
# -----------------------------
if (-not (Test-Path $certPath)) {
    Write-Info "Cloudflare login is required (one-time). A browser window will open."
    Write-Info "If browser opens, please complete login and then return here."
    try {
        & $cloudflaredExe login
    } catch {
        Write-Err "Failed to run 'cloudflared login'. Ensure $cloudflaredExe path is correct."
        throw $_
    }

    # wait for cert to appear (max wait ~ 2 minutes)
    $waitSec = 120
    $elapsed = 0
    Write-Info "Waiting for certificate to be created..."
    while (-not (Test-Path $certPath) -and $elapsed -lt $waitSec) {
        Start-Sleep -Seconds 2
        $elapsed += 2
        Write-Info "Waiting... ($elapsed/$waitSec seconds)"
    }

    if (-not (Test-Path $certPath)) {
        Write-Warn "cert.pem not found after login. If login completed, cert may be in a different location."
        Write-Warn "Press Enter to continue anyway, or Ctrl+C to abort."
        Read-Host "Press Enter to continue"
    } else {
        Write-Info "Login appears successful. cert.pem found at $certPath"
    }
} else {
    Write-Info "Cloudflare already logged in (cert.pem exists)."
}

# -----------------------------
# 4) Create tunnel (if missing)
# -----------------------------
Write-Info "Checking existing tunnels..."
$tunnelsJson = $null
try {
    $tunnelsJson = & $cloudflaredExe tunnel list --output json 2>$null
} catch {
    Write-Warn "Could not list tunnels with JSON output. Attempting plain list..."
    $tunnelsJson = & $cloudflaredExe tunnel list 2>$null
}

$tunnelExists = $false
$tunnelID = $null

# If JSON returned, parse and look for name
if ($tunnelsJson -and $tunnelsJson.Trim().StartsWith("[")) {
    try {
        $arr = $tunnelsJson | ConvertFrom-Json
        foreach ($t in $arr) {
            if ($t.name -eq $tunnelName) {
                $tunnelExists = $true
                $tunnelID = $t.id
                break
            }
        }
    } catch {
        # fallback to text parsing below
        $tunnelExists = $false
    }
}

if (-not $tunnelExists) {
    Write-Info "Tunnel '$tunnelName' not found. Creating..."
    try {
        # Thử tạo tunnel với đầu ra JSON
        $createOut = & $cloudflaredExe tunnel create $tunnelName --output json
        # Phân tích JSON để lấy tunnel ID
        $tunnelInfo = $createOut | ConvertFrom-Json
        $tunnelID = $tunnelInfo.id
    } catch {
        # Nếu dùng JSON thất bại, thử tạo bình thường và phân tích văn bản
        Write-Warn "Failed to create tunnel with JSON output. Trying without JSON..."
        $createOut = & $cloudflaredExe tunnel create $tunnelName
        if ($createOut -match "Created tunnel ([\w-]+)") {
            $tunnelID = $Matches[1]
        } else {
            # Fallback: thử lấy từ danh sách tunnel
            Write-Warn "Could not parse tunnel ID from create output. Attempting to get from tunnel list..."
            $tunnelsJson2 = & $cloudflaredExe tunnel list --output json 2>$null
            if ($tunnelsJson2 -and $tunnelsJson2.Trim().StartsWith("[")) {
                $arr2 = $tunnelsJson2 | ConvertFrom-Json
                foreach ($t in $arr2) {
                    if ($t.name -eq $tunnelName) { $tunnelID = $t.id; break }
                }
            }
        }
    }

    if (-not $tunnelID) {
        Write-Err "Could not determine tunnel ID after create. Please check 'cloudflared tunnel list'."
    } else {
        Write-Info "Tunnel created. ID = $tunnelID"
    }
} else {
    Write-Info "Tunnel '$tunnelName' already exists (ID: $tunnelID)."
}


# -----------------------------
# 5) Ensure DNS mapping (manual instruction)
# -----------------------------
Write-Info "Next step: create a DNS CNAME in Cloudflare dashboard that points:"
Write-Host "  Name: $subdomain"
Write-Host "  Type: CNAME"
Write-Host "  Target: $($tunnelID).cfargotunnel.com"
Write-Host ""
Write-Host "If you already added the CNAME, skip this step. If not, open Cloudflare dashboard -> DNS -> Add record."
Write-Host ""

# -----------------------------
# 6) Create config.yml if missing
# -----------------------------
if (-not (Test-Path $configPath)) {
    Write-Info "Creating config.yml at $configPath"
    # build credential filename path used by cloudflared
    if (-not $tunnelID) {
        Write-Warn "Tunnel ID unknown; will attempt to derive credential file later. Config will still be created with placeholder."
        $credFile = "$configDir\$tunnelName.json"
    } else {
        $credFile = Join-Path $configDir ("$tunnelID.json")
    }

    $yamlTemplate = @'
tunnel: TUNNEL_ID
credentials-file: CREDENTIAL_FILE

ingress:
  - hostname: HOSTNAME
    service: SERVICE_URL
  - service: http_status:404
'@

    $hostname = "$subdomain.$domain"
    $serviceUrl = "http://localhost:$localPort"

    # Fix: Replace ternary operator with if-else for PowerShell compatibility
    $tunnelIdValue = $tunnelID
    if (-not $tunnelIdValue) {
        $tunnelIdValue = $tunnelName
    }

    $yaml = $yamlTemplate.Replace("TUNNEL_ID", $tunnelIdValue)
    $yaml = $yaml.Replace("CREDENTIAL_FILE", $credFile)
    $yaml = $yaml.Replace("HOSTNAME", $hostname)
    $yaml = $yaml.Replace("SERVICE_URL", $serviceUrl)

    try {
        $yaml | Out-File -FilePath $configPath -Encoding UTF8 -Force
        Write-Info "config.yml created."
    } catch {
        Write-Err "Failed to write config.yml: $_"
        throw $_
    }
} else {
    Write-Info "config.yml already exists at $configPath"
}

# -----------------------------
# 7) Start the tunnel (non-blocking)
# -----------------------------
Write-Info "Starting Cloudflare tunnel (non-blocking)..."
try {
    Start-Process -FilePath $cloudflaredExe -ArgumentList "tunnel run $tunnelName" -NoNewWindow
    Start-Sleep -Seconds 2
    Write-Info "Tunnel launched. Access your local service at: https://$subdomain.$domain -> http://localhost:$localPort"
} catch {
    Write-Err "Failed to start tunnel process: $_"
    throw $_
}

Write-Info "DONE. If this is the first time, ensure you added the DNS CNAME record in Cloudflare dashboard and that the record is proxied (orange cloud)."
Write-Host ""
Write-Host "Facebook: add the redirect URI to your app's settings:"
Write-Host "  https://$subdomain.$domain/api/oauth/callback/facebook"
Write-Host ""
Write-Host "If cloudflared login opened a browser, complete the login there (one-time)."