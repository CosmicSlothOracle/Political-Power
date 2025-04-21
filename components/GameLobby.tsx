'use client';

import React from 'react';
import styled from 'styled-components';
import { GameState, GameSettings, Player } from '../types/gameTypes';
import { SimpleButton } from './SimpleButton';
import { GameSettingsPanel } from './GameSettingsPanel';
import toast from './ToastProvider';
import { useGameController } from '../hooks/useGameController';

interface GameLobbyProps {
  gameState: GameState;
  currentPlayerId: string;
  onLeave: () => Promise<boolean>;
}

const LobbyContainer = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const LobbyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
`;

const GameTitle = styled.h1`
  margin: 0;
  font-size: 28px;
  color: #2c3e50;
`;

const LobbyContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PlayerSection = styled.div`
  h2 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 20px;
  }
`;

const SettingsSection = styled.div`
  h2 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 20px;
  }
`;

const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PlayerItem = styled.div<{ isHost: boolean; isReady: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: ${ props => props.isReady ? '#e6ffed' : '#fff8e6' };
  border: 1px solid ${ props => props.isReady ? '#b7eb8f' : '#ffe58f' };
  border-radius: 5px;

  .player-name {
    font-weight: ${ props => props.isHost ? 'bold' : 'normal' };
  display: flex;
  align-items: center;

    .host-badge {
      background-color: #1890ff;
  color: white;
  font-size: 12px;
      padding: 2px 6px;
      border-radius: 3px;
      margin-left: 8px;
    }
  }

  .status {
    font-size: 14px;
    color: ${ props => props.isReady ? '#52c41a' : '#faad14' };
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
`;

const GameLobby: React.FC<GameLobbyProps> = ({ gameState, currentPlayerId, onLeave }) => {
  const { startGame, updateSettings, isLoading } = useGameController(currentPlayerId);

  // Check if current player is the host (first player in the list)
  const isHost = gameState.players.length > 0 && gameState.players[0].id === currentPlayerId;

  // Get current game settings
  const currentSettings: GameSettings = {
    enableAI: gameState.players.some(p => p.name.includes('AI')),
    aiDifficulty: 'MEDIUM',
    aiPlayerCount: gameState.players.filter(p => p.name.includes('AI')).length,
    mandateThreshold: gameState.mandateThreshold,
    maxRounds: gameState.maxRounds,
    allowCoalitions: true,
    shufflePlayerOrder: true,
    dealInitialCards: 5
  };

  const handleStartGame = async () => {
    if (!isHost) {
      toast.warning('Only the host can start the game');
      return;
    }

    if (gameState.players.length < 2) {
      toast.warning('At least 2 players are needed to start the game');
      return;
    }

    try {
      await startGame();
      toast.success('Game started!');
    } catch (error) {
      console.error('Failed to start game:', error);
      toast.error('Failed to start game');
    }
  };

  const handleSettingsChange = (newSettings: GameSettings) => {
    if (!isHost) {
      toast.warning('Only the host can change game settings');
      return;
    }

    updateSettings(newSettings);
  };

  const handleLeaveGame = async () => {
    try {
      await onLeave();
      toast.info('You left the game');
    } catch (error) {
      console.error('Failed to leave game:', error);
      toast.error('Failed to leave game');
    }
  };

  return (
    <LobbyContainer>
      <LobbyHeader>
        <GameTitle>{gameState.name} - Lobby</GameTitle>
        <SimpleButton
          color="danger"
          onClick={handleLeaveGame}
          disabled={isLoading}
        >
          Leave Game
        </SimpleButton>
      </LobbyHeader>

      <LobbyContent>
        <PlayerSection>
          <h2>Players ({gameState.players.length})</h2>
          <PlayerList>
            {gameState.players.map((player, index) => (
              <PlayerItem
                key={player.id}
                isHost={index === 0}
                isReady={player.isReady}
              >
                <div className="player-name">
                  {player.name} {player.id === currentPlayerId && '(You)'}
                  {index === 0 && <span className="host-badge">Host</span>}
                </div>
                <div className="status">
                      {player.isReady ? 'Ready' : 'Not Ready'}
                </div>
              </PlayerItem>
            ))}
          </PlayerList>

          <ButtonGroup>
            {isHost ? (
              <SimpleButton
                color="primary"
                onClick={handleStartGame}
                disabled={isLoading || gameState.players.length < 2}
              >
                Start Game
              </SimpleButton>
            ) : (
              <div>Waiting for host to start the game...</div>
            )}
          </ButtonGroup>
        </PlayerSection>

        <SettingsSection>
          <h2>Game Settings</h2>
          <GameSettingsPanel
            initialSettings={currentSettings}
            onSettingsChange={handleSettingsChange}
            readOnly={!isHost || isLoading}
          />
        </SettingsSection>
      </LobbyContent>
    </LobbyContainer>
  );
};

export default GameLobby;