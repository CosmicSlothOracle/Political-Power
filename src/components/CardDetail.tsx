import React from 'react';
import styled from 'styled-components';
import { Card } from '../interfaces/Card';
import { SimpleButton } from './SimpleButton';

interface CardDetailProps {
  card: Card;
  onClose: () => void;
  onAddToDeck?: () => void;
  onRemoveFromDeck?: () => void;
  isInDeck?: boolean;
  deckIsFull?: boolean;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

  @media (min-width: 768px) {
    flex-direction: row;
    max-height: 80vh;
  }
`;

const ImageSection = styled.div<{ imagePath: string }>`
  flex: 1;
  background-image: url(${ props => props.imagePath });
  background-size: cover;
  background-position: center;
  min-height: 250px;
  position: relative;

  @media (min-width: 768px) {
    min-height: unset;
  }
`;

const CardTypeIndicator = styled.div<{ type: string }>`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  background-color: ${ props => {
    switch (props.type) {
      case 'ally': return 'rgba(52, 152, 219, 0.85)';
      case 'action': return 'rgba(231, 76, 60, 0.85)';
      case 'plot': return 'rgba(155, 89, 182, 0.85)';
      default: return 'rgba(52, 73, 94, 0.85)';
    }
  } };
  color: white;
  text-transform: uppercase;
`;

const InfoSection = styled.div`
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const CardName = styled.h2`
  margin: 0 0 15px 0;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
`;

const CardInfo = styled.div`
  display: flex;
  margin-bottom: 20px;
  gap: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 5px;
  text-transform: uppercase;
`;

const InfoValue = styled.span`
  font-size: 16px;
  color: #34495e;
  font-weight: 600;
`;

const CardDescription = styled.p`
  margin: 0 0 30px 0;
  font-size: 16px;
  line-height: 1.6;
  color: #34495e;
  flex-grow: 1;
`;

const Ability = styled.div`
  margin-bottom: 30px;
`;

const AbilityTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
`;

const AbilityText = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: #34495e;
  padding: 15px;
  background-color: #f8f9fa;
  border-left: 4px solid #3498db;
  border-radius: 4px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-top: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  z-index: 10;

  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const CardDetail: React.FC<CardDetailProps> = ({
  card,
  onClose,
  onAddToDeck,
  onRemoveFromDeck,
  isInDeck = false,
  deckIsFull = false
}) => {
  // Handle click on overlay to prevent bubbling
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return '#95a5a6';
      case 'uncommon': return '#3498db';
      case 'rare': return '#9b59b6';
      case 'legendary': return '#f1c40f';
      default: return '#95a5a6';
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <DetailContainer>
        <CloseButton onClick={onClose}>&times;</CloseButton>

        <ImageSection imagePath={card.imagePath || '/images/card-placeholder.jpg'}>
          <CardTypeIndicator type={card.type}>{card.type}</CardTypeIndicator>
        </ImageSection>

        <InfoSection>
          <CardName>{card.name}</CardName>

          <CardInfo>
            <InfoItem>
              <InfoLabel>Type</InfoLabel>
              <InfoValue style={{ color: getRarityColor(card.rarity) }}>
                {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
              </InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>Influence</InfoLabel>
              <InfoValue>{card.influence}</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>Rarity</InfoLabel>
              <InfoValue style={{ color: getRarityColor(card.rarity) }}>
                {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}
              </InfoValue>
            </InfoItem>
          </CardInfo>

          <CardDescription>{card.description}</CardDescription>

          {card.ability && (
            <Ability>
              <AbilityTitle>Special Ability</AbilityTitle>
              <AbilityText>{card.ability}</AbilityText>
            </Ability>
          )}

          <ButtonsContainer>
            {!isInDeck && onAddToDeck && (
              <SimpleButton
                onClick={onAddToDeck}
                disabled={deckIsFull}
                variant="primary"
              >
                {deckIsFull ? 'Deck Full' : 'Add to Deck'}
              </SimpleButton>
            )}

            {isInDeck && onRemoveFromDeck && (
              <SimpleButton
                onClick={onRemoveFromDeck}
                variant="danger"
              >
                Remove from Deck
              </SimpleButton>
            )}

            <SimpleButton
              onClick={onClose}
              variant="secondary"
            >
              Close
            </SimpleButton>
          </ButtonsContainer>
        </InfoSection>
      </DetailContainer>
    </Overlay>
  );
};

export default CardDetail;