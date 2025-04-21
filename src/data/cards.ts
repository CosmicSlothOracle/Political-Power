// data/cards.ts - Kartendaten für Mandat Macht Momentum
import { Card, CardType } from '../types/gameTypes';

// Charakterkarten
export const charakterCards: Card[] = [
    {
        id: 'char-1',
        name: 'Erfahrene Bürgermeisterin',
        type: 'charakterkarte',
        description: 'Hat bereits zwei Amtszeiten erfolgreich absolviert.',
        campaignValue: 16000,
        influence: 3,
        effect: 'Bei Momentum 1-2: +1 Einfluss',
        imagePath: '/images/characters/mayor.jpg',
        rarity: 'common',
        tags: ['lokal', 'erfahren']
    },
    {
        id: 'char-2',
        name: 'Charismatischer Oppositionsführer',
        type: 'charakterkarte',
        description: 'Brillianter Redner mit starker medialer Präsenz.',
        campaignValue: 22000,
        influence: 4,
        effect: 'Bei Koalition: Beide Partner erhalten +1 Einfluss',
        imagePath: '/images/characters/opposition.jpg',
        rarity: 'uncommon',
        tags: ['rhetorik', 'medien']
    },
    {
        id: 'char-3',
        name: 'Politischer Quereinsteiger',
        type: 'charakterkarte',
        description: 'Bringt frischen Wind und unkonventionelle Ideen.',
        campaignValue: 18000,
        influence: 2,
        effect: 'Bei 0 Mandaten: +3 Einfluss',
        imagePath: '/images/characters/newcomer.jpg',
        rarity: 'common',
        tags: ['innovativ', 'outsider']
    },
    {
        id: 'char-4',
        name: 'Wirtschaftsminister',
        type: 'charakterkarte',
        description: 'Einflussreich in Wirtschaftskreisen.',
        campaignValue: 28000,
        influence: 5,
        effect: 'Kein Einfluss gegen Charaktere mit dem Tag "populist"',
        imagePath: '/images/characters/economy.jpg',
        rarity: 'rare',
        tags: ['wirtschaft', 'establishment']
    },
    {
        id: 'char-5',
        name: 'Populistischer Medienstar',
        type: 'charakterkarte',
        description: 'Spricht die Sorgen des einfachen Volkes an.',
        campaignValue: 20000,
        influence: 4,
        effect: 'Bei Momentum 5-6: +2 Einfluss',
        imagePath: '/images/characters/populist.jpg',
        rarity: 'uncommon',
        tags: ['populist', 'medien']
    },
    {
        id: 'char-6',
        name: 'Diplomatischer Vermittler',
        type: 'charakterkarte',
        description: 'Stellt die Gemeinsamkeiten über die Unterschiede.',
        campaignValue: 17000,
        influence: 3,
        effect: 'Bei Koalition: Keine Mandatsverluste durch wiederholte Koalitionen',
        imagePath: '/images/characters/diplomat.jpg',
        rarity: 'uncommon',
        tags: ['diplomat', 'koalition']
    },
    {
        id: 'char-7',
        name: 'Gestandene Landesministerin',
        type: 'charakterkarte',
        description: 'Jahrzehntelange Erfahrung in der Landespolitik.',
        campaignValue: 24000,
        influence: 4,
        effect: 'Bei 4+ eigenen Mandaten: +1 Einfluss',
        imagePath: '/images/characters/minister.jpg',
        rarity: 'uncommon',
        tags: ['erfahren', 'establishment']
    },
    {
        id: 'char-8',
        name: 'Umweltaktivist',
        type: 'charakterkarte',
        description: 'Kämpft für nachhaltige Politik.',
        campaignValue: 15000,
        influence: 2,
        effect: 'Bei Momentum 3-4: +2 Einfluss',
        imagePath: '/images/characters/activist.jpg',
        rarity: 'common',
        tags: ['idealist', 'nachhaltig']
    },
    {
        id: 'char-9',
        name: 'Machtbewusster Parlamentarier',
        type: 'charakterkarte',
        description: 'Zieht im Hintergrund die Fäden.',
        campaignValue: 23000,
        influence: 3,
        effect: '+1 Einfluss für jede gespielte Spezialkarte',
        imagePath: '/images/characters/parliamentary.jpg',
        rarity: 'uncommon',
        tags: ['stratege', 'establishment']
    },
    {
        id: 'char-10',
        name: 'Charismastischer Spitzenkandidat',
        type: 'charakterkarte',
        description: 'Beliebte Gallionsfigur der Partei.',
        campaignValue: 32000,
        influence: 5,
        effect: 'Kann nicht durch Fallenkarten betroffen werden',
        imagePath: '/images/characters/candidate.jpg',
        rarity: 'rare',
        tags: ['charisma', 'medien']
    },
    {
        id: 'char-11',
        name: 'Innovativer Jungpolitiker',
        type: 'charakterkarte',
        description: 'Die Stimme der nächsten Generation.',
        campaignValue: 17000,
        influence: 3,
        effect: 'Bei weniger als 3 Mandaten: +2 Einfluss',
        imagePath: '/images/characters/youth.jpg',
        rarity: 'common',
        tags: ['innovation', 'sozial']
    },
    {
        id: 'char-12',
        name: 'Angesehener Regierungschef',
        type: 'charakterkarte',
        description: 'Erfahren im Regieren auf höchster Ebene.',
        campaignValue: 36000,
        influence: 6,
        effect: 'Bei Spielen als erste Karte: -1 Einfluss',
        imagePath: '/images/characters/president.jpg',
        rarity: 'legendary',
        tags: ['etabliert', 'erfahren']
    },
    {
        id: 'char-13',
        name: 'Parteivorsitzende',
        type: 'charakterkarte',
        description: 'Bestimmt die strategische Ausrichtung der Partei.',
        campaignValue: 28000,
        influence: 5,
        effect: 'Bei Koalition: Verhandelt bessere Bedingungen (+1 Mandat extra)',
        imagePath: '/images/characters/party-leader.jpg',
        rarity: 'rare',
        tags: ['führung', 'strategie']
    },
    {
        id: 'char-14',
        name: 'Lokaler Hoffnungsträger',
        type: 'charakterkarte',
        description: 'Verwurzelt in der lokalen Gemeinde.',
        campaignValue: 12000,
        influence: 2,
        effect: 'Bei Momentum 1-3: +1 Einfluss',
        imagePath: '/images/characters/local.jpg',
        rarity: 'common',
        tags: ['lokal', 'authentisch']
    },
    {
        id: 'char-15',
        name: 'Politstratege',
        type: 'charakterkarte',
        description: 'Meister der politischen Manöver.',
        campaignValue: 25000,
        influence: 3,
        effect: 'Bei Fallenkarten im Spiel: +2 Einfluss',
        imagePath: '/images/characters/strategist.jpg',
        rarity: 'rare',
        tags: ['strategie', 'taktik']
    },
];

