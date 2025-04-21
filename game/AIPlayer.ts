/**
 * AIPlayer.ts
 * Provides AI player functionality for the game
 */

import { GameState, Player, Card, ActionType } from '../types/gameTypes';
import { DeckManager } from './DeckManager';
import { CardUtils } from './CardUtils';
import { GameActionService } from '../services/GameActionService';

export enum AIDifficulty {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard'
}

export interface AIPlayerConfig {
    id: string;
    name: string;
    deckId: string;
    difficulty: AIDifficulty;
}

export class AIPlayer {
    private config: AIPlayerConfig;
    private gameActionService: GameActionService;
    private gameState: GameState | null = null;
    private player: Player | null = null;
    private thinkingTime: number;

    constructor(config: AIPlayerConfig) {
        this.config = config;
        this.gameActionService = GameActionService.getInstance();

        // Set thinking time based on difficulty
        switch (config.difficulty) {
            case AIDifficulty.EASY:
                this.thinkingTime = 1500; // 1.5 seconds
                break;
            case AIDifficulty.MEDIUM:
                this.thinkingTime = 1000; // 1 second
                break;
            case AIDifficulty.HARD:
                this.thinkingTime = 500; // 0.5 seconds
                break;
            default:
                this.thinkingTime = 1000;
        }
    }

    /**
     * Set up the AI player to listen for game state changes
     */
    public initialize(): void {
        this.gameActionService.addGameStateListener(this.handleGameStateUpdate);
    }

    /**
     * Clean up event listeners when AI player is removed
     */
    public dispose(): void {
        this.gameActionService.removeGameStateListener(this.handleGameStateUpdate);
    }

    /**
     * Handle game state updates
     */
    private handleGameStateUpdate = (updatedState: GameState): void => {
        this.gameState = updatedState;
        this.player = updatedState.players.find(p => p.id === this.config.id) || null;

        // If it's this AI's turn, perform an action
        if (updatedState.activePlayerId === this.config.id) {
            this.takeTurn();
        }
    };

    /**
     * Main method for taking a turn
     */
    private takeTurn(): void {
        if (!this.gameState || !this.player) return;

        // Add a small delay to simulate "thinking"
        setTimeout(() => {
            this.decideAction();
        }, this.thinkingTime);
    }

    /**
     * Decide which action to take based on current game state
     */
    private decideAction(): void {
        if (!this.player || !this.gameState) return;

        // If hand is empty, draw a card
        if (this.player.hand.length === 0) {
            this.drawCard();
            return;
        }

        // Determine whether to play a card or end turn based on difficulty
        const shouldPlayCard = this.shouldPlayCard();

        if (shouldPlayCard) {
            const cardToPlay = this.selectCardToPlay();
            if (cardToPlay) {
                this.playCard(cardToPlay);
            } else {
                this.endTurn();
            }
        } else {
            this.endTurn();
        }
    }

    /**
     * Determine if the AI should play a card based on difficulty
     */
    private shouldPlayCard(): boolean {
        if (!this.player || this.player.hand.length === 0) return false;

        // Easy difficulty plays cards randomly
        if (this.config.difficulty === AIDifficulty.EASY) {
            return Math.random() > 0.3; // 70% chance to play a card
        }

        // Medium difficulty plays cards if they're good enough
        if (this.config.difficulty === AIDifficulty.MEDIUM) {
            const bestCard = this.selectBestCard();
            if (!bestCard) return false;
            return bestCard.influence >= 3; // Play if influence is significant
        }

        // Hard difficulty uses more complex logic
        if (this.config.difficulty === AIDifficulty.HARD) {
            // If we're close to winning, always play a card
            const currentInfluence = this.getTotalPlayerInfluence();
            const mandateThreshold = this.gameState?.mandateThreshold || 10;

            if (currentInfluence >= mandateThreshold * 0.8) {
                return true;
            }

            // Otherwise, decide based on the best card available
            const bestCard = this.selectBestCard();
            if (!bestCard) return false;
            return bestCard.influence >= 2;
        }

        return true;
    }

    /**
     * Select the best card to play based on the current game state
     */
    private selectBestCard(): Card | null {
        if (!this.player || !this.gameState) return null;

        const handCards = CardUtils.getPlayerHandCards(this.player);
        if (handCards.length === 0) return null;

        // Sort cards by influence in descending order
        const sortedCards = CardUtils.sortCards(handCards, 'influence', false);

        // For now, simply return the highest influence card
        return sortedCards[0];
    }

    /**
     * Select a card to play based on difficulty
     */
    private selectCardToPlay(): string | null {
        if (!this.player || !this.gameState) return null;

        const handCards = CardUtils.getPlayerHandCards(this.player);
        if (handCards.length === 0) return null;

        // Different selection strategies based on difficulty
        switch (this.config.difficulty) {
            case AIDifficulty.EASY:
                // Randomly select a card
                const randomIndex = Math.floor(Math.random() * handCards.length);
                return handCards[randomIndex].id;

            case AIDifficulty.MEDIUM:
                // Select highest influence card
                const sortedByInfluence = CardUtils.sortCards(handCards, 'influence', false);
                return sortedByInfluence[0].id;

            case AIDifficulty.HARD:
                // More sophisticated strategy
                // TODO: Implement better card selection logic for hard AI
                // For now, use the same as medium
                const sortedCards = CardUtils.sortCards(handCards, 'influence', false);
                return sortedCards[0].id;

            default:
                // Default to random
                const defaultIndex = Math.floor(Math.random() * handCards.length);
                return handCards[defaultIndex].id;
        }
    }

    /**
     * Get the total influence for this player
     */
    private getTotalPlayerInfluence(): number {
        if (!this.player) return 0;
        return CardUtils.calculateTotalInfluence(this.player);
    }

    /**
     * Execute a card play action
     */
    private async playCard(cardId: string): Promise<void> {
        try {
            await this.gameActionService.playCard(cardId);
        } catch (error) {
            console.error('AI player failed to play card:', error);
            // Fallback to drawing a card
            this.drawCard();
        }
    }

    /**
     * Execute a draw card action
     */
    private async drawCard(): Promise<void> {
        try {
            await this.gameActionService.drawCard();
        } catch (error) {
            console.error('AI player failed to draw card:', error);
            // Fallback to ending turn
            this.endTurn();
        }
    }

    /**
     * Execute an end turn action
     */
    private async endTurn(): Promise<void> {
        try {
            await this.gameActionService.endTurn();
        } catch (error) {
            console.error('AI player failed to end turn:', error);
        }
    }
}