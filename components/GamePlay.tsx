'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import GameBoard from './GameBoard';
import GameLobby from './GameLobby';
import LoadingSpinner from './LoadingSpinner';
import { SimpleButton } from './SimpleButton';
import { GameState, GameStatus, GamePhase } from '../types/gameTypes';
import { useGameController } from '../hooks/useGameController';
import toast from './ToastProvider';

const GamePlayContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
`;

const GameTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  color: #2c3e50;
`;

const GameStatus = styled.span<{ status: GameStatus }>`
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${ props => {
        switch (props.status) {
            case 'lobby': return '#e6f7ff';
            case 'starting': return '#fff7e6';
            case 'active': return '#f6ffed';
            case 'completed': return '#f9f0ff';
            default: return '#f5f5f5';
        }
    } };
  color: ${ props => {
        switch (props.status) {
            case 'lobby': return '#1890ff';
            case 'starting': return '#fa8c16';
            case 'active': return '#52c41a';
            case 'completed': return '#722ed1';
            default: return '#8c8c8c';
        }
    } };
  margin-left: 10px;
`;

const GameInfo = styled.div`
  display: flex;
  align-items: center;
`;

const GameOver = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const GameOverContent = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  max-width: 500px;
`;

const WinnerHeading = styled.h2`
  font-size: 28px;
  margin-bottom: 20px;
  color: #1890ff;
`;

const GameStats = styled.div`
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: left;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
    padding-top: 8px;
    border-top: 1px solid #ddd;
    font-weight: bold;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
`;

const CenteredMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  text-align: center;

  h2 {
    margin-bottom: 20px;
    color: #2c3e50;
  }

  p {
    color: #7f8c8d;
    margin-bottom: 30px;
    max-width: 600px;
  }
`;

interface GamePlayProps {
    gameId: string;
}

const GamePlay: React.FC<GamePlayProps> = ({ gameId }) => {
    const router = useRouter();

    // Mock user ID for development
    const userId = `user-${ Date.now() }`;

    // Use our game controller hook
    const {
        gameState,
        gamePhase,
        gameStatus,
        isLoading,
        error,
        joinGame,
        leaveGame,
        startGame,
        processCurrentPhase,
    } = useGameController(userId);

    // UI state
    const [showGameOver, setShowGameOver] = useState(false);

    // Automatically join the game when component mounts
    useEffect(() => {
        const autoJoinGame = async () => {
            if (!gameState && gameId) {
                try {
                    // Auto-generate a player name
                    const playerName = `Player ${ userId.substring(0, 4) }`;
                    await joinGame(gameId, playerName);
                } catch (err) {
                    console.error('Failed to join game:', err);
                    toast.error('Failed to join game');
                }
            }
        };

        autoJoinGame();

        // Clean up when component unmounts
        return () => {
            if (gameState) {
                leaveGame();
            }
        };
    }, [gameId, userId, gameState, joinGame, leaveGame]);

    // Show game over screen when game is completed
    useEffect(() => {
        if (gameState && gameState.status === 'completed') {
            setShowGameOver(true);
        }
    }, [gameState]);

    // Handle leaving the game
    const handleLeaveGame = async () => {
        try {
            const success = await leaveGame();
            if (success) {
        router.push('/games');
                toast.info('You left the game');
            }
        } catch (error) {
            console.error('Failed to leave game:', error);
            toast.error('Failed to leave game');
        }
    };

    // Handle returning to lobby after game ends
    const handleReturnToLobby = () => {
        setShowGameOver(false);
        router.push('/games');
    };

    // Render loading state
    if (isLoading && !gameState) {
        return (
            <GamePlayContainer>
                <CenteredMessage>
                    <LoadingSpinner />
                    <p>Loading game...</p>
                </CenteredMessage>
            </GamePlayContainer>
        );
    }

    // Render error state
    if (error) {
        return (
            <GamePlayContainer>
                <CenteredMessage>
                    <h2>Error</h2>
                <p>{error}</p>
                    <SimpleButton color="primary" onClick={() => router.push('/games')}>
                        Return to Games
                    </SimpleButton>
                </CenteredMessage>
            </GamePlayContainer>
        );
    }

    // Render placeholder if no game state is available
    if (!gameState) {
    return (
        <GamePlayContainer>
                <CenteredMessage>
                    <h2>Game Not Found</h2>
                    <p>The game you're looking for doesn't exist or is no longer available.</p>
                    <SimpleButton color="primary" onClick={() => router.push('/games')}>
                        Return to Games
                    </SimpleButton>
                </CenteredMessage>
            </GamePlayContainer>
        );
    }

    // Render game over screen
    if (showGameOver) {
        const winner = gameState.players.find(p => p.id === gameState.winner);

        return (
                <GameOver>
                    <GameOverContent>
                        <WinnerHeading>
                        {winner ? `${ winner.name } Wins!` : "Game Over!"}
                        </WinnerHeading>

                    <p>
                        {winner
                            ? `${ winner.name } has reached the mandate threshold of ${ gameState.mandateThreshold }!`
                            : "The game has ended with no clear winner."}
                    </p>

                        <GameStats>
                        <h3>Final Scores</h3>
                            {gameState.players.map(player => (
                            <StatItem key={player.id}>
                                <span>{player.name}</span>
                                <span>{player.influence} Influence</span>
                                </StatItem>
                            ))}
                        </GameStats>

                        <ButtonGroup>
                        <SimpleButton color="secondary" onClick={handleReturnToLobby}>
                            Return to Lobby
                        </SimpleButton>
                        </ButtonGroup>
                    </GameOverContent>
                </GameOver>
        );
    }

    // If in lobby phase, render the lobby
    if (gameState.status === 'lobby') {
        return (
            <GameLobby
                gameState={gameState}
                currentPlayerId={userId}
                onLeave={handleLeaveGame}
            />
        );
    }

    // Render the main game
    return (
        <GamePlayContainer>
            <GameHeader>
                <GameInfo>
                    <GameTitle>{gameState.name}</GameTitle>
                    <GameStatus status={gameState.status}>{gameState.status}</GameStatus>
                </GameInfo>

                <SimpleButton color="danger" onClick={handleLeaveGame}>
                    Leave Game
                </SimpleButton>
            </GameHeader>

            <GameBoard
                gameState={gameState}
                currentPlayerId={userId}
            />
        </GamePlayContainer>
    );
}

export default GamePlay;