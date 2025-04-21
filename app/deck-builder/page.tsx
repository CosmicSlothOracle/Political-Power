'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CardGrid from '../../components/CardGrid';
import PoliticalCard from '../../components/PoliticalCard';
import { Card } from '../../interfaces/Card';
import { getAllCards } from '../../game/mockCards';
import { SimpleButton } from '../../components/SimpleButton';

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 32px;
  margin-bottom: 8px;
  color: #2c3e50;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #7f8c8d;
  margin-bottom: 24px;
`;

const DeckBuilderLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const CardsSection = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
`;

const DeckSection = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  height: fit-content;
`;

const DeckHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const DeckTitle = styled.h2`
  font-size: 24px;
  margin: 0;
  color: #2c3e50;
`;

const DeckCount = styled.div<{ isMaxed: boolean }>`
  padding: 6px 12px;
  border-radius: 20px;
  background-color: ${ props => props.isMaxed ? '#e74c3c' : '#3498db' };
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

const DeckList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 1200px) and (min-width: 1025px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const EmptyDeck = styled.div`
  padding: 24px;
  text-align: center;
  color: #7f8c8d;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #e0e0e0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
`;

const DeckStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
`;

const StatCard = styled.div<{ color: string }>`
  padding: 12px;
  background-color: ${ props => props.color };
  color: white;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

const BudgetStatCard = styled(StatCard) <{ isOverBudget: boolean }>`
  background-color: ${ props => props.isOverBudget ? '#e74c3c' : '#2ecc71' };
  grid-column: span 3;
`;

// Maximum deck size
const MAX_DECK_SIZE = 20;

// Maximum campaign budget
const MAX_CAMPAIGN_BUDGET = 250000;

const DeckBuilderPage: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [deckCards, setDeckCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading cards from an API
    const loadCards = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch from an API
        const allCards = getAllCards();
        setCards(allCards);
      } catch (error) {
        console.error('Failed to load cards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCards();
  }, []);

  const handleAddCard = (card: Card) => {
    if (deckCards.length >= MAX_DECK_SIZE) return;

    // Check if card already exists in deck
    if (deckCards.some(c => c.id === card.id)) return;

    setDeckCards([...deckCards, card]);
  };

  const handleRemoveCard = (cardId: number) => {
    setDeckCards(deckCards.filter(card => card.id !== cardId));
  };

  const handleSaveDeck = () => {
    // In a real app, you would save to an API
    console.log('Saving deck:', deckCards);
    alert('Deck saved successfully!');
  };

  const handleClearDeck = () => {
    if (window.confirm('Are you sure you want to clear your deck?')) {
      setDeckCards([]);
    }
  };

  // Calculate deck stats
  const politicianCount = deckCards.filter(card =>
    card.type === 'ally' || card.type === 'Politician'
  ).length;

  const eventCount = deckCards.filter(card =>
    card.type === 'action' || card.type === 'Event'
  ).length;

  const specialCount = deckCards.filter(card =>
    card.type === 'plot' || card.type === 'Special'
  ).length;

  const avgInfluence = deckCards.length > 0
    ? Math.round(deckCards.reduce((sum, card) => sum + (card.influence || 0), 0) / deckCards.length * 10) / 10
    : 0;

  // Calculate campaign budget
  const campaignBudget = deckCards.reduce((sum, card) => sum + (card.campaignValue || 0), 0);
  const isOverBudget = campaignBudget > MAX_CAMPAIGN_BUDGET;

  // Format budget as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <PageContainer>
      <PageHeader>
        <Title>Deck Builder</Title>
        <Subtitle>Create your political strategy by building a powerful deck of cards under a {formatCurrency(MAX_CAMPAIGN_BUDGET)} budget.</Subtitle>
      </PageHeader>

      <DeckBuilderLayout>
        <CardsSection>
          <CardGrid
            cards={cards}
            deckCards={deckCards}
            isLoading={isLoading}
            onAddCard={handleAddCard}
            onRemoveCard={handleRemoveCard}
            maxDeckSize={MAX_DECK_SIZE}
          />
        </CardsSection>

        <DeckSection>
          <DeckHeader>
            <DeckTitle>Your Deck</DeckTitle>
            <DeckCount isMaxed={deckCards.length >= MAX_DECK_SIZE}>
              {deckCards.length}/{MAX_DECK_SIZE}
            </DeckCount>
          </DeckHeader>

          {deckCards.length > 0 ? (
            <>
              <DeckStats>
                <StatCard color="#3498db">
                  <StatValue>{politicianCount}</StatValue>
                  <StatLabel>Politicians</StatLabel>
                </StatCard>
                <StatCard color="#e74c3c">
                  <StatValue>{eventCount}</StatValue>
                  <StatLabel>Events</StatLabel>
                </StatCard>
                <StatCard color="#8e44ad">
                  <StatValue>{specialCount}</StatValue>
                  <StatLabel>Special</StatLabel>
                </StatCard>
                <StatCard color="#2c3e50" style={{ gridColumn: 'span 3' }}>
                  <StatValue>{avgInfluence}</StatValue>
                  <StatLabel>Avg. Influence</StatLabel>
                </StatCard>
                <BudgetStatCard color="#2ecc71" isOverBudget={isOverBudget}>
                  <StatValue>{formatCurrency(campaignBudget)}</StatValue>
                  <StatLabel>Campaign Budget {isOverBudget ? '(Over budget!)' : ''}</StatLabel>
                </BudgetStatCard>
              </DeckStats>

              <DeckList>
                {deckCards.map(card => (
                  <PoliticalCard
                    key={card.id}
                    card={card}
                    isInDeck={true}
                    onClick={() => handleRemoveCard(card.id)}
                  />
                ))}
              </DeckList>
            </>
          ) : (
            <EmptyDeck>
              <p>Your deck is empty</p>
              <p>Add cards from the collection to build your deck</p>
            </EmptyDeck>
          )}

          <ActionButtons>
            <SimpleButton
              onClick={handleSaveDeck}
              color="success"
              disabled={deckCards.length === 0 || isOverBudget}
              fullWidth
            >
              {isOverBudget ? 'Reduce Budget to Save' : 'Save Deck'}
            </SimpleButton>
            <SimpleButton
              onClick={handleClearDeck}
              color="danger"
              disabled={deckCards.length === 0}
              fullWidth
            >
              Clear Deck
            </SimpleButton>
          </ActionButtons>
        </DeckSection>
      </DeckBuilderLayout>
    </PageContainer>
  );
};

export default DeckBuilderPage;