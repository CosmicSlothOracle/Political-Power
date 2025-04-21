@echo off
echo Checking if Node.js server processes are running...
tasklist /fi "imagename eq node.exe" /fo list

echo.
echo Stopping any running Node.js processes...
taskkill /F /IM node.exe /T

echo.
echo Starting Political Card Game Server...
cd C:\src

echo.
echo Installing dependencies...
call npm install

echo.
echo Starting backend server...
start cmd /k "title Backend Server && npm start"

echo.
echo Starting frontend server...
start cmd /k "title Frontend Server && npm run dev:frontend"

echo.
echo Server startup complete.
echo Backend is running at http://localhost:3001
echo Frontend is running at http://localhost:3000
echo.
echo You can close this window, the servers will continue running in their own windows.