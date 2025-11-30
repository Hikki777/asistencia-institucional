# Instala Hack Nerd Font Mono en Windows
# Estrategia: 1) winget (silencioso) 2) descarga oficial y "Install" por cada TTF

param(
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

function Test-HackFontInstalled {
    try {
        Add-Type -AssemblyName System.Drawing | Out-Null
        $fc = New-Object System.Drawing.Text.InstalledFontCollection
        $names = $fc.Families | ForEach-Object { $_.Name }
        return ($names -contains 'Hack Nerd Font Mono' -or $names -contains 'Hack Nerd Font')
    } catch {
        # Fallback: revisar registro de fuentes por usuario
        try {
            $fontsKey = 'HKCU:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts'
            $props = Get-ItemProperty -Path $fontsKey -ErrorAction SilentlyContinue
            return ($props.PSObject.Properties.Name | Where-Object { $_ -like '*Hack Nerd*' }).Count -gt 0
        } catch {
            return $false
        }
    }
}

function Install-WithWinget {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        return $false
    }
    Write-Host '➡  Instalando con winget: NerdFonts.Hack' -ForegroundColor Cyan
    $args = @('install','-e','--id','NerdFonts.Hack','--accept-package-agreements','--accept-source-agreements')
    $p = Start-Process -FilePath 'winget' -ArgumentList $args -WindowStyle Hidden -PassThru -Wait
    return ($p.ExitCode -eq 0)
}

function Install-FromZip {
    $zipUrl = 'https://github.com/ryanoasis/nerd-fonts/releases/latest/download/Hack.zip'
    $temp = Join-Path $env:TEMP ('HackNF_' + [guid]::NewGuid() + '.zip')
    $tmpDir = Join-Path $env:TEMP ('HackNF_' + [guid]::NewGuid())

    Write-Host "➡  Descargando: $zipUrl" -ForegroundColor Cyan
    Invoke-WebRequest -Uri $zipUrl -OutFile $temp

    Write-Host "➡  Extrayendo: $temp" -ForegroundColor Cyan
    Expand-Archive -Path $temp -DestinationPath $tmpDir -Force

    $ttfs = Get-ChildItem -Path $tmpDir -Recurse -Include *.ttf
    if (-not $ttfs) {
        throw 'No se encontraron archivos TTF esperados en el zip.'
    }

    $installedCount = 0
    foreach ($ttf in $ttfs) {
        try {
            Write-Host ("   • Instalando: {0}" -f $ttf.Name) -ForegroundColor Yellow
            # Este verbo abre el instalador de fuentes (per-user en Windows 10/11). Puede requerir confirmación.
            $proc = Start-Process -FilePath $ttf.FullName -Verb Install -PassThru -Wait
            $installedCount++
        } catch {
            Write-Warning "   ! Falló instalar $($ttf.Name): $($_.Exception.Message)"
        }
    }

    Remove-Item $temp -Force -ErrorAction SilentlyContinue
    Remove-Item $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
    return ($installedCount -gt 0)
}

try {
    if (-not $Force -and (Test-HackFontInstalled)) {
        Write-Host '✓ Hack Nerd Font ya está instalada' -ForegroundColor Green
        exit 0
    }

    if (Install-WithWinget) {
        if (Test-HackFontInstalled) {
            Write-Host '✓ Fuente instalada con winget' -ForegroundColor Green
            exit 0
        }
    }

    Write-Host '↪  winget no disponible o falló. Intentando descarga directa…' -ForegroundColor Yellow
    if (Install-FromZip) {
        if (Test-HackFontInstalled) {
            Write-Host '✓ Fuente instalada desde zip' -ForegroundColor Green
            exit 0
        }
    }

    throw 'No se pudo instalar Hack Nerd Font automáticamente.'
} catch {
    Write-Error $_
    exit 1
}
