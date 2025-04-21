# Kill all node processes (Next.js development server)
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment for processes to fully terminate
Start-Sleep -Seconds 2

# Start the Next.js development server
& npm run dev