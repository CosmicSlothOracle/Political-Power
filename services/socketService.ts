/**
 * socketService.ts
 * Socket service for the game to handle real-time interactions
 */

import { io, Socket } from 'socket.io-client';
import { BrowserEventEmitter } from './browserEventEmitter';

interface SocketOptions {
    url: string;
    useMock: boolean;
    reconnectAttempts?: number;
    reconnectDelay?: number;
    timeout?: number;
}

class SocketService {
    private socket: Socket | null = null;
    private eventEmitter: BrowserEventEmitter = new BrowserEventEmitter();
    private mockMode: boolean = false;
    private url: string = '';
    private reconnectAttempts: number = 5;
    private reconnectDelay: number = 3000;
    private timeout: number = 20000; // Increase timeout for slower connections
    private currentReconnectAttempt: number = 0;
    private isConnecting: boolean = false;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private connectionPromise: Promise<boolean> | null = null;

    constructor() {
        // Initialize with environment variables, but don't connect yet
        this.url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        this.mockMode = process.env.NEXT_PUBLIC_USE_MOCK_SOCKET === 'true';

        console.log('[SocketService] Initialized with URL:', this.url, 'Mock mode:', this.mockMode);

        // For browser environment, setup connection check on window focus
        if (typeof window !== 'undefined') {
            window.addEventListener('focus', this.checkConnection.bind(this));
        }
    }

    // Method to check connection status and reconnect if needed
    private checkConnection(): void {
        if (!this.isConnected() && !this.isConnecting && !this.mockMode) {
            console.log('[SocketService] Window focused, checking connection');
            this.connect().catch(err => {
                console.error('[SocketService] Reconnection failed:', err);
            });
        }
    }

    connect(options?: Partial<SocketOptions>): Promise<boolean> {
        // If already connecting, return the existing promise
        if (this.connectionPromise && this.isConnecting) {
            console.log('[SocketService] Already connecting, returning existing promise');
            return this.connectionPromise;
        }

        // Update options if provided
        if (options) {
            if (options.url) this.url = options.url;
            if (options.useMock !== undefined) this.mockMode = options.useMock;
            if (options.reconnectAttempts) this.reconnectAttempts = options.reconnectAttempts;
            if (options.reconnectDelay) this.reconnectDelay = options.reconnectDelay;
            if (options.timeout) this.timeout = options.timeout;
        }

        // In mock mode, don't actually connect to a socket
        if (this.mockMode) {
            console.log('[SocketService] Using mock mode, not connecting to actual socket');
            return Promise.resolve(true);
        }

        // If already connected, just return success
        if (this.isConnected()) {
            console.log('[SocketService] Already connected');
            return Promise.resolve(true);
        }

        this.isConnecting = true;
        this.currentReconnectAttempt = 0;

        this.connectionPromise = new Promise((resolve) => {
            try {
                console.log(`[SocketService] Connecting to socket server at ${ this.url }`);

                // Close existing socket if any
                if (this.socket) {
                    this.socket.close();
                    this.socket = null;
                }

                // Ensure URL is valid
                if (!this.url || !this.url.startsWith('http')) {
                    console.error(`[SocketService] Invalid socket URL: ${ this.url }`);
                    this.handleConnectionFailure(resolve);
                    return;
                }

                this.socket = io(this.url, {
                    transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
                    reconnection: false, // We'll handle reconnection manually
                    timeout: this.timeout, // Increase timeout for slower connections
                    forceNew: true, // Force a new connection
                    autoConnect: true, // Connect immediately
                    path: '/socket.io/', // Default socket.io path
                    // Add debug for development environment
                    debug: process.env.NODE_ENV === 'development'
                });

                // Set a connection timeout
                const connectionTimeout = setTimeout(() => {
                    if (this.socket && !this.socket.connected) {
                        console.warn('[SocketService] Connection attempt timed out');
                        this.socket.close();
                        this.handleConnectionFailure(resolve);
                    }
                }, this.timeout + 1000);

                this.socket.on('connect', () => {
                    console.log('[SocketService] Socket connected successfully');
                    clearTimeout(connectionTimeout);
                    this.isConnecting = false;
                    this.currentReconnectAttempt = 0;
                    if (this.reconnectTimer) {
                        clearTimeout(this.reconnectTimer);
                        this.reconnectTimer = null;
                    }

                    // Setup ping/pong for connection health checks
                    this.setupConnectionHealthCheck();

                    resolve(true);
                });

                this.socket.on('connect_error', (error) => {
                    console.error('[SocketService] Connection error:', error);
                    clearTimeout(connectionTimeout);
                    this.handleConnectionFailure(resolve);
                });

                this.socket.on('disconnect', (reason) => {
                    console.log('[SocketService] Socket disconnected:', reason);

                    // Only null the socket if it's the same instance
                    if (this.socket) {
                        this.socket.close();
                        this.socket = null;
                    }

                    // If the disconnection wasn't initiated by the client, try to reconnect
                    if (reason !== 'io client disconnect') {
                        this.handleConnectionFailure(resolve);
                    }
                });

                this.socket.on('error', (error) => {
                    console.error('[SocketService] Socket error:', error);
                    this.emitErrorEvent(`Socket error: ${ error }`);
                });

            } catch (error) {
                console.error('[SocketService] Failed to initialize socket:', error);
                this.handleConnectionFailure(resolve);
            }
        });

        return this.connectionPromise;
    }