// Spezialkarten
export const specialCards: Card[] = [
    {
        id: 'special-1',
        name: 'Medienkampagne',
        type: 'spezialkarte',
        description: 'Eine großangelegte Medienkampagne startet.',
        campaignValue: 18000,
        influence: 0,
        effect: 'Erhöhe den Einfluss deiner Charakterkarte um +2',
        imagePath: '/images/specials/media.jpg',
        rarity: 'common',
        tags: ['medien', 'öffentlichkeit']
    },
    {
        id: 'special-2',
        name: 'Koalitionsverhandlung',
        type: 'spezialkarte',
        description: 'Enge Absprachen mit potentiellen Partnern.',
        campaignValue: 15000,
        influence: 0,
        effect: 'Kann nach der Koalitionsphase gespielt werden. Wechsel des Partners möglich.',
        imagePath: '/images/specials/coalition.jpg',
        rarity: 'uncommon',
        tags: ['koalition', 'strategie']
    },
    {
        id: 'special-3',
        name: 'Strategischer Rückzug',
        type: 'spezialkarte',
        description: 'Taktischer Verzicht, um später zu gewinnen.',
        campaignValue: 10000,
        influence: -2,
        effect: 'Ziehe 2 zusätzliche Karten zu Beginn der nächsten Runde',
        imagePath: '/images/specials/retreat.jpg',
        rarity: 'common',
        tags: ['taktik', 'langfristig']
    },
    {
        id: 'special-4',
        name: 'Bürgerinitiative',
        type: 'spezialkarte',
        description: 'Unterstützung aus der Zivilgesellschaft.',
        campaignValue: 20000,
        influence: 0,
        effect: 'Verhindert den Verlust von Mandaten in dieser Runde',
        imagePath: '/images/specials/initiative.jpg',
        rarity: 'rare',
        tags: ['zivil', 'schutz']
    },
    {
        id: 'special-5',
        name: 'Parteitagsbeschluss',
        type: 'spezialkarte',
        description: 'Rückenwind durch einen klaren Parteitagsbeschluss.',
        campaignValue: 14000,
        influence: 0,
        effect: 'Bei eigenem Momentumwurf: Wähle das Ergebnis statt zu würfeln',
        imagePath: '/images/specials/party-convention.jpg',
        rarity: 'uncommon',
        tags: ['partei', 'strategie']
    },
    {
        id: 'special-6',
        name: 'Überraschendes Wahlkampfthema',
        type: 'spezialkarte',
        description: 'Ein neues Thema dominiert den Diskurs.',
        campaignValue: 16000,
        influence: 0,
        effect: 'Setze den Momentumwert auf 3',
        imagePath: '/images/specials/campaign-topic.jpg',
        rarity: 'common',
        tags: ['thema', 'aktuell']
    },
    {
        id: 'special-7',
        name: 'Parlamentarischer Coup',
        type: 'spezialkarte',
        description: 'Ein geschickter parlamentarischer Schachzug.',
        campaignValue: 22000,
        influence: 0,
        effect: 'Stehle 1 Mandat vom Spieler mit den meisten Mandaten',
        imagePath: '/images/specials/parliament.jpg',
        rarity: 'rare',
        tags: ['taktik', 'aggressiv']
    },
    {
        id: 'special-8',
        name: 'Parteiübergreifende Initiative',
        type: 'spezialkarte',
        description: 'Ein Thema, das über Parteigrenzen hinweg unterstützt wird.',
        campaignValue: 18000,
        influence: 0,
        effect: 'Alle Koalitionen erhalten +1 Einfluss in dieser Runde',
        imagePath: '/images/specials/bipartisan.jpg',
        rarity: 'uncommon',
        tags: ['kooperation', 'konsens']
    },
    {
        id: 'special-9',
        name: 'Regierungskriser',
        type: 'spezialkarte',
        description: 'Eine Krise erschüttert die aktuelle Regierung.',
        campaignValue: 25000,
        influence: 0,
        effect: 'Der Spieler mit den meisten Mandaten verliert 1 Mandat',
        imagePath: '/images/specials/crisis.jpg',
        rarity: 'rare',
        tags: ['krise', 'opposition']
    },
    {
        id: 'special-10',
        name: 'Enthüllung',
        type: 'spezialkarte',
        description: 'Brisante Informationen kommen ans Licht.',
        campaignValue: 20000,
        influence: 0,
        effect: 'Alle anderen Spieler müssen ihre Spezialkarten aufdecken',
        imagePath: '/images/specials/revelation.jpg',
        rarity: 'uncommon',
        tags: ['transparenz', 'strategie']
    },
];

