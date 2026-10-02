param([string]$Python = 'python')
$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$venv = Join-Path $repoRoot '.venv-sprite-forge'
& $Python -m venv $venv
if ($LASTEXITCODE -ne 0) { throw 'Could not create the Sprite Forge Python environment.' }
$venvPython = Join-Path $venv 'Scripts/python.exe'
& $venvPython -m pip install -r (Join-Path $PSScriptRoot 'requirements.txt')
if ($LASTEXITCODE -ne 0) { throw 'Could not install Sprite Forge dependencies.' }
& $venvPython (Join-Path $PSScriptRoot 'forge.py') --help
if ($LASTEXITCODE -ne 0) { throw 'Sprite Forge processor did not start.' }
Write-Output 'Sprite Forge is ready. Use .venv-sprite-forge/Scripts/python.exe tools/sprite-forge/forge.py'
