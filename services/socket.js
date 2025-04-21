import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
        this.gameListeners = new Map();
    }

    // Connect to socket server
    connect(token) {
        if (this.socket && this.socket.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket']
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return this.socket;
    }

    // Disconnect from socket server
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Join a game room
    joinGame(gameId) {
        if (!this.socket || !this.socket.connected) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('join-game', gameId);
    }

    // Leave a game room
    leaveGame(gameId) {
        if (!this.socket || !this.socket.connected) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('leave-game', gameId);
    }

    // Draw initial cards
    drawInitialCards(gameId) {
        if (!this.socket || !this.socket.connected) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('draw-initial-cards', gameId);
    }

    // Play a card
    playCard(gameId, cardId) {
        if (!this.socket || !this.socket.connected) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('play-card', { gameId, cardId });
    }

    // Reveal cards
    revealCards(gameId) {
        if (!this.socket || !this.socket.connected) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('reveal-cards', gameId);
    }

    // Propose coalition
    proposeCoalition(gameId, targetUserId) {
        if (!this.socket || !this.socket.connected) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('propose-coalition', { gameId, targetUserId });
    }

    // Accept coalition
    acceptCoalition(gameId, partnerUserId) {
        if (!this.socket || !this.socket.connected) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('accept-coalition', { gameId, partnerUserId });
    }

    // Decline coalition
    declineCoalition(gameId, partnerUserId) {
        if (!this.socket || !this.socket.connected) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('decline-coalition', { gameId, partnerUserId });
    }

    // Roll dice
    rollDice(gameId) {
        if (!this.socket || !this.socket.connected) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('roll-dice', gameId);
    }

    // Add event listener
    on(event, callback) {
        if (!this.socket) {
            throw new Error('Socket not initialized');
        }

        this.socket.on(event, callback);

        // Store callback for removal
        if (!this.gameListeners.has(event)) {
            this.gameListeners.set(event, []);
        }
        this.gameListeners.get(event).push(callback);

        return this;
    }

    // Remove event listener
    off(event, callback) {
        if (!this.socket) {
            return this;
        }

        if (callback) {
            this.socket.off(event, callback);

            // Remove specific callback from stored listeners
            if (this.gameListeners.has(event)) {
                const callbacks = this.gameListeners.get(event);
                const index = callbacks.indexOf(callback);
                if (index !== -1) {
                    callbacks.splice(index, 1);
                }
            }
        } else {
            this.socket.off(event);

            // Remove all callbacks for this event
            this.gameListeners.delete(event);
        }

        return this;
    }

    // Remove all game-related event listeners
    removeAllGameListeners() {
        if (!this.socket) {
            return;
        }

        this.gameListeners.forEach((callbacks, event) => {
            callbacks.forEach(callback => {
                this.socket.off(event, callback);
            });
        });

        this.gameListeners.clear();
    }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;