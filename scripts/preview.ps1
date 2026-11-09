[CmdletBinding()]
param(
    [switch]$NoBrowser,
    [int]$Port = 4173
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Dist = Join-Path $Root "dist"
$Index = Join-Path $Dist "index.html"

try {
    [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding $false
} catch {}

if (-not (Test-Path -LiteralPath $Index)) {
    Write-Host ""
    Write-Host "  还没有构建产物（dist/index.html）。" -ForegroundColor Yellow
    Write-Host "  这个免安装预览只负责打开已经构建好的站点。" -ForegroundColor Yellow
    Write-Host "  如果要修改文章并重新生成，请安装 Node.js 后运行 dev.cmd。" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

function Get-MimeType([string]$Path) {
    switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        ".html" { "text/html; charset=utf-8" }
        ".css"  { "text/css; charset=utf-8" }
        ".js"   { "text/javascript; charset=utf-8" }
        ".mjs"  { "text/javascript; charset=utf-8" }
        ".json" { "application/json; charset=utf-8" }
        ".xml"  { "application/xml; charset=utf-8" }
        ".txt"  { "text/plain; charset=utf-8" }
        ".svg"  { "image/svg+xml" }
        ".png"  { "image/png" }
        ".jpg"  { "image/jpeg" }
        ".jpeg" { "image/jpeg" }
        ".webp" { "image/webp" }
        ".gif"  { "image/gif" }
        ".ico"  { "image/x-icon" }
        ".woff" { "font/woff" }
        ".woff2" { "font/woff2" }
        ".ttf"  { "font/ttf" }
        ".otf"  { "font/otf" }
        default { "application/octet-stream" }
    }
}

function Send-Response($Stream, [string]$Status, [string]$ContentType, [byte[]]$Bytes, [bool]$HeadOnly) {
    $header = "HTTP/1.1 $Status`r`nContent-Type: $ContentType`r`nContent-Length: $($Bytes.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $Stream.Write($headerBytes, 0, $headerBytes.Length)
    if (-not $HeadOnly) {
        $Stream.Write($Bytes, 0, $Bytes.Length)
    }
    $Stream.Flush()
}

function Send-Text($Stream, [string]$Status, [string]$Message, [bool]$HeadOnly) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Message)
    Send-Response $Stream $Status "text/plain; charset=utf-8" $bytes $HeadOnly
}

$listener = $null
$selectedPort = $Port

for ($candidatePort = $Port; $candidatePort -lt ($Port + 20); $candidatePort += 1) {
    $candidate = $null
    try {
        $candidate = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $candidatePort)
        $candidate.Start()
        $listener = $candidate
        $selectedPort = $candidatePort
        break
    } catch {
        if ($candidate -ne $null) {
            try { $candidate.Stop() } catch {}
        }
    }
}

if ($listener -eq $null) {
    Write-Host ""
    Write-Host "  无法启动本地预览服务：端口被占用或系统限制。" -ForegroundColor Red
    Write-Host "  可以关掉占用 4173 的程序后再试。" -ForegroundColor Red
    Write-Host ""
    exit 1
}

$url = "http://127.0.0.1:$selectedPort/"
$distPrefix = $Dist.TrimEnd("\") + "\"
$notFoundPage = Join-Path $Dist "404.html"

Write-Host ""
Write-Host "  南窗 · 本地预览" -ForegroundColor Cyan
Write-Host "  $url" -ForegroundColor White
Write-Host ""
Write-Host "  这个窗口需要保持打开。按 Ctrl+C 停止服务。" -ForegroundColor DarkGray
Write-Host ""

if (-not $NoBrowser) {
    try { Start-Process $url | Out-Null } catch {}
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $null
        try {
            $client.ReceiveTimeout = 5000
            $client.SendTimeout = 5000
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 2048, $true)
            $requestLine = $reader.ReadLine()

            if ([string]::IsNullOrWhiteSpace($requestLine)) {
                continue
            }

            while ($true) {
                $line = $reader.ReadLine()
                if ($line -eq $null -or $line -eq "") { break }
            }

            $parts = $requestLine.Split(" ")
            if ($parts.Length -lt 2) {
                Send-Text $stream "400 Bad Request" "Bad Request" $false
                continue
            }

            $method = $parts[0].ToUpperInvariant()
            $target = $parts[1]
            $headOnly = $method -eq "HEAD"

            if ($method -ne "GET" -and $method -ne "HEAD") {
                Send-Text $stream "405 Method Not Allowed" "Method Not Allowed" $headOnly
                continue
            }

            $pathPart = $target.Split("?")[0]
            try {
                $decoded = [System.Uri]::UnescapeDataString($pathPart)
            } catch {
                Send-Text $stream "400 Bad Request" "Bad Request" $headOnly
                continue
            }

            if ($decoded -eq "/" -or $decoded -eq "") {
                $fullPath = $Index
            } else {
                $relative = $decoded.TrimStart("/")
                if ($decoded.EndsWith("/")) {
                    $relative = $relative + "index.html"
                }
                $fullPath = [System.IO.Path]::GetFullPath((Join-Path $Dist $relative))
            }

            if (-not $fullPath.StartsWith($distPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
                Send-Text $stream "403 Forbidden" "Forbidden" $headOnly
                continue
            }

            if (Test-Path -LiteralPath $fullPath -PathType Container) {
                $fullPath = Join-Path $fullPath "index.html"
            }

            if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
                if (Test-Path -LiteralPath $notFoundPage -PathType Leaf) {
                    $bytes = [System.IO.File]::ReadAllBytes($notFoundPage)
                    Send-Response $stream "404 Not Found" "text/html; charset=utf-8" $bytes $headOnly
                } else {
                    Send-Text $stream "404 Not Found" "Not Found" $headOnly
                }
                continue
            }

            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            Send-Response $stream "200 OK" (Get-MimeType $fullPath) $bytes $headOnly
        } catch {
            try {
                if ($stream -ne $null) {
                    Send-Text $stream "500 Internal Server Error" "Internal Server Error" $false
                }
            } catch {}
        } finally {
            if ($client -ne $null) {
                try { $client.Close() } catch {}
            }
        }
    }
} finally {
    try { $listener.Stop() } catch {}
    Write-Host ""
    Write-Host "  本地预览已停止。" -ForegroundColor DarkGray
}
