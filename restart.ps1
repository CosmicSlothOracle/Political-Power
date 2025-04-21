# Kill all node processes (Next.js development server)
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Clear ports that might be in use
netsh int ipv4 show excludedportrange protocol=tcp | Out-Null

# Wait a moment for processes to fully terminate
Start-Sleep -Seconds 1

# Start Next.js development server
npm run dev