@echo off
echo 🔪 Killing existing servers...

echo 🔌 Killing WebSocket server (port 3002)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3002') do taskkill /f /pid %%a 2>nul

echo 🛠️ Killing API server (port 3001)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /f /pid %%a 2>nul

echo 🌐 Killing Next.js dev server (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a 2>nul

echo ✅ All servers killed!
timeout /t 2 /nobreak >nul 