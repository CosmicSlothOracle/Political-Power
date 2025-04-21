/**
 * mockCards.ts
 * Mock card data for development and testing
 */

import { Card, CardType, CardRarity } from '../types/gameTypes';

// Generate a unique ID for mock cards
const generateCardId = (): string => {
    return `card-${ Date.now() }-${ Math.floor(Math.random() * 1000) }`;
};

// Define some sample cards for testing
export const mockCards: Card[] = [
    {
        id: generateCardId(),
        name: "Charismatic Leader",
        type: "politician",
        country: "Germany",
        influence: 5,
        effect: "When played, draw an additional card",
        campaignValue: 12000,
        era: "Modern",
        description: "A political figure known for their persuasive speaking skills",
        imagePath: "/images/cards/charismatic-leader.jpg",
        rarity: "rare",
        tags: ["leadership", "charisma"]
    },
    {
        id: generateCardId(),
        name: "Economic Boom",
        type: "event",
        influence: 3,
        effect: "Increase your influence by 2 for each politician card you have played",
        campaignValue: 8500,
        description: "A surge in the national economy boosts political standing",
        imagePath: "/images/cards/economic-boom.jpg",
        rarity: "common",
        tags: ["economy", "positive"]
    },
    {
        id: generateCardId(),
        name: "Media Scandal",
        type: "event",
        influence: -2,
        effect: "Target player discards a card of their choice",
        campaignValue: 7000,
        description: "Breaking news creates a political firestorm",
        imagePath: "/images/cards/media-scandal.jpg",
        rarity: "common",
        tags: ["media", "scandal"]
    },
    {
        id: generateCardId(),
        name: "Campaign Rally",
        type: "event",
        influence: 2,
        effect: "Draw a card for each politician you control",
        campaignValue: 6000,
        description: "A successful public event that energizes the base",
        imagePath: "/images/cards/campaign-rally.jpg",
        rarity: "common",
        tags: ["campaign", "public"]
    },
    {
        id: generateCardId(),
        name: "Policy Expert",
        type: "politician",
        country: "France",
        influence: 3,
        effect: "When played, you may play an additional event card this turn",
        campaignValue: 9000,
        description: "A skilled technocrat with deep knowledge of governance",
        imagePath: "/images/cards/policy-expert.jpg",
        rarity: "common",
        tags: ["expert", "policy"]
    },
    {
        id: generateCardId(),
        name: "Coalition Partner",
        type: "politician",
        country: "Spain",
        influence: 4,
        effect: "You may form a coalition with another player. If you do, both draw a card",
        campaignValue: 10000,
        description: "A pragmatic politician willing to work across party lines",
        imagePath: "/images/cards/coalition-partner.jpg",
        rarity: "rare",
        tags: ["coalition", "cooperation"]
    },
    {
        id: generateCardId(),
        name: "Voter Mobilization",
        type: "event",
        influence: 3,
        effect: "If you have fewer cards than an opponent, draw until you match them",
        campaignValue: 8000,
        description: "An effective grassroots campaign to get out the vote",
        imagePath: "/images/cards/voter-mobilization.jpg",
        rarity: "common",
        tags: ["voters", "grassroots"]
    },
    {
        id: generateCardId(),
        name: "International Crisis",
        type: "event",
        influence: 0,
        effect: "All players discard a card. The player with most influence gains 3 influence",
        campaignValue: 15000,
        description: "A global situation that tests leadership capabilities",
        imagePath: "/images/cards/international-crisis.jpg",
        rarity: "rare",
        tags: ["crisis", "international"]
    },
    {
        id: generateCardId(),
        name: "Political Strategist",
        type: "politician",
        country: "United States",
        influence: 2,
        effect: "Look at the top 3 cards of your deck. Put one in your hand and the rest back in any order",
        campaignValue: 7500,
        description: "A behind-the-scenes operative who plans the path to victory",
        imagePath: "/images/cards/political-strategist.jpg",
        rarity: "common",
        tags: ["strategy", "planning"]
    },
    {
        id: generateCardId(),
        name: "Social Media Campaign",
        type: "event",
        influence: 2,
        effect: "For your next two turns, gain +1 influence when you play a card",
        campaignValue: 5000,
        description: "An innovative digital outreach strategy",
        imagePath: "/images/cards/social-media-campaign.jpg",
        rarity: "common",
        tags: ["digital", "media"]
    },
    {
        id: generateCardId(),
        name: "Veteran Politician",
        type: "politician",
        country: "Italy",
        influence: 6,
        effect: "Cannot form coalitions, but adds +2 influence to all your events",
        campaignValue: 14000,
        description: "A long-serving political figure with decades of experience",
        imagePath: "/images/cards/veteran-politician.jpg",
        rarity: "legendary",
        tags: ["experienced", "senior"]
    },
    {
        id: generateCardId(),
        name: "Political Newcomer",
        type: "politician",
        country: "Canada",
        influence: 2,
        effect: "Gains +1 influence for each turn they remain in play",
        campaignValue: 6000,
        description: "A fresh face bringing new energy to politics",
        imagePath: "/images/cards/political-newcomer.jpg",
        rarity: "common",
        tags: ["newcomer", "youth"]
    },
    {
        id: generateCardId(),
        name: "Grassroots Support",
        type: "event",
        influence: 3,
        effect: "If you have less influence than any opponent, gain +2 influence",
        campaignValue: 7000,
        description: "Popular backing from ordinary citizens",
        imagePath: "/images/cards/grassroots-support.jpg",
        rarity: "common",
        tags: ["support", "public"]
    },
    {
        id: generateCardId(),
        name: "Diplomatic Summit",
        type: "event",
        influence: 4,
        effect: "All players gain +1 influence. You gain an additional +2 influence",
        campaignValue: 9500,
        description: "A high-profile international meeting",
        imagePath: "/images/cards/diplomatic-summit.jpg",
        rarity: "rare",
        tags: ["international", "diplomacy"]
    },
    {
        id: generateCardId(),
        name: "Opposition Research",
        type: "special",
        influence: 0,
        effect: "Look at an opponent's hand and choose a card for them to discard",
        campaignValue: 12000,
        description: "Uncovering damaging information about political rivals",
        imagePath: "/images/cards/opposition-research.jpg",
        rarity: "rare",
        tags: ["opposition", "strategy"]
    },
    {
        id: generateCardId(),
        name: "Populist Leader",
        type: "politician",
        country: "Brazil",
        influence: 5,
        effect: "Gain +1 influence for each event you play while this card is in play",
        campaignValue: 11000,
        description: "A charismatic figure who appeals directly to the people",
        imagePath: "/images/cards/populist-leader.jpg",
        rarity: "rare",
        tags: ["populist", "charisma"]
    },
    {
        id: generateCardId(),
        name: "Bipartisan Bill",
        type: "event",
        influence: 3,
        effect: "You and another player of your choice each gain +2 influence",
        campaignValue: 8000,
        description: "Legislation that brings opposing parties together",
        imagePath: "/images/cards/bipartisan-bill.jpg",
        rarity: "common",
        tags: ["cooperation", "legislation"]
    },
    {
        id: generateCardId(),
        name: "Constitutional Challenge",
        type: "special",
        influence: 1,
        effect: "Cancel the effect of another player's event card",
        campaignValue: 9000,
        description: "Legal action questioning the validity of a political move",
        imagePath: "/images/cards/constitutional-challenge.jpg",
        rarity: "rare",
        tags: ["legal", "counter"]
    },
    {
        id: generateCardId(),
        name: "Ideological Purist",
        type: "politician",
        country: "Sweden",
        influence: 4,
        effect: "Cannot join coalitions. Gain +3 influence if you have no coalition",
        campaignValue: 9500,
        description: "A politician unwavering in their core beliefs",
        imagePath: "/images/cards/ideological-purist.jpg",
        rarity: "common",
        tags: ["ideology", "principled"]
    },
    {
        id: generateCardId(),
        name: "Political Dynasty",
        type: "politician",
        country: "Japan",
        influence: 7,
        effect: "If you have fewer than 3 cards in hand, draw a card",
        campaignValue: 15500,
        description: "A member of a storied political family with deep connections",
        imagePath: "/images/cards/political-dynasty.jpg",
        rarity: "legendary",
        tags: ["legacy", "establishment"]
    }
];

// Helper function to get a subset of random cards
export const getRandomCards = (count: number): Card[] => {
    // Create a shallow copy to avoid modifying the original array
    const shuffled = [...mockCards];

    // Simple Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Return the requested number of cards (or all if count is larger)
    return shuffled.slice(0, Math.min(count, shuffled.length));
};

export default mockCards;