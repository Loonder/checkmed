@echo off
:: ============================================================
:: CheckMed TV Kiosk - Auto-Start Script
:: ============================================================
:: 
:: Este script inicia o CheckMed TV automaticamente.
:: 
:: CONFIGURAÇÃO:
:: 1. Coloque este arquivo junto com CheckMed-TV.exe
:: 2. Para iniciar com o Windows:
::    - Pressione Win+R, digite: shell:startup
::    - Cole um atalho deste .bat lá
:: 
:: OU use o Agendador de Tarefas:
::    - Abra "Agendador de Tarefas"
::    - Criar Tarefa Básica
::    - Disparador: Ao fazer logon
::    - Ação: Iniciar programa -> Selecione este .bat
:: 
:: ============================================================

cd /d "%~dp0"

:: Aguardar 5 segundos para a rede conectar
timeout /t 5 /nobreak > nul

:: Iniciar o CheckMed TV
start "" "CheckMed-TV.exe"

:: Log
echo [%date% %time%] CheckMed TV iniciado >> checkmed-tv-log.txt
