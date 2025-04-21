/**
 * GameActionService.ts
 * Service for managing game actions and interactions with the socket server
 */

import socketService from './socketService';
import { GameStateManager } from '../game/GameStateManager';
import { ActionType, Card, GameState, Player } from '../types/gameTypes';
import { DeckManager } from '../game/DeckManager';
import cardService from './CardService';

export class GameActionService {
    private static instance: GameActionService;
    private currentGameState: GameState | null = null;
    private gameStateListeners: ((gameState: GameState) => void)[] = [];
    private isInitialized: boolean = false;

    // Private constructor for singleton pattern
    private constructor() {
        // Ensure card service is initialized
        cardService.initialize().catch(error => {
            console.error('[GameActionService] Failed to initialize card service:', error);
        });
    }

    /**
     * Get the singleton instance of GameActionService
     */
    public static getInstance(): GameActionService {
        if (!GameActionService.instance) {
            GameActionService.instance = new GameActionService();
        }
        return GameActionService.instance;
    }

    /**
     * Initialize the service and set up socket event listeners
     */
    public async initialize(): Promise<boolean> {
        // Prevent multiple initializations
        if (this.isInitialized) {
            console.log('[GameActionService] Already initialized');
            return true;
        }

        try {
            // Connect to socket server if not already connected
            if (!socketService.isConnected()) {
                console.log('[GameActionService] Socket not connected, connecting...');
                const connected = await socketService.connect();
                if (!connected) {
                    console.warn('[GameActionService] Failed to connect to socket server');
                    // We'll still set up listeners but return false to indicate issue
                }
            }

            // Set up socket listeners for game events
            socketService.on('game-updated', this.handleGameUpdated.bind(this));
            socketService.on('player-joined', this.handlePlayerJoined.bind(this));
            socketService.on('player-left', this.handlePlayerLeft.bind(this));
            socketService.on('card-played', this.handleCardPlayed.bind(this));
            socketService.on('card-drawn', this.handleCardDrawn.bind(this));
            socketService.on('turn-ended', this.handleTurnEnded.bind(this));
            socketService.on('game-ended', this.handleGameEnded.bind(this));
            socketService.on('error', this.handleError.bind(this));

            console.log('[GameActionService] Initialized successfully');
            this.isInitialized = true;
            return socketService.isConnected();
        } catch (error) {
            console.error('[GameActionService] Failed to initialize:', error);
            return false;
        }
    }

    /**
     * Add a listener for game state updates
     */
    public addGameStateListener(listener: (gameState: GameState) => void): void {
        this.gameStateListeners.push(listener);
    }

    /**
     * Remove a game state listener
     */
    public removeGameStateListener(listener: (gameState: GameState) => void): void {
        this.gameStateListeners = this.gameStateListeners.filter(l => l !== listener);
    }

    /**
     * Get the current game state
     */
    public getCurrentGameState(): GameState | null {
        return this.currentGameState;
    }

    /**
     * Create a new game
     */
    public createGame(options: {
        name: string;
        maxPlayers: number;
        maxRounds: number;
        mandateThreshold: number;
        players: Player[]
    }): Promise<GameState> {
        return new Promise((resolve, reject) => {
            // Ensure service is initialized
            if (!this.isInitialized) {
                this.initialize();
            }

            if (!socketService.isConnected()) {
                // For dev/testing mode without a live server
                if (process.env.NEXT_PUBLIC_USE_MOCK_SOCKET === 'true') {
                    console.log('[GameActionService] Creating mock game in mock mode');
                    const gameId = `game${ Date.now() }-${ Math.floor(Math.random() * 1000) }`;

                    // Create game state
                    const newGame = GameStateManager.initializeGame(
                        gameId,
                        options.players,
                        options.name,
                        options.maxRounds,
                        options.mandateThreshold
                    );

                    this.currentGameState = newGame;
                    this.notifyListeners();
                    resolve(newGame);
                    return;
                }

                reject(new Error('Socket not connected, cannot create game'));
                return;
            }

            // Set up one-time listener for the response
            const responseHandler = (response: { success: boolean; game?: GameState; error?: string }) => {
                console.log('[GameActionService] Received create-game response:', response);
                socketService.off('create-game-response', responseHandler);

                if (response.success && response.game) {
                    this.currentGameState = response.game;
                    socketService.joinGame(response.game.gameId);
                    this.notifyListeners();
                    resolve(response.game);
                } else {
                    reject(new Error(response.error || 'Failed to create game'));
                }
            };

            // Set up error handler
            const errorHandler = (error: any) => {
                console.error('[GameActionService] Error during game creation:', error);
                socketService.off('error', errorHandler);
                reject(new Error(error?.message || 'Failed to create game'));
            };

            // Add listeners
            socketService.on('create-game-response', responseHandler);
            socketService.on('error', errorHandler);

            console.log('[GameActionService] Sending create-game event', options);
            socketService.emit('create-game', options);

            // Set up timeout
            setTimeout(() => {
                socketService.off('create-game-response', responseHandler);
                socketService.off('error', errorHandler);
                reject(new Error('Game creation timed out'));
            }, 10000); // 10 second timeout
        });
    }

