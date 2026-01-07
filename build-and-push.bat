@echo off
REM Script để build và push images lên Docker Hub (Windows)
REM Sử dụng: build-and-push.bat [tag]
REM Nếu không có tag, mặc định dùng "latest"

setlocal enabledelayedexpansion

set REGISTRY=hoangtu0812
set TAG=%1
if "%TAG%"=="" set TAG=latest

echo ========================================
echo PocketFile - Build ^& Push Images
echo ========================================
echo Registry: %REGISTRY%
echo Tag: %TAG%
echo.

REM Kiểm tra đã login Docker Hub chưa
docker info | findstr /C:"Username" >nul
if errorlevel 1 (
    echo Chưa đăng nhập Docker Hub. Đang yêu cầu đăng nhập...
    docker login
)

REM Build Backend
echo [1/4] Building backend image...
docker build -t %REGISTRY%/pocketfile-backend:%TAG% ./backend
if errorlevel 1 (
    echo ERROR: Build backend failed!
    exit /b 1
)
echo [OK] Backend built successfully

REM Build Frontend
echo [2/4] Building frontend image...
docker build -t %REGISTRY%/pocketfile-frontend:%TAG% ./frontend
if errorlevel 1 (
    echo ERROR: Build frontend failed!
    exit /b 1
)
echo [OK] Frontend built successfully

REM Push Backend
echo [3/4] Pushing backend image...
docker push %REGISTRY%/pocketfile-backend:%TAG%
if errorlevel 1 (
    echo ERROR: Push backend failed!
    exit /b 1
)
echo [OK] Backend pushed successfully

REM Push Frontend
echo [4/4] Pushing frontend image...
docker push %REGISTRY%/pocketfile-frontend:%TAG%
if errorlevel 1 (
    echo ERROR: Push frontend failed!
    exit /b 1
)
echo [OK] Frontend pushed successfully

echo.
echo ========================================
echo Hoan thanh! Images da duoc push len Docker Hub
echo ========================================
echo.
echo Images:
echo   - %REGISTRY%/pocketfile-backend:%TAG%
echo   - %REGISTRY%/pocketfile-frontend:%TAG%
echo.
echo De deploy tren Portainer, dam bao stack.env co:
echo   REGISTRY=%REGISTRY%
echo   TAG=%TAG%

