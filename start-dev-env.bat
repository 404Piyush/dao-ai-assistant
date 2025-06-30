@echo off
title DAO AI Assistant - Full Stack Startup

echo 🚀 Starting DAO AI Assistant Full Stack...
echo.

:: Kill existing servers first
echo 🔪 Cleaning up existing servers...
call kill-servers.bat

echo.
echo 🔧 Starting API Server (Port 3001)...
start "API Server" cmd /k "cd /d %~dp0 && node server/index.js"

echo ⏳ Waiting for API server to initialize...
timeout /t 5 /nobreak >nul

echo.
echo 🔌 Starting WebSocket Server (Port 3002)...
start "WebSocket Server" cmd /k "cd /d %~dp0 && node server/websocket-server.js"

echo ⏳ Waiting for WebSocket server to initialize...
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Starting Next.js Frontend (Port 3000)...
start "Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ✅ All servers are starting up!
echo.
echo 📋 Server URLs:
echo   🌐 Frontend: http://localhost:3000
echo   🛠️ API:      http://localhost:3001
echo   🔌 WebSocket: http://localhost:3002
echo.
echo 🔍 Check the individual windows for server status
echo 📊 Analytics should be working once all servers are running
echo.
pause 