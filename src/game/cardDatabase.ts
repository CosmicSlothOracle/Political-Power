import { Card } from '../types/gameTypes';

export const cardDatabase: Card[] = [
    // Charakterkarten (1-29)
    {
        id: "1",
        type: "charakterkarte",
        name: "Donald Trump",
        influence: 7,
        effect: "Neutralisiert Gegner-Karte (Wurf-Effekt)",
        description: "I alone can fix it",
        country: "USA",
        campaignValue: 33000,
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
        description: "Respekt für dich.",
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
        description: "Lieber nicht regieren als falsch regieren.",
        country: "FDP",
        campaignValue: 25000,
        tags: ["wirtschaft"]
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
        tags: ["diplomat"]
    },

    // Fallenkarten (30-39)
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
        id: "33",
        type: "fallenkarte",
        name: "Korruptionsvorwürfe",
        influence: 0,
        effect: "Wenn ein Gegner eine Wirtschaftskarte spielt: -2 Einfluss für diese Runde.",
        description: "Folgen Sie dem Geld.",
        campaignValue: 8700,
        tags: ["korruption"]
    },
    {
        id: "34",
        type: "fallenkarte",
        name: "Medienboykott",
        influence: 0,
        effect: "Wenn ein Gegner eine Medienkarte spielt: Kein Effekt in dieser Runde.",
        description: "Lügenpresse!",
        campaignValue: 8800,
        tags: ["medien"]
    },

    // Spezialkarten (40-49)
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
    },
    {
        id: "43",
        type: "spezialkarte",
        name: "Koalitionsbruch",
        influence: 0,
        effect: "Beende eine bestehende Koalition. Beide Spieler verlieren 1 Mandat.",
        description: "Es ist vorbei, Anakin!",
        campaignValue: 9200,
        tags: ["partei"]
    },
    {
        id: "44",
        type: "spezialkarte",
        name: "Investigativer Journalismus",
        influence: 0,
        effect: "Decke alle verdeckten Karten auf. -1 Einfluss pro aufgedeckter Karte.",
        description: "Die Wahrheit muss ans Licht!",
        campaignValue: 9100,
        tags: ["medien"]
    }
];

// Hilfsfunktionen für den Zugriff auf die Kartendatenbank
export const getCardById = (id: string): Card | undefined =>
    cardDatabase.find(card => card.id === id);

export const getCardsByType = (type: 'charakterkarte' | 'spezialkarte' | 'fallenkarte'): Card[] =>
    cardDatabase.filter(card => card.type === type);

export const getCardsByTag = (tag: string): Card[] =>
    cardDatabase.filter(card => card.tags?.includes(tag));

export const getCardsByCountry = (country: string): Card[] =>
    cardDatabase.filter(card => card.country === country);