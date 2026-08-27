$ErrorActionPreference = "Stop"
$extensionRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $extensionRoot
$releaseRoot = Join-Path $repoRoot "release"
$stage = Join-Path $releaseRoot "hover-sinhala-translator-v1.0.0"
$zip = Join-Path $releaseRoot "hover-sinhala-translator-v1.0.0.zip"
if (Test-Path $releaseRoot) { Remove-Item -LiteralPath $releaseRoot -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null
Copy-Item (Join-Path $extensionRoot "manifest.json") $stage
Copy-Item (Join-Path $extensionRoot "dist") (Join-Path $stage "dist") -Recurse
New-Item -ItemType Directory -Path (Join-Path $stage "src\options") | Out-Null
Copy-Item (Join-Path $extensionRoot "src\options\options.html") (Join-Path $stage "src\options")
Copy-Item (Join-Path $extensionRoot "src\options\options.css") (Join-Path $stage "src\options")
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip
Write-Output $zip
