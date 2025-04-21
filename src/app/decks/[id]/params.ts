// This function is required when using 'output: export' in next.config.js
// Since our decks are stored in localStorage and created dynamically
// we don't know the IDs at build time, so we return an empty array
// Next.js will handle client-side navigation for dynamic routes
export function generateStaticParams() {
    // In a real app with a backend, you would fetch all possible deck IDs here
    // For our localStorage approach, we return an empty array
    // We could also return placeholder values to pre-generate some paths
    return [
        { id: 'placeholder-1' },
        { id: 'placeholder-2' },
        { id: 'placeholder-3' }
    ]
}