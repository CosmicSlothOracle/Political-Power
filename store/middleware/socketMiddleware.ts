/**
 * socketMiddleware.ts
 * Redux middleware for handling socket.io integration with the game
 */

import { Middleware } from 'redux';
import socketService from '../../services/socketService';
import {
    setGameState,
    setLoading,
    setError,
    addMessage,
    updatePlayerStatus
} from '../actions/gameActions';

// Define socket action types
export const SOCKET_CONNECT = 'socket/connect';
export const SOCKET_DISCONNECT = 'socket/disconnect';
export const SOCKET_JOIN_GAME = 'socket/joinGame';
export const SOCKET_LEAVE_GAME = 'socket/leaveGame';
export const SOCKET_START_GAME = 'socket/startGame';
export const SOCKET_PLAY_CARD = 'socket/playCard';
export const SOCKET_REVEAL_CARD = 'socket/revealCard';
export const SOCKET_ROLL_DICE = 'socket/rollDice';
export const SOCKET_PROPOSE_COALITION = 'socket/proposeCoalition';
export const SOCKET_ACCEPT_COALITION = 'socket/acceptCoalition';
export const SOCKET_DECLINE_COALITION = 'socket/declineCoalition';
export const SOCKET_SEND_MESSAGE = 'socket/sendMessage';
export const SOCKET_TOGGLE_READY = 'socket/toggleReady';

// Flag to track if listeners are already set up
let listenersInitialized = false;