    /**
     * Join an existing game
     */
    public joinGame(gameId: string, player: Player): Promise<GameState> {
        return new Promise((resolve, reject) => {
            // Ensure service is initialized
            if (!this.isInitialized) {
                this.initialize();
            }

            if (!socketService.isConnected()) {
                // For dev/testing mode without a live server
                if (process.env.NEXT_PUBLIC_USE_MOCK_SOCKET === 'true' && this.currentGameState) {
                    console.log('[GameActionService] Joining mock game in mock mode');
                    if (this.currentGameState.gameId === gameId) {
                        // Check if player is already in the game
                        if (!this.currentGameState.players.find(p => p.id === player.id)) {
                            this.currentGameState = {
                                ...this.currentGameState,
                                players: [...this.currentGameState.players, player]
                            };
                        }

                        this.notifyListeners();
                        resolve(this.currentGameState);
                        return;
                    }
                }

                reject(new Error('Socket not connected or game not found'));
                return;
            }

            socketService.on('join-game-response', (response: { success: boolean; game?: GameState; error?: string }) => {
                socketService.off('join-game-response');

                if (response.success && response.game) {
                    this.currentGameState = response.game;
                    this.notifyListeners();
                    resolve(response.game);
                } else {
                    reject(new Error(response.error || 'Failed to join game'));
                }
            });

            console.log('[GameActionService] Joining game', { gameId, player });
            socketService.joinGame(gameId);
            socketService.emit('join-game', { gameId, player });
        });
    }

    /**
     * Play a card from hand
     */
    public playCard(cardId: string): Promise<GameState> {
        return new Promise((resolve, reject) => {
            // Ensure service is initialized
            if (!this.isInitialized) {
                this.initialize();
            }

            if (!this.currentGameState) {
                reject(new Error('No active game'));
                return;
            }

            if (!socketService.isConnected() && process.env.NEXT_PUBLIC_USE_MOCK_SOCKET === 'true') {
                // For dev/testing mode without a live server
                console.log('[GameActionService] Playing card in mock mode', cardId);
                const action = {
                    type: ActionType.PLAY_CARD,
                    playerId: this.currentGameState.activePlayerId!,
                    cardId: cardId,
                    timestamp: Date.now(),
                    message: ''
                };

                const updatedState = GameStateManager.processAction(this.currentGameState, action);
                this.currentGameState = updatedState;
                this.notifyListeners();
                resolve(updatedState);
                return;
            }

            if (!socketService.isConnected()) {
                reject(new Error('Socket not connected'));
                return;
            }

            socketService.on('play-card-response', (response: { success: boolean; gameState?: GameState; error?: string }) => {
                socketService.off('play-card-response');

                if (response.success && response.gameState) {
                    this.currentGameState = response.gameState;
                    this.notifyListeners();
                    resolve(response.gameState);
                } else {
                    reject(new Error(response.error || 'Failed to play card'));
                }
            });

            console.log('[GameActionService] Sending play-card event', { gameId: this.currentGameState.gameId, cardId });
            socketService.emit('play-card', {
                gameId: this.currentGameState.gameId,
                cardId
            });
        });
    }

    /**
     * Draw a card
     */
    public drawCard(): Promise<GameState> {
        return new Promise((resolve, reject) => {
            if (!this.currentGameState) {
                reject(new Error('No active game'));
                return;
            }

            if (!socketService.isConnected() && process.env.NEXT_PUBLIC_USE_MOCK_SOCKET === 'true') {
                // For dev/testing mode without a live server
                const action = {
                    type: ActionType.DRAW_CARD,
                    playerId: this.currentGameState.activePlayerId!,
                    cardId: '',
                    timestamp: Date.now(),
                    message: ''
                };

                const updatedState = GameStateManager.processAction(this.currentGameState, action);
                this.currentGameState = updatedState;
                this.notifyListeners();
                resolve(updatedState);
                return;
            }

            if (!socketService.isConnected()) {
                reject(new Error('Socket not connected'));
                return;
            }

            socketService.on('draw-card-response', (response: { success: boolean; gameState?: GameState; error?: string }) => {
                socketService.off('draw-card-response');

                if (response.success && response.gameState) {
                    this.currentGameState = response.gameState;
                    this.notifyListeners();
                    resolve(response.gameState);
                } else {
                    reject(new Error(response.error || 'Failed to draw card'));
                }
            });

            socketService.emit('draw-card', {
                gameId: this.currentGameState.gameId
            });
        });
    }

