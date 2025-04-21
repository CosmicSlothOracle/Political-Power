import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CardGrid from './CardGrid';
import { Card } from '../interfaces/Card';
import { getDeckById } from '../game/deckUtils';
import SimpleButton from './SimpleButton';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';

interface DeckDetailsClientProps {
    deckId: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  color: #2c3e50;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const DeckInfo = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
`;

const DeckStats = styled.div`
  flex: 1;
  min-width: 300px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
`;

const DeckDescription = styled.div`
  flex: 2;
  min-width: 300px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
`;

const StatTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #2c3e50;
`;

const StatList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid #dee2e6;

  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.div`
  color: #6c757d;
`;

const StatValue = styled.div`
  font-weight: 600;
  color: #2c3e50;
`;

const TypeDistribution = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const TypeCard = styled.div<{ color: string }>`
  background-color: ${ props => props.color };
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
`;

const TypeValue = styled.div`
  font-size: 24px;
  font-weight: 700;
`;

const TypeLabel = styled.div`
  font-size: 14px;
  margin-top: 4px;
`;

const NoData = styled.div`
  text-align: center;
  padding: 40px;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #6c757d;
`;

const DeckDetailsClient: React.FC<DeckDetailsClientProps> = ({ deckId }) => {
    const [deck, setDeck] = useState<{ name: string; description: string; cards: Card[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Safety check for deckId
        if (!deckId) {
            setIsLoading(false);
            return;
        }

        try {
            const loadedDeck = getDeckById(deckId);
            setDeck(loadedDeck);
        } catch (error) {
            console.error('Error loading deck:', error);
        } finally {
            setIsLoading(false);
        }
    }, [deckId]);

    const handleBackClick = () => {
        router.push('/decks');
    };

    const handleEditClick = () => {
        if (deckId) {
            router.push(`/decks/edit/${ deckId }`);
        }
    };

    const handleDeleteClick = () => {
        // Handle deck deletion logic
        // For now, just navigate back to decks page
        router.push('/decks');
    };

    // Calculate deck statistics
    const calculateDeckStats = () => {
        if (!deck || !deck.cards || !Array.isArray(deck.cards)) {
            return {
                totalCards: 0,
                averageInfluence: 0,
                totalCampaignValue: 0,
                typeDistribution: { ally: 0, action: 0, plot: 0 },
                rarityDistribution: { common: 0, uncommon: 0, rare: 0, legendary: 0 }
            };
        }

        const totalCards = deck.cards.length;

        let totalInfluence = 0;
        let totalCampaignValue = 0;

        const typeDistribution = { ally: 0, action: 0, plot: 0 };
        const rarityDistribution = { common: 0, uncommon: 0, rare: 0, legendary: 0 };

        deck.cards.forEach(card => {
            // Skip if card is undefined or null
            if (!card) return;

            // Add influence
            totalInfluence += card.influence || 0;

            // Add campaign value
            totalCampaignValue += card.campaignValue || 0;

            // Count card type (normalize to handle both naming conventions)
            const normalizedType = typeof card.type === 'string'
                ? card.type.toLowerCase()
                : String(card.type);

            if (normalizedType === 'politician' || normalizedType === 'ally') {
                typeDistribution.ally += 1;
            } else if (normalizedType === 'event' || normalizedType === 'action') {
                typeDistribution.action += 1;
            } else if (normalizedType === 'special' || normalizedType === 'plot') {
                typeDistribution.plot += 1;
            }

            // Count card rarity
            if (card.rarity) {
                const normalizedRarity = card.rarity.toLowerCase();
                if (rarityDistribution.hasOwnProperty(normalizedRarity)) {
                    // @ts-ignore - we've already checked the property exists
                    rarityDistribution[normalizedRarity] += 1;
                }
            }
        });

        const averageInfluence = totalCards > 0 ? Math.round((totalInfluence / totalCards) * 10) / 10 : 0;

        return {
            totalCards,
            averageInfluence,
            totalCampaignValue,
            typeDistribution,
            rarityDistribution
        };
    };

    const stats = calculateDeckStats();

    // Format currency for display
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (isLoading) {
        return (
            <Container>
                <div>Loading deck details...</div>
            </Container>
        );
    }

    if (!deck) {
        return (
            <Container>
                <Header>
                    <Title>Deck Not Found</Title>
                    <ButtonsContainer>
                        <SimpleButton onClick={handleBackClick} color="secondary">
                            <FaArrowLeft /> Back to Decks
                        </SimpleButton>
                    </ButtonsContainer>
                </Header>
                <NoData>
                    <p>The deck you are looking for does not exist or has been deleted.</p>
                </NoData>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <Title>{deck.name || 'Unnamed Deck'}</Title>
                <ButtonsContainer>
                    <SimpleButton onClick={handleBackClick} color="secondary">
                        <FaArrowLeft /> Back
                    </SimpleButton>
                    <SimpleButton onClick={handleEditClick} color="primary">
                        <FaEdit /> Edit
                    </SimpleButton>
                    <SimpleButton onClick={handleDeleteClick} color="danger">
                        <FaTrash /> Delete
                    </SimpleButton>
                </ButtonsContainer>
            </Header>

            <DeckInfo>
                <DeckStats>
                    <StatTitle>Deck Statistics</StatTitle>
                    <StatList>
                        <StatItem>
                            <StatLabel>Total Cards</StatLabel>
                            <StatValue>{stats.totalCards}</StatValue>
                        </StatItem>
                        <StatItem>
                            <StatLabel>Average Influence</StatLabel>
                            <StatValue>{stats.averageInfluence}</StatValue>
                        </StatItem>
                        <StatItem>
                            <StatLabel>Total Campaign Value</StatLabel>
                            <StatValue>{formatCurrency(stats.totalCampaignValue)}</StatValue>
                        </StatItem>
                    </StatList>

                    <StatTitle>Card Distribution</StatTitle>
                    <TypeDistribution>
                        <TypeCard color="#3498db">
                            <TypeValue>{stats.typeDistribution.ally}</TypeValue>
                            <TypeLabel>Allies</TypeLabel>
                        </TypeCard>
                        <TypeCard color="#2ecc71">
                            <TypeValue>{stats.typeDistribution.action}</TypeValue>
                            <TypeLabel>Actions</TypeLabel>
                        </TypeCard>
                        <TypeCard color="#e74c3c">
                            <TypeValue>{stats.typeDistribution.plot}</TypeValue>
                            <TypeLabel>Plots</TypeLabel>
                        </TypeCard>
                    </TypeDistribution>
                </DeckStats>

                <DeckDescription>
                    <StatTitle>Description</StatTitle>
                    <p>{deck.description || 'No description provided.'}</p>
                </DeckDescription>
            </DeckInfo>

            <CardGrid
                cards={deck.cards || []}
                title="Deck Cards"
                showFilters={true}
                showBudget={false}
            />
        </Container>
    );
};

export default DeckDetailsClient;