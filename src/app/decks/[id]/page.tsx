import React from 'react'
import DeckDetailsClient from './DeckDetailsClient'

interface DeckDetailsPageProps {
    params: {
        id: string;
    };
}

// This function is required when using 'output: export' in next.config.js
// Since our decks are stored in localStorage and created dynamically
// we don't know the IDs at build time, but we need to provide some placeholders
export function generateStaticParams() {
    // In a real app with a backend, you would fetch all possible deck IDs here
    // For our localStorage approach, we return placeholder values and patterns
    return [
        { id: 'placeholder-1' },
        { id: 'placeholder-2' },
        { id: 'placeholder-3' },
        { id: 'deck-*' }, // Wildcard pattern for deck IDs
        { id: 'deck-[0-9]*' } // Numeric pattern for timestamp-based deck IDs
    ]
}

export default function DeckDetailsPage({ params }: DeckDetailsPageProps) {
    return <DeckDetailsClient deckId={params.id} />;
}