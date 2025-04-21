'use client'

import { useEffect } from 'react'
import cardService from '../services/CardService'

export default function CardServiceInitializer() {
    useEffect(() => {
        // Initialize card service on app start
        cardService.initialize().catch(error => {
            console.error('Failed to initialize card service:', error)
        })
    }, [])

    // This component doesn't render anything
    return null
}