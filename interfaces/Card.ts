export type CardType = 'charakterkarte' | 'fallenkarte' | 'spezialkarte';
export type CardRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Card {
    id: number;
    name: string;
    type: CardType;
    influence: number | null;
    description: string;
    rarity?: CardRarity;
    ability?: string;
    imagePath: string;
    tags?: string[];
    country?: string;
    campaignValue?: number;
    effect?: string;
    era?: string;
}