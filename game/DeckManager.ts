/**
 * DeckManager.ts
 * Provides functions for deck management, card drawing and shuffling
 */

import { Card, Deck } from '../types/gameTypes';

export class DeckManager {
    /**
     * Creates a new shuffled deck from a list of cards
     */
    static createDeck(cards: Card[]): Deck {
        const shuffled = [...cards].sort(() => 0.5 - Math.random());

        return {
            id: `deck-${ Date.now() }`,
            name: "New Deck",
            cards: shuffled,
            drawPile: shuffled.map(card => card.id),
            discardPile: []
        };
    }

    /**
     * Shuffles a deck's draw pile
     */
    static shuffleDeck(deck: Deck): Deck {
        const shuffled = [...deck.drawPile].sort(() => 0.5 - Math.random());

        return {
            ...deck,
            drawPile: shuffled
        };
    }

    /**
     * Reshuffles the discard pile into the draw pile
     */
    static reshuffleDiscardPile(deck: Deck): Deck {
        const allCards = [...deck.drawPile, ...deck.discardPile];
        const shuffled = allCards.sort(() => 0.5 - Math.random());

        return {
            ...deck,
            drawPile: shuffled,
            discardPile: []
        };
    }

    /**
     * Draws a specified number of cards from the deck
     * Returns the drawn card IDs and the updated deck
     */
    static drawCards(deck: Deck, count: number): { drawnCardIds: string[], updatedDeck: Deck } {
        let currentDeck = { ...deck };
        const drawnCardIds: string[] = [];

        for (let i = 0; i < count; i++) {
            // If draw pile is empty, reshuffle discard pile
            if (currentDeck.drawPile.length === 0) {
                if (currentDeck.discardPile.length === 0) {
                    // No more cards available
                    break;
                }
                currentDeck = this.reshuffleDiscardPile(currentDeck);
            }

            // Draw from the top of the deck
            const drawnCardId = currentDeck.drawPile[0];
            drawnCardIds.push(drawnCardId);

            // Update the deck
            currentDeck = {
                ...currentDeck,
                drawPile: currentDeck.drawPile.slice(1)
            };
        }

        return { drawnCardIds, updatedDeck: currentDeck };
    }

    /**
     * Discards specified cards from a player's hand
     */
    static discardCards(deck: Deck, cardIds: string[]): Deck {
        return {
            ...deck,
            discardPile: [...deck.discardPile, ...cardIds]
        };
    }

    /**
     * Looks at the top X cards of a deck without drawing them
     */
    static peekTopCards(deck: Deck, count: number): { cards: string[], remainingDeck: Deck } {
        if (deck.drawPile.length === 0) {
            if (deck.discardPile.length === 0) {
                return { cards: [], remainingDeck: deck };
            }
            deck = this.reshuffleDiscardPile(deck);
        }

        const actualCount = Math.min(count, deck.drawPile.length);
        const topCards = deck.drawPile.slice(0, actualCount);

        return {
            cards: topCards,
            remainingDeck: deck
        };
    }

    /**
     * Puts specific cards back on top of the deck in a specified order
     */
    static putCardsOnTop(deck: Deck, cardIds: string[]): Deck {
        return {
            ...deck,
            drawPile: [...cardIds, ...deck.drawPile]
        };
    }

    /**
     * Gets a card by ID from the deck's card pool
     */
    static getCardById(deck: Deck, cardId: string): Card | undefined {
        return deck.cards.find(card => card.id === cardId);
    }

    /**
     * Calculate total campaign value of a deck
     */
    static calculateDeckValue(deck: Deck): number {
        return deck.cards.reduce((sum, card) => sum + (card.campaignValue || 0), 0);
    }

    /**
     * Validates a deck against the game rules
     */
    static validateDeck(deck: Deck): { valid: boolean, errors: string[] } {
        const errors: string[] = [];

        // 1. Check deck size
        if (deck.cards.length !== 20) {
            errors.push(`Deck muss genau 20 Karten enthalten. Aktuell: ${ deck.cards.length }`);
        }

        // 2. Check card type distribution
        const charakterCount = deck.cards.filter(c => c.type === 'charakterkarte').length;
        const spezialCount = deck.cards.filter(c => c.type === 'spezialkarte').length;
        const fallenCount = deck.cards.filter(c => c.type === 'fallenkarte').length;

        if (charakterCount !== 10) {
            errors.push(`Deck muss genau 10 Charakterkarten enthalten. Aktuell: ${ charakterCount }`);
        }
        if (spezialCount !== 5) {
            errors.push(`Deck muss genau 5 Spezialkarten enthalten. Aktuell: ${ spezialCount }`);
        }
        if (fallenCount !== 5) {
            errors.push(`Deck muss genau 5 Fallenkarten enthalten. Aktuell: ${ fallenCount }`);
        }

        // 3. Check for duplicate cards
        const cardIds = deck.cards.map(c => c.id);
        const uniqueCardIds = new Set(cardIds);
        if (uniqueCardIds.size !== cardIds.length) {
            errors.push('Deck enthält doppelte Karten');
        }

        // 4. Check campaign budget
        const totalValue = this.calculateDeckValue(deck);
        const politicianTypes = this.determinePoliticianType(deck);

        if (politicianTypes.local && totalValue > 180000) {
            errors.push(`Lokalpolitiker-Deck überschreitet Budget von 180.000 EUR (${ totalValue })`);
        }
        if (politicianTypes.regional && totalValue > 250000) {
            errors.push(`Regional/Bundes-Deck überschreitet Budget von 250.000 EUR (${ totalValue })`);
        }
        if (politicianTypes.cosmopolitan && totalValue > 320000) {
            errors.push(`Kosmopolit-Deck überschreitet Budget von 320.000 EUR (${ totalValue })`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Determines the politician type of the deck based on the cards
     */
    private static determinePoliticianType(deck: Deck): {
        local: boolean;
        regional: boolean;
        cosmopolitan: boolean;
    } {
        const charakterCards = deck.cards.filter(c => c.type === 'charakterkarte');

        return {
            local: charakterCards.some(c => c.country === 'Lokalpolitiker'),
            regional: charakterCards.some(c => ['CDU', 'SPD', 'Grüne', 'FDP', 'CSU'].includes(c.country || '')),
            cosmopolitan: charakterCards.some(c => ['USA', 'China', 'Türkei', 'Ukraine', 'Brasilien', 'Frankreich'].includes(c.country || ''))
        };
    }
}