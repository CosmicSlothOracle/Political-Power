/**
 * mockCards.ts
 * Provides mock card data for testing the Political Card Game
 */

import { Card } from '../types/gameTypes';

// Card collection for testing
const cards: Card[] = [
    // Charakterkarten
    {
        id: "1",
        type: "charakterkarte",
        name: "Donald Trump",
        influence: 7,
        effect: "Neutralisiert Gegner-Karte (Wurf-Effekt)",
        description: "I alone can fix it",
        country: "USA",
        campaignValue: 33000,
        rarity: "legendary",
        tags: ["populist"]
    },
    {
        id: "2",
        type: "charakterkarte",
        name: "Angela Merkel",
        influence: 6,
        effect: "Einmal pro Spiel eine Ereigniskarte ignorieren",
        description: "Wir schaffen das.",
        country: "CDU",
        campaignValue: 31900,
        rarity: "legendary",
        tags: ["diplomat"]
    },
    {
        id: "3",
        type: "charakterkarte",
        name: "Xi Jinping",
        influence: 6,
        effect: "Gegner muss Karte offenlegen",
        description: "Zensur ist Schutz.",
        country: "China",
        campaignValue: 29000,
        rarity: "legendary",
        tags: ["autoritär"]
    },
    {
        id: "4",
        type: "charakterkarte",
        name: "Recep Tayyip Erdogan",
        influence: 6,
        effect: "Wenn Momentum ≥ 4: +3 Einfluss",
        description: "Demokratie ist kein Ziel, sondern ein Mittel",
        country: "Türkei",
        campaignValue: 29000,
        tags: ["autoritär"]
    },
    {
        id: "5",
        type: "charakterkarte",
        name: "Franz Müntefering",
        influence: 5,
        effect: "Reduziert gegnerischen Einfluss um 1 (bei Würfel 1-2: -2)",
        description: "Wer nicht arbeitet, soll auch nicht essen.",
        country: "SPD",
        campaignValue: 25000,
        tags: ["arbeiter"]
    },
    {
        id: "6",
        type: "charakterkarte",
        name: "Peer Steinbrück",
        influence: 5,
        effect: "Bei Rückstand: +2 Einfluss",
        description: "Ich bin nicht die Sparkasse.",
        country: "SPD",
        campaignValue: 25000,
        tags: ["wirtschaft"]
    },
    {
        id: "7",
        type: "charakterkarte",
        name: "Volodymyr Selenskyj",
        influence: 5,
        effect: "Bei Momentum ≥ 4: alle eigenen Karten +1",
        description: "Ich bin kein Held, ich bin der Präsident.",
        country: "Ukraine",
        campaignValue: 25000,
        tags: ["krisenmanager"]
    },
    {
        id: "8",
        type: "charakterkarte",
        name: "Olaf Scholz",
        influence: 5,
        effect: "Bei Momentum ≥ 3: +2 Einfluss",
        description: "Ich bin kein Held, ich bin der Präsident.",
        country: "SPD",
        campaignValue: 25000,
        tags: ["wirtschaft"]
    },
    {
        id: "9",
        type: "charakterkarte",
        name: "Christian Lindner",
        influence: 5,
        effect: "Bei Wurf 5-6: +2 Einfluss",
        description: "",
        country: "FDP",
        campaignValue: 25000,
        tags: ["arbeiter"]
    },
    {
        id: "10",
        type: "charakterkarte",
        name: "Annalena Baerbock",
        influence: 5,
        effect: "Bei internationalem Thema: +2 Einfluss",
        description: "Ich habe keinen Kobold - ich hab ein Ziel.",
        country: "Grüne",
        campaignValue: 25000,
        tags: ["wirtschaft"]
    },
    {
        id: 'card-4',
        name: 'Vladimir Putin',
        type: 'politician',
        country: 'Russia',
        influence: 8,
        effect: 'All other players get -1 influence this round.',
        campaignValue: 35000,
        era: 'Modern',
        description: 'The authoritarian Russian leader with an iron grip on power.'
    },
    {
        id: 'card-5',
        name: 'Volodymyr Zelenskyj',
        type: 'politician',
        country: 'Ukraine',
        influence: 4,
        effect: '+3 influence if momentum level is 4 or higher.',
        campaignValue: 20000,
        era: 'Modern',
        description: 'The Ukrainian president who rose to prominence during wartime.'
    },
    {
        id: 'card-6',
        name: 'Ursula von der Leyen',
        type: 'politician',
        country: 'EU',
        influence: 5,
        effect: 'All EU politicians gain +1 influence.',
        campaignValue: 22000,
        era: 'Modern',
        description: 'President of the European Commission and former German defense minister.'
    },
    {
        id: 'card-7',
        name: 'Boris Johnson',
        type: 'politician',
        country: 'UK',
        influence: 5,
        effect: 'If momentum is below 3, gain +2 influence.',
        campaignValue: 21000,
        era: 'Modern',
        description: 'The charismatic but controversial former UK Prime Minister who led Brexit.'
    },
    {
        id: 'card-8',
        name: 'Kamala Harris',
        type: 'politician',
        country: 'USA',
        influence: 5,
        effect: 'If another player has more mandates than you, gain +2 influence.',
        campaignValue: 20000,
        era: 'Modern',
        description: 'The trail-blazing Vice President of the United States.'
    },

    // Event cards (global effects)
    {
        id: 'card-11',
        name: 'Economic Summit',
        type: 'event',
        country: 'Global',
        influence: 0,
        effect: 'Player with highest influence gains 1 extra mandate.',
        campaignValue: 15000,
        era: 'Modern',
        description: 'World leaders gather to address economic challenges and opportunities.'
    },
    {
        id: 'card-12',
        name: 'Climate Conference',
        type: 'event',
        country: 'Global',
        influence: 0,
        effect: 'Set momentum level to 2.',
        campaignValue: 12000,
        era: 'Modern',
        description: 'Nations debate environmental policy amid rising global temperatures.'
    },
    {
        id: 'card-13',
        name: 'Election Year',
        type: 'event',
        country: 'Global',
        influence: 0,
        effect: 'All politicians gain +1 influence.',
        campaignValue: 18000,
        era: 'Modern',
        description: 'Multiple countries hold elections, creating a wave of political activity.'
    },
    {
        id: 'card-14',
        name: 'UN Resolution',
        type: 'event',
        country: 'Global',
        influence: 0,
        effect: 'Set momentum to level 3 (neutral).',
        campaignValue: 10000,
        era: 'Modern',
        description: 'The international body passes a significant resolution affecting global politics.'
    },
    {
        id: 'card-15',
        name: 'Nuclear Tensions',
        type: 'event',
        country: 'Global',
        influence: 0,
        effect: 'Increase momentum by 2 levels. All players discard 1 card.',
        campaignValue: 22000,
        era: 'Modern',
        description: 'Geopolitical tensions rise as nuclear threats are exchanged.'
    },
    {
        id: 'card-16',
        name: 'Diplomatic Breakthrough',
        type: 'event',
        country: 'Global',
        influence: 0,
        effect: 'Decrease momentum by 1 level. Each player draws 1 card.',
        campaignValue: 17000,
        era: 'Modern',
        description: 'A unexpected agreement leads to easing tensions between major powers.'
    },
    {
        id: 'card-17',
        name: 'Financial Crisis',
        type: 'event',
        country: 'Global',
        influence: 0,
        effect: 'All players lose 1 influence. Increase momentum by 1.',
        campaignValue: 20000,
        era: 'Modern',
        description: 'Markets crash as confidence in the global financial system wavers.'
    },
    {
        id: 'card-18',
        name: 'Pandemic',
        type: 'event',
        country: 'Global',
        influence: 0,
        effect: 'No special cards can be played this round. Set momentum to level 4.',
        campaignValue: 23000,
        era: 'Modern',
        description: 'A global health crisis forces nations to adopt emergency measures.'
    },
    {
        id: 'card-19',
        name: 'Technological Breakthrough',
        type: 'event',
        country: 'Global',
        influence: 0,
        effect: 'The player who played this card draws 2 cards.',
        campaignValue: 15000,
        era: 'Modern',
        description: 'A major scientific advancement shifts the balance of power.'
    },
    {
        id: 'card-20',
        name: 'Lobbyismus',
        type: 'event',
        country: 'Global',
        influence: 0,
        effect: 'Draw 1 extra card at the end of this round.',
        campaignValue: 12000,
        era: 'Modern',
        description: 'Behind-the-scenes influence shapes policy decisions in unexpected ways.'
    },

    // Special cards (targeted effects)
    {
        id: 'card-21',
        name: 'Shitstorm',
        type: 'special',
        country: 'Global',
        influence: 0,
        effect: 'Target player gets -2 influence this round.',
        campaignValue: 8000,
        era: 'Modern',
        description: 'A social media scandal erupts, damaging someone\'s reputation.'
    },
    {
        id: 'card-22',
        name: 'Media Blackout',
        type: 'special',
        country: 'Global',
        influence: 0,
        effect: 'Block the next special card played.',
        campaignValue: 9000,
        era: 'Modern',
        description: 'Information control prevents certain stories from reaching the public.'
    },
    {
        id: 'card-23',
        name: 'Whistleblower',
        type: 'special',
        country: 'Global',
        influence: 0,
        effect: 'Reveal another player\'s hand. That player discards 1 card.',
        campaignValue: 11000,
        era: 'Modern',
        description: 'Classified information leaks to the public with damaging consequences.'
    },
    {
        id: 'card-24',
        name: 'Counterintelligence',
        type: 'special',
        country: 'Global',
        influence: 0,
        effect: 'Cancel the effect of the last politician played.',
        campaignValue: 10000,
        era: 'Modern',
        description: 'Secret services uncover and neutralize a political operation.'
    },
    {
        id: 'card-25',
        name: 'Political Asylum',
        type: 'special',
        country: 'Global',
        influence: 0,
        effect: 'Protect your mandates from being lost this round.',
        campaignValue: 12000,
        era: 'Modern',
        description: 'A safe harbor from political persecution and retribution.'
    },
    {
        id: 'card-26',
        name: 'Emergency Powers',
        type: 'special',
        country: 'Global',
        influence: 0,
        effect: 'Double your politician\'s influence for this round.',
        campaignValue: 18000,
        era: 'Modern',
        description: 'Extraordinary circumstances enable the exercise of expanded authority.'
    },
    {
        id: 'card-27',
        name: 'Fake News',
        type: 'special',
        country: 'Global',
        influence: 0,
        effect: 'Change the momentum level up or down by 1.',
        campaignValue: 7000,
        era: 'Modern',
        description: 'Misinformation spreads rapidly, shaping public opinion.'
    },
    {
        id: 'card-28',
        name: 'Diplomatic Immunity',
        type: 'special',
        country: 'Global',
        influence: 0,
        effect: 'You cannot be targeted by special cards this round.',
        campaignValue: 9000,
        era: 'Modern',
        description: 'Political protection that shields from certain consequences.'
    },
    {
        id: 'card-29',
        name: 'Opposition Research',
        type: 'special',
        country: 'Global',
        influence: 0,
        effect: 'Look at the top 3 cards of the deck. Draw 1 and put the others back in any order.',
        campaignValue: 8000,
        era: 'Modern',
        description: 'Digging up dirt on opponents to gain strategic advantage.'
    },
    {
        id: 'card-30',
        name: 'Grassroots Movement',
        type: 'special',
        country: 'Global',
        influence: 0,
        effect: 'If you have the fewest mandates, gain +3 influence this round.',
        campaignValue: 7000,
        era: 'Modern',
        description: 'An organic political movement emerges from ordinary citizens.'
    },
    {
        id: "30",
        type: "fallenkarte",
        name: "Shitstorm-Kaskade",
        influence: 0,
        effect: "Wird aktiviert, wenn du Zeit hast: Spezialkarte trifft – der Gegner verliert stattdessen 2 Einfluss.",
        description: "Mediale Rückkopplung trifft zurück.",
        campaignValue: 8925,
        tags: ["medien"]
    },
    {
        id: "31",
        type: "fallenkarte",
        name: "Lohnerhöhung",
        influence: 0,
        effect: "Wenn dein Gegner eine Arbeitskampf- oder Streik-Spezialkarte spielt: Annulliere sie sofort.",
        description: "Wir haben immer das Ohr am Tarif.",
        campaignValue: 8500,
        tags: ["wirtschaft"]
    },
    {
        id: "32",
        type: "fallenkarte",
        name: "Fraktionsdisziplin",
        influence: 0,
        effect: "Wenn eine Koalition dich betrifft: Beide Partner verlieren 1 Mandat extra.",
        description: "Wir stimmen ab – nicht ab.",
        campaignValue: 8500,
        tags: ["partei"]
    },
    {
        id: "40",
        type: "spezialkarte",
        name: "Maskendeal",
        influence: 0,
        effect: "Alle Karten mit Korruption x2 verlieren 2 Einfluss.",
        description: "Die Lieferung war... großzügig kalkuliert.",
        campaignValue: 9000,
        tags: ["korruption"]
    },
    {
        id: "41",
        type: "spezialkarte",
        name: "Populistische Wende",
        influence: 0,
        effect: "Alle Populisten +2 Einfluss, alle anderen -1",
        description: "Was die Menschen spüren, ist wichtiger als was sie wissen.",
        campaignValue: 9000,
        tags: ["populismus"]
    },
    {
        id: "42",
        type: "spezialkarte",
        name: "Cyberangriff",
        influence: 0,
        effect: "Zielspieler darf in der nächsten Runde keine Spezialkarte spielen.",
        description: "404 – Demokratie nicht gefunden.",
        campaignValue: 9000,
        tags: ["digital"]
    }
];

