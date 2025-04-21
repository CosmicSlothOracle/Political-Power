/**
 * CardService.ts
 * Service for managing cards, card collections, and providing card-related operations
 */

import { Card, CardType, CardRarity, Deck } from '../types/gameTypes';
import { DeckManager } from '../game/DeckManager';
import mockCards from '../game/mockCards';

export class CardService {
    private static instance: CardService;
    private cards: Card[] = [];
    private isInitialized: boolean = false;

    private constructor() {
        // Private constructor for singleton pattern
    }

    /**
     * Get the singleton instance of CardService
     */
    public static getInstance(): CardService {
        if (!CardService.instance) {
            CardService.instance = new CardService();
        }
        return CardService.instance;
    }

    /**
     * Initialize the card service with data
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // In a real implementation, we might fetch cards from an API
            // For now, we'll use the mockCards
            this.cards = mockCards.getAllCards();
            this.isInitialized = true;
            console.log(`[CardService] Initialized with ${ this.cards.length } cards`);
        } catch (error) {
            console.error('[CardService] Failed to initialize:', error);
            throw error;
        }
    }

    /**
     * Get all available cards
     */
    public getAllCards(): Card[] {
        if (!this.isInitialized) {
            this.initialize();
        }
        return [...this.cards];
    }

    /**
     * Get a card by ID
     */
    public getCardById(id: string): Card | undefined {
        if (!this.isInitialized) {
            this.initialize();
        }
        return this.cards.find(card => card.id === id);
    }

    /**
     * Get cards by type
     */
    public getCardsByType(type: CardType): Card[] {
        if (!this.isInitialized) {
            this.initialize();
        }
        return this.cards.filter(card => card.type === type);
    }

    /**
     * Get cards by country
     */
    public getCardsByCountry(country: string): Card[] {
        if (!this.isInitialized) {
            this.initialize();
        }
        return this.cards.filter(card => card.country === country);
    }

    /**
     * Get cards by rarity
     */
    public getCardsByRarity(rarity: CardRarity): Card[] {
        if (!this.isInitialized) {
            this.initialize();
        }
        return this.cards.filter(card => card.rarity === rarity);
    }

    /**
     * Search cards by name (case-insensitive partial match)
     */
    public searchCardsByName(searchTerm: string): Card[] {
        if (!this.isInitialized) {
            this.initialize();
        }
        const lowerSearchTerm = searchTerm.toLowerCase();
        return this.cards.filter(card =>
            card.name.toLowerCase().includes(lowerSearchTerm)
        );
    }

    /**
     * Create a starter deck for a new player
     */
    public createStarterDeck(userId: string): Deck {
        if (!this.isInitialized) {
            this.initialize();
        }

        // Get a well-balanced starter deck
        const starterCards = mockCards.createStarterDeck();

        // Create and return a deck
        const deck = DeckManager.createDeck(starterCards);
        deck.userId = userId;
        deck.name = "Starter Deck";

        return deck;
    }

    /**
     * Create a random deck with balanced card types
     */
    public createRandomDeck(userId: string, size: number = 20): Deck {
        if (!this.isInitialized) {
            this.initialize();
        }

        // Get random cards but ensure type balance
        const politicianCards = this.getCardsByType('politician');
        const eventCards = this.getCardsByType('event');
        const specialCards = this.getCardsByType('special');

        // Shuffle each array
        const shufflePoliticians = [...politicianCards].sort(() => 0.5 - Math.random());
        const shuffleEvents = [...eventCards].sort(() => 0.5 - Math.random());
        const shuffleSpecials = [...specialCards].sort(() => 0.5 - Math.random());

        // Create a balanced deck with approximate ratio of 50% politicians, 30% events, 20% special
        const politicianCount = Math.floor(size * 0.5);
        const eventCount = Math.floor(size * 0.3);
        const specialCount = size - politicianCount - eventCount;

        const selectedCards = [
            ...shufflePoliticians.slice(0, politicianCount),
            ...shuffleEvents.slice(0, eventCount),
            ...shuffleSpecials.slice(0, specialCount)
        ];

        // Create and return a deck
        const deck = DeckManager.createDeck(selectedCards);
        deck.userId = userId;
        deck.name = "Random Deck";

        return deck;
    }

    /**
     * Validate if a deck meets game rules
     */
    public validateDeck(deck: Deck): { valid: boolean, errors: string[] } {
        return DeckManager.validateDeck(deck);
    }

    /**
     * Calculate the campaign value of a deck
     */
    public calculateDeckValue(deck: Deck): number {
        return DeckManager.calculateDeckValue(deck);
    }

    /**
     * Get detailed information about cards in a deck
     */
    public getCardsInDeck(deck: Deck): Card[] {
        return deck.cards;
    }

    /**
     * Get detailed information about cards in a player's hand
     */
    public getCardsInHand(deck: Deck, cardIds: string[]): Card[] {
        return cardIds
            .map(id => DeckManager.getCardById(deck, id))
            .filter((card): card is Card => card !== undefined);
    }
}

// Export a singleton instance
const cardService = CardService.getInstance();
export default cardService;