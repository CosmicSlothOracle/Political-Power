import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { SimpleButton } from '../components/SimpleButton';
import { toast } from 'react-toastify';
import GamesGrid from '../components/GamesGrid';
import LoadingSpinner from '../components/LoadingSpinner';

const GamesContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const TitleHeading = styled.h1`
  font-size: 28px;
  margin: 0;
`;

const TabsWrapper = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 3px solid ${ props => props.active ? '#1a73e8' : 'transparent' };
  color: ${ props => props.active ? '#1a73e8' : '#5f6368' };
  font-weight: ${ props => props.active ? 'bold' : 'normal' };
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #1a73e8;
  }
`;

const CreateGameModal = styled.div`
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
  background-color: #fff;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }

  input, select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #dadce0;
    border-radius: 4px;
    font-size: 14px;
  }
`;

const ModalFooter = styled.div`
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const CreateGameButton = styled(SimpleButton)`
  margin-left: 10px;
`;

interface Game {
    id: string;
    name: string;
    status: 'open' | 'active' | 'finished';
    createdBy: string;
    maxPlayers: number;
    players: {
        id: string;
        username: string;
        isHost: boolean;
    }[];
    rounds: number;
    mandateThreshold: number;
    createdAt: string;
}

const Games: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'open' | 'my-games' | 'finished'>('open');
    const [games, setGames] = useState<Game[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGameName, setNewGameName] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(2);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();

    // Mock current user for development
    const currentUser = {
        id: 'user1',
        username: 'Player 1'
    };

    useEffect(() => {
        // In a real app, you would fetch games from the server
        // This is mock data for development
        fetchGames();
    }, [activeTab]);

    const fetchGames = async () => {
        setIsLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Generate mock games based on the selected tab
        const mockGames: Game[] = [];

        if (activeTab === 'open' || activeTab === 'my-games') {
            mockGames.push({
                id: 'game1',
                name: 'Power Struggle EU',
                status: 'open',
                createdBy: 'user2',
                maxPlayers: 2,
                players: [
                    { id: 'user2', username: 'Player 2', isHost: true }
                ],
                rounds: 10,
                mandateThreshold: 8,
                createdAt: new Date().toISOString()
            });

            mockGames.push({
                id: 'game2',
                name: 'Political Arena',
                status: 'open',
                createdBy: 'user3',
                maxPlayers: 4,
                players: [
                    { id: 'user3', username: 'Player 3', isHost: true },
                    { id: 'user4', username: 'Player 4', isHost: false }
                ],
                rounds: 15,
                mandateThreshold: 10,
                createdAt: new Date().toISOString()
            });
        }

        if (activeTab === 'my-games') {
            mockGames.push({
                id: 'game3',
                name: 'My Active Game',
                status: 'active',
                createdBy: 'user1',
                maxPlayers: 2,
                players: [
                    { id: 'user1', username: 'Player 1', isHost: true },
                    { id: 'user5', username: 'Player 5', isHost: false }
                ],
                rounds: 10,
                mandateThreshold: 8,
                createdAt: new Date(Date.now() - 3600000).toISOString()
            });
        }

        if (activeTab === 'finished' || activeTab === 'my-games') {
            mockGames.push({
                id: 'game4',
                name: 'Past Election',
                status: 'finished',
                createdBy: 'user1',
                maxPlayers: 4,
                players: [
                    { id: 'user1', username: 'Player 1', isHost: true },
                    { id: 'user2', username: 'Player 2', isHost: false },
                    { id: 'user3', username: 'Player 3', isHost: false }
                ],
                rounds: 12,
                mandateThreshold: 8,
                createdAt: new Date(Date.now() - 86400000).toISOString()
            });
        }

        setGames(mockGames);
        setIsLoading(false);
    };

    const handleCreateGame = () => {
        if (!newGameName.trim()) {
            toast.error('Please enter a game name');
            return;
        }

        // In a real app, you would call an API to create the game
        toast.success('Game created successfully!');

        // Add the new game to the list
        const newGame: Game = {
            id: `game-${ Date.now() }`,
            name: newGameName,
            status: 'open',
            createdBy: currentUser.id,
            maxPlayers: maxPlayers,
            players: [
                { id: currentUser.id, username: currentUser.username, isHost: true }
            ],
            rounds: 10,
            mandateThreshold: 8,
            createdAt: new Date().toISOString()
        };

        setGames([newGame, ...games]);
        setShowCreateModal(false);
        setNewGameName('');

        // Navigate to the new game
        router.push(`/game/${ newGame.id }`);
    };

    const handleJoinGame = (gameId: string) => {
        // In a real app, you would call an API to join the game
        toast.success('Joining game...');

        // Navigate to the game page
        router.push(`/game/${ gameId }`);
    };

    const filteredGames = games.filter(game => {
        if (activeTab === 'open') return game.status === 'open';
        if (activeTab === 'my-games') return true; // All games where the user is a player
        if (activeTab === 'finished') return game.status === 'finished';
        return true;
    });

    return (
        <GamesContainer>
            <Header>
                <TitleHeading>Games</TitleHeading>
                <SimpleButton onClick={() => setShowCreateModal(true)}>
                    Create New Game
                </SimpleButton>
            </Header>

            <TabsWrapper>
                <TabButton
                    active={activeTab === 'open'}
                    onClick={() => setActiveTab('open')}
                >
                    Open Games
                </TabButton>
                <TabButton
                    active={activeTab === 'my-games'}
                    onClick={() => setActiveTab('my-games')}
                >
                    My Games
                </TabButton>
                <TabButton
                    active={activeTab === 'finished'}
                    onClick={() => setActiveTab('finished')}
                >
                    Finished Games
                </TabButton>
            </TabsWrapper>

            <GamesGrid
                games={filteredGames}
                isLoading={isLoading}
                activeTab={activeTab}
                currentUserId={currentUser.id}
                onJoinGame={handleJoinGame}
            />

            {showCreateModal && (
                <CreateGameModal>
                    <ModalContent>
                        <ModalHeader>
                            <h2 style={{ margin: 0 }}>Create New Game</h2>
                        </ModalHeader>

                        <ModalBody>
                            <FormGroup>
                                <label>Game Name</label>
                                <input
                                    type="text"
                                    value={newGameName}
                                    onChange={(e) => setNewGameName(e.target.value)}
                                    placeholder="Enter a name for your game"
                                />
                            </FormGroup>

                            <FormGroup>
                                <label>Max Players</label>
                                <select
                                    value={maxPlayers}
                                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                                >
                                    <option value="2">2 Players</option>
                                    <option value="4">4 Players</option>
                                </select>
                            </FormGroup>

                            <FormGroup>
                                <label>Victory Condition</label>
                                <select defaultValue="8">
                                    <option value="6">6 Mandates (Quick)</option>
                                    <option value="8">8 Mandates (Standard)</option>
                                    <option value="10">10 Mandates (Long)</option>
                                </select>
                            </FormGroup>

                            <FormGroup>
                                <label>Max Rounds</label>
                                <select defaultValue="10">
                                    <option value="10">10 Rounds</option>
                                    <option value="15">15 Rounds</option>
                                    <option value="20">20 Rounds</option>
                                </select>
                            </FormGroup>
                        </ModalBody>

                        <ModalFooter>
                            <SimpleButton color="secondary" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </SimpleButton>
                            <SimpleButton color="primary" onClick={handleCreateGame}>
                                Create Game
                            </SimpleButton>
                        </ModalFooter>
                    </ModalContent>
                </CreateGameModal>
            )}
        </GamesContainer>
    );
};

export default Games;