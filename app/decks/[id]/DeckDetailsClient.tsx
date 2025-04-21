'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'
import MainNavigation from '../../../components/MainNavigation'
import PoliticalCard from '../../../components/PoliticalCard'
import { SimpleButton } from '../../../components/SimpleButton'
import { Deck, Card } from '../../../types/gameTypes'
import Link from 'next/link'
import { toast } from 'react-toastify'

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

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`

const DeckStats = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 1rem;
`

const TypeSection = styled.div`
  margin-top: 30px;
`

const TypeTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 20px;
  border-bottom: 2px solid;
  padding-bottom: 8px;
  border-color: ${ props => props.color || '#333' };
  color: ${ props => props.color || '#333' };
`

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`

const TypeLabel = styled.span<{ type: string }>`
  background-color: ${ props => {
        const type = props.type || 'ally';
        switch (type.toLowerCase()) {
            case 'ally': return '#4a69bd';
            case 'action': return '#b71540';
            case 'plot': return '#6ab04c';
            default: return '#aaa';
        }
    } };
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 14px;
  margin-right: 8px;
`

const RarityLabel = styled.span<{ rarity: string }>`
  background-color: ${ props => {
        const rarity = props.rarity || 'common';
        switch (rarity.toLowerCase()) {
            case 'common': return '#aaa';
            case 'rare': return '#5c7cfa';
            case 'legendary': return '#fcc419';
            default: return '#aaa';
        }
    } };
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 14px;
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

const DeckDate = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
`

