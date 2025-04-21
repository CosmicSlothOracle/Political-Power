/**
 * GameControllerService.ts
 * High-level service that manages game flow, phases, and state transitions
 */

import { GameActionService } from './GameActionService';
import { GameSettings, GameState, Player, DEFAULT_GAME_SETTINGS, GameStatus, GamePhase, Deck } from '../types/gameTypes';
import { AIPlayerManager } from '../game/AIPlayerManager';
import { DeckManager } from '../game/DeckManager';
import { mockCards } from '../data/mockCards';
import cardService from './CardService';
import socketService from './socketService';

export class GameControllerService {
    private static instance: GameControllerService;
    private gameActionService: GameActionService;
    private aiPlayerManager: AIPlayerManager;
    private activeGameId: string | null = null;
    private gameSettings: GameSettings = DEFAULT_GAME_SETTINGS;
    private gamePhaseListeners: ((phase: GamePhase) => void)[] = [];
    private gameStatusListeners: ((status: GameStatus) => void)[] = [];
    private currentGameState: GameState | null = null;
    private isInitialized: boolean = false;

    private constructor() {
        this.gameActionService = GameActionService.getInstance();
        this.aiPlayerManager = AIPlayerManager.getInstance();

        // Initialize services
        this.initializeServices();
    }

    /**
     * Initialize all required services
     */
    private async initializeServices() {
        try {
            // Initialize CardService
            await cardService.initialize().catch(error => {
                console.error('[GameControllerService] Failed to initialize card service:', error);
            });

            // Ensure socket service is connected
            if (!socketService.isConnected()) {
                console.log('[GameControllerService] Socket not connected, connecting...');
                await socketService.connect();
            }

            // Initialize GameActionService
            await this.gameActionService.initialize();

            // Provide default decks for AI players
            this.aiPlayerManager.setDefaultDecks(['default-deck-1', 'default-deck-2', 'default-deck-3']);

            this.isInitialized = true;
            console.log('[GameControllerService] All services initialized successfully');
        } catch (error) {
            console.error('[GameControllerService] Failed to initialize services:', error);
        }
    }

    /**
     * Get the singleton instance of GameControllerService
     */
    public static getInstance(): GameControllerService {
        if (!GameControllerService.instance) {
            GameControllerService.instance = new GameControllerService();
        }
        return GameControllerService.instance;
    }

    /**
     * Initialize a new game with the given settings and players
     */
    public async createNewGame(
        gameName: string,
        hostPlayer: Player,
        settings: Partial<GameSettings> = {}
    ): Promise<GameState> {
        // Ensure services are initialized
        if (!this.isInitialized) {
            console.log('[GameControllerService] Services not initialized, initializing...');
            await this.initializeServices();
        }

        // Merge provided settings with defaults
        this.gameSettings = {
            ...DEFAULT_GAME_SETTINGS,
            ...settings
        };

        try {
            // Log attempt to create game
            console.log('[GameControllerService] Creating new game:', gameName, 'with host:', hostPlayer.name);

            // Create game through the action service first, with just the host player
            const newGameState = await this.gameActionService.createGame({
                name: gameName,
                maxPlayers: this.gameSettings.aiPlayerCount + 1, // +1 for host player
                maxRounds: this.gameSettings.maxRounds,
                mandateThreshold: this.gameSettings.mandateThreshold,
                players: [hostPlayer]
            });

            console.log('[GameControllerService] Game created successfully:', newGameState.gameId);

            // Save the active game ID for reference
            this.activeGameId = newGameState.gameId;

            // Add AI players after the game is created if enabled
            if (this.gameSettings.enableAI && this.gameSettings.aiPlayerCount > 0) {
                try {
                    console.log('[GameControllerService] Adding AI players to game');
                    // Use the fillGameWithAI method to add AI players
                    await this.aiPlayerManager.fillGameWithAI(
                        newGameState.gameId,
                        this.gameSettings.aiPlayerCount + 1, // +1 for host player
                        this.gameSettings.aiDifficulty
                    );
                } catch (aiError) {
                    console.error('[GameControllerService] Failed to add AI players:', aiError);
                    // Continue with the game even if AI creation fails
                }
            }

            // Deal initial cards if configured
            if (this.gameSettings.dealInitialCards > 0) {
                await this.dealInitialCards(newGameState);
            }

            // Notify listeners about the game status
            this.notifyStatusChange(newGameState.status);
            this.notifyPhaseChange(newGameState.phase);

            // Get the updated game state after AI players have been added
            const finalGameState = this.gameActionService.getCurrentGameState() || newGameState;

            // Store the current game state
            this.currentGameState = finalGameState;

            return finalGameState;
        } catch (error) {
            console.error('[GameControllerService] Failed to create game:', error);
            throw error;
        }
    }

