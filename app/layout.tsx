import type { Metadata } from 'next'
import { Providers } from './providers'
import '../styles/globals.css'

export const metadata: Metadata = {
    title: 'Political Power - Strategy Card Game',
    description: 'A strategic multiplayer card game about political power and influence',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}