const CardCount = styled.span`
  background-color: #eee;
  border-radius: 30px;
  padding: 3px 8px;
  font-size: 14px;
  margin-left: 10px;
  color: #666;
`

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const CardModal = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;
`

interface DeckDetailsClientProps {
    deckId: string;
}

export default function DeckDetailsClient({ deckId }: DeckDetailsClientProps) {
    const router = useRouter();
    const [deck, setDeck] = useState<Deck | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);

    // Group cards by type for better organization
    const groupCardsByType = (cards: Card[]) => {
        if (!cards || !Array.isArray(cards)) return {};

        return cards.reduce((groups, card) => {
            if (!card || !card.type) return groups;

            // Normalize card type to standard types - use toLowerCase for case insensitivity
            let normalizedType = card.type.toLowerCase();
            if (normalizedType === 'politician') normalizedType = 'ally';
            else if (normalizedType === 'event') normalizedType = 'action';
            else if (normalizedType === 'special') normalizedType = 'plot';

            // Only include standard types
            if (['ally', 'action', 'plot'].includes(normalizedType)) {
                if (!groups[normalizedType]) {
                    groups[normalizedType] = [];
                }
                groups[normalizedType].push(card);
            }
            return groups;
        }, {} as Record<string, Card[]>);
    };

    // Calculate card type counts
    const calculateTypeCounts = (cards: Card[]) => {
        if (!cards || !Array.isArray(cards)) {
            return { ally: 0, action: 0, plot: 0 };
        }

        const counts = { ally: 0, action: 0, plot: 0 };

        cards.forEach(card => {
            if (!card || !card.type) return;

            // Normalize card type to standard types - use toLowerCase for case insensitivity
            let normalizedType = card.type.toLowerCase();
            if (normalizedType === 'politician') normalizedType = 'ally';
            else if (normalizedType === 'event') normalizedType = 'action';
            else if (normalizedType === 'special') normalizedType = 'plot';

            // Increment count if it's a standard type
            if (counts[normalizedType] !== undefined) {
                counts[normalizedType]++;
            }
        });

        return counts;
    };

    // Calculate average influence
    const calculateAverageInfluence = (cards: Card[]) => {
        if (!cards || !Array.isArray(cards) || cards.length === 0) {
            return '0';
        }

        // Filter out cards with undefined influence
        const cardsWithInfluence = cards.filter(card => card && typeof card.influence === 'number');

        if (cardsWithInfluence.length === 0) {
            return '0';
        }

        // Sum up influence values
        const totalInfluence = cardsWithInfluence.reduce((sum, card) => sum + (card.influence || 0), 0);

        // Calculate average
        return (totalInfluence / cardsWithInfluence.length).toFixed(1);
    };

    // Format date
    const formatDate = (dateString: string | Date | undefined) => {
        if (!dateString) return 'Unknown date';

        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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
                        // Ensure deck has valid cards array
                        if (!foundDeck.cards || !Array.isArray(foundDeck.cards)) {
                            foundDeck.cards = [];
                        }
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

    const handleCardClick = (card: Card) => {
        if (!card) return;
        setSelectedCard(card);
    };

    const closeModal = () => {
        setSelectedCard(null);
    };

    const handleCopyDeck = () => {
        if (!deck) return;

        try {
            // Create a copy of the deck with a new name and ID
            const newDeck: Deck = {
                ...deck,
                id: `deck-${ Date.now() }-${ Math.floor(Math.random() * 1000) }`,
                name: `${ deck.name } (Copy)`,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Get existing decks
            const decksData = localStorage.getItem('userDecks');
            const existingDecks: Deck[] = decksData ? JSON.parse(decksData) : [];

            // Add the new deck
            existingDecks.push(newDeck);

            // Save to localStorage
            localStorage.setItem('userDecks', JSON.stringify(existingDecks));

            // Show success message
            toast.success(`Deck "${ deck.name }" copied successfully`);

            // Redirect to the new deck
            router.push(`/decks/${ newDeck.id }`);
        } catch (error) {
            console.error('Error copying deck:', error);
            toast.error('Failed to copy deck');
        }
    };

    const handleDeleteDeck = () => {
        if (!deck) return;

        if (window.confirm(`Are you sure you want to delete the deck "${ deck.name }"?`)) {
            try {
                // Get current decks from localStorage
                const decksData = localStorage.getItem('userDecks');
                if (decksData) {
                    // Filter out the deck to delete
                    const currentDecks = JSON.parse(decksData);
                    const updatedDecks = currentDecks.filter((d: Deck) => d.id !== deck.id);

                    // Save updated decks back to localStorage
                    localStorage.setItem('userDecks', JSON.stringify(updatedDecks));

                    // Show success message
                    toast.success(`Deck "${ deck.name }" deleted successfully`);

                    // Redirect to decks page
                    router.push('/decks');
                }
            } catch (error) {
                console.error('Error deleting deck:', error);
                toast.error('Failed to delete deck');
            }
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
                            <Title>Deck Details</Title>
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

    const groupedCards = groupCardsByType(deck.cards);
    const typeCounts = calculateTypeCounts(deck.cards);
    const averageInfluence = calculateAverageInfluence(deck.cards);

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
                            <Title>{deck.name}</Title>
                        </HeaderLeft>
                        <ButtonGroup>
                            <SimpleButton
                                color="secondary"
                                onClick={() => router.push(`/decks/edit/${ deck.id }`)}
                            >
                                Edit Deck
                            </SimpleButton>
                            <SimpleButton
                                color="primary"
                                onClick={handleCopyDeck}
                            >
                                Copy Deck
                            </SimpleButton>
                            <SimpleButton
                                color="danger"
                                onClick={handleDeleteDeck}
                            >
                                Delete Deck
                            </SimpleButton>
                        </ButtonGroup>
                    </Header>

                    <DeckStats>
                        <h2>Deck Statistics</h2>
                        {deck.createdAt && (
                            <DeckDate>
                                Created: {formatDate(deck.createdAt)}
                                {deck.updatedAt && deck.updatedAt !== deck.createdAt &&
                                    ` • Updated: ${ formatDate(deck.updatedAt) }`}
                            </DeckDate>
                        )}
                        <StatRow>
                            <span>Total Cards:</span>
                            <span>{deck.cards.length}</span>
                        </StatRow>
                        <StatRow>
                            <span>Average Influence:</span>
                            <span>{averageInfluence}</span>
                        </StatRow>
                        <StatRow>
                            <span>Card Types:</span>
                            <div>
                                {typeCounts.ally > 0 && (
                                    <TypeLabel type="ally">Ally: {typeCounts.ally}</TypeLabel>
                                )}
                                {typeCounts.action > 0 && (
                                    <TypeLabel type="action">Action: {typeCounts.action}</TypeLabel>
                                )}
                                {typeCounts.plot > 0 && (
                                    <TypeLabel type="plot">Plot: {typeCounts.plot}</TypeLabel>
                                )}
                            </div>
                        </StatRow>
                    </DeckStats>

                    {/* Ally Cards */}
                    {groupedCards.ally && groupedCards.ally.length > 0 && (
                        <TypeSection>
                            <TypeTitle color="#4a69bd">
                                Allies
                                <CardCount>{groupedCards.ally.length}</CardCount>
                            </TypeTitle>
                            <CardGrid>
                                {groupedCards.ally.map(card => (
                                    <PoliticalCard
                                        key={card.id || `ally-${ Math.random() }`}
                                        card={card}
                                        isInDeck={true}
                                        onClick={() => handleCardClick(card)}
                                    />
                                ))}
                            </CardGrid>
                        </TypeSection>
                    )}

                    {/* Action Cards */}
                    {groupedCards.action && groupedCards.action.length > 0 && (
                        <TypeSection>
                            <TypeTitle color="#b71540">
                                Actions
                                <CardCount>{groupedCards.action.length}</CardCount>
                            </TypeTitle>
                            <CardGrid>
                                {groupedCards.action.map(card => (
                                    <PoliticalCard
                                        key={card.id || `action-${ Math.random() }`}
                                        card={card}
                                        isInDeck={true}
                                        onClick={() => handleCardClick(card)}
                                    />
                                ))}
                            </CardGrid>
                        </TypeSection>
                    )}

                    {/* Plot Cards */}
                    {groupedCards.plot && groupedCards.plot.length > 0 && (
                        <TypeSection>
                            <TypeTitle color="#6ab04c">
                                Plots
                                <CardCount>{groupedCards.plot.length}</CardCount>
                            </TypeTitle>
                            <CardGrid>
                                {groupedCards.plot.map(card => (
                                    <PoliticalCard
                                        key={card.id || `plot-${ Math.random() }`}
                                        card={card}
                                        isInDeck={true}
                                        onClick={() => handleCardClick(card)}
                                    />
                                ))}
                            </CardGrid>
                        </TypeSection>
                    )}

                    {/* Card Detail Modal */}
                    {selectedCard && (
                        <ModalBackground onClick={closeModal}>
                            <CardModal onClick={e => e.stopPropagation()}>
                                <h2>{selectedCard.name || 'Unnamed Card'}</h2>
                                <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
                                    {selectedCard.type && (
                                        <TypeLabel type={selectedCard.type}>
                                            {selectedCard.type.charAt(0).toUpperCase() + selectedCard.type.slice(1)}
                                        </TypeLabel>
                                    )}
                                    {selectedCard.rarity && (
                                        <RarityLabel rarity={selectedCard.rarity}>
                                            {selectedCard.rarity.charAt(0).toUpperCase() + selectedCard.rarity.slice(1)}
                                        </RarityLabel>
                                    )}
                                </div>
                                <p><strong>Influence:</strong> {selectedCard.influence !== undefined && selectedCard.influence !== null ? selectedCard.influence : 'N/A'}</p>
                                <p><strong>Description:</strong> {selectedCard.description || 'No description'}</p>
                                {selectedCard.ability && <p><strong>Ability:</strong> {selectedCard.ability}</p>}
                                {selectedCard.tags && selectedCard.tags.length > 0 && (
                                    <p><strong>Tags:</strong> {selectedCard.tags.join(', ')}</p>
                                )}
                                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                                    <SimpleButton color="secondary" onClick={closeModal}>Close</SimpleButton>
                                </div>
                            </CardModal>
                        </ModalBackground>
                    )}
                </ContentContainer>
            </PageContainer>
        </>
    );
}