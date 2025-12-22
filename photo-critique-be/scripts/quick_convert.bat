@echo off
chcp 65001 >nul
echo ========================================
echo ERD to Image Converter
echo ========================================
echo.
echo This script helps you convert ERD.mmd to image
echo.
echo Choose an option:
echo [1] Open mermaid.live in browser (Recommended)
echo [2] Check if mermaid-cli is installed
echo [3] Install mermaid-cli (requires Node.js)
echo [4] Convert to PNG (if mermaid-cli installed)
echo [5] Convert to SVG (if mermaid-cli installed)
echo [0] Exit
echo.
set /p choice="Enter your choice: "

if "%choice%"=="1" (
    start https://mermaid.live/
    echo.
    echo Browser opened! Copy the contents of ERD.mmd and paste into the editor.
    echo Then click Actions ^> Download PNG/SVG
    pause
    exit
)

if "%choice%"=="2" (
    where mmdc >nul 2>&1
    if %errorlevel%==0 (
        echo [OK] mermaid-cli is installed!
        mmdc --version
    ) else (
        echo [ERROR] mermaid-cli is not installed
        echo Run option 3 to install it
    )
    pause
    exit
)

if "%choice%"=="3" (
    echo Installing mermaid-cli...
    npm install -g @mermaid-js/mermaid-cli
    pause
    exit
)

if "%choice%"=="4" (
    cd ..
    if exist ERD.mmd (
        echo Converting ERD.mmd to ERD.png...
        mmdc -i ERD.mmd -o ERD.png -w 2400 -b white
        if %errorlevel%==0 (
            echo [OK] ERD.png generated successfully!
        ) else (
            echo [ERROR] Conversion failed. Make sure mermaid-cli is installed.
        )
    ) else (
        echo [ERROR] ERD.mmd not found. Run generate_erd.py first.
    )
    pause
    exit
)

if "%choice%"=="5" (
    cd ..
    if exist ERD.mmd (
        echo Converting ERD.mmd to ERD.svg...
        mmdc -i ERD.mmd -o ERD.svg -t dark
        if %errorlevel%==0 (
            echo [OK] ERD.svg generated successfully!
        ) else (
            echo [ERROR] Conversion failed. Make sure mermaid-cli is installed.
        )
    ) else (
        echo [ERROR] ERD.mmd not found. Run generate_erd.py first.
    )
    pause
    exit
)

if "%choice%"=="0" (
    exit
)

echo Invalid choice!
pause

