/**
 * Socket.io Connectivity Test Script
 *
 * This script tests if the socket.io server is running and can be connected to.
 */

const { io } = require("socket.io-client");
const readline = require('readline');

// Create readline interface for interactive testing
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Default server URL
const DEFAULT_URL = 'http://localhost:3001';

console.log('Socket.io Connectivity Test');
console.log('---------------------------');

// Ask for the server URL
rl.question(`Enter server URL (default: ${ DEFAULT_URL }): `, (url) => {
    const serverUrl = url || DEFAULT_URL;
    console.log(`\nTesting connection to ${ serverUrl }...`);

    // Create socket connection with detailed logging
    const socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        timeout: 5000,
        forceNew: true
    });

    // Connection event handlers
    socket.on('connect', () => {
        console.log('\n✅ SUCCESS: Connected to the server!');
        console.log(`Socket ID: ${ socket.id }`);
        console.log('Transport type:', socket.io.engine.transport.name);

        // Test emitting an event
        console.log('\nSending a ping event to the server...');
        socket.emit('ping', { timestamp: new Date().toISOString() });

        // Wait for potential response then prompt for further testing
        setTimeout(() => {
            rl.question('\nDo you want to test sending a message? (y/n): ', (answer) => {
                if (answer.toLowerCase() === 'y') {
                    rl.question('Enter your message: ', (message) => {
                        socket.emit('message', {
                            content: message,
                            sender: 'TestClient',
                            timestamp: new Date().toISOString()
                        });
                        console.log('Message sent! Waiting for any response...');

                        // Give some time for potential response then close
                        setTimeout(() => {
                            console.log('\nTest completed. Disconnecting...');
                            socket.disconnect();
                            rl.close();
                        }, 3000);
                    });
                } else {
                    console.log('\nTest completed. Disconnecting...');
                    socket.disconnect();
                    rl.close();
                }
            });
        }, 1000);
    });

    socket.on('connect_error', (err) => {
        console.error('\n❌ ERROR: Failed to connect to the server');
        console.error(`Error details: ${ err.message }`);
        console.log('\nPossible causes:');
        console.log('1. The server is not running');
        console.log('2. Wrong server URL');
        console.log('3. CORS is not properly configured on the server');
        console.log('4. Firewall is blocking the connection');

        rl.question('\nDo you want to retry the connection? (y/n): ', (answer) => {
            if (answer.toLowerCase() === 'y') {
                console.log('Retrying connection...');
                socket.connect();
            } else {
                console.log('Test aborted.');
                socket.disconnect();
                rl.close();
            }
        });
    });

    socket.on('disconnect', (reason) => {
        console.log(`\nDisconnected from server. Reason: ${ reason }`);
    });

    // Listen for any event from the server
    socket.onAny((event, ...args) => {
        console.log(`\nReceived event '${ event }' from server with data:`, args);
    });

    // Listen specifically for ping response
    socket.on('pong', (data) => {
        console.log('\n✅ Received pong response from server:', data);
    });

    // Listen for error events
    socket.on('error', (error) => {
        console.error('\n❌ Socket error:', error);
    });
});

// Handle script termination
process.on('SIGINT', () => {
    console.log('\nTest terminated by user.');
    rl.close();
    process.exit(0);
});