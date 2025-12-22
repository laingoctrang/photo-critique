@echo off
REM Script để refresh tất cả rankings (Windows)
REM Sử dụng: scripts\refresh_all_rankings.bat

REM Cấu hình
set API_BASE_URL=http://localhost:8080
set API_ENDPOINT=%API_BASE_URL%/api/rankings/refresh-all

echo === Refreshing All Rankings ===
echo API Endpoint: %API_ENDPOINT%
echo.

REM Kiểm tra xem server có đang chạy không
curl -s --head --request GET "%API_BASE_URL%/actuator/health" >nul 2>&1
if errorlevel 1 (
    echo Error: Cannot connect to server at %API_BASE_URL%
    echo Please make sure the server is running.
    exit /b 1
)

REM Gọi API refresh-all
echo Calling refresh-all endpoint...
curl -X POST "%API_ENDPOINT%" ^
    -H "Content-Type: application/json" ^
    -w "\nHTTP Status: %%{http_code}\n"

if errorlevel 1 (
    echo.
    echo Error: Failed to call API
    exit /b 1
)

echo.
echo === Refresh completed ===


