import React from 'react'
import EditDeckClient from './EditDeckClient'

// This function is required when using 'output: export' in next.config.js
// It generates a list of static paths to pre-render
export function generateStaticParams() {
    // Since decks are stored in localStorage and created dynamically,
    // we need to provide placeholder values to satisfy static export requirements
    return [
        { id: 'placeholder-1' },
        { id: 'placeholder-2' },
        { id: 'placeholder-3' },
        { id: 'deck-*' }, // Wildcard pattern for deck IDs
        { id: 'deck-[0-9]*' } // Numeric pattern for timestamp-based deck IDs
    ]
}

interface EditDeckPageProps {
    params: {
        id: string;
    };
}

export default function EditDeckPage({ params }: EditDeckPageProps) {
    return <EditDeckClient deckId={params.id} />
}