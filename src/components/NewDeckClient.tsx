'use client'

import React from 'react'
import styled from 'styled-components'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import MainNavigation from './MainNavigation'
import DeckBuilder from './DeckBuilder'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { Deck } from '../types/gameTypes'

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f4f7fa;
  padding-top: 100px;
  padding-bottom: 40px;
`

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`

const Title = styled.h1`
  font-size: 2rem;
  color: #202124;
`

export default function NewDeckClient() {
    const router = useRouter();

    const handleSaveDeck = (deck: Deck) => {
        try {
            // Generate a unique ID if not provided
            if (!deck.id) {
                deck.id = `deck-${ Date.now() }-${ Math.floor(Math.random() * 1000) }`;
            }

            // Get existing decks from localStorage or initialize empty array
            const existingDecksStr = localStorage.getItem('userDecks');
            const existingDecks: Deck[] = existingDecksStr ? JSON.parse(existingDecksStr) : [];

            // Check if we're updating an existing deck
            const deckIndex = existingDecks.findIndex(d => d.id === deck.id);

            if (deckIndex >= 0) {
                // Update existing deck
                existingDecks[deckIndex] = deck;
            } else {
                // Add new deck
                existingDecks.push(deck);
            }

            // Save updated decks to localStorage
            localStorage.setItem('userDecks', JSON.stringify(existingDecks));

            // Show success message
            toast.success(`Deck "${ deck.name }" saved successfully with ${ deck.cards.length } cards!`);

            // Redirect to decks page after saving
            setTimeout(() => {
                router.push('/decks');
            }, 1500);
        } catch (error) {
            console.error('Error saving deck:', error);
            toast.error('Failed to save deck. Please try again.');
        }
    };

    return (
        <>
            <MainNavigation />
            <PageContainer>
                <ContentContainer>
                    <a href="#main-content" className="skip-link">Skip to content</a>
                    <Header>
                        <Title id="main-content">Create New Deck</Title>
                    </Header>

                    <DndProvider backend={HTML5Backend}>
                        <DeckBuilder onSaveDeck={handleSaveDeck} />
                    </DndProvider>
                </ContentContainer>
            </PageContainer>
        </>
    );
}