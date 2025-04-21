@echo off
echo Stopping Node.js processes...
taskkill /F /IM node.exe /T

echo Clearing Next.js cache...
if exist .next (
  rmdir /S /Q .next
  echo Next.js cache cleared.
)

echo Starting Next.js development server...
npm run dev