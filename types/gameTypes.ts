// Card Types
export type CardType = 'charakterkarte' | 'spezialkarte' | 'fallenkarte' | 'bonuskarte';
export type CardRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export type PoliticianType = 'populist' | 'diplomat' | 'autoritär' | 'arbeiter' | 'wirtschaft' | 'krisenmanager';

export interface Card {
    id: string;
    type: CardType;
    name: string;
    influence: number;
    effect: string;
    description: string;
    country?: string;
    campaignValue: number;
    tags?: string[];
    imagePath?: string;
    rarity?: CardRarity;
}

// Type guards for card types
export const isCharakterkarte = (card: Card): boolean => card.type === 'charakterkarte';
export const isSpezialkarte = (card: Card): boolean => card.type === 'spezialkarte';
export const isFallenkarte = (card: Card): boolean => card.type === 'fallenkarte';

// Card type display names mapping
export const CARD_TYPE_NAMES = {
    charakterkarte: 'Charakterkarte',
    spezialkarte: 'Spezialkarte',
    fallenkarte: 'Fallenkarte'
} as const;

// Player Types
export interface Player {
    id: string;
    name: string;
    deck: Card[];
    hand: Card[];
    mandates: number;
    drawPile: Card[];
    discardPile: Card[];
    playedCharacters: Card[];
    playedSpecials: Card[];
    playedTraps: Card[];
    isActive: boolean;
    coalitionWith?: string; // ID of the coalition partner
}

// Game Types
export type GameStatus = 'lobby' | 'starting' | 'active' | 'completed';
export enum GamePhase {
    SETUP = 'setup',
    MOMENTUM = 'momentum',
    COALITION = 'coalition',
    CHARACTER = 'character',
    SPECIAL = 'special',
    RESOLUTION = 'resolution',
    INFLUENCE_LOSS = 'influence_loss',
    DRAW = 'draw',
    END = 'end'
}

export interface GameState {
    id: string;
    players: Player[];
    currentRound: number;
    phase: GamePhase;
    momentum: number;
    activePlayerId: string;
    winner: string | null;
    coalitions: Coalition[];
    log: GameLogEntry[];
    startTime: Date;
    endTime?: Date;
}

export interface Effect {
    type: string;
    duration: number;
    value: any;
    source: string;
}

export interface DeckValidation {
    isValid: boolean;
    errors: string[];
    charakterkartenCount: number;
    spezialkartenCount: number;
    fallenkartenCount: number;
    totalBudget: number;
}

// Konstanten für Deck-Validierung
export const DECK_SIZE = 20;
export const CHARAKTERKARTEN_COUNT = 10;
export const SPEZIALKARTEN_COUNT = 5;
export const FALLENKARTEN_COUNT = 5;

// Budget-Limits basierend auf Politikertyp
export const BUDGET_LIMITS = {
    [BudgetCategory.LOCAL]: 180000,
    [BudgetCategory.REGIONAL]: 250000,
    [BudgetCategory.COSMOPOLITAN]: 320000
};

// Deck Types
export interface Deck {
    id: string;
    name: string;
    cards: Card[];
    owner: string;
    totalValue: number;
    charakterCount: number;
    specialCount: number;
    trapOrBonusCount: number;
    isValid: boolean;
}

export interface GameLogEntry {
    timestamp: Date;
    message: string;
    type: 'system' | 'action' | 'effect' | 'result';
    playerId?: string;
}

// Game Action Types
export enum ActionType {
    PLAY_CHARACTER = 'play_character',
    PLAY_SPECIAL = 'play_special',
    PLAY_TRAP = 'play_trap',
    OFFER_COALITION = 'offer_coalition',
    ACCEPT_COALITION = 'accept_coalition',
    DECLINE_COALITION = 'decline_coalition',
    THROW_MOMENTUM = 'throw_momentum',
    END_TURN = 'end_turn'
}

export interface GameAction {
    type: ActionType;
    playerId: string;
    targetId?: string;
    cardId?: string;
    value?: number | string;
    timestamp: Date;
}

// Dice roll result
export interface DiceRoll {
    playerId: string;
    value: number;
    purpose: 'momentum' | 'effect' | 'backfire'; // What the roll is for
    timestamp: number;
}

