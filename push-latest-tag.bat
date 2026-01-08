@echo off
REM Script để tag và push images với tag "latest"
REM Chạy sau khi đã push với tag version cụ thể

set REGISTRY=hoangtu0812

echo ========================================
echo Tagging images as latest...
echo ========================================

REM Tag backend
docker tag %REGISTRY%/pocketfile-backend:v1.0.0 %REGISTRY%/pocketfile-backend:latest
if errorlevel 1 (
    echo ERROR: Tag backend failed!
    exit /b 1
)

REM Tag frontend
docker tag %REGISTRY%/pocketfile-frontend:v1.0.0 %REGISTRY%/pocketfile-frontend:latest
if errorlevel 1 (
    echo ERROR: Tag frontend failed!
    exit /b 1
)

echo [OK] Images tagged successfully
echo.

echo ========================================
echo Pushing latest tags...
echo ========================================

REM Push backend latest
docker push %REGISTRY%/pocketfile-backend:latest
if errorlevel 1 (
    echo ERROR: Push backend latest failed!
    exit /b 1
)
echo [OK] Backend latest pushed

REM Push frontend latest
docker push %REGISTRY%/pocketfile-frontend:latest
if errorlevel 1 (
    echo ERROR: Push frontend latest failed!
    exit /b 1
)
echo [OK] Frontend latest pushed

echo.
echo ========================================
echo Hoan thanh! Tag latest da duoc push
echo ========================================
echo.
echo Bay gio docker-compose.yml co the dung tag "latest"

