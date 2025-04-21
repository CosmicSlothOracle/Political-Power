'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { GameState, Card } from '../types/gameTypes';
import { GameActionService } from '../services/GameActionService';
import SimpleButton from './SimpleButton';

interface GameControlsProps {
    gameState: GameState;
    currentPlayerId: string;
    onCardPlayed?: (cardId: string) => void;
    onCardDrawn?: () => void;
    onTurnEnded?: () => void;
}

const ControlsContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

const ActionsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 140px;
`;

const ActionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #444;
`;

const GameControls: React.FC<GameControlsProps> = ({
    gameState,
    currentPlayerId,
    onCardPlayed,
    onCardDrawn,
    onTurnEnded
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const gameActionService = GameActionService.getInstance();
    const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);

    const isCurrentPlayerTurn = gameState.activePlayerId === currentPlayerId;
    const isGameActive = gameState.status === 'active';

    const handlePlayCard = async (cardId: string) => {
        if (!isCurrentPlayerTurn || !isGameActive) return;

        try {
            setIsLoading(true);
            await gameActionService.playCard(cardId);
            if (onCardPlayed) onCardPlayed(cardId);
        } catch (error) {
            console.error('Failed to play card:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrawCard = async () => {
        if (!isCurrentPlayerTurn || !isGameActive) return;

        try {
            setIsLoading(true);
            await gameActionService.drawCard();
            if (onCardDrawn) onCardDrawn();
        } catch (error) {
            console.error('Failed to draw card:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndTurn = async () => {
        if (!isCurrentPlayerTurn || !isGameActive) return;

        try {
            setIsLoading(true);
            await gameActionService.endTurn();
            if (onTurnEnded) onTurnEnded();
        } catch (error) {
            console.error('Failed to end turn:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Check if the current player can perform actions
    const canDrawCard = isCurrentPlayerTurn && isGameActive;
    const canPlayCard = isCurrentPlayerTurn && isGameActive && currentPlayer && currentPlayer.hand.length > 0;
    const canEndTurn = isCurrentPlayerTurn && isGameActive;

    return (
        <ControlsContainer>
            <ActionsGroup>
                <ActionTitle>Card Actions</ActionTitle>
                {canPlayCard && currentPlayer?.hand.map(cardId => (
                    <SimpleButton
                        key={cardId}
                        onClick={() => handlePlayCard(cardId)}
                        disabled={isLoading || !canPlayCard}
                    >
                        Play Card {cardId.substring(0, 6)}...
                    </SimpleButton>
                ))}
                <SimpleButton
                    onClick={handleDrawCard}
                    disabled={isLoading || !canDrawCard}
                >
                    Draw Card
                </SimpleButton>
            </ActionsGroup>

            <ActionsGroup>
                <ActionTitle>Turn Actions</ActionTitle>
                <SimpleButton
                    onClick={handleEndTurn}
                    disabled={isLoading || !canEndTurn}
                >
                    End Turn
                </SimpleButton>
            </ActionsGroup>
        </ControlsContainer>
    );
};

export default GameControls;