    // Setup a periodic ping to check if the connection is still alive
    private setupConnectionHealthCheck(): void {
        if (!this.socket || this.mockMode) return;

        const PING_INTERVAL = 30000; // 30 seconds

        const pingInterval = setInterval(() => {
            if (!this.socket || !this.socket.connected) {
                clearInterval(pingInterval);
                return;
            }

            this.socket.emit('ping', { timestamp: Date.now() });
        }, PING_INTERVAL);

        // Clean up the interval when disconnected
        this.socket.on('disconnect', () => {
            clearInterval(pingInterval);
        });
    }

    private emitErrorEvent(message: string): void {
        this.eventEmitter.emit('error', message);
    }

    private handleConnectionFailure(resolvePromise: (value: boolean) => void): void {
        if (this.currentReconnectAttempt < this.reconnectAttempts) {
            this.currentReconnectAttempt++;
            console.log(`[SocketService] Reconnect attempt ${ this.currentReconnectAttempt }/${ this.reconnectAttempts } in ${ this.reconnectDelay }ms`);

            // Clear any existing reconnect timer
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
            }

            this.reconnectTimer = setTimeout(() => {
                if (this.socket) {
                    this.socket.close();
                    this.socket = null;
                }

                this.isConnecting = false;
                this.connectionPromise = null;
                this.connect().then(resolvePromise);
            }, this.reconnectDelay);
        } else {
            console.error('[SocketService] Max reconnect attempts reached, falling back to mock mode');
            this.isConnecting = false;
            this.connectionPromise = null;

            if (this.socket) {
                this.socket.close();
                this.socket = null;
            }

            // In development, fall back to mock mode
            if (process.env.NODE_ENV === 'development') {
                console.log('[SocketService] In development environment, falling back to mock mode');
                this.mockMode = true;
                resolvePromise(true);
            } else {
                resolvePromise(false);
            }
        }
    }

    disconnect(): void {
        if (this.socket) {
            console.log('[SocketService] Disconnecting socket');
            this.socket.disconnect();
            this.socket = null;
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        this.currentReconnectAttempt = 0;
        this.isConnecting = false;
        this.connectionPromise = null;
    }

    isConnected(): boolean {
        if (this.mockMode) return true;
        return this.socket !== null && this.socket.connected;
    }

    joinGame(gameId: string): void {
        if (this.mockMode) {
            console.log('[SocketService] Mock: Joining game room', gameId);
            return;
        }

        if (!this.isConnected()) {
            console.warn('[SocketService] Cannot join game: Socket not connected');
            // Try to connect first, then join
            this.connect().then((connected) => {
                if (connected) {
                    console.log('[SocketService] Connected, now joining game room', gameId);
                    this.socket!.emit('join-room', gameId);
                } else {
                    console.error('[SocketService] Failed to connect, cannot join game room', gameId);
                }
            });
            return;
        }

        console.log('[SocketService] Joining game room', gameId);
        this.socket!.emit('join-room', gameId);
    }

    leaveGame(gameId: string): void {
        if (this.mockMode) {
            console.log('[SocketService] Mock: Leaving game room', gameId);
            return;
        }

        if (!this.isConnected()) {
            console.warn('[SocketService] Cannot leave game: Socket not connected');
            return;
        }

        console.log('[SocketService] Leaving game room', gameId);
        this.socket!.emit('leave-room', gameId);
    }

    on(event: string, callback: (...args: any[]) => void): void {
        if (this.mockMode) {
            this.eventEmitter.on(event, callback);
            return;
        }

        if (!this.isConnected()) {
            console.warn(`[SocketService] Socket not connected for event ${ event }, registering with local emitter`);
            this.eventEmitter.on(event, callback);

            // Connect and then re-register with the socket when connected
            this.connect().then((connected) => {
                if (connected && this.socket) {
                    console.log(`[SocketService] Now connected, registering ${ event } with socket`);
                    this.socket.on(event, callback);
                }
            });
            return;
        }

        this.socket!.on(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void): void {
        if (this.mockMode) {
            this.eventEmitter.off(event, callback);
            return;
        }

        if (!this.isConnected()) {
            console.warn(`[SocketService] Cannot remove listener for event ${ event }: Socket not connected`);
            this.eventEmitter.off(event, callback);
            return;
        }

        if (callback) {
            this.socket!.off(event, callback);
        } else {
            this.socket!.off(event);
        }
    }

    emit(event: string, ...args: any[]): void {
        if (this.mockMode) {
            console.log(`[SocketService] Mock: Emitting event ${ event }`, args);
            this.mockEventHandler(event, ...args);
            return;
        }

        if (!this.isConnected()) {
            console.warn(`[SocketService] Cannot emit event ${ event }: Socket not connected, attempting to connect...`);

            this.connect().then((connected) => {
                if (connected) {
                    console.log(`[SocketService] Now connected, emitting ${ event }`);
                    this.emit(event, ...args); // Recursively call emit after connecting
                } else {
                    console.error(`[SocketService] Failed to connect, cannot emit ${ event }`);
                    // Fallback to mock handler in development
                    if (process.env.NODE_ENV === 'development') {
                        console.log(`[SocketService] Falling back to mock handler for ${ event }`);
                        this.mockEventHandler(event, ...args);
                    }
                }
            });
            return;
        }

        console.log(`[SocketService] Emitting event ${ event }`, args);

        // Add specific event listeners for game creation
        if (event === 'create-game') {
            this.socket!.once('create-game-response', (response) => {
                console.log('[SocketService] Received create-game-response:', response);
                if (response.success) {
                    this.eventEmitter.emit('create-game-response', response);
                } else {
                    console.error('[SocketService] Game creation failed:', response.error);
                    this.eventEmitter.emit('error', response.error || 'Failed to create game');
                }
            });
        }

        this.socket!.emit(event, ...args);
    }

    // Mock event handler for testing without a real socket server
    private mockEventHandler(event: string, ...args: any[]): void {
        // Simple echo response for testing
        setTimeout(() => {
            switch (event) {
                case 'create-game':
                    const gameData = args[0] || {};
                    this.eventEmitter.emit('create-game-response', {
                        success: true,
                        game: {
                            gameId: `mock-game-${ Date.now() }`,
                            name: gameData.name || 'Mock Game',
                            status: 'waiting',
                            phase: 'setup',
                            players: gameData.players || [],
                            rounds: 0,
                            maxRounds: gameData.maxRounds || 10,
                            mandateThreshold: gameData.mandateThreshold || 5,
                            activePlayerId: null,
                            winner: null,
                            createdAt: new Date().toISOString(),
                            lastUpdated: new Date().toISOString(),
                        }
                    });
                    break;

                case 'join-game':
                    this.eventEmitter.emit('join-game-response', {
                        success: true,
                        game: {
                            gameId: args[0]?.gameId || `mock-game-${ Date.now() }`,
                            name: 'Mock Game',
                            status: 'waiting',
                            phase: 'setup',
                            players: [args[0]?.player || { id: 'mock-player', name: 'Mock Player' }],
                            rounds: 0,
                            maxRounds: 10,
                            mandateThreshold: 5,
                            activePlayerId: null,
                            winner: null,
                            createdAt: new Date().toISOString(),
                            lastUpdated: new Date().toISOString(),
                        }
                    });
                    break;

                default:
                    // Generic response for other events
                    this.eventEmitter.emit(`${ event }-response`, {
                        success: true,
                        timestamp: new Date().toISOString(),
                        data: args
                    });
            }
        }, 300); // Simulate network delay
    }
}

// Create a singleton instance
const socketService = new SocketService();

// Export the service as default and also named export
export { SocketService };
export default socketService;