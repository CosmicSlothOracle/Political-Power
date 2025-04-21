/**
 * Game page that loads the client component
 */
import { Metadata } from 'next'
import GameClient from './client'

// Generate metadata for the page
export const metadata: Metadata = {
    title: 'Political Power - Game Room',
    description: 'Join the political card game and compete for power!',
}

// This is a server component for static generation
export async function generateStaticParams() {
    // For static export, we need to provide all possible game IDs
    // In a real app, you would fetch these from your database or API
    // For now, we'll return an empty array to allow all dynamic IDs
    return []
}

// This is a server component that loads the client component
export default function GamePage({ params }: { params: { id: string } }) {
    return (
        <main className="min-h-screen w-full bg-gray-900">
            <GameClient id={params.id} />
        </main>
    )
}