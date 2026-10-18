$ErrorActionPreference = 'Stop'
$taskWorkspace = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$taskInstaller = Join-Path $taskWorkspace 'release\CodeShip-0.2.0-x64.exe'
$taskFixture = [IO.Path]::GetFullPath((Join-Path $taskWorkspace ('.generated\installer-' + [Guid]::NewGuid().ToString('N'))))
$taskExpectedRoot = [IO.Path]::GetFullPath((Join-Path $taskWorkspace '.generated')) + [IO.Path]::DirectorySeparatorChar
if (-not $taskFixture.StartsWith($taskExpectedRoot, [StringComparison]::OrdinalIgnoreCase)) { throw 'Installer fixture leaves the workspace.' }
$taskRegistry = @('HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall', 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall', 'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall')
$taskExisting = $taskRegistry | ForEach-Object { Get-ChildItem -LiteralPath $_ -ErrorAction SilentlyContinue | Get-ItemProperty } | Where-Object { $_.DisplayName -like 'CodeShip*' }
if ($taskExisting) { throw 'An existing CodeShip installation was found. Preserve it; use a separate Windows account for installer lifecycle testing.' }
if (Get-Process -Name 'CodeShip' -ErrorAction SilentlyContinue) { throw 'A CodeShip process is running. Close it before installer testing; the test must not interrupt another session.' }
foreach ($taskSurface in @('Desktop', 'CommonDesktopDirectory')) {
  if (Test-Path -LiteralPath (Join-Path ([Environment]::GetFolderPath($taskSurface)) 'CodeShip.lnk')) { throw 'An existing CodeShip shortcut must be preserved.' }
}
foreach ($taskSurface in @('StartMenu', 'CommonStartMenu')) {
  if (Test-Path -LiteralPath (Join-Path ([Environment]::GetFolderPath($taskSurface)) 'Programs\CodeShip.lnk')) { throw 'An existing CodeShip shortcut must be preserved.' }
}
$taskDestination = Join-Path $taskFixture 'application'
$taskProjects = Join-Path $taskFixture 'projects'
New-Item -ItemType Directory -Path $taskProjects -Force | Out-Null
$taskMarker = Join-Path $taskProjects 'retained-project-marker.txt'
Set-Content -LiteralPath $taskMarker -Value 'User projects stay outside the application install directory.'
$env:CODESHIP_TEST_USER_DATA = Join-Path $taskFixture 'user-data'
$env:CODESHIP_TEST_PROJECTS = $taskProjects
$env:CODESHIP_DESKTOP_SMOKE = '1'
$taskSmokePassed = $false
try {
  Write-Output ('Installing into isolated fixture: ' + $taskDestination)
  $taskInstallProcess = Start-Process -FilePath $taskInstaller -ArgumentList @('/S', ('/D=' + $taskDestination)) -WindowStyle Hidden -Wait -PassThru
  if ($taskInstallProcess.ExitCode -ne 0) { throw ('Installer exited ' + $taskInstallProcess.ExitCode) }
  $env:CODESHIP_PACKAGED_EXE = Join-Path $taskDestination 'CodeShip.exe'
  if (-not (Test-Path -LiteralPath $env:CODESHIP_PACKAGED_EXE)) { throw 'Installed executable was not found.' }
  Push-Location $taskWorkspace
  try { & corepack pnpm test:desktop; if ($LASTEXITCODE -ne 0) { throw 'Installed application smoke failed.' }; $taskSmokePassed = $true } finally { Pop-Location }
} finally {
  $taskUninstaller = [IO.Path]::GetFullPath((Join-Path $taskDestination 'Uninstall CodeShip.exe'))
  if (-not $taskUninstaller.StartsWith($taskExpectedRoot, [StringComparison]::OrdinalIgnoreCase)) { throw 'Uninstall target leaves the workspace.' }
  if (Test-Path -LiteralPath $taskUninstaller) {
    Write-Output 'Uninstalling only the isolated test application.'
    $taskUninstallProcess = Start-Process -FilePath $taskUninstaller -ArgumentList '/S' -WindowStyle Hidden -Wait -PassThru
    if ($taskUninstallProcess.ExitCode -ne 0) { throw ('Uninstaller exited ' + $taskUninstallProcess.ExitCode) }
  }
}
if (-not (Test-Path -LiteralPath $taskMarker)) { throw 'The project marker did not survive uninstall.' }
if (Test-Path -LiteralPath (Join-Path $taskDestination 'CodeShip.exe')) { throw 'Application executable remains after uninstall.' }
$taskLeftover = $taskRegistry | ForEach-Object { Get-ChildItem -LiteralPath $_ -ErrorAction SilentlyContinue | Get-ItemProperty } | Where-Object { $_.DisplayName -like 'CodeShip*' }
if ($taskLeftover) { throw 'The test installation registration was not removed.' }
[ordered]@{ fixture = $taskFixture; installedSmokePassed = $taskSmokePassed; uninstalled = $true; projectMarkerRetained = $true; verifiedAt = [DateTime]::UtcNow.ToString('o') } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $taskWorkspace 'release\install-verification.json')
Write-Output 'Installer, installed offline runtime, uninstall and retained-project checks passed.'
