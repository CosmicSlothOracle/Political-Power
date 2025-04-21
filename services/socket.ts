/**
 * socket.ts - A lightweight wrapper for socket.io-client
 * This ensures consistent socket connection handling across the application
 */

import io, { Socket } from 'socket.io-client';

// Get server URL from environment or use local IP
const LOCAL_IP = '172.20.10.3'; // Your detected IP address
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || `http://${ LOCAL_IP }:3001`;

class SocketService {
    private socket: Socket | null = null;
    private connected: boolean = false;
    private connectionAttempts: number = 0;
    private maxConnectionAttempts: number = 5;
    private reconnectionTimer: NodeJS.Timeout | null = null;

    constructor() {
        console.log(`[SocketService] Initialized with URL: ${ SOCKET_URL } Mock mode: false`);
    }

    connect(token: string = 'demo-token'): boolean {
        if (this.socket) {
            this.disconnect();
        }

        try {
            console.log(`[SocketService] Connecting to ${ SOCKET_URL }...`);

            this.socket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: this.maxConnectionAttempts,
                timeout: 10000
            });

            this.socket.on('connect', () => {
                console.log('[SocketService] Connected successfully');
                this.connected = true;
                this.connectionAttempts = 0;
                if (this.reconnectionTimer) {
                    clearTimeout(this.reconnectionTimer);
                    this.reconnectionTimer = null;
                }
            });

            this.socket.on('disconnect', (reason) => {
                console.log(`[SocketService] Disconnected: ${ reason }`);
                this.connected = false;
                this.attemptReconnect();
            });

            this.socket.on('connect_error', (error) => {
                console.error('[SocketService] Connection error:', error);
                this.connected = false;
                this.attemptReconnect();
            });

            return true;
        } catch (error) {
            console.error('[SocketService] Failed to initialize socket:', error);
            return false;
        }
    }

    private attemptReconnect(): void {
        if (this.reconnectionTimer) {
            clearTimeout(this.reconnectionTimer);
        }

        if (this.connectionAttempts >= this.maxConnectionAttempts) {
            console.error(`[SocketService] Max connection attempts (${ this.maxConnectionAttempts }) reached`);
            return;
        }

        this.connectionAttempts++;
        console.log(`[SocketService] Will attempt to reconnect (${ this.connectionAttempts }/${ this.maxConnectionAttempts })`);

        this.reconnectionTimer = setTimeout(() => {
            if (this.socket) {
                console.log(`[SocketService] Attempting reconnection...`);
                this.socket.connect();
            }
        }, 2000);
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        this.connected = false;

        if (this.reconnectionTimer) {
            clearTimeout(this.reconnectionTimer);
            this.reconnectionTimer = null;
        }

        console.log('[SocketService] Disconnected');
    }

    emit(event: string, data: any): void {
        if (!this.socket || !this.connected) {
            console.warn(`[SocketService] Cannot emit ${ event }, not connected`);
            return;
        }

        console.log(`[SocketService] Emitting ${ event }:`, data);
        this.socket.emit(event, data);
    }

    on(event: string, callback: Function): void {
        if (!this.socket) {
            console.warn('[SocketService] Socket not initialized');
            return;
        }

        console.log(`[SocketService] Registering listener for ${ event }`);
        this.socket.on(event, callback as any);
    }

    off(event: string, callback?: Function): void {
        if (!this.socket) {
            return;
        }

        if (callback) {
            this.socket.off(event, callback as any);
        } else {
            this.socket.off(event);
        }
    }

    isConnected(): boolean {
        return this.connected && this.socket !== null;
    }
}

// Export as singleton
const socketService = new SocketService();
export default socketService;