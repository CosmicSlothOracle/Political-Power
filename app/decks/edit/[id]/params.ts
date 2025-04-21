// This is needed for Next.js static export
export function generateStaticParams() {
    // In a real app with a backend, you would fetch real deck IDs
    // Since we're using localStorage, we can only provide placeholder values
    return [
        { id: 'placeholder-1' },
        { id: 'placeholder-2' },
        { id: 'placeholder-3' }
    ]
}