    /**
     * Join an existing game
     */
    public async joinGame(gameId: string, player: Player): Promise<GameState> {
        // Ensure services are initialized
        if (!this.isInitialized) {
            console.log('[GameControllerService] Services not initialized, initializing...');
            await this.initializeServices();
        }

        try {
            console.log(`[GameControllerService] Player ${ player.name } joining game ${ gameId }`);

            // Join the game through the action service
            const updatedGameState = await this.gameActionService.joinGame(gameId, player);
            this.activeGameId = gameId;

            console.log(`[GameControllerService] Player ${ player.name } joined game ${ gameId } successfully`);

            this.notifyStatusChange(updatedGameState.status);
            this.notifyPhaseChange(updatedGameState.phase);

            // Store the current game state
            this.currentGameState = updatedGameState;

            return updatedGameState;
        } catch (error) {
            console.error('[GameControllerService] Failed to join game:', error);
            throw error;
        }
    }

    /**
     * Start the game
     */
    public async startGame(): Promise<GameState | null> {
        if (!this.activeGameId) {
            console.error('No active game to start');
            return null;
        }

        const currentGameState = this.gameActionService.getCurrentGameState();
        if (!currentGameState) {
            console.error('No game state available');
            return null;
        }

        // Check if all players are ready
        const allPlayersReady = currentGameState.players.every(player => player.isReady);
        if (!allPlayersReady) {
            console.error('Not all players are ready');
            return null;
        }

        // Update game status to active
        const updatedState = {
            ...currentGameState,
            status: 'active' as GameStatus,
            phase: 'play' as GamePhase
        };

        // In a real implementation, this would be done through a socket call
        // For now, we'll just update our local state and notify listeners
        this.notifyStatusChange(updatedState.status);
        this.notifyPhaseChange(updatedState.phase);

        return updatedState;
    }

    /**
     * Handle a specific phase of the game
     */
    public async processGamePhase(phase: GamePhase): Promise<GameState | null> {
        const currentGameState = this.gameActionService.getCurrentGameState();
        if (!currentGameState) {
            console.error('No game state available');
            return null;
        }

        switch (phase) {
            case 'setup':
                // Setup phase logic
                return this.handleSetupPhase(currentGameState);
            case 'play':
                // Play phase logic (main gameplay)
                return currentGameState;
            case 'effect':
                // Effect resolution phase
                return this.handleEffectPhase(currentGameState);
            case 'resolution':
                // End of round resolution
                return this.handleResolutionPhase(currentGameState);
            case 'final':
                // Final scoring
                return this.handleFinalPhase(currentGameState);
            case 'finished':
                // Game over
                return this.handleGameOver(currentGameState);
            default:
                return currentGameState;
        }
    }

    /**
     * Leave the current game
     */
    public async leaveGame(): Promise<boolean> {
        if (!this.activeGameId) {
            console.error('No active game to leave');
            return false;
        }

        try {
            // Leave the game through the action service
            const success = await this.gameActionService.leaveGame();
            if (success) {
                this.activeGameId = null;
                this.gameSettings = DEFAULT_GAME_SETTINGS;
            }
            return success;
        } catch (error) {
            console.error('Failed to leave game:', error);
            return false;
        }
    }

