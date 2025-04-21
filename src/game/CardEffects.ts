/**
 * CardEffects.ts
 * Handles the processing and resolution of card effects for the Political Card Game
 */

import { Card, GameState, Player, GameEffect } from '../types/gameTypes';

/**
 * CardEffects class provides methods to process and apply card effects
 */
class CardEffects {
    /**
     * Process effects for the cards played in the current round
     * @param gameState Current game state
     * @returns Updated game state with effects applied
     */
    static processEffects(gameState: GameState): GameState {
        // Copy the game state to avoid mutations
        let updatedGameState = { ...gameState };

        // Get all revealed center cards
        const revealedCards = gameState.centerCards
            .filter(cc => cc.revealed && cc.card)
            .map(cc => ({
                card: cc.card!,
                playerId: cc.playerId,
                position: cc.position
            }));

        // Sort cards by effect priority
        // 1. Politicians process first (influence-based)
        // 2. Events process second (global effects)
        // 3. Special cards process last (targeted effects)
        const sortedCards = revealedCards.sort((a, b) => {
            // Sort by type first
            const typeOrder: Record<string, number> = {
                'politician': 1,
                'event': 2,
                'special': 3
            };

            const aOrder = typeOrder[a.card.type] || 99;
            const bOrder = typeOrder[b.card.type] || 99;

            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }

            // Then by position (order played)
            return a.position - b.position;
        });

        // Process each card's effect
        for (const { card, playerId } of sortedCards) {
            updatedGameState = this.applyCardEffect(updatedGameState, card, playerId);
        }

        return updatedGameState;
    }

    /**
     * Apply a single card's effect to the game state
     * @param gameState Current game state
     * @param card Card to apply effect from
     * @param playerId ID of the player who played the card
     * @returns Updated game state
     */
    static applyCardEffect(gameState: GameState, card: Card, playerId: string): GameState {
        // Generic functionality for all cards
        console.log(`Applying effect for card: ${ card.name }`);

        // Clone game state to avoid direct mutation
        const newState = {
            ...gameState,
            players: [...gameState.players],
            log: [...gameState.log]
        };

        // Calculate any influence boosts
        const influenceBoost = this.calculateInfluenceBoost(card, gameState);

        // Log the play
        newState.log.push({
            text: `${ this.getPlayerName(newState, playerId) } played ${ card.name } (${ card.influence }${ influenceBoost > 0 ? '+' + influenceBoost : '' } influence).`,
            timestamp: Date.now(),
            type: 'action'
        });

        // Call the specific effect based on card type
        switch (card.type) {
            case 'charakterkarte':
                return this.applyCharakterkartEffect(newState, card, playerId);
            case 'spezialkarte':
                return this.applySpezialkartEffect(newState, card, playerId);
            case 'fallenkarte':
                return this.applyFallenkartEffect(newState, card, playerId);
            default:
                return newState;
        }
    }

    /**
     * Apply effects specific to Politician cards
     */
    private static applyCharakterkartEffect(gameState: GameState, card: Card, playerId: string): GameState {
        // Charakterkarte (former Politician) effects
        // ... existing politician card logic ...
    }

    /**
     * Apply effects specific to Event cards
     */
    private static applySpezialkartEffect(gameState: GameState, card: Card, playerId: string): GameState {
        // Spezialkarte (former Event) effects
        // ... existing event card logic ...
    }

    /**
     * Apply effects specific to Special cards
     */
    private static applyFallenkartEffect(gameState: GameState, card: Card, playerId: string): GameState {
        // Fallenkarte (former Special) effects
        // ... existing special card logic ...
    }

    /**
     * Resolve dice roll for a card effect
     * @param gameState Current game state
     * @param playerId Player rolling the dice
     * @param cardId Card that triggered the dice roll
     * @returns Dice roll result (1-6)
     */
    static rollDice(gameState: GameState, playerId: string, cardId: string): number {
        // Generate random dice roll (1-6)
        const rollResult = Math.floor(Math.random() * 6) + 1;

        // In a real implementation, you would update the game state
        // with the dice roll result here

        return rollResult;
    }
}

export default CardEffects;