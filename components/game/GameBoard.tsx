'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { GameState, GamePhase, Player, Card } from '../../types/gameTypes';
import PlayerArea from './PlayerArea';
import CardHand from './CardHand';
import GameInfo from './GameInfo';
import CoalitionDialog from './CoalitionDialog';
import ActionButtons from './ActionButtons';
import { motion } from 'framer-motion';

interface GameBoardProps {
    gameState: GameState;
    currentPlayerId: string;
    onPlayCard: (cardId: string, type: 'character' | 'special' | 'trap') => void;
    onThrowMomentum: () => void;
    onOfferCoalition: (targetPlayerId: string) => void;
    onAcceptCoalition: (offeringPlayerId: string) => void;
    onNextPhase: () => void;
}

const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: #2c3e50;
  color: white;
  overflow: hidden;
  position: relative;
`;

const GameContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const PlayersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
`;

const CenterArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  margin-bottom: 20px;
`;

const MomentumDisplay = styled.div<{ value: number }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  background-color: ${ props => {
        const value = props.value;
        if (value <= 2) return '#e74c3c'; // Rot
        if (value <= 4) return '#f1c40f'; // Gelb
        return '#2ecc71'; // Grün
    } };
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const PhaseDisplay = styled.div`
  font-size: 18px;
  margin-bottom: 10px;
  text-align: center;
`;

const HandContainer = styled.div`
  padding: 20px;
  background-color: #34495e;
  border-top: 1px solid #2c3e50;
`;

const GameBoard: React.FC<GameBoardProps> = ({
    gameState,
    currentPlayerId,
    onPlayCard,
    onThrowMomentum,
    onOfferCoalition,
    onAcceptCoalition,
    onNextPhase
}) => {
    const [showCoalitionDialog, setShowCoalitionDialog] = useState(false);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);

    // Aktueller Spieler
    const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
    if (!currentPlayer) {
        return <div>Spieler nicht gefunden</div>;
    }

    // Phase-Namen auf Deutsch
    const phaseNames = {
        [GamePhase.SETUP]: 'Vorbereitung',
        [GamePhase.MOMENTUM]: 'Momentum-Wurf',
        [GamePhase.COALITION]: 'Koalitionsphase',
        [GamePhase.CHARACTER]: 'Charakterkartenphase',
        [GamePhase.SPECIAL]: 'Spezialkartenphase',
        [GamePhase.RESOLUTION]: 'Auflösungsphase',
        [GamePhase.INFLUENCE_LOSS]: 'Einflussverlustphase',
        [GamePhase.DRAW]: 'Kartenziehphase',
        [GamePhase.END]: 'Spielende'
    };

    // Ist der aktuelle Spieler aktiv?
    const isActivePlayer = gameState.activePlayerId === currentPlayerId;

    // Prüfe, welche Karten gespielt werden können
    const canPlayCharacter = gameState.phase === GamePhase.CHARACTER;
    const canPlaySpecial = gameState.phase === GamePhase.SPECIAL;
    const canPlayTrap = gameState.phase === GamePhase.SPECIAL && currentPlayer.playedCharacters.length > 0;

    // Prüfe, ob der Spieler Momentum würfeln kann
    const canThrowMomentum =
        gameState.phase === GamePhase.MOMENTUM &&
        (gameState.currentRound === 1 ||
            currentPlayerId === gameState.players.sort((a, b) => a.mandates - b.mandates)[0].id);

    // Prüfe, ob der Spieler eine Koalition anbieten kann
    const canOfferCoalition = gameState.phase === GamePhase.COALITION && gameState.players.length >= 3;

    // Handlere
    const handleCardSelect = (card: Card) => {
        setSelectedCard(card);
    };

    const handleCardPlay = (type: 'character' | 'special' | 'trap') => {
        if (selectedCard) {
            onPlayCard(selectedCard.id, type);
            setSelectedCard(null);
        }
    };

    const handleCoalitionOffer = () => {
        setShowCoalitionDialog(true);
    };

    const handleCoalitionSelect = (targetPlayerId: string) => {
        onOfferCoalition(targetPlayerId);
        setShowCoalitionDialog(false);
    };

    return (
        <BoardContainer>
            <GameContent>
                <PlayersContainer>
                    {gameState.players.map(player => (
                        <PlayerArea
                            key={player.id}
                            player={player}
                            isCurrentPlayer={player.id === currentPlayerId}
                            isActive={player.id === gameState.activePlayerId}
                            onCoalitionAccept={player.id !== currentPlayerId ? () => onAcceptCoalition(player.id) : undefined}
                        />
                    ))}
                </PlayersContainer>

                <CenterArea>
                    <MomentumDisplay value={gameState.momentum}>
                        {gameState.momentum}
                    </MomentumDisplay>

                    <PhaseDisplay>
                        Phase: {phaseNames[gameState.phase] || gameState.phase}
                    </PhaseDisplay>

                    <ActionButtons
                        gamePhase={gameState.phase}
                        isActivePlayer={isActivePlayer}
                        canThrowMomentum={canThrowMomentum}
                        canOfferCoalition={canOfferCoalition}
                        canPlayCharacter={canPlayCharacter && !!selectedCard}
                        canPlaySpecial={canPlaySpecial && !!selectedCard}
                        canPlayTrap={canPlayTrap && !!selectedCard}
                        onThrowMomentum={onThrowMomentum}
                        onOfferCoalition={handleCoalitionOffer}
                        onPlayCharacter={() => handleCardPlay('character')}
                        onPlaySpecial={() => handleCardPlay('special')}
                        onPlayTrap={() => handleCardPlay('trap')}
                        onNextPhase={onNextPhase}
                    />
                </CenterArea>

                <GameInfo
                    gameState={gameState}
                    currentPlayerId={currentPlayerId}
                />
            </GameContent>

            <HandContainer>
                <CardHand
                    cards={currentPlayer.hand}
                    selectedCard={selectedCard}
                    onCardSelect={handleCardSelect}
                    gamePhase={gameState.phase}
                />
            </HandContainer>

            {showCoalitionDialog && (
                <CoalitionDialog
                    players={gameState.players.filter(p => p.id !== currentPlayerId)}
                    onSelect={handleCoalitionSelect}
                    onClose={() => setShowCoalitionDialog(false)}
                />
            )}
        </BoardContainer>
    );
};

export default GameBoard;