// Fallenkarten
export const trapCards: Card[] = [
    {
        id: 'trap-1',
        name: 'Medienaffäre',
        type: 'fallenkarte',
        description: 'Ein Skandal in den Medien.',
        campaignValue: 15000,
        influence: -2,
        effect: 'Aktiviert, wenn ein Gegner eine Charakterkarte mit "medien" tag spielt: Dessen Einfluss -3',
        imagePath: '/images/traps/media-scandal.jpg',
        rarity: 'common',
        tags: ['skandal', 'medien']
    },
    {
        id: 'trap-2',
        name: 'Politisches Foul',
        type: 'fallenkarte',
        description: 'Ein hinterhältiger politischer Schachzug.',
        campaignValue: 18000,
        influence: 0,
        effect: 'Aktiviert bei Koalitionsbildung: Die Koalition erhält -2 Einfluss',
        imagePath: '/images/traps/foul.jpg',
        rarity: 'uncommon',
        tags: ['dirty', 'taktik']
    },
    {
        id: 'trap-3',
        name: 'Enthüllung dubioser Spenden',
        type: 'fallenkarte',
        description: 'Fragwürdige Finanzierung kommt ans Licht.',
        campaignValue: 20000,
        influence: 0,
        effect: 'Aktiviert bei Spielen einer Charakterkarte mit Einfluss 5+: Deren Einfluss wird auf 2 reduziert',
        imagePath: '/images/traps/donation-scandal.jpg',
        rarity: 'rare',
        tags: ['skandal', 'korruption']
    },
    {
        id: 'trap-4',
        name: 'Öffentlicher Fauxpas',
        type: 'fallenkarte',
        description: 'Ein peinlicher Auftritt mit Konsequenzen.',
        campaignValue: 12000,
        influence: -1,
        effect: 'Aktiviert bei Momentum 5-6: Gegnerische Charakterkarte verliert 2 Einfluss',
        imagePath: '/images/traps/faux-pas.jpg',
        rarity: 'common',
        tags: ['peinlich', 'öffentlich']
    },
    {
        id: 'trap-5',
        name: 'Parteiinterner Widerstand',
        type: 'fallenkarte',
        description: 'Uneinigkeit in den eigenen Reihen.',
        campaignValue: 16000,
        influence: -1,
        effect: 'Aktiviert bei gegnerischer Spezialkarte: Diese wird unwirksam',
        imagePath: '/images/traps/internal-resistance.jpg',
        rarity: 'uncommon',
        tags: ['partei', 'konflikt']
    },
    {
        id: 'trap-6',
        name: 'Leak vertraulicher Informationen',
        type: 'fallenkarte',
        description: 'Geheime Strategie wird öffentlich.',
        campaignValue: 22000,
        influence: 0,
        effect: 'Aktiviert am Ende der Runde: Gegner mit höchstem Einfluss verliert 2 Einfluss',
        imagePath: '/images/traps/leak.jpg',
        rarity: 'rare',
        tags: ['geheimnisse', 'skandal']
    },
    {
        id: 'trap-7',
        name: 'Inkompetenzvorwurf',
        type: 'fallenkarte',
        description: 'Die Fähigkeiten werden öffentlich in Frage gestellt.',
        campaignValue: 14000,
        influence: 0,
        effect: 'Aktiviert gegen "establishment" Charaktere: Diese verlieren 3 Einfluss',
        imagePath: '/images/traps/incompetence.jpg',
        rarity: 'common',
        tags: ['reputation', 'kritik']
    },
    {
        id: 'trap-8',
        name: 'Oppositionsrecherche',
        type: 'fallenkarte',
        description: 'Die Opposition hat gründlich recherchiert.',
        campaignValue: 17000,
        influence: 0,
        effect: 'Aktiviert bei Momentum 1-2: Eigener Charaktereinfluss +2, gegnerischer -1',
        imagePath: '/images/traps/opposition-research.jpg',
        rarity: 'uncommon',
        tags: ['recherche', 'opposition']
    },
    {
        id: 'trap-9',
        name: 'Verfassungsbeschwerde',
        type: 'fallenkarte',
        description: 'Ein rechtliches Mittel wird eingesetzt.',
        campaignValue: 24000,
        influence: 0,
        effect: 'Aktiviert bei gewonnener Runde des Gegners: Dieser erhält keine Mandate',
        imagePath: '/images/traps/constitutional.jpg',
        rarity: 'rare',
        tags: ['legal', 'blockade']
    },
    {
        id: 'trap-10',
        name: 'Koalitionsbruch',
        type: 'fallenkarte',
        description: 'Eine bestehende Koalition zerbricht.',
        campaignValue: 19000,
        influence: 0,
        effect: 'Aktiviert bei bestehender Koalition: Diese wird aufgelöst, beide Spieler verlieren 1 Mandat',
        imagePath: '/images/traps/coalition-break.jpg',
        rarity: 'uncommon',
        tags: ['koalition', 'konflikt']
    },
];

