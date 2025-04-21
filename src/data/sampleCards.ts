export interface Card {
    id: string;
    name: string;
    type: 'charakterkarte' | 'spezialkarte' | 'fallenkarte';
    influence: number;
    country?: string;
    effect: string;
    description: string;
    campaignValue: number;
    tags: string[];
}

export const sampleCards: Card[] = [
    {
        id: 'char1',
        name: 'Diplomat',
        type: 'charakterkarte',
        influence: 3,
        country: 'Deutschland',
        effect: 'Erhöhe den Einfluss aller verbündeten Karten um 1',
        description: 'Ein geschickter Verhandlungsführer mit jahrelanger Erfahrung.',
        campaignValue: 5000,
        tags: ['Diplomatie', 'Politik']
    },
    {
        id: 'spec1',
        name: 'Geheimoperation',
        type: 'spezialkarte',
        influence: 2,
        effect: 'Ziehe 2 Karten und wirf 1 ab',
        description: 'Eine verdeckte Mission mit weitreichenden Konsequenzen.',
        campaignValue: 3000,
        tags: ['Geheimdienst', 'Taktik']
    },
    {
        id: 'trap1',
        name: 'Politischer Skandal',
        type: 'fallenkarte',
        influence: -2,
        effect: 'Der Gegner muss eine Charakterkarte abwerfen',
        description: 'Ein gut platzierter Skandal kann eine vielversprechende Karriere beenden.',
        campaignValue: 4000,
        tags: ['Skandal', 'Medien']
    },
    {
        id: 'char2',
        name: 'Industriemagnat',
        type: 'charakterkarte',
        influence: 4,
        country: 'Frankreich',
        effect: 'Erhöhe deinen Kampagnenwert um 2000€',
        description: 'Ein einflussreicher Geschäftsmann mit weitreichenden Verbindungen.',
        campaignValue: 6000,
        tags: ['Wirtschaft', 'Industrie']
    }
];