// Export the functions directly for use in other files
export const getAllCards = (): Card[] => {
    return [...cards];
};

export const getCardById = (id: string): Card | undefined => {
    return cards.find(card => card.id === id);
};

export const getCardsByType = (type: 'charakterkarte' | 'spezialkarte' | 'fallenkarte'): Card[] => {
    return cards.filter(card => card.type === type);
};

export const getCardsByRarity = (rarity: string): Card[] => {
    return cards.filter(card => card.rarity === rarity);
};

export const getRandomCards = (count: number): Card[] => {
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, cards.length));
};

export const createStarterDeck = (): Card[] => {
    const charakterkarten = getCardsByType('charakterkarte').slice(0, 10);
    const spezialkarten = getCardsByType('spezialkarte').slice(0, 5);
    const fallenkarten = getCardsByType('fallenkarte').slice(0, 5);

    return [...charakterkarten, ...spezialkarten, ...fallenkarten];
};

export const calculateDeckValue = (deck: Card[]): number => {
    return deck.reduce((sum, card) => sum + card.campaignValue, 0);
};

export const isDeckValid = (deck: Card[]): boolean => {
    const charakterCount = deck.filter(c => c.type === 'charakterkarte').length;
    const spezialCount = deck.filter(c => c.type === 'spezialkarte').length;
    const fallenCount = deck.filter(c => c.type === 'fallenkarte').length;

    // Prüfe die Deck-Zusammensetzung
    const isValidComposition = (
        deck.length === 20 &&
        charakterCount === 10 &&
        spezialCount === 5 &&
        fallenCount === 5
    );

    // Prüfe das Spendenbudget basierend auf dem Land/Fraktion
    const totalValue = calculateDeckValue(deck);
    const hasLocalPolitician = deck.some(card => card.country === 'Lokalpolitiker');
    const hasRegionalPolitician = deck.some(card =>
        card.country === 'CDU' || card.country === 'SPD' || card.country === 'Grüne'
    );
    const budgetLimit = hasLocalPolitician ? 180000 :
        hasRegionalPolitician ? 250000 : 320000;

    return isValidComposition && totalValue <= budgetLimit;
};

// Keep the mockCards object for backward compatibility
const mockCards = {
    getAllCards,
    getCardById,
    getCardsByType,
    getCardsByRarity,
    getRandomCards,
    createStarterDeck,
    calculateDeckValue,
    isDeckValid
};

export default mockCards;