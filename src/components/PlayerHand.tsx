/**
 * PlayerHand.tsx
 * Component for displaying and managing a player's hand of cards
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Player } from '../types/gameTypes';
import cardService from '../services/CardService';
import PoliticalCard from './PoliticalCard';

interface PlayerHandProps {
    player: Player;
    isActivePlayer: boolean;
    onPlayCard: (cardId: string) => void;
    onViewCardDetails: (card: Card) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
    player,
    isActivePlayer,
    onPlayCard,
    onViewCardDetails
}) => {
    const [handCards, setHandCards] = useState<Card[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    useEffect(() => {
        // Convert card IDs to actual card objects
        if (player && player.hand && player.deck) {
            const cards = cardService.getCardsInHand(player.deck, player.hand);
            setHandCards(cards);
        } else {
            setHandCards([]);
        }
    }, [player]);

    const handleCardClick = (card: Card) => {
        if (isActivePlayer) {
            setSelectedCardId(card.id === selectedCardId ? null : card.id);
            onViewCardDetails(card);
        }
    };

    const handlePlayCard = () => {
        if (selectedCardId && isActivePlayer) {
            onPlayCard(selectedCardId);
            setSelectedCardId(null);
        }
    };

    return (
        <HandContainer>
            <HandTitle>
                Your Hand ({handCards.length} cards)
                {isActivePlayer && selectedCardId && (
                    <PlayButton onClick={handlePlayCard}>
                        Play Card
                    </PlayButton>
                )}
            </HandTitle>

            <CardsContainer>
                {handCards.length === 0 ? (
                    <EmptyHand>No cards in hand</EmptyHand>
                ) : (
                    handCards.map((card) => (
                        <CardWrapper
                            key={card.id}
                            isSelected={card.id === selectedCardId}
                            isPlayable={isActivePlayer}
                            onClick={() => handleCardClick(card)}
                        >
                            <PoliticalCard
                                card={card}
                                size="small"
                                highlighted={card.id === selectedCardId}
                            />
                        </CardWrapper>
                    ))
                )}
            </CardsContainer>

            {!isActivePlayer && (
                <NotYourTurn>Waiting for your turn...</NotYourTurn>
            )}
        </HandContainer>
    );
};

const HandContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #2d3748;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const HandTitle = styled.h3`
  color: white;
  font-size: 1.2rem;
  margin: 0 0 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  justify-content: flex-start;
  min-height: 160px;
`;

const CardWrapper = styled.div<{ isSelected: boolean; isPlayable: boolean }>`
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border-radius: 8px;
  border: ${ (props) => (props.isSelected ? '2px solid #48bb78' : 'none') };
  transform: ${ (props) => (props.isSelected ? 'translateY(-10px)' : 'none') };
  cursor: ${ (props) => (props.isPlayable ? 'pointer' : 'default') };
  opacity: ${ (props) => (props.isPlayable ? 1 : 0.8) };

  &:hover {
    transform: ${ (props) => (props.isPlayable ? 'translateY(-5px)' : 'none') };
    box-shadow: ${ (props) => (props.isPlayable ? '0 5px 15px rgba(0, 0, 0, 0.2)' : 'none') };
  }
`;

const EmptyHand = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 140px;
  background-color: #3a4556;
  border-radius: 8px;
  color: #a0aec0;
  font-style: italic;
`;

const PlayButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #48bb78;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-left: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #38a169;
  }
`;

const NotYourTurn = styled.div`
  background-color: #2c364a;
  color: #a0aec0;
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
  margin-top: 1rem;
  font-style: italic;
`;

export default PlayerHand;