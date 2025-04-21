'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SimpleButton } from '../../components/SimpleButton'
import MainNavigation from '../../components/MainNavigation'
import { Spinner } from '../../components/Spinner'
import { GameSettings, DEFAULT_GAME_SETTINGS } from '../../types/gameTypes'
import { GameSettingsPanel } from '../../components/GameSettingsPanel'
import useSocket from '../../hooks/useSocket'
import { useGameController } from '../../hooks/useGameController'
import { deckService } from '../../services/api'
import mockCards from '../../data/mockCards'

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a2a6c, #2a3e84);
  padding: 2rem;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const GameList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const GameCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const GameName = styled.h3`
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #2c3e50;
`;

const GameInfo = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
`;

const JoinButton = styled(SimpleButton)`
  width: 100%;
`;

const NoGamesMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
`;

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
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3498db;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

export default function GamesPage() {
    const router = useRouter();
    const socket = useSocket();
    const gameController = useGameController();

    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewGameModal, setShowNewGameModal] = useState(false);
    const [showJoinGameModal, setShowJoinGameModal] = useState(false);
    const [gameName, setGameName] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [gameId, setGameId] = useState('');
    const [gameSettings, setGameSettings] = useState(DEFAULT_GAME_SETTINGS);
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [selectedDeckId, setSelectedDeckId] = useState('');
    const [availableDecks, setAvailableDecks] = useState([]);

    useEffect(() => {
        const fetchGames = async () => {
            setLoading(true);
            try {
                const games = await gameController.getAvailableGames();
                setGames(games || []);
            } catch (error) {
                console.error('Failed to fetch games:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchDecks = async () => {
            try {
                // Use the deckService to fetch decks
                let decks = [];
                try {
                    decks = await deckService.getUserDecks();
                } catch (deckError) {
                    console.error('Error fetching decks from API:', deckError);
                }

                // If no decks are available, create a default deck from mockCards
                if (!decks || decks.length === 0) {
                    const defaultDeck = {
                        id: 'default-deck',
                        name: 'Default Deck',
                        cards: mockCards.slice(0, 20) // Use first 20 mock cards
                    };
                    setAvailableDecks([defaultDeck]);
                    setSelectedDeckId(defaultDeck.id);
                } else {
                    setAvailableDecks(decks);
                    if (decks.length > 0) {
                        setSelectedDeckId(decks[0].id);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch decks:', error);

                // Fallback to a default deck if API fails
                const defaultDeck = {
                    id: 'default-deck',
                    name: 'Default Deck',
                    cards: mockCards.slice(0, 20) // Take first 20 mock cards
                };
                setAvailableDecks([defaultDeck]);
                setSelectedDeckId(defaultDeck.id);
            }
        };

        if (socket.isConnected) {
            fetchGames();
            fetchDecks();

            // Listen for game updates
            socket.on('gameListUpdated', (updatedGames) => {
                setGames(updatedGames);
            });

            // Clean up
            return () => {
                socket.off('gameListUpdated');
            };
        }
    }, [socket.isConnected, gameController]);

    const handleCreateGame = async (e) => {
        e.preventDefault();

        if (!gameName || !playerName) {
            return;
        }

        setIsCreating(true);

        try {
            // Call createGame with proper parameters: gameName, playerName, gameSettings
            const newGame = await gameController.createGame(
                gameName,
                playerName,
                gameSettings
            );

            if (newGame && newGame.id) {
                router.push(`/game/${ newGame.id }`);
            }
        } catch (error) {
            console.error('Failed to create game:', error);
            alert('Failed to create game. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinGame = async (e) => {
        e.preventDefault();


        if (!playerName || !gameId) {
            return;
        }

        setIsJoining(true);

        try {
            const success = await gameController.joinGame(gameId, {
                playerName,
                deckId: selectedDeckId
            });

            if (success) {
                router.push(`/game/${ gameId }`);
            }
        } catch (error) {
            console.error('Failed to join game:', error);
            alert('Failed to join game. Please try again.');
        } finally {
            setIsJoining(false);
        }
    };

    const joinGame = (gameId) => {
        setGameId(gameId);
        setShowJoinGameModal(true);
    };

    return (
        <>
            <MainNavigation />
            <PageContainer>
                <ContentContainer>
                    <PageHeader>
                        <Title>Game Lobby</Title>
                        <ButtonContainer>
                            <SimpleButton
                                color="primary"
                                onClick={() => setShowNewGameModal(true)}
                            >
                                Create New Game
                            </SimpleButton>
                        </ButtonContainer>
                    </PageHeader>

                    {loading ? (
                        <LoadingContainer>
                            <Spinner size="large" />
                        </LoadingContainer>
                    ) : games.length > 0 ? (
                        <GameList>
                            {games.map((game) => (
                                <GameCard key={game.id}>
                                    <GameName>{game.name}</GameName>
                                    <GameInfo>
                                        <div>Host: {game.host}</div>
                                        <div>Players: {game.players.length}/{game.maxPlayers}</div>
                                        <div>Status: {game.status}</div>
                                    </GameInfo>
                                    <JoinButton
                                        color="primary"
                                        onClick={() => joinGame(game.id)}
                                        disabled={game.status !== 'lobby' || game.players.length >= game.maxPlayers}
                                    >
                                        Join Game
                                    </JoinButton>
                                </GameCard>
                            ))}
                        </GameList>
                    ) : (
                        <NoGamesMessage>
                            <p>No games available. Create a new game to get started!</p>
                        </NoGamesMessage>
                    )}
                </ContentContainer>
            </PageContainer>

            {/* Create Game Modal */}
            {showNewGameModal && (
                <Modal onClick={(e) => e.target === e.currentTarget && setShowNewGameModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <h2>Create New Game</h2>
                        <form onSubmit={handleCreateGame}>
                            <FormGroup>
                                <Label htmlFor="gameName">Game Name</Label>
                                <Input
                                    id="gameName"
                                    type="text"
                                    value={gameName}
                                    onChange={(e) => setGameName(e.target.value)}
                                    placeholder="Enter a name for your game"
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="playerName">Your Name</Label>
                                <Input
                                    id="playerName"
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="Enter your player name"
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="deckSelect">Select Deck</Label>
                                <select
                                    id="deckSelect"
                                    value={selectedDeckId}
                                    onChange={(e) => setSelectedDeckId(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {availableDecks.map(deck => (
                                        <option key={deck.id} value={deck.id}>{deck.name}</option>
                                    ))}
                                </select>
                            </FormGroup>

                            <GameSettingsPanel
                                initialSettings={gameSettings}
                                onSettingsChange={setGameSettings}
                                readOnly={isCreating}
                            />

                            <ModalButtons>
                                <SimpleButton
                                    color="secondary"
                                    type="button"
                                    onClick={() => setShowNewGameModal(false)}
                                >
                                    Cancel
                                </SimpleButton>
                                <SimpleButton
                                    color="primary"
                                    type="submit"
                                    disabled={isCreating || !gameName || !playerName}
                                >
                                    {isCreating ? <Spinner size="small" /> : 'Create Game'}
                                </SimpleButton>
                            </ModalButtons>
                        </form>
                    </ModalContent>
                </Modal>
            )}

            {/* Join Game Modal */}
            {showJoinGameModal && (
                <Modal onClick={(e) => e.target === e.currentTarget && setShowJoinGameModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <h2>Join Game</h2>
                        <form onSubmit={handleJoinGame}>
                            <FormGroup>
                                <Label htmlFor="playerNameJoin">Your Name</Label>
                                <Input
                                    id="playerNameJoin"
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="Enter your player name"
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="deckSelectJoin">Select Deck</Label>
                                <select
                                    id="deckSelectJoin"
                                    value={selectedDeckId}
                                    onChange={(e) => setSelectedDeckId(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {availableDecks.map(deck => (
                                        <option key={deck.id} value={deck.id}>{deck.name}</option>
                                    ))}
                                </select>
                            </FormGroup>

                            <ModalButtons>
                                <SimpleButton
                                    color="secondary"
                                    type="button"
                                    onClick={() => setShowJoinGameModal(false)}
                                >
                                    Cancel
                                </SimpleButton>
                                <SimpleButton
                                    color="primary"
                                    type="submit"
                                    disabled={isJoining || !playerName}
                                >
                                    {isJoining ? <Spinner size="small" /> : 'Join Game'}
                                </SimpleButton>
                            </ModalButtons>
                        </form>
                    </ModalContent>
                </Modal>
            )}
        </>
    );
}