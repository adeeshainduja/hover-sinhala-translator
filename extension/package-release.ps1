$ErrorActionPreference = "Stop"
$extensionRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $extensionRoot
$releaseRoot = Join-Path $repoRoot "release"
$version = (Get-Content (Join-Path $extensionRoot "manifest.json") -Raw | ConvertFrom-Json).version
$stage = Join-Path $releaseRoot "hover-sinhala-translator-v$version"
$zip = Join-Path $releaseRoot "hover-sinhala-translator-v$version.zip"
if (Test-Path $releaseRoot) { Remove-Item -LiteralPath $releaseRoot -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null
Copy-Item (Join-Path $extensionRoot "manifest.json") $stage
Copy-Item (Join-Path $extensionRoot "dist") (Join-Path $stage "dist") -Recurse
New-Item -ItemType Directory -Path (Join-Path $stage "src\options") | Out-Null
Copy-Item (Join-Path $extensionRoot "src\options\options.html") (Join-Path $stage "src\options")
Copy-Item (Join-Path $extensionRoot "src\options\options.css") (Join-Path $stage "src\options")
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip
if (-not (Test-Path (Join-Path $stage "manifest.json"))) { throw "Release manifest is missing." }
$releaseManifest = Get-Content (Join-Path $stage "manifest.json") -Raw | ConvertFrom-Json
if ($releaseManifest.version -ne $version) { throw "Release version mismatch." }
if ((Get-ChildItem $stage -Recurse -Force -Filter ".env").Count -gt 0) { throw "Secrets found in release." }
if ((Get-ChildItem $stage -Recurse -Force -Directory | Where-Object Name -in @("node_modules", ".git", "tests")).Count -gt 0) { throw "Development files found in release." }
if (-not (Test-Path $zip)) { throw "Release ZIP was not created." }
Write-Output $zip
