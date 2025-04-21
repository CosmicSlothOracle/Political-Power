/**
 * mockSocketHelper.ts
 * Utility functions to help with socket testing in mock mode
 */

import socketService from './socketService';

/**
 * Enable mock mode for the socket service
 * @param force If true, will forcibly disconnect any existing socket and enable mock mode
 */
export function enableMockMode(force: boolean = false): void {
    if (force && socketService.isConnected()) {
        socketService.disconnect();
    }

    console.log('[MockHelper] Enabling mock mode for socket testing');
    socketService.connect({
        url: 'http://localhost:3001',
        useMock: true
    });
}

/**
 * Disable mock mode and try to connect to the real socket server
 */
export function disableMockMode(): Promise<boolean> {
    console.log('[MockHelper] Disabling mock mode and connecting to real server');
    return socketService.connect({
        url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
        useMock: false
    });
}

/**
 * Test if the socket server is available by attempting a connection
 * Falls back to mock mode if the connection fails
 */
export async function testSocketAndFallback(timeout: number = 5000): Promise<boolean> {
    console.log('[MockHelper] Testing socket connection with fallback');

    try {
        const connected = await socketService.connect({
            url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
            useMock: false,
            timeout
        });

        if (!connected) {
            console.log('[MockHelper] Socket connection failed, falling back to mock mode');
            enableMockMode(true);
            return false;
        }

        return true;
    } catch (error) {
        console.error('[MockHelper] Error testing socket connection:', error);
        enableMockMode(true);
        return false;
    }
}