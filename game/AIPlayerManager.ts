/**
 * AIPlayerManager.ts
 * Manages AI players in a game
 */

import { GameState, Player } from '../types/gameTypes';
import { AIPlayer, AIPlayerConfig, AIDifficulty } from './AIPlayer';
import { GameActionService } from '../services/GameActionService';
import { DeckManager } from './DeckManager';

export class AIPlayerManager {
    private static instance: AIPlayerManager;
    private aiPlayers: Map<string, AIPlayer> = new Map();
    private gameActionService: GameActionService;
    private defaultDecks: string[] = []; // Default deck IDs to use for AI players

    private constructor() {
        this.gameActionService = GameActionService.getInstance();
    }

    public static getInstance(): AIPlayerManager {
        if (!AIPlayerManager.instance) {
            AIPlayerManager.instance = new AIPlayerManager();
        }
        return AIPlayerManager.instance;
    }

    /**
     * Set default decks for AI players to use
     */
    public setDefaultDecks(deckIds: string[]): void {
        this.defaultDecks = deckIds;
    }

    /**
     * Create an AI player and add it to the game
     */
    public async createAIPlayer(
        gameId: string,
        name: string,
        difficulty: AIDifficulty = AIDifficulty.MEDIUM,
        deckId?: string
    ): Promise<string> {
        // Generate a unique ID for the AI player
        const aiPlayerId = `ai-${ Date.now() }-${ Math.floor(Math.random() * 1000) }`;

        // Use provided deck ID or select a random one from defaults
        const selectedDeckId = deckId || this.getRandomDeckId();

        // Create AI player config
        const config: AIPlayerConfig = {
            id: aiPlayerId,
            name: `AI ${ name }`,
            deckId: selectedDeckId,
            difficulty
        };

        // Create AI player instance
        const aiPlayer = new AIPlayer(config);
        this.aiPlayers.set(aiPlayerId, aiPlayer);

        // Create player object for the game
        const player: Player = {
            id: aiPlayerId,
            name: `AI ${ name }`,
            deckId: selectedDeckId,
            hand: [],
            played: [],
            influence: 0,
            isReady: true,
            isConnected: true,
            coalition: null,
            lastRoll: null,
            deck: {
                name: 'AI Deck',
                cards: [],  // Will be populated by the game
                drawPile: [],
                discardPile: []
            },
            influenceModifier: 0,
            protectedMandates: false,
            canPlaySpecial: true,
            discardNext: false
        };

        // Join the game
        try {
            await this.gameActionService.joinGame(gameId, player);

            // Initialize AI player to start listening for game events
            aiPlayer.initialize();

            return aiPlayerId;
        } catch (error) {
            console.error('Failed to add AI player to game:', error);
            this.aiPlayers.delete(aiPlayerId);
            throw error;
        }
    }

    /**
     * Fill empty slots in a game with AI players
     */
    public async fillGameWithAI(
        gameId: string,
        targetPlayerCount: number,
        difficulty: AIDifficulty = AIDifficulty.MEDIUM
    ): Promise<string[]> {
        const gameState = this.gameActionService.getCurrentGameState();
        if (!gameState || gameState.gameId !== gameId) {
            throw new Error('Game not found');
        }

        const currentPlayerCount = gameState.players.length;
        const aiCount = targetPlayerCount - currentPlayerCount;

        if (aiCount <= 0) {
            return []; // No AI players needed
        }

        const aiPlayerIds: string[] = [];

        // Add AI players one by one
        for (let i = 0; i < aiCount; i++) {
            try {
                const aiPlayerId = await this.createAIPlayer(
                    gameId,
                    `Player ${ currentPlayerCount + i + 1 }`,
                    difficulty
                );
                aiPlayerIds.push(aiPlayerId);
            } catch (error) {
                console.error(`Failed to add AI player ${ i + 1 }:`, error);
            }
        }

        return aiPlayerIds;
    }

    /**
     * Remove an AI player from the game and clean up
     */
    public removeAIPlayer(aiPlayerId: string): void {
        const aiPlayer = this.aiPlayers.get(aiPlayerId);
        if (aiPlayer) {
            aiPlayer.dispose();
            this.aiPlayers.delete(aiPlayerId);
        }
    }

    /**
     * Clean up all AI players
     */
    public removeAllAIPlayers(): void {
        this.aiPlayers.forEach(aiPlayer => {
            aiPlayer.dispose();
        });
        this.aiPlayers.clear();
    }

    /**
     * Check if a player is an AI
     */
    public isAIPlayer(playerId: string): boolean {
        return this.aiPlayers.has(playerId);
    }

    /**
     * Get a list of all AI player IDs
     */
    public getAIPlayerIds(): string[] {
        return Array.from(this.aiPlayers.keys());
    }

    /**
     * Get a random deck ID from the default decks
     */
    private getRandomDeckId(): string {
        if (this.defaultDecks.length === 0) {
            // Instead of throwing an error, generate a temporary deck ID
            console.warn('No default decks available for AI players, creating a temporary one');
            return `temp-deck-${ Date.now() }-${ Math.floor(Math.random() * 1000) }`;
        }
        const randomIndex = Math.floor(Math.random() * this.defaultDecks.length);
        return this.defaultDecks[randomIndex];
    }
}