    /**
     * Add a listener for game phase changes
     */
    public addPhaseChangeListener(listener: (phase: GamePhase) => void): void {
        this.gamePhaseListeners.push(listener);
    }

    /**
     * Remove a game phase listener
     */
    public removePhaseChangeListener(listener: (phase: GamePhase) => void): void {
        this.gamePhaseListeners = this.gamePhaseListeners.filter(l => l !== listener);
    }

    /**
     * Add a listener for game status changes
     */
    public addStatusChangeListener(listener: (status: GameStatus) => void): void {
        this.gameStatusListeners.push(listener);
    }

    /**
     * Remove a game status listener
     */
    public removeStatusChangeListener(listener: (status: GameStatus) => void): void {
        this.gameStatusListeners = this.gameStatusListeners.filter(l => l !== listener);
    }

    /**
     * Get the current game settings
     */
    public getGameSettings(): GameSettings {
        return this.gameSettings;
    }

    /**
     * Update game settings
     */
    public updateGameSettings(newSettings: Partial<GameSettings>): void {
        this.gameSettings = {
            ...this.gameSettings,
            ...newSettings
        };
    }

    /**
     * Create a default player deck for a new player
     */
    public createDefaultPlayerDeck(playerId: string): Deck {
        // For demo purposes, create a starter deck using the mockCards
        const cards = mockCards.slice(0, 20); // Just grab first 20 cards

        // Create a deck with these cards
        return DeckManager.createDeck(cards);
    }

    // Private helper methods

    /**
     * Deal initial cards to all players based on settings
     */
    private async dealInitialCards(gameState: GameState): Promise<void> {
        // In real implementation, this would trigger card draw actions for each player
        // For now, we'll just log that cards would be dealt
        console.log(`Would deal ${ this.gameSettings.dealInitialCards } cards to each player`);
    }

    /**
     * Handle the setup phase (pre-game)
     */
    private async handleSetupPhase(gameState: GameState): Promise<GameState> {
        // Setup logic (shuffle decks, prepare initial state, etc.)
        return gameState;
    }

    /**
     * Handle the effect phase (after cards are played)
     */
    private async handleEffectPhase(gameState: GameState): Promise<GameState> {
        // Apply card effects, resolve conflicts, etc.
        return gameState;
    }

    /**
     * Handle the resolution phase (end of round)
     */
    private async handleResolutionPhase(gameState: GameState): Promise<GameState> {
        // Score points, check win conditions, advance to next round, etc.
        return gameState;
    }

    /**
     * Handle the final phase (final scoring)
     */
    private async handleFinalPhase(gameState: GameState): Promise<GameState> {
        // Final scoring logic, determine winner
        return gameState;
    }

    /**
     * Handle game over
     */
    private async handleGameOver(gameState: GameState): Promise<GameState> {
        // Game over cleanup, notifications, etc.
        return gameState;
    }

    /**
     * Notify all phase change listeners
     */
    private notifyPhaseChange(phase: GamePhase): void {
        this.gamePhaseListeners.forEach(listener => {
            try {
                listener(phase);
            } catch (error) {
                console.error('Error in phase change listener:', error);
            }
        });
    }

    /**
     * Notify all status change listeners
     */
    private notifyStatusChange(status: GameStatus): void {
        this.gameStatusListeners.forEach(listener => {
            try {
                listener(status);
            } catch (error) {
                console.error('Error in status change listener:', error);
            }
        });
    }

