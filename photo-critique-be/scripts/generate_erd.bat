@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Generating ERD diagram...
python generate_erd.py
echo.
echo ERD files generated successfully!
echo - ERD.mmd (Mermaid diagram)
echo - ERD_README.md (Instructions)
echo.
pause

