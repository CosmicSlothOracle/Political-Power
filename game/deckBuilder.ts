/**
 * deckBuilder.ts
 * Provides utilities for building, saving, and managing card decks
 */

import { Card } from '../types/gameTypes';
import { getAllCards, getCardById } from './mockCards';

interface Deck {
    id: string;
    name: string;
    description: string;
    cards: Card[];
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
}

interface DeckSummary {
    id: string;
    name: string;
    description: string;
    cardCount: number;
    authorId: string;
}

// Maximum cards allowed in a deck
const MAX_DECK_SIZE = 15;
// Maximum number of special cards allowed
const MAX_SPECIAL_CARDS = 3;

/**
 * Creates a new empty deck
 */
const createEmptyDeck = (authorId: string, name = 'New Deck', description = ''): Deck => {
    return {
        id: `deck_${ Date.now() }`,
        name,
        description,
        cards: [],
        authorId,
        createdAt: new Date(),
        updatedAt: new Date()
    };
};

/**
 * Checks if a card can be added to the deck based on deck building rules
 */
const canAddCardToDeck = (deck: Deck, cardId: string): { canAdd: boolean; reason?: string } => {
    const card = getCardById(cardId);

    if (!card) {
        return { canAdd: false, reason: 'Card not found' };
    }

    // Check if deck is full
    if (deck.cards.length >= MAX_DECK_SIZE) {
        return { canAdd: false, reason: `Deck size limit of ${ MAX_DECK_SIZE } reached` };
    }

    // Check if special card limit is reached
    if (card.type === 'plot') {
        const plotCardsCount = deck.cards.filter(c => c.type === 'plot').length;
        if (plotCardsCount >= MAX_SPECIAL_CARDS) {
            return { canAdd: false, reason: `Maximum of ${ MAX_SPECIAL_CARDS } plot cards allowed` };
        }
    }

    // Check for duplicate unique cards (using card id)
    const maxCopiesAllowed = card.rarity === 'legendary' ? 1 : 2;
    const cardCount = deck.cards.filter(c => c.id === card.id).length;

    if (cardCount >= maxCopiesAllowed) {
        return {
            canAdd: false,
            reason: `Maximum of ${ maxCopiesAllowed } copies of this card allowed (${ card.rarity })`
        };
    }

    return { canAdd: true };
};

/**
 * Adds a card to a deck if allowed by deck building rules
 */
const addCardToDeck = (deck: Deck, cardId: string): { success: boolean; deck: Deck; message?: string } => {
    const { canAdd, reason } = canAddCardToDeck(deck, cardId);

    if (!canAdd) {
        return { success: false, deck, message: reason };
    }

    const card = getCardById(cardId);

    if (!card) {
        return { success: false, deck, message: 'Card not found' };
    }

    const updatedDeck = {
        ...deck,
        cards: [...deck.cards, card],
        updatedAt: new Date()
    };

    return { success: true, deck: updatedDeck };
};

/**
 * Removes a card from a deck at the specified index
 */
const removeCardFromDeck = (deck: Deck, cardIndex: number): Deck => {
    if (cardIndex < 0 || cardIndex >= deck.cards.length) {
        return deck;
    }

    const updatedCards = [...deck.cards];
    updatedCards.splice(cardIndex, 1);

    return {
        ...deck,
        cards: updatedCards,
        updatedAt: new Date()
    };
};

/**
 * Gets deck statistics (card type distribution, influence total, etc.)
 */
const getDeckStats = (deck: Deck) => {
    const allyCount = deck.cards.filter(card => card.type === 'ally').length;
    const actionCount = deck.cards.filter(card => card.type === 'action').length;
    const plotCount = deck.cards.filter(card => card.type === 'plot').length;

    const totalInfluence = deck.cards.reduce((sum, card) => sum + card.influence, 0);

    const rarityDistribution = {
        common: deck.cards.filter(card => card.rarity === 'common').length,
        rare: deck.cards.filter(card => card.rarity === 'rare').length,
        legendary: deck.cards.filter(card => card.rarity === 'legendary').length
    };

    return {
        cardCount: deck.cards.length,
        maxSize: MAX_DECK_SIZE,
        typeCounts: {
            ally: allyCount,
            action: actionCount,
            plot: plotCount
        },
        rarityDistribution,
        totalInfluence,
        averageInfluence: totalInfluence / (deck.cards.length || 1)
    };
};

/**
 * Validates a deck against the deck building rules
 */
const validateDeck = (deck: Deck): { isValid: boolean; issues: string[] } => {
    const issues: string[] = [];

    // Check total card count (should be 20 for MANDAT MACHT MOMENTUM)
    const totalCards = deck.cards.length;
    if (totalCards !== 20) {
        issues.push(`Deck must contain exactly 20 cards (currently has ${ totalCards })`);
    }

    // Count card types
    const characterCards = deck.cards.filter(card => card.type === 'politician');
    const specialCards = deck.cards.filter(card => card.type === 'special');
    const bonusCards = deck.cards.filter(card => card.type === 'event');

    // Check character cards (should be 10)
    if (characterCards.length !== 10) {
        issues.push(`Deck must contain exactly 10 character cards (currently has ${ characterCards.length })`);
    }

    // Check special cards (should be 5)
    if (specialCards.length !== 5) {
        issues.push(`Deck must contain exactly 5 special cards (currently has ${ specialCards.length })`);
    }

    // Check bonus cards (should be 5)
    if (bonusCards.length !== 5) {
        issues.push(`Deck must contain exactly 5 bonus cards (currently has ${ bonusCards.length })`);
    }

    // Check campaign budget (250,000 max)
    const totalCampaignValue = deck.cards.reduce((sum, card) => sum + card.campaignValue, 0);
    if (totalCampaignValue > 250000) {
        issues.push(`Total campaign value exceeds maximum budget of €250,000 (currently €${ totalCampaignValue.toLocaleString() })`);
    }

    // Check for duplicate cards (by ID)
    const cardIds = deck.cards.map(card => card.id);
    const uniqueCardIds = new Set(cardIds);
    if (uniqueCardIds.size !== cardIds.length) {
        issues.push('Deck contains duplicate cards');
    }

    return {
        isValid: issues.length === 0,
        issues
    };
};

/**
 * Creates a deck summary object (for listings)
 */
const createDeckSummary = (deck: Deck): DeckSummary => {
    return {
        id: deck.id,
        name: deck.name,
        description: deck.description,
        cardCount: deck.cards.length,
        authorId: deck.authorId
    };
};

/**
 * Creates a starter deck for new players
 */
const createStarterDeck = (authorId: string): Deck => {
    const deck = createEmptyDeck(authorId, 'Starter Deck', 'A balanced deck for new players');
    const allCards = getAllCards();

    // Add some ally cards
    const allies = allCards.filter(card => card.type === 'ally' && card.rarity !== 'legendary').slice(0, 6);

    // Add some action cards
    const actions = allCards.filter(card => card.type === 'action' && card.rarity !== 'legendary').slice(0, 6);

    // Add one plot card
    const plots = allCards.filter(card => card.type === 'plot' && card.rarity !== 'legendary').slice(0, 1);

    return {
        ...deck,
        cards: [...allies, ...actions, ...plots]
    };
};

export {
    Deck,
    DeckSummary,
    MAX_DECK_SIZE,
    MAX_SPECIAL_CARDS,
    createEmptyDeck,
    canAddCardToDeck,
    addCardToDeck,
    removeCardFromDeck,
    getDeckStats,
    validateDeck,
    createDeckSummary,
    createStarterDeck
};