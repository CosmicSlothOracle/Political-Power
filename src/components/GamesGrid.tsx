import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { SimpleButton } from './SimpleButton';
import { format } from 'date-fns';

// Types
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

interface GamesGridProps {
    games: Game[];
    isLoading: boolean;
    activeTab: 'open' | 'my-games' | 'finished';
    currentUserId: string;
    onJoinGame: (gameId: string) => void;
}

// Styled Components
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const GameCard = styled(motion.div)`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
`;

const GameCardHeader = styled.div<{ status: string }>`
  padding: 15px;
  background-color: ${ props => {
        switch (props.status) {
            case 'open': return '#e6f4ea';
            case 'active': return '#e8f0fe';
            case 'finished': return '#feefc3';
            default: return '#f1f3f4';
        }
    } };
  border-bottom: 1px solid #eee;
`;

const GameCardContent = styled.div`
  padding: 15px;
`;

const GameTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GameStatus = styled.span<{ status: string }>`
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  background-color: ${ props => {
        switch (props.status) {
            case 'open': return '#0f9d58';
            case 'active': return '#1a73e8';
            case 'finished': return '#ea8600';
            default: return '#5f6368';
        }
    } };
  color: white;
`;

const GameInfo = styled.div`
  margin: 10px 0;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;

  .label {
    color: #5f6368;
  }

  .value {
    font-weight: 500;
  }
`;

const PlayersList = styled.div`
  margin: 15px 0;
`;

const Player = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
  font-size: 14px;
`;

const PlayerAvatar = styled.div<{ isHost?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${ props => props.isHost ? '#1a73e8' : '#5f6368' };
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

const CardFooter = styled.div`
  padding: 10px 15px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 50px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 10px;
  color: #5f6368;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 50px 20px;
`;

const GamesGrid: React.FC<GamesGridProps> = ({
    games,
    isLoading,
    activeTab,
    currentUserId,
    onJoinGame
}) => {
    const router = useRouter();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return <LoadingContainer>Loading games...</LoadingContainer>;
    }

    if (games.length === 0) {
        return (
            <EmptyState>
                <EmptyStateIcon>🎮</EmptyStateIcon>
                <h3>No games found</h3>
                <p>
                    {activeTab === 'open' ? 'There are no open games right now. Create your own!' :
                        activeTab === 'my-games' ? 'You haven\'t joined any games yet.' :
                            'No finished games found.'}
                </p>
                <Button onClick={() => router.push('/games')}>
                    Create New Game
                </Button>
            </EmptyState>
        );
    }

    return (
        <Grid>
            {games.map(game => (
                <GameCard
                    key={game.id}
                    whileHover={{ y: -5, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}
                >
                    <GameCardHeader status={game.status}>
                        <GameTitle>
                            {game.name}
                            <GameStatus status={game.status}>
                                {game.status === 'open' ? 'Lobby' :
                                    game.status === 'active' ? 'In Progress' : 'Finished'}
                            </GameStatus>
                        </GameTitle>
                    </GameCardHeader>

                    <GameCardContent>
                        <GameInfo>
                            <InfoItem>
                                <span className="label">Created</span>
                                <span className="value">{formatDate(game.createdAt)}</span>
                            </InfoItem>
                            <InfoItem>
                                <span className="label">Players</span>
                                <span className="value">{game.players.length}/{game.maxPlayers}</span>
                            </InfoItem>
                            <InfoItem>
                                <span className="label">Victory at</span>
                                <span className="value">{game.mandateThreshold} mandates</span>
                            </InfoItem>
                        </GameInfo>

                        <PlayersList>
                            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>Players:</div>
                            {game.players.map(player => (
                                <Player key={player.id}>
                                    <PlayerAvatar isHost={player.isHost}>{player.username[0]}</PlayerAvatar>
                                    <span>{player.username} {player.isHost && '(Host)'}</span>
                                </Player>
                            ))}
                        </PlayersList>
                    </GameCardContent>

                    <CardFooter>
                        {game.status === 'open' && game.players.every(p => p.id !== currentUserId) && (
                            <Button
                                onClick={() => onJoinGame(game.id)}
                                disabled={game.players.length >= game.maxPlayers}
                            >
                                Join Game
                            </Button>
                        )}

                        {game.status === 'open' && game.players.some(p => p.id === currentUserId) && (
                            <Button onClick={() => router.push(`/game/${ game.id }`)}>
                                Enter Lobby
                            </Button>
                        )}

                        {game.status === 'active' && game.players.some(p => p.id === currentUserId) && (
                            <Button variant="primary" onClick={() => router.push(`/game/${ game.id }`)}>
                                Continue Game
                            </Button>
                        )}

                        {game.status === 'finished' && (
                            <Button variant="outline" onClick={() => router.push(`/game/${ game.id }`)}>
                                View Results
                            </Button>
                        )}
                    </CardFooter>
                </GameCard>
            ))}
        </Grid>
    );
};

export default GamesGrid;