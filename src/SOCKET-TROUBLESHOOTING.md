# Socket Connection Troubleshooting Guide

This guide will help you resolve socket connection issues in the Political Card Game application.

## Common Socket Connection Errors

1. **Connection Timeout Error**
   ```
   [SocketService] Connection error: Error: timeout
   ```
   This typically occurs when the socket client attempts to connect to the server but doesn't receive a response within the timeout period.

2. **Connection Refused Error**
   ```
   [SocketService] Connection error: Error: xhr poll error
   ```
   This happens when the server is not running or not accessible at the specified URL.

3. **CORS Errors**
   ```
   Access to XMLHttpRequest has been blocked by CORS policy
   ```
   This occurs when the server doesn't have proper CORS configuration.

## Troubleshooting Steps

### 1. Check if the Backend Server is Running

The backend server should be running on http://localhost:3001. To verify:

```bash
# Check if node processes are running
tasklist /fi "imagename eq node.exe"

# Test connection to the server
curl http://localhost:3001
```

If the server is not running, use the provided `server-startup.bat` script to restart it.

### 2. Check Socket Configuration

Ensure both frontend and backend socket configurations are compatible:

#### Backend (server.js)
```javascript
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_USE_MOCK_SOCKET=false
```

### 3. Test Socket Connection Directly

Use the provided `test-socket.js` script to test the socket connection:

```bash
node test-socket.js
```

This will attempt to connect to the socket server and provide detailed diagnostics.

### 4. Debugging Connection Issues

If you're experiencing connection timeouts:

1. **Increase Timeout Value**: Modify the timeout in `socketService.ts` to a higher value (e.g., 30000ms)
   ```javascript
   private timeout: number = 30000; // 30 seconds
   ```

2. **Check Network Conditions**: Ensure there are no firewall or network issues blocking the connection.

3. **Use Fallback to Mock Mode**: If in development, you can temporarily enable mock mode in `.env.local`:
   ```
   NEXT_PUBLIC_USE_MOCK_SOCKET=true
   ```

### 5. Browser Console Debugging

Open your browser's developer tools (F12) and check the console for errors. Look for:

- Socket connection errors
- CORS errors
- Network request failures

### 6. Server-Side Logging

Check the terminal where your server is running for error messages. Common server-side issues include:

- Port conflicts (another service using port 3001)
- Socket namespace or event name mismatches
- Authentication/authorization errors

## Quick Solutions

### If the game works but sockets don't connect:

1. Restart both servers using `server-startup.bat`
2. Clear browser cache and reload the page
3. Check if the correct socket URL is being used
4. Temporarily enable mock mode for testing

### If you need to use mock mode:

In `.env.local`:
```
NEXT_PUBLIC_USE_MOCK_SOCKET=true
```

Then restart the frontend server.

## Advanced Debugging

For more advanced debugging, you can enable detailed socket.io logging:

```javascript
// In socketService.ts
this.socket = io(this.url, {
    transports: ['websocket', 'polling'],
    reconnection: false,
    timeout: this.timeout,
    forceNew: true,
    autoConnect: true,
    debug: true // Enable internal socket.io debug logging
});

// In your browser console
localStorage.debug = '*'; // Enable all socket.io debug logs
```

---

For further assistance, check the [Socket.io official documentation](https://socket.io/docs/v4/).