    /**
     * End the current player's turn
     */
    public endTurn(): Promise<GameState> {
        return new Promise((resolve, reject) => {
            if (!this.currentGameState) {
                reject(new Error('No active game'));
                return;
            }

            if (!socketService.isConnected() && process.env.NEXT_PUBLIC_USE_MOCK_SOCKET === 'true') {
                // For dev/testing mode without a live server
                const action = {
                    type: ActionType.END_TURN,
                    playerId: this.currentGameState.activePlayerId!,
                    cardId: '',
                    timestamp: Date.now(),
                    message: ''
                };

                const updatedState = GameStateManager.processAction(this.currentGameState, action);
                this.currentGameState = updatedState;
                this.notifyListeners();
                resolve(updatedState);
                return;
            }

            if (!socketService.isConnected()) {
                reject(new Error('Socket not connected'));
                return;
            }

            socketService.on('end-turn-response', (response: { success: boolean; gameState?: GameState; error?: string }) => {
                socketService.off('end-turn-response');

                if (response.success && response.gameState) {
                    this.currentGameState = response.gameState;
                    this.notifyListeners();
                    resolve(response.gameState);
                } else {
                    reject(new Error(response.error || 'Failed to end turn'));
                }
            });

            socketService.emit('end-turn', {
                gameId: this.currentGameState.gameId
            });
        });
    }

    /**
     * Send a chat message in the game
     */
    public sendChatMessage(message: string): Promise<GameState> {
        return new Promise((resolve, reject) => {
            if (!this.currentGameState) {
                reject(new Error('No active game'));
                return;
            }

            if (!socketService.isConnected() && process.env.NEXT_PUBLIC_USE_MOCK_SOCKET === 'true') {
                // For dev/testing mode without a live server
                const action = {
                    type: ActionType.CHAT,
                    playerId: this.currentGameState.activePlayerId!,
                    cardId: '',
                    timestamp: Date.now(),
                    message: message
                };

                const updatedState = GameStateManager.processAction(this.currentGameState, action);
                this.currentGameState = updatedState;
                this.notifyListeners();
                resolve(updatedState);
                return;
            }

            if (!socketService.isConnected()) {
                reject(new Error('Socket not connected'));
                return;
            }

            socketService.on('chat-message-response', (response: { success: boolean; gameState?: GameState; error?: string }) => {
                socketService.off('chat-message-response');

                if (response.success && response.gameState) {
                    this.currentGameState = response.gameState;
                    this.notifyListeners();
                    resolve(response.gameState);
                } else {
                    reject(new Error(response.error || 'Failed to send message'));
                }
            });

            socketService.emit('chat-message', {
                gameId: this.currentGameState.gameId,
                message
            });
        });
    }

    /**
     * Leave the current game
     */
    public leaveGame(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!this.currentGameState) {
                resolve(true);
                return;
            }

            if (!socketService.isConnected() && process.env.NEXT_PUBLIC_USE_MOCK_SOCKET === 'true') {
                this.currentGameState = null;
                this.notifyListeners();
                resolve(true);
                return;
            }

            if (!socketService.isConnected()) {
                this.currentGameState = null;
                resolve(true);
                return;
            }

            socketService.on('leave-game-response', (response: { success: boolean; error?: string }) => {
                socketService.off('leave-game-response');

                if (response.success) {
                    this.currentGameState = null;
                    this.notifyListeners();
                    resolve(true);
                } else {
                    reject(new Error(response.error || 'Failed to leave game'));
                }
            });

            socketService.emit('leave-game', {
                gameId: this.currentGameState.gameId
            });
        });
    }

    // Socket event handlers
    private handleGameUpdated(gameState: GameState): void {
        this.currentGameState = gameState;
        this.notifyListeners();
    }

    private handlePlayerJoined(data: { gameState: GameState; player: Player }): void {
        this.currentGameState = data.gameState;
        this.notifyListeners();
    }

    private handlePlayerLeft(data: { gameState: GameState; playerId: string }): void {
        this.currentGameState = data.gameState;
        this.notifyListeners();
    }

    private handleCardPlayed(data: { gameState: GameState; playerId: string; cardId: string }): void {
        this.currentGameState = data.gameState;
        this.notifyListeners();
    }

    private handleCardDrawn(data: { gameState: GameState; playerId: string }): void {
        this.currentGameState = data.gameState;
        this.notifyListeners();
    }

    private handleTurnEnded(data: { gameState: GameState; playerId: string }): void {
        this.currentGameState = data.gameState;
        this.notifyListeners();
    }

    private handleGameEnded(data: { gameState: GameState }): void {
        this.currentGameState = data.gameState;
        this.notifyListeners();
    }

    private handleError(error: string): void {
        console.error('Game error:', error);
    }

    private notifyListeners(): void {
        if (this.currentGameState) {
            this.gameStateListeners.forEach(listener => listener(this.currentGameState!));
        }
    }

    /**
     * Cleanup and reset service
     */
    public reset(): void {
        this.currentGameState = null;
        this.gameStateListeners = [];
        // We don't reset isInitialized since listeners are still set up
        console.log('[GameActionService] Reset completed');
    }
}