@echo off
echo ==============================================
echo    CineTrack - Baslatiyor...
echo ==============================================
echo.

:: Node.js varsa path'e ekle
set PATH=%PATH%;C:\Program Files\nodejs;%APPDATA%\npm

:: Node kontrol et
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Node.js bulunamadi!
    echo Lutfen nodejs.org adresinden Node.js 20 LTS indirip kurun.
    echo Kurulum sonrasi bu scripti tekrar calistirin.
    pause
    exit /b 1
)

echo [OK] Node.js bulundu
node -v

:: Backend bagimliliklerini kur
echo.
echo [1/4] Backend bagimlilikler kuruluyor...
cd /d "%~dp0backend"
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 (
        echo [HATA] Backend npm install basarisiz!
        pause
        exit /b 1
    )
)
echo [OK] Backend hazir

:: Frontend bagimliliklerini kur
echo.
echo [2/4] Frontend bagimlilikler kuruluyor...
cd /d "%~dp0frontend"
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 (
        echo [HATA] Frontend npm install basarisiz!
        pause
        exit /b 1
    )
)
echo [OK] Frontend hazir

:: Backend'i yeni pencerede baslat
echo.
echo [3/4] Backend sunucu baslatiliyor (port 3001)...
cd /d "%~dp0backend"
start "CineTrack-Backend" cmd /k "echo Backend calisiyor... && node server.js"

:: Bir saniye bekle
timeout /t 2 /nobreak >nul

:: Frontend'i yeni pencerede baslat
echo.
echo [4/4] Frontend baslatiliyor (port 5173)...
cd /d "%~dp0frontend"
start "CineTrack-Frontend" cmd /k "echo Frontend calisiyor... && npm run dev"

:: Bir saniye bekle
timeout /t 3 /nobreak >nul

:: Tarayiciyi ac
echo.
echo Tarayici aciliyor...
start http://localhost:5173

echo.
echo ==============================================
echo    CineTrack basarıyla baslatildi!
echo    http://localhost:5173 adresini ziyaret et
echo ==============================================
pause
