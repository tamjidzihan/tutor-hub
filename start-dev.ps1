$ErrorActionPreference = 'Stop'

$rootPath = $PSScriptRoot
$frontendPath = Join-Path $rootPath 'frontend'
$backendPath = Join-Path $rootPath 'backend'
$requirementsPath = Join-Path $backendPath 'requirements.txt'
$venvPath = Join-Path $backendPath 'env'
$backendPython = Join-Path $venvPath 'Scripts\python.exe'

if (-not (Test-Path (Join-Path $frontendPath 'package.json'))) {
    throw "Frontend package.json not found at '$frontendPath'."
}
if (-not (Test-Path $requirementsPath)) {
    throw "Backend requirements.txt not found at '$requirementsPath'."
}

$npmCommand = Get-Command 'npm.cmd' -ErrorAction SilentlyContinue
if (-not $npmCommand) {
    throw 'npm was not found. Install Node.js and npm, then run this script again.'
}

Write-Host 'Checking frontend dependencies...'
Push-Location $frontendPath
try {
    $dependencyOutput = & $npmCommand.Source ls --depth=0 2>&1
    $dependencyExitCode = $LASTEXITCODE
    $dependencyOutput | ForEach-Object { Write-Host $_ }
    if ($dependencyExitCode -ne 0) {
        Write-Host 'Frontend dependencies are missing or incomplete. Installing with npm...'
        $installOutput = & $npmCommand.Source install 2>&1
        $installExitCode = $LASTEXITCODE
        $installOutput | ForEach-Object { Write-Host $_ }
        if ($installExitCode -ne 0) {
            throw 'npm install failed.'
        }
    } else {
        Write-Host 'Frontend dependencies are already installed.'
    }
} finally {
    Pop-Location
}

if (-not (Test-Path $backendPython)) {
    $pythonCommand = Get-Command 'python.exe' -ErrorAction SilentlyContinue
    $pythonArgs = @()
    if (-not $pythonCommand) {
        $pythonCommand = Get-Command 'py.exe' -ErrorAction SilentlyContinue
        $pythonArgs = @('-3')
    }
    if (-not $pythonCommand) {
        throw 'Python was not found. Install Python 3.12 or newer, then run this script again.'
    }

    Write-Host 'Creating the backend virtual environment...'
    $venvOutput = & $pythonCommand.Source @pythonArgs -m venv $venvPath 2>&1
    $venvExitCode = $LASTEXITCODE
    $venvOutput | ForEach-Object { Write-Host $_ }
    if ($venvExitCode -ne 0) {
        throw 'Failed to create the backend virtual environment.'
    }
}

Write-Host 'Checking and installing backend dependencies from requirements.txt...'
$pipOutput = & $backendPython -m pip install -r $requirementsPath 2>&1
$pipExitCode = $LASTEXITCODE
$pipOutput | ForEach-Object { Write-Host $_ }
if ($pipExitCode -ne 0) {
    throw 'Installing backend Python dependencies failed.'
}

$powershellExe = (Get-Process -Id $PID).Path
Write-Host 'Starting frontend and backend development servers...'
Start-Process -FilePath $powershellExe `
    -WorkingDirectory $frontendPath `
    -ArgumentList @('-NoExit', '-Command', '& npm.cmd run dev')
Start-Process -FilePath $powershellExe `
    -WorkingDirectory $backendPath `
    -ArgumentList @('-NoExit', '-Command', "& '$backendPython' manage.py runserver 0.0.0.0:8000")

Write-Host 'Servers started in separate PowerShell windows.'
Write-Host 'Frontend: http://localhost:5173'
Write-Host 'Backend:  http://127.0.0.1:8000'
