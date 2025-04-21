import React from 'react';
import styled from 'styled-components';
import { Card as CardType } from '../types/gameTypes';
import { motion } from 'framer-motion';

interface GameCardProps {
  card: CardType | null;
  isRevealed?: boolean;
  isPlayed?: boolean;
  isDisabled?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

const CardContainer = styled(motion.div) <{
  isRevealed: boolean;
  isPlayed: boolean;
  isDisabled: boolean;
  isSelected: boolean;
}>`
  position: relative;
  width: 180px;
  height: 250px;
  border-radius: 10px;
  background-color: ${ props => props.isRevealed ? '#fff' : '#2c3e50' };
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: ${ props => (props.isDisabled ? 'not-allowed' : 'pointer') };
  overflow: hidden;
  transform-style: preserve-3d;
  transition: transform 0.6s, opacity 0.3s;
  opacity: ${ props => (props.isDisabled ? 0.7 : 1) };
  transform: ${ props => props.isSelected ? 'translateY(-10px)' : 'none' };

  &:hover {
    transform: ${ props => !props.isDisabled && !props.isPlayed ? 'scale(1.05)' : 'none' };
  }
`;

const CardFront = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  padding: 12px;
`;

const CardBack = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: linear-gradient(135deg, #2c3e50, #4a69bd);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardHeader = styled.div<{ cardType: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .card-name {
    font-weight: bold;
    font-size: 16px;
    color: ${ props => {
    switch (props.cardType) {
      case 'ally': return '#4a69bd';  // Blue for allies
      case 'action': return '#b71540'; // Red for actions
      case 'plot': return '#6ab04c';   // Green for plots
      default: return '#000';
    }
  } };
  }

  .card-influence {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: ${ props => {
    switch (props.cardType) {
      case 'ally': return '#4a69bd';  // Blue for allies
      case 'action': return '#b71540'; // Red for actions
      case 'plot': return '#6ab04c';   // Green for plots
      default: return '#000';
    }
  } };
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }
`;

const CardImage = styled.div`
  width: 100%;
  height: 100px;
  background-color: #eee;
  margin-bottom: 8px;
  border-radius: 4px;
  background-size: cover;
  background-position: center;
`;

const CardDesc = styled.div`
  font-size: 12px;
  color: #333;
  flex-grow: 1;
  overflow-y: auto;
`;

const CardAbility = styled.div`
  font-size: 12px;
  font-style: italic;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #eee;
  color: #555;
`;

const CardTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
`;

const Tag = styled.div`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  background-color: #eee;
  color: #555;
`;

const BackLogo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-align: center;
`;

const GameCard: React.FC<GameCardProps> = ({
  card,
  isRevealed = false,
  isPlayed = false,
  isDisabled = false,
  isSelected = false,
  onClick,
  className
}) => {
  return (
    <CardContainer
      className={className}
      isRevealed={isRevealed}
      isPlayed={isPlayed}
      isDisabled={isDisabled}
      isSelected={isSelected}
      onClick={isDisabled ? undefined : onClick}
      whileHover={{ scale: isDisabled || isPlayed ? 1 : 1.05 }}
      whileTap={{ scale: isDisabled || isPlayed ? 1 : 0.98 }}
    >
      {isRevealed && card ? (
        <CardFront>
          <CardHeader cardType={card.type}>
            <div className="card-name">{card.name}</div>
            <div className="card-influence">{card.influence}</div>
          </CardHeader>
          <CardImage style={{ backgroundImage: `url(${ card.imagePath })` }} />
          <CardDesc>{card.description}</CardDesc>
          <CardAbility>{card.ability}</CardAbility>
          {card.tags && card.tags.length > 0 && (
            <CardTags>
              {card.tags.map((tag, index) => (
                <Tag key={index}>{tag}</Tag>
              ))}
            </CardTags>
          )}
        </CardFront>
      ) : (
        <CardBack>
          <BackLogo>Political Cards</BackLogo>
        </CardBack>
      )}
    </CardContainer>
  );
};

export default GameCard;