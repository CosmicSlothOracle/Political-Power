import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { GameState, Player } from '../types/gameTypes';

interface GameStateDisplayProps {
    gameState: GameState;
    currentUserId: string;
}

const Container = styled.div`
  background-color: rgba(44, 62, 80, 0.9);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  color: white;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 8px;
`;

const StateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StateSection = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 0.9rem;
  margin-bottom: 8px;
  opacity: 0.8;
`;

const MomentumContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const MomentumBar = styled.div`
  height: 12px;
  flex-grow: 1;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  overflow: hidden;
  margin: 0 10px;
`;

const MomentumFill = styled.div<{ level: number }>`
  height: 100%;
  width: ${ props => (props.level * 20) }%;
  background: linear-gradient(90deg, #3498db, #9b59b6);
  border-radius: 6px;
  transition: width 0.5s ease;
`;

const MomentumLabel = styled.div`
  font-size: 0.8rem;
  width: 25px;
  text-align: center;
`;

const CoalitionItem = styled(motion.div)`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CoalitionPlayers = styled.div`
  font-size: 0.9rem;
`;

const CoalitionStatus = styled.div<{ active: boolean }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  background-color: ${ props => props.active ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)' };
`;

const PlayerItem = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
`;

const PlayerName = styled.div<{ isCurrentUser: boolean }>`
  font-weight: ${ props => props.isCurrentUser ? 'bold' : 'normal' };
  color: ${ props => props.isCurrentUser ? '#3498db' : 'white' };
`;

const MandateCounter = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const MandateIcon = styled.div`
  width: 16px;
  height: 16px;
  background-color: #f1c40f;
  border-radius: 50%;
`;

const GamePhaseDisplay = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 12px;
  text-align: center;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 1px;
`;

const RoundCounter = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 10px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
`;

const GameStateDisplay: React.FC<GameStateDisplayProps> = ({ gameState, currentUserId }) => {
    const getPhaseDisplay = (phase: string): string => {
        switch (phase) {
            case 'drawing': return 'Drawing Phase';
            case 'playing': return 'Playing Phase';
            case 'revealing': return 'Revealing Phase';
            case 'resolving': return 'Resolving Phase';
            case 'interim': return 'Interim Phase';
            default: return phase;
        }
    };

    return (
        <Container>
            <Title>Game State</Title>

            <GamePhaseDisplay>{getPhaseDisplay(gameState.phase)}</GamePhaseDisplay>

            <StateGrid>
                <StateSection>
                    <SectionTitle>MOMENTUM (LEVEL {gameState.momentumLevel})</SectionTitle>
                    <MomentumContainer>
                        <MomentumLabel>Low</MomentumLabel>
                        <MomentumBar>
                            <MomentumFill level={gameState.momentumLevel} />
                        </MomentumBar>
                        <MomentumLabel>High</MomentumLabel>
                    </MomentumContainer>

                    <SectionTitle>ACTIVE COALITIONS</SectionTitle>
                    {gameState.coalitions.length > 0 ? (
                        gameState.coalitions.map((coalition, index) => {
                            const player1 = gameState.players.find(p => p.userId === coalition.player1Id);
                            const player2 = gameState.players.find(p => p.userId === coalition.player2Id);

                            return (
                                <CoalitionItem
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <CoalitionPlayers>
                                        {player1?.username || 'Player 1'} & {player2?.username || 'Player 2'}
                                    </CoalitionPlayers>
                                    <CoalitionStatus active={coalition.active}>
                                        {coalition.active ? 'Active' : 'Broken'}
                                    </CoalitionStatus>
                                </CoalitionItem>
                            );
                        })
                    ) : (
                        <div style={{ opacity: 0.7, fontSize: '0.9rem', fontStyle: 'italic' }}>
                            No coalitions formed yet
                        </div>
                    )}
                </StateSection>

                <StateSection>
                    <SectionTitle>PLAYERS & MANDATES</SectionTitle>
                    {gameState.players.map((player, index) => (
                        <PlayerItem key={index}>
                            <PlayerName isCurrentUser={player.userId === currentUserId}>
                                {player.username}
                                {player.userId === gameState.activePlayerId && ' (Active)'}
                            </PlayerName>
                            <MandateCounter>
                                <MandateIcon />
                                <span>{player.mandates} / {gameState.mandateThreshold}</span>
                            </MandateCounter>
                        </PlayerItem>
                    ))}

                    <SectionTitle>GAME PROGRESS</SectionTitle>
                    <RoundCounter>
                        Round {gameState.round} of {gameState.maxRounds}
                    </RoundCounter>
                </StateSection>
            </StateGrid>
        </Container>
    );
};

export default GameStateDisplay;