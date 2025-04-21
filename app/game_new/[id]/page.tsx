/**
 * Game page for new game implementation
 * This will redirect to the main game page to ensure routing consistency
 */
import { redirect } from 'next/navigation';

export default function GameNewPage({ params }: { params: { id: string } }) {
    // Redirect to the standard game route
    redirect(`/game/${ params.id }`);
}