'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import MainNavigation from './MainNavigation'
import { SimpleButton } from './SimpleButton'
import Link from 'next/link'
import { Deck, Card } from '../types/gameTypes'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f4f7fa;
  padding-top: 100px;
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  color: #5f6368;
`

const DeckGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`

const DeckCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }
`

const DeckHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`

const DeckName = styled.h2`
  font-size: 1.5rem;
  margin: 0;
  cursor: pointer;
  color: #1a73e8;

  &:hover {
    text-decoration: underline;
  }
`

const DeckStats = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
`

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
`

const CardTypeDistribution = styled.div`
  display: flex;
  height: 6px;
  width: 100%;
  background-color: #eee;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 10px;
`

const TypeBar = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${ props => props.width }%;
  background-color: ${ props => props.color };
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 15px;
`

const DeckDate = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 10px;
`

export default function DecksClient() {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Load decks from localStorage
        const loadDecks = () => {
            try {
                const decksData = localStorage.getItem('userDecks');
                if (decksData) {
                    const parsedDecks = JSON.parse(decksData);
                    setDecks(parsedDecks);
                }
            } catch (error) {
                console.error('Error loading decks:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDecks();
    }, []);

    const handleEditDeck = (deckId: string) => {
        router.push(`/decks/edit/${ deckId }`);
    };

    const handleDeleteDeck = (deckId: string, deckName: string) => {
        if (window.confirm(`Are you sure you want to delete the deck "${ deckName }"?`)) {
            try {
                // Get current decks from localStorage
                const decksData = localStorage.getItem('userDecks');
                if (decksData) {
                    // Filter out the deck to delete
                    const currentDecks = JSON.parse(decksData);
                    const updatedDecks = currentDecks.filter((deck: Deck) => deck.id !== deckId);

                    // Save updated decks back to localStorage
                    localStorage.setItem('userDecks', JSON.stringify(updatedDecks));

                    // Update state
                    setDecks(updatedDecks);
                }
            } catch (error) {
                console.error('Error deleting deck:', error);
            }
        }
    };

    // Calculate type distribution for deck display
    const calculateTypeDistribution = (cards: Card[]) => {
        const typeCount = { ally: 0, action: 0, plot: 0 };

        cards.forEach(card => {
            if (!card.type) return;

            // Map between old and new naming systems
            let normalizedType = card.type.toLowerCase();
            if (normalizedType === 'politician') normalizedType = 'ally';
            else if (normalizedType === 'event') normalizedType = 'action';
            else if (normalizedType === 'special') normalizedType = 'plot';

            // Only count if it's one of our standard types
            if (typeCount[normalizedType] !== undefined) {
                typeCount[normalizedType]++;
            }
        });

        return typeCount;
    };

    return (
        <>
            <MainNavigation />
            <PageContainer>
                <ContentContainer>
                    <a href="#main-content" className="skip-link">Skip to content</a>
                    <Header>
                        <Title id="main-content">My Decks</Title>
                        <Link href="/decks/new">
                            <SimpleButton color="primary">Create New Deck</SimpleButton>
                        </Link>
                    </Header>

                    {loading ? (
                        <div>Loading your decks...</div>
                    ) : decks.length === 0 ? (
                        <EmptyState>
                            <EmptyStateIcon aria-hidden="true">🃏</EmptyStateIcon>
                            <h2>No Decks Found</h2>
                            <p style={{ margin: '20px 0' }}>
                                You haven't created any decks yet. Create your first deck to get started.
                            </p>
                            <Link href="/decks/new">
                                <SimpleButton color="primary">Create New Deck</SimpleButton>
                            </Link>
                        </EmptyState>
                    ) : (
                        <DeckGrid>
                            {decks.map(deck => {
                                const typeDistribution = calculateTypeDistribution(deck.cards);
                                const totalCards = deck.cards.length;

                                return (
                                    <DeckCard key={deck.id}>
                                        <DeckHeader>
                                            <DeckName>{deck.name}</DeckName>
                                        </DeckHeader>

                                        <DeckStats>
                                            <StatRow>
                                                <span>Cards:</span>
                                                <span>{totalCards}/20</span>
                                            </StatRow>
                                            <StatRow>
                                                <span>Types:</span>
                                                <span>
                                                    {typeDistribution.ally > 0 && `${ typeDistribution.ally } Ally `}
                                                    {typeDistribution.action > 0 && `${ typeDistribution.action } Action `}
                                                    {typeDistribution.plot > 0 && `${ typeDistribution.plot } Plot`}
                                                </span>
                                            </StatRow>

                                            <CardTypeDistribution>
                                                {totalCards > 0 && (
                                                    <>
                                                        {typeDistribution.ally > 0 && (
                                                            <TypeBar
                                                                width={(typeDistribution.ally / totalCards) * 100}
                                                                color="#4a69bd"
                                                            />
                                                        )}
                                                        {typeDistribution.action > 0 && (
                                                            <TypeBar
                                                                width={(typeDistribution.action / totalCards) * 100}
                                                                color="#b71540"
                                                            />
                                                        )}
                                                        {typeDistribution.plot > 0 && (
                                                            <TypeBar
                                                                width={(typeDistribution.plot / totalCards) * 100}
                                                                color="#6ab04c"
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </CardTypeDistribution>
                                        </DeckStats>

                                        <ButtonGroup>
                                            <SimpleButton
                                                color="primary"
                                                onClick={() => router.push(`/decks/${ deck.id }`)}
                                            >
                                                View
                                            </SimpleButton>
                                            <SimpleButton
                                                color="secondary"
                                                onClick={() => handleEditDeck(deck.id!)}
                                            >
                                                Edit
                                            </SimpleButton>
                                            <SimpleButton
                                                color="danger"
                                                onClick={() => handleDeleteDeck(deck.id!, deck.name)}
                                            >
                                                Delete
                                            </SimpleButton>
                                        </ButtonGroup>
                                    </DeckCard>
                                );
                            })}
                        </DeckGrid>
                    )}
                </ContentContainer>
            </PageContainer>
        </>
    )
}