    /**
     * Process the current game turn with proper phase transitions
     */
    public async processGameTurn(): Promise<GameState | null> {
        if (!this.activeGameId) {
            console.error('No active game to process turn');
            return null;
        }

        const currentGameState = this.gameActionService.getCurrentGameState();
        if (!currentGameState) {
            console.error('No game state available');
            return null;
        }

        // Get the current phase and process it
        const currentPhase = currentGameState.phase;
        let updatedGameState: GameState | null = null;

        try {
            // Phase transition logic
            switch (currentPhase) {
                case 'setup':
                    // Initialize game
                    updatedGameState = await this.processSetupPhase(currentGameState);
                    // Transition to play phase
                    if (updatedGameState) {
                        this.notifyPhaseChange('play');
                        updatedGameState.phase = 'play';
                    }
                    break;

                case 'play':
                    // Handle player actions
                    updatedGameState = await this.processPlayPhase(currentGameState);
                    // Transition to effect phase after card is played
                    if (updatedGameState && this.shouldMoveToEffectPhase(updatedGameState)) {
                        this.notifyPhaseChange('effect');
                        updatedGameState.phase = 'effect';
                    }
                    break;

                case 'effect':
                    // Process card effects
                    updatedGameState = await this.processEffectPhase(currentGameState);
                    // Transition to resolution phase
                    if (updatedGameState) {
                        this.notifyPhaseChange('resolution');
                        updatedGameState.phase = 'resolution';
                    }
                    break;

                case 'resolution':
                    // End of round resolution
                    updatedGameState = await this.processResolutionPhase(currentGameState);

                    // Check if game should end
                    if (this.checkGameEndCondition(updatedGameState)) {
                        this.notifyPhaseChange('final');
                        updatedGameState.phase = 'final';
                    } else {
                        // Start new round if game continues
                        this.notifyPhaseChange('play');
                        updatedGameState.phase = 'play';
                        updatedGameState.round++;

                        // Move to next player
                        updatedGameState = this.moveToNextPlayer(updatedGameState);
                    }
                    break;

                case 'final':
                    // Game end scoring and cleanup
                    updatedGameState = await this.processFinalPhase(currentGameState);
                    // Transition to finished state
                    this.notifyPhaseChange('finished');
                    this.notifyStatusChange('completed');
                    updatedGameState.phase = 'finished';
                    updatedGameState.status = 'completed';
                    break;

                case 'finished':
                    // Game is already finished, no further processing
                    return currentGameState;

                default:
                    console.error('Unknown game phase:', currentPhase);
                    return currentGameState;
            }

            // Log phase transition for verification
            if (updatedGameState) {
                console.log(`Game phase transition: ${ currentPhase } -> ${ updatedGameState.phase }`);
            }

            return updatedGameState;
        } catch (error) {
            console.error('Error processing game turn:', error);
            return null;
        }
    }

    /**
     * Determine if the game should move to the effect phase
     */
    private shouldMoveToEffectPhase(gameState: GameState): boolean {
        // Check if current player has played a card
        const currentPlayer = gameState.players.find(
            player => player.id === gameState.activePlayerId
        );

        return currentPlayer?.played.length > 0;
    }

    /**
     * Move to the next player in turn order
     */
    private moveToNextPlayer(gameState: GameState): GameState {
        const playerCount = gameState.players.length;
        if (playerCount <= 1) {
            return gameState; // No need to change if only one player
        }

        const currentPlayerIndex = gameState.players.findIndex(
            player => player.id === gameState.activePlayerId
        );

        // Calculate next player index (wrapping around)
        const nextPlayerIndex = (currentPlayerIndex + 1) % playerCount;
        const nextPlayerId = gameState.players[nextPlayerIndex].id;

        // Update game state with new active player
        return {
            ...gameState,
            activePlayerId: nextPlayerId
        };
    }

    /**
     * Setup phase handling
     */
    private async processSetupPhase(gameState: GameState): Promise<GameState> {
        try {
            // Create a copy of the game state to work with
            let updatedGameState = { ...gameState };

            // Deal initial cards to all players
            for (let i = 0; i < updatedGameState.players.length; i++) {
                const playerWithCards = await this.dealInitialCardsToPlayer(
                    updatedGameState.players[i],
                    this.gameSettings.dealInitialCards
                );
                updatedGameState.players[i] = playerWithCards;
            }

            // Set initial active player (host by default, or first player)
            if (!updatedGameState.activePlayerId) {
                updatedGameState.activePlayerId = updatedGameState.players[0].id;
            }

            // Add setup log entry
            const setupLogEntry = {
                timestamp: Date.now(),
                message: `Game setup completed. Round ${ updatedGameState.round } begins.`,
                type: 'system' as const
            };
            updatedGameState.log.push(setupLogEntry);

            return updatedGameState;
        } catch (error) {
            console.error('Error in setup phase:', error);
            throw error;
        }
    }