// Bonuskarten
export const bonusCards: Card[] = [
    {
        id: 'bonus-1',
        name: 'Freiwilligenunterstützung',
        type: 'bonuskarte',
        description: 'Engagierte Freiwillige stärken die Kampagne.',
        campaignValue: 10000,
        influence: 1,
        effect: 'Bei Momentum 3-4: Erhalte +2 Einfluss',
        imagePath: '/images/bonus/volunteers.jpg',
        rarity: 'common',
        tags: ['unterstützung', 'basis']
    },
    {
        id: 'bonus-2',
        name: 'Virale Kampagne',
        type: 'bonuskarte',
        description: 'Die Kampagne verbreitet sich rasant in sozialen Medien.',
        campaignValue: 15000,
        influence: 1,
        effect: 'Bei 0-3 Mandaten: Erhalte +2 Einfluss',
        imagePath: '/images/bonus/viral.jpg',
        rarity: 'uncommon',
        tags: ['medien', 'digital']
    },
    {
        id: 'bonus-3',
        name: 'Starke Basis',
        type: 'bonuskarte',
        description: 'Eine loyale und aktive Parteibasis.',
        campaignValue: 14000,
        influence: 1,
        effect: 'Bei Verfolgerposition (2./3. Platz): +2 Einfluss',
        imagePath: '/images/bonus/base.jpg',
        rarity: 'common',
        tags: ['partei', 'mobilisierung']
    },
    {
        id: 'bonus-4',
        name: 'Prominente Unterstützung',
        type: 'bonuskarte',
        description: 'Ein bekanntes Gesicht unterstützt die Kampagne.',
        campaignValue: 20000,
        influence: 2,
        effect: 'Eigene Charakterkarte kann nicht durch Fallenkarten beeinflusst werden',
        imagePath: '/images/bonus/celebrity.jpg',
        rarity: 'rare',
        tags: ['prominenz', 'medien']
    },
    {
        id: 'bonus-5',
        name: 'Strategische Berater',
        type: 'bonuskarte',
        description: 'Professionelle Kampagnenberater optimieren die Strategie.',
        campaignValue: 18000,
        influence: 1,
        effect: 'Erhalte zu Beginn der nächsten Runde eine zusätzliche Karte',
        imagePath: '/images/bonus/advisors.jpg',
        rarity: 'uncommon',
        tags: ['professionell', 'strategie']
    },
];

// Alle Karten kombinieren
export const allCards: Card[] = [
    ...charakterCards,
    ...specialCards,
    ...trapCards,
    ...bonusCards
];

// Kartenfilterungsfunktionen
export const getCardsByType = (type: CardType) => {
    return allCards.filter(card => card.type === type);
};

export const getCardById = (id: string) => {
    return allCards.find(card => card.id === id);
};

export const getRandomCards = (count: number) => {
    const shuffled = [...allCards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const getCardsWithinBudget = (budget: number) => {
    return allCards.filter(card => card.campaignValue <= budget);
};

export default allCards;