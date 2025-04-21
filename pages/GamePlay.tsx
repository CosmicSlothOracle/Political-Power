import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import GameBoard from '../components/GameBoard';
import GameLobby from '../components/GameLobby';
import LoadingSpinner from '../components/LoadingSpinner';
import socketService from '../services/socketService';
import { GameState, Card } from '../types/gameTypes';

// Mock initial game state for development
const initialGameState: GameState = {
    gameId: 'game123',
    status: 'lobby',
    phase: 'drawing',
    players: [
        {
            userId: 'user1',
            username: 'Player 1',
            deckId: 'deck1',
            hand: [],
            playedCard: null,
            mandates: 0,
            isReady: false,
            isConnected: true,
            coalition: null,
            lastRoll: null
        }
    ],
    hostId: 'user1',
    round: 0,
    momentumLevel: 1,
    activePlayerId: null,
    mandateThreshold: 8,
    maxPlayers: 2,
    maxRounds: 10,
    created: new Date().toISOString(),
    log: [
        {
            text: 'Game created. Waiting for players...',
            timestamp: new Date().toISOString(),
            type: 'system'
        }
    ],
    coalitions: [],
    centerCards: []
};

const GamePlayContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #1a1a2e;
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
  color: #1a73e8;
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

const GamePlay: React.FC = () => {
    const { id: gameId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // In a real app, you would get these from Redux store
    // const { currentGame, isLoading, error } = useSelector(state => state.games);
    // const { user } = useSelector(state => state.auth);

    // For development, we're using local state
    const [gameState, setGameState] = useState<GameState>(initialGameState);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showGameOver, setShowGameOver] = useState(false);

    // Mock current user
    const currentUser = {
        id: 'user1',
        username: 'Player 1'
    };

    useEffect(() => {
        // In a real app, you would fetch the game from the server and connect to socket
        // dispatch(getGameById(gameId));

        // For development, we're simulating API calls
        const fetchGame = async () => {
            try {
                setIsLoading(true);

                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Initialize game with more realistic mock data
                const mockGameState: GameState = {
                    ...initialGameState,
                    gameId: gameId || 'game123',
                    players: [
                        {
                            userId: 'user1',
                            username: 'Player 1',
                            deckId: 'deck1',
                            hand: generateMockHand(6),
                            playedCard: null,
                            mandates: 0,
                            isReady: true,
                            isConnected: true,
                            coalition: null,
                            lastRoll: null
                        },
                        {
                            userId: 'user2',
                            username: 'Player 2',
                            deckId: 'deck2',
                            hand: [],
                            playedCard: null,
                            mandates: 0,
                            isReady: true,
                            isConnected: true,
                            coalition: null,
                            lastRoll: null
                        }
                    ],
                    status: 'lobby'
                };

                setGameState(mockGameState);

                // Connect to socket
                socketService.connect('mock-token');
                socketService.joinGame(gameId || 'game123');

                // Add socket event listeners
                setupSocketEvents();

                setIsLoading(false);
            } catch (err) {
                setError('Failed to load game');
                setIsLoading(false);
                toast.error('Failed to load game');
            }
        };

        fetchGame();

        // Cleanup function
        return () => {
            socketService.disconnect();
        };
    }, [gameId, dispatch]);

    // Setup socket event listeners
    const setupSocketEvents = () => {
        // In a real app, you would listen for socket events here
        // This is a mock implementation for development

        socketService.on('game-updated', (updatedGame: GameState) => {
            setGameState(updatedGame);

            // Check if the game is over
            if (updatedGame.status === 'finished') {
                setShowGameOver(true);
            }
        });

        // Mock other events as needed
    };

    // Generate mock hand of cards for development
    const generateMockHand = (count: number): Card[] => {
        const hand: Card[] = [];

        for (let i = 1; i <= count; i++) {
            const cardType = i % 3 === 0 ? 'event' : i % 4 === 0 ? 'special' : 'politician';

            hand.push({
                id: `card-${ i }`,
                name: cardType === 'politician' ? `Politician ${ i }` :
                    cardType === 'event' ? `Event ${ i }` :
                        `Special Card ${ i }`,
                type: cardType as any,
                influence: cardType === 'event' ? 0 : Math.floor(Math.random() * 7) + 1,
                ability: `Sample ability for ${ cardType } card ${ i }`,
                description: `This is a sample description for ${ cardType } card ${ i }`,
                imagePath: '/assets/placeholder/card-front.png',
                tags: ['tag1', 'tag2']
            });
        }

        return hand;
    };

    // Game action handlers
    const handleStartGame = () => {
        // In a real app, this would emit a socket event
        toast.info('Starting game...');

        // Mock game start response
        setTimeout(() => {
            const updatedState = {
                ...gameState,
                status: 'active',
                phase: 'drawing',
                round: 1,
                activePlayerId: 'user1',
                log: [
                    ...gameState.log,
                    {
                        text: 'Game has started!',
                        timestamp: new Date().toISOString(),
                        type: 'system'
                    }
                ]
            };

            setGameState(updatedState);
        }, 1000);
    };

    const handleLeaveGame = () => {
        // In a real app, this would emit a socket event
        toast.info('Leaving game...');

        // Navigate back to games list
        navigate('/games');
    };

    const handleToggleReady = () => {
        // In a real app, this would emit a socket event
        toast.info('Toggling ready state...');

        // Mock ready state toggle
        const playerIndex = gameState.players.findIndex(p => p.userId === currentUser.id);

        if (playerIndex !== -1) {
            const updatedPlayers = [...gameState.players];
            updatedPlayers[playerIndex] = {
                ...updatedPlayers[playerIndex],
                isReady: !updatedPlayers[playerIndex].isReady
            };

            setGameState({
                ...gameState,
                players: updatedPlayers
            });
        }
    };

    const handleSelectDeck = (deckId: string) => {
        // In a real app, this would emit a socket event
        toast.info(`Selecting deck: ${ deckId }`);

        // Mock deck selection
        const playerIndex = gameState.players.findIndex(p => p.userId === currentUser.id);

        if (playerIndex !== -1) {
            const updatedPlayers = [...gameState.players];
            updatedPlayers[playerIndex] = {
                ...updatedPlayers[playerIndex],
                deckId: deckId
            };

            setGameState({
                ...gameState,
                players: updatedPlayers
            });
        }
    };

    const handleUpdateSettings = (newSettings: any) => {
        // In a real app, this would emit a socket event
        toast.info('Updating game settings...');

        // Mock settings update
        setGameState({
            ...gameState,
            maxPlayers: newSettings.maxPlayers,
            maxRounds: newSettings.maxRounds,
            mandateThreshold: newSettings.mandateThreshold
        });
    };

    const handleSendMessage = (message: string) => {
        // In a real app, this would emit a socket event
        // Here we just update our local state

        const newLog = [
            ...gameState.log,
            {
                text: `${ currentUser.username }: ${ message }`,
                timestamp: new Date().toISOString(),
                type: 'action'
            }
        ];

        setGameState({
            ...gameState,
            log: newLog
        });
    };

    const handlePlayCard = (cardId: string) => {
        // In a real app, this would emit a socket event
        toast.info(`Playing card: ${ cardId }`);

        // Mock playing a card
        const playerIndex = gameState.players.findIndex(p => p.userId === currentUser.id);

        if (playerIndex !== -1) {
            const player = gameState.players[playerIndex];
            const cardIndex = player.hand.findIndex(card => card.id === cardId);

            if (cardIndex !== -1) {
                const card = player.hand[cardIndex];

                // Update the player's hand and played card
                const updatedHand = player.hand.filter(c => c.id !== cardId);

                const updatedPlayers = [...gameState.players];
                updatedPlayers[playerIndex] = {
                    ...player,
                    hand: updatedHand,
                    playedCard: card
                };

                // Add card to center cards
                const centerCards = [
                    ...gameState.centerCards,
                    {
                        playerId: player.userId,
                        card: card,
                        revealed: false
                    }
                ];

                // Add log entry
                const newLog = [
                    ...gameState.log,
                    {
                        text: `${ player.username } played a card.`,
                        timestamp: new Date().toISOString(),
                        type: 'action'
                    }
                ];

                // Update game state
                setGameState({
                    ...gameState,
                    players: updatedPlayers,
                    centerCards,
                    log: newLog,
                    phase: updatedPlayers.every(p => p.playedCard !== null) ? 'revealing' : 'playing',
                    activePlayerId: updatedPlayers.every(p => p.playedCard !== null) ? 'user1' : 'user2'
                });
            }
        }
    };

    const handleProposeCoalition = (targetUserId: string) => {
        // In a real app, this would emit a socket event
        toast.info(`Proposing coalition with: ${ targetUserId }`);

        // Mock coalition proposal
        const newLog = [
            ...gameState.log,
            {
                text: `${ currentUser.username } proposed a coalition with ${ gameState.players.find(p => p.userId === targetUserId)?.username || 'Player'
                    }.`,
                timestamp: new Date().toISOString(),
                type: 'action'
            }
        ];

        setGameState({
            ...gameState,
            log: newLog
        });
    };

    const handleAcceptCoalition = (partnerUserId: string) => {
        // In a real app, this would emit a socket event
        toast.info(`Accepting coalition with: ${ partnerUserId }`);

        // Mock coalition acceptance
        const newCoalition = {
            player1Id: currentUser.id,
            player2Id: partnerUserId,
            roundFormed: gameState.round,
            active: true
        };

        const newLog = [
            ...gameState.log,
            {
                text: `${ currentUser.username } accepted a coalition with ${ gameState.players.find(p => p.userId === partnerUserId)?.username || 'Player'
                    }.`,
                timestamp: new Date().toISOString(),
                type: 'action'
            }
        ];

        setGameState({
            ...gameState,
            coalitions: [...gameState.coalitions, newCoalition],
            log: newLog
        });
    };

    const handleDeclineCoalition = (partnerUserId: string) => {
        // In a real app, this would emit a socket event
        toast.info(`Declining coalition with: ${ partnerUserId }`);

        // Mock coalition decline
        const newLog = [
            ...gameState.log,
            {
                text: `${ currentUser.username } declined a coalition with ${ gameState.players.find(p => p.userId === partnerUserId)?.username || 'Player'
                    }.`,
                timestamp: new Date().toISOString(),
                type: 'action'
            }
        ];

        setGameState({
            ...gameState,
            log: newLog
        });
    };

    const handleRollDice = () => {
        // In a real app, this would emit a socket event
        toast.info('Rolling dice...');

        // Mock dice roll
        const diceResult = Math.floor(Math.random() * 6) + 1;

        // Update player's roll
        const playerIndex = gameState.players.findIndex(p => p.userId === currentUser.id);

        if (playerIndex !== -1) {
            const updatedPlayers = [...gameState.players];
            updatedPlayers[playerIndex] = {
                ...updatedPlayers[playerIndex],
                lastRoll: diceResult
            };

            // Add log entry
            const newLog = [
                ...gameState.log,
                {
                    text: `${ currentUser.username } rolled a ${ diceResult }.`,
                    timestamp: new Date().toISOString(),
                    type: 'action'
                }
            ];

            // Update game state - revealing cards
            const updatedCenterCards = gameState.centerCards.map(cc => ({
                ...cc,
                revealed: true
            }));

            // Determine winner of the round
            const player1Card = gameState.centerCards.find(cc => cc.playerId === 'user1')?.card;
            const player2Card = gameState.centerCards.find(cc => cc.playerId === 'user2')?.card;

            let roundWinner = null;
            let mandateAwarded = false;

            if (player1Card && player2Card) {
                const player1Total = player1Card.influence + (diceResult > 3 ? 1 : 0);
                const player2Total = player2Card.influence;

                if (player1Total > player2Total) {
                    roundWinner = 'user1';
                    mandateAwarded = true;
                } else if (player2Total > player1Total) {
                    roundWinner = 'user2';
                    mandateAwarded = true;
                }

                if (roundWinner) {
                    // Update mandates
                    const winnerIndex = updatedPlayers.findIndex(p => p.userId === roundWinner);
                    if (winnerIndex !== -1) {
                        updatedPlayers[winnerIndex].mandates += 1;

                        newLog.push({
                            text: `${ updatedPlayers[winnerIndex].username } won the round and gained a mandate!`,
                            timestamp: new Date().toISOString(),
                            type: 'system'
                        });

                        // Check for game end
                        if (updatedPlayers[winnerIndex].mandates >= gameState.mandateThreshold) {
                            newLog.push({
                                text: `${ updatedPlayers[winnerIndex].username } has reached ${ gameState.mandateThreshold } mandates and won the game!`,
                                timestamp: new Date().toISOString(),
                                type: 'system'
                            });

                            // End the game
                            setGameState({
                                ...gameState,
                                players: updatedPlayers,
                                centerCards: updatedCenterCards,
                                log: newLog,
                                phase: 'interim',
                                round: gameState.round + 1,
                                status: 'finished'
                            });

                            setShowGameOver(true);
                            return;
                        }
                    }
                } else {
                    newLog.push({
                        text: 'The round ended in a tie!',
                        timestamp: new Date().toISOString(),
                        type: 'system'
                    });
                }
            }

            // Move to next round
            setGameState({
                ...gameState,
                players: updatedPlayers,
                centerCards: [],
                log: newLog,
                phase: 'drawing',
                round: gameState.round + 1,
                activePlayerId: 'user1'
            });

            // Add new cards to hands
            setTimeout(() => {
                const updatedPlayers = gameState.players.map(player => ({
                    ...player,
                    hand: [...generateMockHand(1), ...(player.hand || [])],
                    playedCard: null
                }));

                setGameState(prev => ({
                    ...prev,
                    players: updatedPlayers
                }));
            }, 2000);
        }
    };

    const handlePlayAgain = () => {
        // In a real app, this would redirect to a new game
        setShowGameOver(false);

        // Reset the game to lobby state
        setGameState({
            ...initialGameState,
            gameId: gameId || 'game123',
            players: gameState.players.map(p => ({
                ...p,
                hand: [],
                playedCard: null,
                mandates: 0,
                isReady: false
            })),
            status: 'lobby',
            round: 0
        });
    };

    const handleReturnToLobby = () => {
        navigate('/games');
    };

    // Loading state
    if (isLoading) {
        return <LoadingSpinner fullScreen />;
    }

    // Error state
    if (error) {
        return (
            <div>
                <h2>Error loading game</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/games')}>Return to Games</button>
            </div>
        );
    }

    // Render the appropriate component based on game status
    return (
        <GamePlayContainer>
            {gameState.status === 'lobby' ? (
                <GameLobby
                    gameId={gameState.gameId}
                    isHost={gameState.hostId === currentUser.id}
                    onStartGame={handleStartGame}
                    onLeaveGame={handleLeaveGame}
                    onToggleReady={handleToggleReady}
                    onSelectDeck={handleSelectDeck}
                    onUpdateSettings={handleUpdateSettings}
                    onSendMessage={handleSendMessage}
                />
            ) : (
                <GameBoard
                    gameState={gameState}
                    currentUserId={currentUser.id}
                    onPlayCard={handlePlayCard}
                    onProposeCoalition={handleProposeCoalition}
                    onAcceptCoalition={handleAcceptCoalition}
                    onDeclineCoalition={handleDeclineCoalition}
                    onRollDice={handleRollDice}
                />
            )}

            {showGameOver && (
                <GameOver>
                    <GameOverContent>
                        <WinnerHeading>
                            {gameState.players.find(p => p.mandates >= gameState.mandateThreshold)?.username || 'Unknown'} Wins!
                        </WinnerHeading>

                        <p>The game has ended after {gameState.round - 1} rounds.</p>

                        <GameStats>
                            {gameState.players.map(player => (
                                <StatItem key={player.userId}>
                                    <span>{player.username}</span>
                                    <span>{player.mandates} mandates</span>
                                </StatItem>
                            ))}
                        </GameStats>

                        <ButtonGroup>
                            <button onClick={handlePlayAgain}>Play Again</button>
                            <button onClick={handleReturnToLobby}>Return to Lobby</button>
                        </ButtonGroup>
                    </GameOverContent>
                </GameOver>
            )}
        </GamePlayContainer>
    );
};

export default GamePlay;