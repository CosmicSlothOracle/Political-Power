import React from 'react';
import styled from 'styled-components';
import { GameState, Player } from '../types/gameTypes';

interface PlayerInfoPanelProps {
    gameState: GameState;
    userId: string;
    className?: string;
}

const Container = styled.div`
    background-color: #2d3748;
    border-radius: 8px;
    padding: 1.5rem;
    color: white;
    margin-bottom: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid #4a5568;
    padding-bottom: 0.75rem;
`;

const Title = styled.h2`
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
`;

const Badge = styled.span<{ active?: boolean }>`
    background-color: ${ props => props.active ? '#4299e1' : '#718096' };
    color: white;
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-weight: 500;
`;

const InfoRow = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;

    &:last-child {
        margin-bottom: 0;
    }
`;

const Label = styled.span`
    color: #a0aec0;
    font-size: 0.875rem;
`;

const Value = styled.span`
    font-weight: 500;
`;

const PlayerInfoPanel: React.FC<PlayerInfoPanelProps> = ({ gameState, userId, className }) => {
    // Find the current player
    const currentPlayer = gameState.players.find(p => p.id === userId);

    // Find the active player
    const activePlayer = gameState.players.find(p => p.id === gameState.activePlayerId);

    // Format the phase display
    const formatPhase = (phase: string): string => {
        return phase.charAt(0).toUpperCase() + phase.slice(1);
    };

    // Calculate the player's current influence
    const calculateInfluence = (player: Player): number => {
        if (!player) return 0;
        return player.influence + player.influenceModifier;
    };

    return (
        <Container className={className}>
            <Header>
                <Title>Game Status</Title>
                <Badge active={gameState.status === 'active'}>
                    {gameState.status.toUpperCase()}
                </Badge>
            </Header>

            <InfoRow>
                <Label>Round:</Label>
                <Value>{gameState.round} / {gameState.maxRounds}</Value>
            </InfoRow>

            <InfoRow>
                <Label>Phase:</Label>
                <Value>{formatPhase(gameState.phase)}</Value>
            </InfoRow>

            <InfoRow>
                <Label>Current Player:</Label>
                <Value>
                    {activePlayer ? activePlayer.name : 'None'}
                    {activePlayer && activePlayer.id === userId && ' (You)'}
                </Value>
            </InfoRow>

            <InfoRow>
                <Label>Mandate Threshold:</Label>
                <Value>{gameState.mandateThreshold}%</Value>
            </InfoRow>

            {currentPlayer && (
                <>
                    <Header>
                        <Title>Your Status</Title>
                        <Badge active={gameState.activePlayerId === userId}>
                            {gameState.activePlayerId === userId ? 'YOUR TURN' : 'WAITING'}
                        </Badge>
                    </Header>

                    <InfoRow>
                        <Label>Influence:</Label>
                        <Value>{calculateInfluence(currentPlayer)}</Value>
                    </InfoRow>

                    <InfoRow>
                        <Label>Cards in Hand:</Label>
                        <Value>{currentPlayer.hand.length}</Value>
                    </InfoRow>

                    <InfoRow>
                        <Label>Cards Played:</Label>
                        <Value>{currentPlayer.played.length}</Value>
                    </InfoRow>
                </>
            )}
        </Container>
    );
};

export default PlayerInfoPanel;