// Interface for temporary game effects
export interface GameEffect {
    id: string;
    type: string;
    sourceCardId: string;
    sourcePlayerId: string;
    targetPlayerId?: string;
    duration: number; // How many rounds/phases the effect lasts
    startRound: number;
    value?: number; // Optional numeric value for the effect
    description: string;
}

export interface CenterCard {
    playerId: string;
    card: Card | null; // null if not revealed yet
    revealed: boolean;
    position: number; // Position in play order
}

export interface Coalition {
    player1Id: string;
    player2Id: string;
    roundFormed: number;
    consecutiveRounds: number;
}

// Statistics for deck analysis
export interface DeckStats {
    totalCards: number;
    totalCampaignValue: number;
    averageInfluence: number;
    typeDistribution: {
        [key: string]: number;
    };
    countryDistribution: {
        [key: string]: number;
    };
    budgetRemaining: number; // Based on €250,000 max
    isValid: boolean;
}

/**
 * Game settings for configuring AI and gameplay options
 */
export interface GameSettings {
    // AI settings
    enableAI: boolean;
    aiDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
    aiPlayerCount: number;

    // Game rules
    mandateThreshold: number; // Default: 12 (MANDAT MACHT MOMENTUM rules)
    alternateWinThreshold: number; // Default: 40 influence for alternate win condition
    maxRounds: number;
    turnTimeLimit?: number; // Optional time limit for turns in seconds
    minPlayers: number; // Minimum number of players (3 for MANDAT MACHT MOMENTUM)

    // Special rules
    allowCoalitions: boolean;
    shufflePlayerOrder: boolean;
    dealInitialCards: number; // Number of cards to deal at start (6 for MANDAT MACHT MOMENTUM)

    // Deck building rules
    deckSize: number; // Total cards in deck (20 for MANDAT MACHT MOMENTUM)
    requiredCharacterCards: number; // Required character cards in deck (10 for MANDAT MACHT MOMENTUM)
    requiredSpecialCards: number; // Required special cards in deck (5 for MANDAT MACHT MOMENTUM)
    requiredBonusCards: number; // Required bonus cards in deck (5 for MANDAT MACHT MOMENTUM)

    // Momentum rules
    initialMomentumLevel: number; // Starting momentum level (1 for first round in MANDAT MACHT MOMENTUM)
    useMomentumRules: boolean; // Whether to use momentum mechanics

    // Budget limits based on politician type
    budgetLimits: {
        local: 180000,    // Lokalpolitiker
        regional: 250000, // Regional/Bundes
        cosmopolitan: 320000 // Cosmopolit
    };

    // Deck building rules
    deckRules: {
        totalCards: 20,
        charakterCards: 10,
        spezialCards: 5,
        fallenCards: 5,
        maxDuplicates: 1 // Keine Karte darf doppelt enthalten sein
    };
}

/**
 * Default game settings based on MANDAT MACHT MOMENTUM rules
 */
export const DEFAULT_GAME_SETTINGS: GameSettings = {
    enableAI: false,
    aiDifficulty: 'MEDIUM',
    aiPlayerCount: 0,

    mandateThreshold: 12, // Win condition: 12 mandates
    alternateWinThreshold: 40, // Alternate win: 40+ influence
    maxRounds: 20,
    turnTimeLimit: undefined,
    minPlayers: 3,

    allowCoalitions: true,
    shufflePlayerOrder: true,
    dealInitialCards: 6,

    deckSize: 20,
    requiredCharacterCards: 10,
    requiredSpecialCards: 5,
    requiredBonusCards: 5,

    initialMomentumLevel: 1,
    useMomentumRules: true,

    budgetLimits: {
        local: 180000,
        regional: 250000,
        cosmopolitan: 320000
    },

    deckRules: {
        totalCards: 20,
        charakterCards: 10,
        spezialCards: 5,
        fallenCards: 5,
        maxDuplicates: 1
    }
};

// Budget-Kategorien
export enum BudgetCategory {
    LOCAL = 'Lokalpolitiker*in',
    REGIONAL = 'Regional/Bundes',
    COSMOPOLITAN = 'Cosmopolit'
}