    /**
     * Deal initial cards to a player
     */
    private async dealInitialCardsToPlayer(player: Player, count: number): Promise<Player> {
        try {
            // Get cards from player's deck
            const deckManager = new DeckManager();

            // Get or create player deck if it doesn't exist
            if (!player.deck) {
                player.deck = this.createDefaultPlayerDeck(player.id);
            }

            // Draw cards from the deck
            const { drawnCardIds, updatedDeck } = deckManager.drawCards(player.deck, count);

            // Update player with drawn cards and updated deck
            return {
                ...player,
                hand: [...player.hand, ...drawnCardIds],
                deck: updatedDeck
            };
        } catch (error) {
            console.error('Error dealing initial cards:', error);
            return player; // Return original player if there's an error
        }
    }

    /**
     * Resolution phase handling - determine winner or continue game
     */
    private async processResolutionPhase(gameState: GameState): Promise<GameState> {
        try {
            // Create a copy of the game state to work with
            let updatedGameState = { ...gameState };

            // Check for mandate threshold winners
            const winners = updatedGameState.players.filter(player => {
                // Calculate total influence including cards and modifiers
                const totalInfluence = this.calculatePlayerInfluence(player);
                return totalInfluence >= updatedGameState.mandateThreshold;
            });

            // If we have winners, set the game to final phase
            if (winners.length > 0) {
                // Set winner ID (first winner if multiple)
                updatedGameState.winner = winners[0].id;

                // Add log entry
                const winLogEntry = {
                    timestamp: Date.now(),
                    message: `${ winners[0].name } has reached the mandate threshold and won the game!`,
                    type: 'system' as const
                };
                updatedGameState.log.push(winLogEntry);
            }
            // If max rounds reached, determine winner by highest influence
            else if (updatedGameState.round >= updatedGameState.maxRounds) {
                // Sort players by influence
                const sortedPlayers = [...updatedGameState.players].sort(
                    (a, b) => this.calculatePlayerInfluence(b) - this.calculatePlayerInfluence(a)
                );

                // Set winner ID (highest influence)
                updatedGameState.winner = sortedPlayers[0].id;

                // Add log entry
                const maxRoundsLogEntry = {
                    timestamp: Date.now(),
                    message: `Maximum rounds reached. ${ sortedPlayers[0].name } wins with the highest influence!`,
                    type: 'system' as const
                };
                updatedGameState.log.push(maxRoundsLogEntry);
            } else {
                // Game continues - add log entry for round end
                const roundEndLogEntry = {
                    timestamp: Date.now(),
                    message: `Round ${ updatedGameState.round } completed. No player has reached the mandate threshold yet.`,
                    type: 'system' as const
                };
                updatedGameState.log.push(roundEndLogEntry);
            }

            return updatedGameState;
        } catch (error) {
            console.error('Error in resolution phase:', error);
            throw error;
        }
    }

    /**
     * Calculate a player's total influence
     */
    private calculatePlayerInfluence(player: Player): number {
        let totalInfluence = player.influence;

        // Add influence modifier
        totalInfluence += player.influenceModifier;

        return totalInfluence;
    }

    /**
     * Final phase handling
     */
    private async processFinalPhase(gameState: GameState): Promise<GameState> {
        try {
            // Create a copy of the game state to work with
            let updatedGameState = { ...gameState };

            // Ensure winner is determined if not already set
            if (!updatedGameState.winner) {
                // Sort players by influence
                const sortedPlayers = [...updatedGameState.players].sort(
                    (a, b) => this.calculatePlayerInfluence(b) - this.calculatePlayerInfluence(a)
                );

                // Set winner ID (highest influence)
                updatedGameState.winner = sortedPlayers[0].id;
            }

            // Get winner information
            const winner = updatedGameState.players.find(p => p.id === updatedGameState.winner);

            if (winner) {
                // Add final game statistics to log
                const finalLogEntry = {
                    timestamp: Date.now(),
                    message: `Game completed after ${ updatedGameState.round } rounds. ${ winner.name } is the winner with ${ this.calculatePlayerInfluence(winner) } influence!`,
                    type: 'system' as const
                };
                updatedGameState.log.push(finalLogEntry);
            }

            return updatedGameState;
        } catch (error) {
            console.error('Error in final phase:', error);
            throw error;
        }
    }

