'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useRouter } from 'next/navigation'
import MainNavigation from '../../../../components/MainNavigation'
import DeckBuilder from '../../../../components/DeckBuilder'
import { SimpleButton } from '../../../../components/SimpleButton'
import { toast } from 'react-toastify'
import { Deck } from '../../../../types/gameTypes'
import Link from 'next/link'

interface EditDeckClientProps {
    deckId: string;
}

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

const BackButton = styled.div`
  margin-right: 20px;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`

const NotFoundState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
`

export default function EditDeckClient({ deckId }: EditDeckClientProps) {
    const router = useRouter();
    const [deck, setDeck] = useState<Deck | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load the specific deck from localStorage
        const loadDeck = () => {
            try {
                setLoading(true);
                const decksData = localStorage.getItem('userDecks');

                if (decksData) {
                    const allDecks: Deck[] = JSON.parse(decksData);
                    const foundDeck = allDecks.find(d => d.id === deckId);

                    if (foundDeck) {
                        setDeck(foundDeck);
                    } else {
                        setError('Deck not found');
                    }
                } else {
                    setError('No decks found');
                }
            } catch (error) {
                console.error('Error loading deck:', error);
                setError('Error loading deck data');
            } finally {
                setLoading(false);
            }
        };

        if (deckId) {
            loadDeck();
        }
    }, [deckId]);

    const handleSaveDeck = (updatedDeck: Deck) => {
        try {
            // Make sure the ID stays the same
            updatedDeck.id = deckId;

            // Get all decks
            const decksData = localStorage.getItem('userDecks');
            if (decksData) {
                const allDecks: Deck[] = JSON.parse(decksData);

                // Replace the deck with the updated version
                const updatedDecks = allDecks.map(d =>
                    d.id === deckId ? updatedDeck : d
                );

                // Save back to localStorage
                localStorage.setItem('userDecks', JSON.stringify(updatedDecks));

                // Show success message
                toast.success(`Deck "${ updatedDeck.name }" updated successfully!`);

                // Redirect back to decks page
                setTimeout(() => {
                    router.push('/decks');
                }, 1500);
            }
        } catch (error) {
            console.error('Error saving deck:', error);
            toast.error('Failed to update deck. Please try again.');
        }
    };

    if (loading) {
        return (
            <>
                <MainNavigation />
                <PageContainer>
                    <ContentContainer>
                        <div>Loading deck data...</div>
                    </ContentContainer>
                </PageContainer>
            </>
        );
    }

    if (error || !deck) {
        return (
            <>
                <MainNavigation />
                <PageContainer>
                    <ContentContainer>
                        <Header>
                            <Title>Edit Deck</Title>
                            <Link href="/decks">
                                <SimpleButton color="secondary">Back to My Decks</SimpleButton>
                            </Link>
                        </Header>

                        <NotFoundState>
                            <h2>Deck Not Found</h2>
                            <p>{error || 'Could not find the requested deck.'}</p>
                            <Link href="/decks">
                                <SimpleButton color="primary" style={{ marginTop: '20px' }}>
                                    Return to My Decks
                                </SimpleButton>
                            </Link>
                        </NotFoundState>
                    </ContentContainer>
                </PageContainer>
            </>
        );
    }

    return (
        <>
            <MainNavigation />
            <PageContainer>
                <ContentContainer>
                    <Header>
                        <HeaderLeft>
                            <BackButton>
                                <Link href="/decks">
                                    <SimpleButton color="secondary">Back</SimpleButton>
                                </Link>
                            </BackButton>
                            <Title>Edit Deck: {deck.name}</Title>
                        </HeaderLeft>
                    </Header>

                    <DndProvider backend={HTML5Backend}>
                        <DeckBuilder
                            initialDeck={deck}
                            onSaveDeck={handleSaveDeck}
                        />
                    </DndProvider>
                </ContentContainer>
            </PageContainer>
        </>
    );
}