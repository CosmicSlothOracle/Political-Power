/**
 * CardUtils.ts
 * Utility functions for managing cards
 */

import { Card, Deck, Player } from '../types/gameTypes';
import { DeckManager } from './DeckManager';

export class CardUtils {
    /**
     * Gets detailed card information for card IDs in a player's hand
     */
    static getPlayerHandCards(player: Player): Card[] {
        if (!player.hand || !player.deck) return [];

        return player.hand
            .map(cardId => DeckManager.getCardById(player.deck, cardId))
            .filter((card): card is Card => card !== undefined);
    }

    /**
     * Gets detailed card information for card IDs in a player's played cards
     */
    static getPlayerPlayedCards(player: Player): Card[] {
        if (!player.played || !player.deck) return [];

        return player.played
            .map(cardId => DeckManager.getCardById(player.deck, cardId))
            .filter((card): card is Card => card !== undefined);
    }

    /**
     * Gets a specific card from a player's deck by ID
     */
    static getCardFromPlayer(player: Player, cardId: string): Card | undefined {
        if (!player.deck) return undefined;
        return DeckManager.getCardById(player.deck, cardId);
    }

    /**
     * Calculates total influence of all played cards for a player
     */
    static calculateTotalInfluence(player: Player): number {
        const playedCards = this.getPlayerPlayedCards(player);

        // Base influence from played cards
        const baseInfluence = playedCards.reduce((sum, card) => sum + (card.influence || 0), 0);

        // Add any player influence modifiers
        return baseInfluence + (player.influenceModifier || 0);
    }

    /**
     * Groups cards by type
     */
    static groupCardsByType(cards: Card[]): Record<string, Card[]> {
        const result: Record<string, Card[]> = {};

        cards.forEach(card => {
            if (!result[card.type]) {
                result[card.type] = [];
            }
            result[card.type].push(card);
        });

        return result;
    }

    /**
     * Sorts cards by a specific property
     */
    static sortCards(cards: Card[], property: keyof Card = 'influence', ascending = true): Card[] {
        return [...cards].sort((a, b) => {
            const valueA = a[property];
            const valueB = b[property];

            if (valueA === undefined) return ascending ? -1 : 1;
            if (valueB === undefined) return ascending ? 1 : -1;

            if (valueA < valueB) return ascending ? -1 : 1;
            if (valueA > valueB) return ascending ? 1 : -1;

            return 0;
        });
    }

    /**
     * Filter cards by type
     */
    static filterCardsByType(cards: Card[], type: string): Card[] {
        return cards.filter(card => card.type === type);
    }

    /**
     * Filter cards by influence value
     */
    static filterCardsByInfluence(cards: Card[], minInfluence: number, maxInfluence?: number): Card[] {
        return cards.filter(card => {
            const influence = card.influence || 0;
            return influence >= minInfluence && (maxInfluence === undefined || influence <= maxInfluence);
        });
    }

    /**
     * Filter cards by campaign value
     */
    static filterCardsByCampaignValue(cards: Card[], maxValue: number): Card[] {
        return cards.filter(card => (card.campaignValue || 0) <= maxValue);
    }

    /**
     * Get all cards with a specific tag
     */
    static getCardsByTag(cards: Card[], tag: string): Card[] {
        return cards.filter(card => card.tags?.includes(tag));
    }

    /**
     * Check if a card can be played based on game rules and current state
     * This is a placeholder for game-specific logic
     */
    static canPlayCard(card: Card, player: Player): boolean {
        // Example checks:
        // 1. Player has the card in hand
        const hasCard = player.hand.includes(card.id);

        // 2. Check if player can play special cards
        if (card.type === 'special' && !player.canPlaySpecial) {
            return false;
        }

        return hasCard;
    }
}