    /**
     * Check if the game has ended
     */
    private checkGameEndCondition(gameState: GameState): boolean {
        // Check if max rounds reached
        if (gameState.round > gameState.maxRounds) {
            return true;
        }

        // Check if any player has reached the mandate threshold
        const winningPlayer = gameState.players.find(player =>
            player.mandates >= gameState.mandateThreshold
        );

        if (winningPlayer) {
            // Set winner
            gameState.winner = winningPlayer.id;
            return true;
        }

        return false;
    }

    /**
     * Create a test game with pre-configured settings and test data
     * This is used for testing the game loop implementation
     */
    public async createTestGame(
        testUserId: string,
        playerName: string = "Test Player"
    ): Promise<GameState> {
        try {
            // Create a player object for the test user
            const testPlayer: Player = {
                id: testUserId,
                name: playerName,
                deckId: `deck-${ testUserId }`,
                hand: [],
                played: [],
                influence: 0,
                isReady: true,
                isConnected: true,
                coalition: null,
                lastRoll: null,
                influenceModifier: 0,
                protectedMandates: false,
                canPlaySpecial: true,
                discardNext: false,
                // Create a default deck for the player
                deck: this.createDefaultPlayerDeck(testUserId)
            };

            // Use test-specific settings
            const testSettings: GameSettings = {
                ...DEFAULT_GAME_SETTINGS,
                enableAI: true,
                aiDifficulty: 'MEDIUM',
                aiPlayerCount: 1,
                mandateThreshold: 30, // Lower threshold for faster testing
                maxRounds: 5, // Fewer rounds for faster testing
                dealInitialCards: 5
            };

            // Create the game with test settings
            const testGameName = `Test Game ${ Date.now() }`;
            const newGameState = await this.createNewGame(
                testGameName,
                testPlayer,
                testSettings
            );

            // Log test game creation for verification
            console.log(`Test game created: ${ newGameState.gameId }`);
            console.log(`Test settings: ${ JSON.stringify(testSettings) }`);

            // Save test game ID to localStorage for easier testing
            if (typeof window !== 'undefined') {
                localStorage.setItem('testGameId', newGameState.gameId);
            }

            return newGameState;
        } catch (error) {
            console.error('Failed to create test game:', error);
            throw error;
        }
    }

    /**
     * Play a card from a player's hand
     */
    public async playCard(cardId: string): Promise<GameState | null> {
        if (!this.activeGameId) {
            console.error('No active game to play card');
            return null;
        }

        try {
            const updatedGameState = await this.gameActionService.playCard(cardId);
            return updatedGameState;
        } catch (error) {
            console.error('Error playing card:', error);
            return null;
        }
    }

    /**
     * Draw a card from the deck
     */
    public async drawCard(): Promise<GameState | null> {
        if (!this.activeGameId) {
            console.error('No active game to draw card');
            return null;
        }

        try {
            const updatedGameState = await this.gameActionService.drawCard();
            return updatedGameState;
        } catch (error) {
            console.error('Error drawing card:', error);
            return null;
        }
    }

    /**
     * End the current player's turn
     */
    public async endTurn(): Promise<GameState | null> {
        if (!this.activeGameId) {
            console.error('No active game to end turn');
            return null;
        }

        try {
            const updatedGameState = await this.gameActionService.endTurn();
            return updatedGameState;
        } catch (error) {
            console.error('Error ending turn:', error);
            return null;
        }
    }
}