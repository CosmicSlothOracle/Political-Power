@echo off
echo Starting Political Card Game...

echo Starting backend server...
start cmd /k "npm run backend"

echo Starting frontend...
start cmd /k "npm run dev:frontend"

echo Both servers are now running.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000