'use client';

import React from 'react';
import styled from 'styled-components';
import { Player, Card } from '../../types/gameTypes';
import { motion } from 'framer-motion';

interface PlayerAreaProps {
    player: Player;
    isCurrentPlayer: boolean;
    isActive: boolean;
    onCoalitionAccept?: () => void;
}

const PlayerContainer = styled(motion.div) <{ isActive: boolean; isCurrentPlayer: boolean }>`
  display: flex;
  flex-direction: column;
  width: 250px;
  padding: 15px;
  border-radius: 10px;
  background-color: ${ props => props.isCurrentPlayer ? '#2980b9' : '#34495e' };
  box-shadow: ${ props => props.isActive ? '0 0 15px #f39c12' : '0 4px 6px rgba(0, 0, 0, 0.1)' };
  transition: all 0.3s ease;
  position: relative;
`;

const PlayerHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Avatar = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${ props => props.color };
  margin-right: 10px;
`;

const PlayerName = styled.h3`
  margin: 0;
  font-size: 16px;
  flex-grow: 1;
`;

const Mandates = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  margin-left: 10px;
`;

const PlayerStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CardArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardSection = styled.div`
  margin-bottom: 5px;
`;

const SectionTitle = styled.h4`
  margin: 0 0 5px 0;
  font-size: 12px;
  color: #bdc3c7;
`;

const CardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const CardPreview = styled.div<{ type: string }>`
  width: 30px;
  height: 45px;
  border-radius: 3px;
  background-color: ${ props => {
        switch (props.type) {
            case 'character': return '#3498db';
            case 'special': return '#9b59b6';
            case 'trap': return '#e74c3c';
            default: return '#95a5a6';
        }
    } };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: white;
  cursor: pointer;
`;

const CoalitionBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #f39c12;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
`;

const CoalitionButton = styled.button`
  background-color: #f39c12;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e67e22;
  }
`;

// Hilfsfunktion zum Anzeigen der Karte mit Typ
const renderCardPreviews = (cards: Card[], type: string) => {
    return cards.map(card => (
        <CardPreview key={card.id} type={type}>
            {card.name.charAt(0)}
        </CardPreview>
    ));
};

const PlayerArea: React.FC<PlayerAreaProps> = ({
    player,
    isCurrentPlayer,
    isActive,
    onCoalitionAccept
}) => {
    return (
        <PlayerContainer
            isActive={isActive}
            isCurrentPlayer={isCurrentPlayer}
            animate={isActive ? { scale: 1.02 } : { scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            {player.coalitionPartners.length > 0 && (
                <CoalitionBadge>{player.coalitionPartners.length}</CoalitionBadge>
            )}

            <PlayerHeader>
                <Avatar color={player.color || '#3498db'} />
                <PlayerName>{player.name}</PlayerName>
                <Mandates>
                    <span role="img" aria-label="mandate">🏛️</span> {player.mandates}
                </Mandates>
            </PlayerHeader>

            <PlayerStats>
                <Stat>
                    <span>Einfluss</span>
                    <strong>{player.influence}</strong>
                </Stat>
                <Stat>
                    <span>Karten</span>
                    <strong>{player.hand.length}</strong>
                </Stat>
                <Stat>
                    <span>Budget</span>
                    <strong>{player.budget}€</strong>
                </Stat>
            </PlayerStats>

            <CardArea>
                {player.playedCharacters.length > 0 && (
                    <CardSection>
                        <SectionTitle>Charaktere</SectionTitle>
                        <CardList>
                            {renderCardPreviews(player.playedCharacters, 'character')}
                        </CardList>
                    </CardSection>
                )}

                {player.playedSpecials.length > 0 && (
                    <CardSection>
                        <SectionTitle>Spezialkarten</SectionTitle>
                        <CardList>
                            {renderCardPreviews(player.playedSpecials, 'special')}
                        </CardList>
                    </CardSection>
                )}

                {player.playedTraps.length > 0 && (
                    <CardSection>
                        <SectionTitle>Fallenkarten</SectionTitle>
                        <CardList>
                            {renderCardPreviews(player.playedTraps, 'trap')}
                        </CardList>
                    </CardSection>
                )}
            </CardArea>

            {onCoalitionAccept && (
                <CoalitionButton onClick={onCoalitionAccept}>
                    Koalition akzeptieren
                </CoalitionButton>
            )}
        </PlayerContainer>
    );
};

export default PlayerArea;