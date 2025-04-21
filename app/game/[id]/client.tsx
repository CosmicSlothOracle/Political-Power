'use client'

import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import toast from '../../../components/ToastProvider'
import GamePlay from '../../../components/GamePlay'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { SimpleButton } from '../../../components/SimpleButton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, GameState, GameSettings, GamePhase } from '../../../types/gameTypes'
import GameBoard from '../../../components/GameBoard'
import GameLobby from '../../../components/GameLobby'
import useSocket from '../../../hooks/useSocket'
import GameControlsComponent from '../../../components/GameControls'
import GameLog from '../../../components/GameLog'
import { CardUtils } from '../../../game/CardUtils'
import PoliticalCard from '../../../components/PoliticalCard'
import { useGameController } from '../../../hooks/useGameController'
import { GameSettingsPanel } from '../../../components/GameSettingsPanel'
import { Spinner } from '../../../components/Spinner'
import PlayerHand from '../../../components/PlayerHand'
import cardService from '../../../services/CardService'
import { SimpleButton as Button } from '../../../components/SimpleButton'
import GameDebugPanel from '../../../components/GameDebugPanel'
import { validateTestUser } from '../../../util/testHelpers'
import PlayerInfoPanel from '../../../components/PlayerInfoPanel'
import { processPhase } from '../../../game/GameEngine'
import { DeckManager } from '../../../game/DeckManager'

const GameContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #1a1a2e;
`

const ErrorContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  background-color: #1a1a2e;
  color: white;

  h2 {
    margin-bottom: 20px;
  }
`

const CenteredContainer = styled.div`
  background-color: #1a1a2e;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ddd;
`

const GameInfo = styled.div`
  h1 {
    margin: 0 0 8px 0;
    font-size: 24px;
  }

  p {
    margin: 0;
    color: #666;
  }
`

const GameMain = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const GameSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const PlayersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const PlayerCard = styled.div<{ active: boolean }>`
  padding: 12px;
  background-color: ${ props => props.active ? '#e6f7ff' : '#f9f9f9' };
  border: 1px solid ${ props => props.active ? '#1890ff' : '#ddd' };
  border-radius: 8px;

  h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #666;
  }
`

const GameContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const HandContainer = styled.div`
  h2 {
    margin: 0 0 12px 0;
    font-size: 18px;
  }
`

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
`

const PlayedCards = styled.div`
  h2 {
    margin: 0 0 12px 0;
    font-size: 18px;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`

const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: #f0f2f5;
`

const GameTitle = styled.h1`
  font-size: 1.5rem;
  margin: 0;
`

const SettingsButton = styled.button`
  background-color: #4a5568;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-left: auto;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2d3748;
  }
`

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`

const GamePlayContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 2rem;
`

const CenterBoard = styled.div`
  background-color: #2d3748;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const PlayedCardsArea = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  min-height: 200px;
  background-color: #1a202c;
  border-radius: 8px;
`;

const PlayerHandArea = styled.div`
  width: 100%;
`;

const GameControlsWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

// Add GameSummaryPanel interface and component
interface GameSummaryPanelProps {
    gameState: GameState;
    players: any[];
    onPlayAgain: () => void;
    onReturnToLobby: () => void;
}

const GameSummaryPanel: React.FC<GameSummaryPanelProps> = ({
    gameState,
    players,
    onPlayAgain,
    onReturnToLobby
}) => {
    const winner = players.find(p => p.id === gameState.winner);

    // Sort players by influence count in descending order
    const sortedPlayers = [...players].sort((a, b) =>
        (b.influence || 0) - (a.influence || 0)
    );

    return (
        <Modal onClick={(e) => e.stopPropagation()}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <h2>Game Over</h2>

                {winner && (
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                        <h3>{winner.name} Wins!</h3>
                        <p>With {winner.influence} influence</p>
                    </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                    <h3>Final Standings</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {sortedPlayers.map((player, index) => (
                            <div key={player.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '10px',
                                backgroundColor: player.id === gameState.winner ? '#4caf5030' : '#f5f5f5',
                                borderRadius: '4px'
                            }}>
                                <div>
                                    <strong>{index + 1}. {player.name}</strong>
                                    {player.isAI && <span> (AI)</span>}
                                </div>
                                <div>
                                    <strong>{player.influence || 0}</strong> influence
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px',
                    marginTop: '20px'
                }}>
                    <Button onClick={onPlayAgain}>
                        Play Again
                    </Button>
                    <Button onClick={onReturnToLobby}>
                        Return to Lobby
                    </Button>
                </div>
            </ModalContent>
        </Modal>
    );
};

// Define simple function to add log entries
const addGameLogEntry = (state: GameState, message: string, type: 'info' | 'action' | 'system' | 'error' | 'game' = 'info'): GameState => {
    return {
        ...state,
        log: [
            ...state.log,
            {
                timestamp: Date.now(),
                message,
                type
            }
        ]
    };
};

export default function GameClient({ id }: { id: string }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timeoutOccurred, setTimeoutOccurred] = useState(false)
    const [forceMockMode, setForceMockMode] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [isHost, setIsHost] = useState(false)
    const [selectedCard, setSelectedCard] = useState<Card | null>(null)
    const [showCardDetails, setShowCardDetails] = useState<boolean>(false)
    const [showDebugPanel, setShowDebugPanel] = useState(process.env.NODE_ENV === 'development')
    const [userId, setUserId] = useState('')

    // Get a persistent user ID for testing
    useEffect(() => {
        const persistentUserId = validateTestUser()
        setUserId(persistentUserId)
        console.log("Game client using user ID:", persistentUserId)
    }, [])

    // Get the socket connection
    const { socket, connected, error: socketError } = useSocket(userId)

    // Use the game controller once we have a valid userId
    const {
        gameState: controllerGameState,
        isLoading: gameControllerLoading,
        error: gameControllerError,
        joinGame,
        leaveGame,
        startGame,
        playCard,
        drawCard,
        endTurn,
        updateGameSettings,
        setGameState,
    } = useGameController(userId)

    // Update local game state when controller state changes
    useEffect(() => {
        if (controllerGameState && typeof setGameState === 'function') {
            setGameState(controllerGameState)
        }
    }, [controllerGameState, setGameState])

    const [handCards, setHandCards] = useState<Card[]>([])
    const [playedCards, setPlayedCards] = useState<Card[]>([])
    const [isInitializing, setIsInitializing] = useState(true)

    useEffect(() => {
        const initGame = async () => {
            try {
                if (!controllerGameState && id && userId) {
                    // Use a default player name based on user ID
                    const playerName = `Player ${ userId.substring(0, 4) }`

                    // Join the game using the controller
                    await joinGame(id, playerName)
                }
            } catch (error) {
                console.error('Failed to join game:', error)
                toast.error('Failed to join game')
            } finally {
                setIsInitializing(false)
            }
        }

        initGame()

        // Clean up on unmount
        return () => {
            leaveGame()
        }
    }, [id, userId, controllerGameState, joinGame, leaveGame])

    // Update card displays when game state changes
    useEffect(() => {
        if (controllerGameState) {
            // Find the current player
            const currentPlayer = controllerGameState.players.find(p => p.id === userId)

            if (currentPlayer) {
                // Get the player's hand cards
                const playerHandCards = currentPlayer.hand.map(cardId => {
                    // Find the card from all available cards in decks
                    for (const player of controllerGameState.players) {
                        const cardFromDeck = player.deck.cards.find(card => card.id === cardId)
                        if (cardFromDeck) return cardFromDeck
                    }
                    return null
                }).filter(card => card !== null) as Card[]

                // Get the player's played cards
                const playerPlayedCards = currentPlayer.played.map(cardId => {
                    // Find the card from all available cards in decks
                    for (const player of controllerGameState.players) {
                        const cardFromDeck = player.deck.cards.find(card => card.id === cardId)
                        if (cardFromDeck) return cardFromDeck
                    }
                    return null
                }).filter(card => card !== null) as Card[]

                setHandCards(playerHandCards)
                setPlayedCards(playerPlayedCards)
            }
        }
    }, [controllerGameState, userId])

    useEffect(() => {
        if (socket && id) {
            joinGame(id)
        }

        return () => {
            if (socket) {
                leaveGame()
            }
        }
    }, [socket, id])

    useEffect(() => {
        // Check if the current player is the host
        if (controllerGameState && userId) {
            const currentPlayer = controllerGameState.players.find(p => p.id === userId)
            setIsHost(currentPlayer?.isHost || false)
        }
    }, [controllerGameState, userId])

    const handleCardClick = (card: Card) => {
        if (!controllerGameState) return

        // Find the current player
        const currentPlayer = controllerGameState.players.find(p => p.id === userId)

        // Check if it's the player's turn and they can play this card
        if (currentPlayer && controllerGameState.activePlayerId === userId && CardUtils.canPlayCard(card, currentPlayer)) {
            // In a full implementation, this would trigger card play through the controller
            console.log('Playing card:', card)
            toast.info(`Playing card: ${ card.name }`)
        } else {
            toast.warning("It's not your turn or you can't play this card")
        }
    }

    useEffect(() => {
        const fetchGame = async () => {
            try {
                setIsLoading(true)
                setError(null)

                // Development mode - set a very short timeout to bypass loading issues
                if (process.env.NODE_ENV === 'development') {
                    console.log('Development mode detected - using shortened timeout')
                    const devTimeoutId = setTimeout(() => {
                        console.log('Development mode - forcing mock mode')
                        setIsLoading(false)
                        setForceMockMode(true)
                    }, 2000) // Short 2 second timeout for development

                    return () => clearTimeout(devTimeoutId)
                }

                // Add a timeout to handle stalled loading for production
                const timeoutId = setTimeout(() => {
                    console.log('Loading timeout occurred')
                    setTimeoutOccurred(true)
                    setIsLoading(false)
                    toast.error('Game is taking too long to load. The server might be busy or there might be connection issues.')
                }, 5000) // 5 second timeout

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000))

                // Clear the timeout if the game loads successfully
                clearTimeout(timeoutId)

                // Check if the ID exists and is valid
                if (id && id.startsWith('game')) {
                    setIsLoading(false)
                } else {
                    throw new Error('Game not found')
                }
            } catch (err) {
                console.error('Failed to load game:', err)
                toast.error('Failed to load game')
                setIsLoading(false)
            }
        }

        fetchGame()
    }, [id])

    // Helper function to return to the games list
    const handleReturnToGames = () => {
        router.push('/games')
    }

    const handleCardPlay = (card: Card) => {
        if (controllerGameState && userId) {
            playCard(card.id)
        }
    }

    // Unified function to handle drawing a card
    const handleDeckDraw = useCallback(() => {
        if (!controllerGameState || !userId) return;

        // Use the existing gameController function if possible
        if (drawCard) {
            drawCard();
            return;
        }

        // Otherwise handle it directly
        const activePlayer = controllerGameState.players.find(p => p.id === controllerGameState.activePlayerId);
        if (!activePlayer || activePlayer.id !== userId) {
            console.log('Not your turn to draw a card');
            return;
        }

        console.log('Player drawing a card');

        try {
            // Draw a card for the active player
            const result = DeckManager.drawCards(controllerGameState.deck, 1);

            // Create a copy of the game state to avoid mutation
            const updatedGameState = {
                ...controllerGameState,
                deck: result.updatedDeck,
                players: controllerGameState.players.map(player => {
                    if (player.id === activePlayer.id) {
                        return {
                            ...player,
                            handIds: [...(player.handIds || []), ...result.drawnCardIds]
                        };
                    }
                    return player;
                })
            };

            // Add a new log entry
            const updatedStateWithLog = {
                ...updatedGameState,
                log: [
                    ...updatedGameState.log,
                    {
                        timestamp: Date.now(),
                        message: `${ activePlayer.name } draws a card`,
                        type: 'game'
                    }
                ]
            };

            // Update local state immediately
            setGameState(updatedStateWithLog);

            // Send the updated game state to the server
            socket.emit('update_game_state', {
                gameId: id,
                gameState: updatedStateWithLog
            });
        } catch (error) {
            console.error('Error drawing card:', error);
            toast.error('An error occurred while drawing a card');
        }
    }, [controllerGameState, id, socket, userId, setGameState, drawCard]);

    // Unified function to handle ending a turn
    const handleEndTurn = useCallback(() => {
        if (!controllerGameState || !userId) return;

        // Use the existing gameController function if possible
        if (endTurn) {
            endTurn();
            return;
        }

        console.log('Player ending turn');

        // Get active player's name
        const activePlayer = controllerGameState.players.find(p => p.id === controllerGameState.activePlayerId);
        const activePlayerName = activePlayer ? activePlayer.name : 'Player';

        try {
            // First process the effect phase to apply card effects
            let updatedGameState = processPhase(controllerGameState, 'effect');

            // Then process the resolution phase to move to the next player
            updatedGameState = processPhase(updatedGameState, 'resolution');

            // Add a log entry
            updatedGameState = {
                ...updatedGameState,
                log: [
                    ...updatedGameState.log,
                    {
                        timestamp: Date.now(),
                        message: `${ activePlayerName } ends their turn`,
                        type: 'game'
                    }
                ]
            };

            // Update local state immediately
            setGameState(updatedGameState);

            // Send the updated game state to the server
            socket.emit('update_game_state', {
                gameId: id,
                gameState: updatedGameState
            });
        } catch (error) {
            console.error('Error processing turn:', error);
            toast.error('An error occurred while processing your turn');
        }
    }, [controllerGameState, id, socket, userId, setGameState, endTurn]);

    const handleSettingsSave = (updatedSettings: GameSettings) => {
        if (isHost && controllerGameState) {
            updateGameSettings(updatedSettings)
            setShowSettings(false)
        }
    }

    // Find the current player based on userId
    const playerData = controllerGameState?.players.find(player => player.id === userId) || null;
    const isActivePlayer = controllerGameState?.activePlayerId === userId;

    // Handle playing a card
    const handlePlayCard = async (cardId: string) => {
        if (!controllerGameState || !isActivePlayer) return;

        try {
            // Call your game action service to play the card
            await socket.emit('play-card', {
                gameId: id,
                cardId
            });

            // Card play is handled by the server and will update the game state
        } catch (error) {
            console.error('Error playing card:', error);
            setError('Failed to play card. Please try again.');
        }
    };

    // Handle viewing card details
    const handleViewCardDetails = (card: Card) => {
        setSelectedCard(card);
        setShowCardDetails(true);
    };

    // Close card details modal
    const closeCardDetails = () => {
        setShowCardDetails(false);
    };

    // Add this within the return statement before the final closing bracket, just after the showCardDetails modal
    const handlePlayAgain = () => {
        socket.emit('restart_game', { gameId: id });
    };

    const handleReturnToLobby = () => {
        socket.emit('return_to_lobby', { gameId: id });
    };

    // Add a function to process a specific game phase
    const handleProcessPhase = useCallback((phase: GamePhase) => {
        if (!controllerGameState) return;

        console.log(`Processing phase: ${ phase }`);
        const updatedGameState = processPhase(controllerGameState, phase);

        // Update local state immediately for better UX
        setGameState(updatedGameState);

        // Send the updated game state to the server
        socket.emit('update_game_state', {
            gameId: id,
            gameState: updatedGameState
        });
    }, [controllerGameState, id, socket, setGameState]);

    if (isLoading && isInitializing) {
        return (
            <CenteredContainer>
                <LoadingSpinner />
                <div style={{ color: 'white', marginTop: '20px' }}>Loading game...</div>
                {showDebugPanel && <GameDebugPanel
                    gameState={controllerGameState}
                    userId={userId}
                    onProcessPhase={handleProcessPhase}
                    onDrawCard={handleDeckDraw}
                    onEndTurn={handleEndTurn}
                />}
            </CenteredContainer>
        )
    }

    if (forceMockMode) {
        console.log('Rendering in forced mock mode')
        return (
            <GameContainer>
                <GamePlay id={id} />
            </GameContainer>
        )
    }

    if (error || timeoutOccurred) {
        return (
            <ErrorContainer>
                <h2>Error</h2>
                <p>{error || 'Game is taking too long to load.'}</p>
                <div style={{ marginTop: '20px' }}>
                    <Link href="/games">
                        <SimpleButton color="danger">Return to Games</SimpleButton>
                    </Link>
                </div>
                {showDebugPanel && <GameDebugPanel
                    gameState={controllerGameState}
                    userId={userId}
                    onProcessPhase={handleProcessPhase}
                    onDrawCard={handleDeckDraw}
                    onEndTurn={handleEndTurn}
                />}
            </ErrorContainer>
        )
    }

    if (!controllerGameState) {
        return (
            <CenteredContainer>
                <div>Game not found or still loading...</div>
                <div style={{ marginTop: '20px' }}>
                    <Link href="/games">
                        <SimpleButton color="primary">Return to Games</SimpleButton>
                    </Link>
                </div>
                {showDebugPanel && <GameDebugPanel
                    gameState={controllerGameState}
                    userId={userId}
                    onProcessPhase={handleProcessPhase}
                    onDrawCard={handleDeckDraw}
                    onEndTurn={handleEndTurn}
                />}
            </CenteredContainer>
        )
    }

    const playerInfo = controllerGameState.players.find(p => p.id === userId)
    const isMyTurn = controllerGameState.activePlayerId === userId

    // Show lobby if game has not started yet
    if (controllerGameState.status === 'lobby') {
        return (
            <GameContainer>
                <GameLobby
                    gameState={controllerGameState}
                    currentPlayerId={userId}
                    onLeave={leaveGame}
                />
                {showDebugPanel && <GameDebugPanel
                    gameState={controllerGameState}
                    userId={userId}
                    onProcessPhase={handleProcessPhase}
                    onDrawCard={handleDeckDraw}
                    onEndTurn={handleEndTurn}
                />}
            </GameContainer>
        )
    }

    return (
        <GameContainer>
            {isLoading ? (
                <LoadingSpinner />
            ) : error ? (
                <div>{error}</div>
            ) : (
                <GameWrapper>
                    <GameHeader>
                        <GameInfo>
                            <h1>Game: {controllerGameState?.name}</h1>
                            <PlayerInfoPanel
                                gameState={controllerGameState}
                                userId={userId}
                            />
                            {isHost && (
                                <SettingsButton onClick={() => setShowSettings(true)}>
                                    Game Settings
                                </SettingsButton>
                            )}
                        </GameInfo>
                        <SimpleButton onClick={() => leaveGame()}>
                            Leave Game
                        </SimpleButton>
                    </GameHeader>

                    <MainContent>
                        <GamePlayContainer>
                            <CenterBoard>
                                <h2>Played Cards</h2>
                                <PlayedCardsArea>
                                </PlayedCardsArea>
                            </CenterBoard>

                            {playerInfo && (
                                <PlayerHandArea>
                                    <PlayerHand
                                        player={playerInfo}
                                        isActivePlayer={isActivePlayer}
                                        onPlayCard={handlePlayCard}
                                        onViewCardDetails={handleViewCardDetails}
                                    />
                                </PlayerHandArea>
                            )}
                        </GamePlayContainer>
                    </MainContent>

                    <GameControlsWrapper>
                        <Button
                            disabled={!isActivePlayer}
                            onClick={handleDeckDraw}
                        >
                            Draw Card
                        </Button>
                        <Button
                            disabled={!isActivePlayer}
                            onClick={handleEndTurn}
                        >
                            End Turn
                        </Button>
                    </GameControlsWrapper>

                    {showSettings && (
                        <Modal onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}>
                            <ModalContent onClick={(e) => e.stopPropagation()}>
                                <GameSettingsPanel
                                    initialSettings={{
                                        mandateThreshold: controllerGameState.mandateThreshold,
                                        maxRounds: controllerGameState.maxRounds,
                                        initialCards: 5,
                                        aiPlayers: controllerGameState.players
                                            .filter(player => player.isAI)
                                            .map(player => ({
                                                name: player.name,
                                                difficulty: player.aiDifficulty || 'MEDIUM'
                                            }))
                                    }}
                                    readOnly={controllerGameState.status !== 'LOBBY'}
                                    onSettingsChange={(newSettings) => console.log('Settings changed:', newSettings)}
                                    onSave={(settings) => {
                                        // Send updated settings to server
                                        socket.emit('update_game_settings', {
                                            gameId: id,
                                            settings
                                        });
                                        setShowSettings(false);
                                    }}
                                />
                                <ButtonRow>
                                    <Button onClick={() => setShowSettings(false)}>Close</Button>
                                </ButtonRow>
                            </ModalContent>
                        </Modal>
                    )}

                    {showCardDetails && selectedCard && (
                        <Modal onClick={closeCardDetails}>
                            <ModalContent onClick={e => e.stopPropagation()}>
                                <h2>{selectedCard.name}</h2>
                                <p>Type: {selectedCard.type}</p>
                                <p>Country: {selectedCard.country || 'Global'}</p>
                                <p>Influence: {selectedCard.influence}</p>
                                <p>Effect: {selectedCard.effect}</p>
                                <p>Description: {selectedCard.description}</p>
                                <Button onClick={closeCardDetails}>Close</Button>
                            </ModalContent>
                        </Modal>
                    )}

                    {controllerGameState.status === 'completed' && (
                        <GameSummaryPanel
                            gameState={controllerGameState}
                            players={controllerGameState.players}
                            onPlayAgain={handlePlayAgain}
                            onReturnToLobby={handleReturnToLobby}
                        />
                    )}
                </GameWrapper>
            )}
            {showDebugPanel && <GameDebugPanel
                gameState={controllerGameState}
                userId={userId}
                onProcessPhase={handleProcessPhase}
                onDrawCard={handleDeckDraw}
                onEndTurn={handleEndTurn}
            />}
        </GameContainer>
    )
}