const socketMiddleware: Middleware = store => {
    // Setup event listeners when the middleware is created
    const setupSocketListeners = () => {
        if (listenersInitialized) {
            console.log('[SocketMiddleware] Listeners already initialized, skipping');
            return;
        }

        // Only set up listeners if socket is connected or in mock mode
        if (!socketService.isConnected()) {
            console.log('[SocketMiddleware] Socket not connected, delaying listener setup');
            return;
        }

        console.log('[SocketMiddleware] Setting up socket listeners');

        // Game state updated
        socketService.on('game-updated', (gameState) => {
            store.dispatch(setGameState(gameState));
        });

        // Player joined
        socketService.on('player-joined', (data) => {
            store.dispatch(setGameState(data.gameState));
            store.dispatch(addMessage({
                text: `${ data.player.username || data.player.name } joined the game`,
                type: 'system',
                timestamp: new Date().toISOString()
            }));
        });

        // Player left
        socketService.on('player-left', (data) => {
            store.dispatch(setGameState(data.gameState));
            const playerName = data.gameState.players.find(p => p.userId === data.playerId || p.id === data.playerId)?.username ||
                data.gameState.players.find(p => p.userId === data.playerId || p.id === data.playerId)?.name ||
                'A player';
            store.dispatch(addMessage({
                text: `${ playerName } left the game`,
                type: 'system',
                timestamp: new Date().toISOString()
            }));
        });

        // Game started
        socketService.on('game-started', (data) => {
            store.dispatch(setGameState(data.gameState));
            store.dispatch(addMessage({
                text: 'Game started!',
                type: 'system',
                timestamp: new Date().toISOString()
            }));
        });

        // Player turn
        socketService.on('player-turn', (data) => {
            store.dispatch(setGameState(data.gameState));
            const playerName = data.gameState.players.find(p => p.userId === data.playerId || p.id === data.playerId)?.username ||
                data.gameState.players.find(p => p.userId === data.playerId || p.id === data.playerId)?.name ||
                'A player';
            store.dispatch(addMessage({
                text: `It's ${ playerName }'s turn!`,
                type: 'system',
                timestamp: new Date().toISOString()
            }));
        });

        // Card played
        socketService.on('card-played', (data) => {
            store.dispatch(setGameState(data.gameState));
            const playerName = data.gameState.players.find(p => p.userId === data.playerId || p.id === data.playerId)?.username ||
                data.gameState.players.find(p => p.userId === data.playerId || p.id === data.playerId)?.name ||
                'A player';
            store.dispatch(addMessage({
                text: `${ playerName } played a card`,
                type: 'system',
                timestamp: new Date().toISOString()
            }));
        });

        // Dice rolled
        socketService.on('dice-rolled', (data) => {
            store.dispatch(setGameState(data.gameState));
            const playerName = data.gameState.players.find(p => p.userId === data.playerId || p.id === data.playerId)?.username ||
                data.gameState.players.find(p => p.userId === data.playerId || p.id === data.playerId)?.name ||
                'A player';
            store.dispatch(addMessage({
                text: `${ playerName } rolled ${ data.roll }`,
                type: 'system',
                timestamp: new Date().toISOString()
            }));
        });

        // Coalition proposed
        socketService.on('coalition-proposed', (data) => {
            store.dispatch(setGameState(data.gameState));
            const proposerName = data.gameState.players.find(p => p.userId === data.proposerId || p.id === data.proposerId)?.username ||
                data.gameState.players.find(p => p.userId === data.proposerId || p.id === data.proposerId)?.name ||
                'A player';
            const targetName = data.gameState.players.find(p => p.userId === data.targetId || p.id === data.targetId)?.username ||
                data.gameState.players.find(p => p.userId === data.targetId || p.id === data.targetId)?.name ||
                'A player';
            store.dispatch(addMessage({
                text: `${ proposerName } proposed a coalition with ${ targetName }`,
                type: 'system',
                timestamp: new Date().toISOString()
            }));
        });

        // Coalition formed
        socketService.on('coalition-formed', (data) => {
            store.dispatch(setGameState(data.gameState));
            const player1Name = data.gameState.players.find(p => p.userId === data.player1Id || p.id === data.player1Id)?.username ||
                data.gameState.players.find(p => p.userId === data.player1Id || p.id === data.player1Id)?.name ||
                'A player';
            const player2Name = data.gameState.players.find(p => p.userId === data.player2Id || p.id === data.player2Id)?.username ||
                data.gameState.players.find(p => p.userId === data.player2Id || p.id === data.player2Id)?.name ||
                'A player';
            store.dispatch(addMessage({
                text: `${ player1Name } and ${ player2Name } formed a coalition!`,
                type: 'system',
                timestamp: new Date().toISOString()
            }));
        });

        // Error handling
        socketService.on('error', (data) => {
            const errorMessage = typeof data === 'string' ? data : data.message || 'Unknown error';
            store.dispatch(setError(errorMessage));
            store.dispatch(addMessage({
                text: `Error: ${ errorMessage }`,
                type: 'error',
                timestamp: new Date().toISOString()
            }));
        });

        // Player status updates
        socketService.on('player-status-changed', (data) => {
            store.dispatch(updatePlayerStatus(data.playerId, data.status));
            const playerName = data.gameState.players.find(p => p.userId === data.playerId || p.id === data.playerId)?.username ||
                data.gameState.players.find(p => p.userId === data.playerId || p.id === data.playerId)?.name ||
                'A player';
            store.dispatch(addMessage({
                text: `${ playerName } is now ${ data.status }`,
                type: 'system',
                timestamp: new Date().toISOString()
            }));
        });

        // New game message
        socketService.on('new-message', (data) => {
            store.dispatch(addMessage(data.message));
        });

        listenersInitialized = true;
        console.log('[SocketMiddleware] Socket listeners setup complete');
    };

    // Don't set up listeners immediately - wait until connection
    if (typeof window !== 'undefined' && socketService.isConnected()) {
        setupSocketListeners();
    }

    // The middleware logic
    return next => action => {
        const { type, payload } = action;

        switch (type) {
            // Connect to the socket
            case SOCKET_CONNECT:
                store.dispatch(setLoading(true));

                // Extract options from payload
                const { url, useMock, timeout } = payload || {};
                const options = {
                    url: url || process.env.NEXT_PUBLIC_SOCKET_URL,
                    useMock: useMock || process.env.NEXT_PUBLIC_USE_MOCK_SOCKET === 'true',
                    timeout: timeout || 20000
                };

                // Use the new async connection method
                socketService.connect(options)
                    .then(connected => {
                        if (connected) {
                            // Only set up listeners after successful connection
                            setupSocketListeners();
                        } else {
                            store.dispatch(setError('Failed to connect to game server'));
                        }
                        store.dispatch(setLoading(false));
                    })
                    .catch(err => {
                        console.error('[SocketMiddleware] Connection error:', err);
                        store.dispatch(setError(`Failed to connect to game server: ${ err.message || 'Unknown error' }`));
                        store.dispatch(setLoading(false));
                    });
                break;

            // Disconnect from the socket
            case SOCKET_DISCONNECT:
                socketService.disconnect();
                break;

            // Join a game room
            case SOCKET_JOIN_GAME:
                socketService.joinGame(payload.gameId);
                break;

            // Leave a game room
            case SOCKET_LEAVE_GAME:
                socketService.leaveGame(payload.gameId);
                break;

            // Start a game
            case SOCKET_START_GAME:
                socketService.emit('start-game', payload);
                break;

            // Play a card
            case SOCKET_PLAY_CARD:
                socketService.emit('play-card', payload);
                break;

            // Reveal a card
            case SOCKET_REVEAL_CARD:
                socketService.emit('reveal-card', payload);
                break;

            // Roll the dice
            case SOCKET_ROLL_DICE:
                socketService.emit('roll-dice', payload);
                break;

            // Propose a coalition
            case SOCKET_PROPOSE_COALITION:
                socketService.emit('propose-coalition', payload);
                break;

            // Accept a coalition
            case SOCKET_ACCEPT_COALITION:
                socketService.emit('accept-coalition', payload);
                break;

            // Decline a coalition
            case SOCKET_DECLINE_COALITION:
                socketService.emit('decline-coalition', payload);
                break;

            // Send a message
            case SOCKET_SEND_MESSAGE:
                socketService.emit('send-message', payload);
                break;

            // Toggle ready state
            case SOCKET_TOGGLE_READY:
                socketService.emit('toggle-ready', payload);
                break;

            default:
                break;
        }

        return next(action);
    };
};

export default socketMiddleware;